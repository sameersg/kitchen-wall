import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, MapPin, ExternalLink, 
  Plus, RefreshCw, Sparkles, CheckCircle2, ChevronRight, AlertCircle,
  Smartphone
} from 'lucide-react';
import { CalendarEvent } from '../types';
import { sounds } from '../utils/audio';

interface CalendarWidgetProps {
  customEvents: CalendarEvent[];
  googleIcalUrl?: string;
  onOpenSettings: () => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  customEvents,
  googleIcalUrl,
  onOpenSettings
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>(customEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncedWithGoogle, setIsSyncedWithGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoogleEvents = async () => {
    if (!googleIcalUrl || !googleIcalUrl.trim()) {
      setEvents(customEvents);
      setIsSyncedWithGoogle(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/calendar?url=${encodeURIComponent(googleIcalUrl.trim())}`);
      if (!res.ok) throw new Error('Konnte Kalender nicht laden');
      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        setEvents(data.events);
        setIsSyncedWithGoogle(true);
      }
    } catch (err) {
      console.warn('Calendar fetch error:', err);
      setError('Kalender konnte nicht aktualisiert werden');
      setEvents(customEvents);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleEvents();
    const interval = setInterval(fetchGoogleEvents, 20 * 60 * 1000);
    return () => clearInterval(interval);
  }, [googleIcalUrl, customEvents]);

  const openIpadCalendar = () => {
    sounds.playTick();
    // iOS / iPadOS native URL scheme to launch Calendar app
    window.location.href = 'calshow:';
  };

  const formatEventDate = (dateStr: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const tomorrow = new Date(Date.now() + 86400000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Heute';
    if (dateStr === tomorrowStr) return 'Morgen';

    const eventDate = new Date(dateStr);
    const daysOfWeek = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

    return `${daysOfWeek[eventDate.getDay()]}, ${eventDate.getDate()}. ${months[eventDate.getMonth()]}`;
  };

  const getCategoryStyle = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'familie': return 'bg-[#fef2eb] text-[#e06236] border-[#fbdcd0]';
      case 'gesundheit': return 'bg-[#eef8f2] text-[#15803d] border-[#c2e7d0]';
      case 'sport': return 'bg-[#f0f9ff] text-[#0284c7] border-[#bae6fd]';
      case 'schule': return 'bg-[#fefce8] text-[#ca8a04] border-[#fef08a]';
      default: return 'bg-[#f4efe8] text-[#786f65] border-[#ece7de]';
    }
  };

  return (
    <div className="bg-white rounded-[28px] border border-[#ece7de] shadow-clean p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ece7de]">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-[#e06236]" />
          <h2 className="font-semibold text-sm tracking-tight text-[#221e1a]">Familien-Kalender</h2>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
              isSyncedWithGoogle
                ? 'bg-[#eef8f2] text-[#15803d] border-[#c2e7d0]'
                : 'bg-[#f4efe8] text-[#786f65] border-[#ece7de]'
            }`}
          >
            {isSyncedWithGoogle ? 'Live Synchron' : 'Küche'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Open iPad Native Calendar */}
          <button
            onClick={openIpadCalendar}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#f4efe8] hover:bg-[#ece7de] border border-[#ece7de] text-[#221e1a] text-xs font-medium transition active:scale-95"
            title="Native iPad Kalender-App auf dem iPad öffnen"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#e06236]" />
            <span>iPad Kalender</span>
          </button>

          {/* Open Google Calendar Web */}
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#f4efe8] hover:bg-[#ece7de] border border-[#ece7de] text-[#221e1a] text-xs font-medium transition active:scale-95"
            title="Google Kalender öffnen"
          >
            <span>Google</span>
            <ExternalLink className="w-3 h-3 text-[#786f65]" />
          </a>

          {googleIcalUrl && (
            <button
              onClick={() => {
                sounds.playTick();
                fetchGoogleEvents();
              }}
              disabled={isLoading}
              className="text-[#786f65] hover:text-[#221e1a] p-1 rounded-lg transition active:scale-95"
              title="Aktualisieren"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#e06236]' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto space-y-2 my-2.5 pr-1 max-h-56 scrollbar-thin">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[#786f65] text-xs space-y-2">
            <CalendarIcon className="w-8 h-8 opacity-30 text-[#e06236] mb-1" />
            <span>Keine anstehenden Termine eingetragen</span>
            <button
              onClick={onOpenSettings}
              className="text-xs text-[#e06236] font-medium underline hover:text-[#c2410c]"
            >
              Google / iCloud Kalender verknüpfen
            </button>
          </div>
        ) : (
          events.slice(0, 5).map((ev) => {
            const isToday = ev.date === new Date().toISOString().split('T')[0];

            return (
              <div
                key={ev.id}
                className={`flex items-start justify-between p-3 rounded-2xl border transition-all ${
                  isToday
                    ? 'bg-[#fef2eb] border-[#fbdcd0] shadow-sm'
                    : 'bg-[#faf8f4] border-[#ece7de] hover:border-[#ded6ca]'
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        isToday
                          ? 'bg-[#e06236] text-white shadow-sm'
                          : 'bg-white text-[#554d44] border border-[#ece7de]'
                      }`}
                    >
                      {formatEventDate(ev.date)}
                    </span>
                    {ev.time && (
                      <span className="text-[11px] font-mono text-[#221e1a] font-semibold flex items-center space-x-0.5">
                        <Clock className="w-3 h-3 text-[#e06236]" />
                        <span>{ev.time} Uhr</span>
                      </span>
                    )}
                    {ev.isAllDay && (
                      <span className="text-[10px] text-[#786f65] font-medium">Ganztägig</span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-[#221e1a] mt-1.5 truncate">
                    {ev.title}
                  </h3>

                  {ev.location && (
                    <div className="flex items-center space-x-1 text-[10px] text-[#786f65] mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-[#e06236] flex-shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  )}
                </div>

                {ev.category && (
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${getCategoryStyle(
                      ev.category
                    )}`}
                  >
                    {ev.category}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer with Quick Action */}
      <div className="pt-2.5 border-t border-[#ece7de] flex items-center justify-between text-[11px]">
        <a
          href="https://calendar.google.com/calendar/render?action=TEMPLATE"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e06236] hover:text-[#c2410c] font-medium flex items-center space-x-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Termin im Kalender anlegen</span>
        </a>

        {!googleIcalUrl && (
          <button
            onClick={onOpenSettings}
            className="text-[10px] text-[#786f65] hover:text-[#221e1a] underline"
          >
            iCloud / Google Kalender einbinden
          </button>
        )}
      </div>
    </div>
  );
};
