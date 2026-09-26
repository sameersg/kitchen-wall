import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, CalendarFeed } from '../types';

export function useDashboardCalendar(
  feedsOrUrl?: CalendarFeed[] | string,
  fallbackEvents: CalendarEvent[] = [],
  wasteCalendarUrl?: string
): { 
  events: CalendarEvent[]; 
  wasteEvents: CalendarEvent[];
  isSyncing: boolean; 
  isLive: boolean; 
  error: string | null; 
  refresh: () => void 
} {
  const [liveEvents, setLiveEvents] = useState<CalendarEvent[]>([]);
  const [liveWasteEvents, setLiveWasteEvents] = useState<CalendarEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllEvents = useCallback(async () => {
    // Resolve active calendar feeds
    const activeFeeds: CalendarFeed[] = [];
    if (Array.isArray(feedsOrUrl)) {
      activeFeeds.push(...feedsOrUrl.filter((f) => f.enabled && f.url && f.url.trim()));
    } else if (typeof feedsOrUrl === 'string' && feedsOrUrl.trim()) {
      activeFeeds.push({
        id: 'legacy_single',
        name: 'Hauptkalender',
        url: feedsOrUrl.trim(),
        enabled: true
      });
    }

    if (activeFeeds.length === 0 && (!wasteCalendarUrl || !wasteCalendarUrl.trim())) {
      setIsLive(false);
      setLiveEvents([]);
      setLiveWasteEvents([]);
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      // 1. Fetch appointments from all active feeds in parallel
      const appointmentPromises = activeFeeds.map(async (feed) => {
        try {
          const res = await fetch(`/api/calendar?url=${encodeURIComponent(feed.url.trim())}`);
          if (!res.ok) return [];
          const data = await res.json();
          if (data && Array.isArray(data.events)) {
            return data.events.map((e: CalendarEvent) => ({
              ...e,
              location: e.location || feed.name
            }));
          }
          return [];
        } catch {
          return [];
        }
      });

      // 2. Fetch waste appointments if URL configured
      const wastePromise = (async () => {
        if (!wasteCalendarUrl || !wasteCalendarUrl.trim()) return [];
        try {
          const res = await fetch(`/api/calendar?url=${encodeURIComponent(wasteCalendarUrl.trim())}`);
          if (!res.ok) return [];
          const data = await res.json();
          return Array.isArray(data.events) ? data.events : [];
        } catch {
          return [];
        }
      })();

      const [appointmentResults, wasteResult] = await Promise.all([
        Promise.all(appointmentPromises),
        wastePromise
      ]);

      // Flatten & deduplicate appointment events
      const allAppointments: CalendarEvent[] = [];
      const seen = new Set<string>();

      for (const feedEvents of appointmentResults) {
        for (const ev of feedEvents) {
          const key = `${ev.date}_${ev.title.toLowerCase().trim()}`;
          if (!seen.has(key)) {
            seen.add(key);
            allAppointments.push(ev);
          }
        }
      }

      // Sort chronologically
      allAppointments.sort((a, b) => {
        const timeA = a.date + (a.time || '00:00');
        const timeB = b.date + (b.time || '00:00');
        return timeA.localeCompare(timeB);
      });

      if (activeFeeds.length > 0) {
        setLiveEvents(allAppointments);
        setIsLive(true);
      }

      if (wasteResult && wasteResult.length > 0) {
        setLiveWasteEvents(wasteResult);
      }
    } catch (err: any) {
      console.warn('Fehler beim Abrufen der Kalender:', err);
      setError(err?.message || 'Kalender konnte nicht geladen werden');
    } finally {
      setIsSyncing(false);
    }
  }, [feedsOrUrl, wasteCalendarUrl]);

  useEffect(() => {
    fetchAllEvents();
    // Auto refresh every 15 minutes
    const interval = setInterval(fetchAllEvents, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAllEvents]);

  // If live events exist, use them; otherwise fallback
  const mergedEvents = isLive && liveEvents.length > 0 ? liveEvents : fallbackEvents;

  return {
    events: mergedEvents,
    wasteEvents: liveWasteEvents,
    isSyncing,
    isLive,
    error,
    refresh: fetchAllEvents
  };
}
