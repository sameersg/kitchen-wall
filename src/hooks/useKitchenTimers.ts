import { useCallback, useEffect, useState } from 'react';
import { sounds } from '../utils/audio';

export interface KitchenTimer {
  id: string;
  label: string;
  durationMs: number;
  /** When a running timer ends (epoch ms); null while paused */
  endsAt: number | null;
  /** Time left while paused; null while running */
  pausedRemainingMs: number | null;
}

export interface RingingTimer {
  id: string;
  label: string;
}

// Timers belong to this device (the wall iPad) and survive a reload
const STORAGE_KEY = 'kitchen_timers_v1';
const ALARM_REPEAT_MS = 2500;
const ALARM_MAX_MS = 5 * 60 * 1000;

function loadTimers(): KitchenTimer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function remainingMs(timer: KitchenTimer, now: number): number {
  if (timer.endsAt === null) return Math.max(0, timer.pausedRemainingMs || 0);
  return Math.max(0, timer.endsAt - now);
}

/** "08:42" or "1:05:03" */
export function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Minutes from a cooking time like "25 Min", "1 Std", "1,5 h" or "1:30 h"; null if none. */
export function parseCookMinutes(cookTime?: string): number | null {
  if (!cookTime) return null;
  const text = cookTime.toLowerCase().replace(',', '.');
  const clock = text.match(/(\d+):(\d{2})/);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  let minutes = 0;
  const hours = text.match(/(\d+(?:\.\d+)?)\s*(?:std|stunden?|h\b)/);
  if (hours) minutes += Math.round(Number(hours[1]) * 60);
  const mins = text.match(/(\d+)\s*(?:min|m\b)/);
  if (mins) minutes += Number(mins[1]);
  if (!hours && !mins) {
    const bare = text.match(/^\s*(\d+)\s*$/);
    if (bare) minutes = Number(bare[1]);
  }
  return minutes > 0 ? minutes : null;
}

/** Re-renders every `intervalMs` while `active`, for countdown displays. */
export function useNow(active: boolean, intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return now;
}

export function useKitchenTimers() {
  const [timers, setTimers] = useState<KitchenTimer[]>(loadTimers);
  const [ringing, setRinging] = useState<RingingTimer[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch {}
  }, [timers]);

  // Move finished timers to "ringing". Checked when the next one is due, and
  // every few seconds as a fallback (timeouts are delayed while Safari sleeps).
  useEffect(() => {
    const running = timers.filter((t) => t.endsAt !== null);
    if (running.length === 0) return;

    const check = () => {
      const now = Date.now();
      const done = running.filter((t) => (t.endsAt as number) <= now + 50);
      if (done.length === 0) return;
      const doneIds = new Set(done.map((t) => t.id));
      setTimers((prev) => prev.filter((t) => !doneIds.has(t.id)));
      setRinging((prev) => [...prev, ...done.map((t) => ({ id: t.id, label: t.label }))]);
    };

    const nextEnd = Math.min(...running.map((t) => t.endsAt as number));
    const timeout = setTimeout(check, Math.max(0, nextEnd - Date.now()));
    const fallback = setInterval(check, 5000);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearTimeout(timeout);
      clearInterval(fallback);
      document.removeEventListener('visibilitychange', check);
    };
  }, [timers]);

  // Repeat the alarm until dismissed (capped so it never rings forever)
  useEffect(() => {
    if (ringing.length === 0) return;
    const startedAt = Date.now();
    sounds.playAlarm();
    const id = setInterval(() => {
      if (Date.now() - startedAt > ALARM_MAX_MS) {
        clearInterval(id);
        return;
      }
      sounds.playAlarm();
    }, ALARM_REPEAT_MS);
    return () => clearInterval(id);
  }, [ringing.length]);

  const startTimer = useCallback((label: string, minutes: number) => {
    if (!(minutes > 0)) return;
    // Starting happens on a tap, which also unlocks audio on iPad Safari
    sounds.playTick();
    const durationMs = Math.round(minutes * 60 * 1000);
    setTimers((prev) => [
      ...prev,
      {
        id: 'timer_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        label: label.trim() || `${minutes} Min`,
        durationMs,
        endsAt: Date.now() + durationMs,
        pausedRemainingMs: null
      }
    ]);
  }, []);

  const pauseTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id && t.endsAt !== null
          ? { ...t, endsAt: null, pausedRemainingMs: Math.max(0, t.endsAt - Date.now()) }
          : t
      )
    );
  }, []);

  const resumeTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id && t.endsAt === null
          ? { ...t, endsAt: Date.now() + (t.pausedRemainingMs || 0), pausedRemainingMs: null }
          : t
      )
    );
  }, []);

  const addMinute = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return t.endsAt !== null
          ? { ...t, endsAt: t.endsAt + 60000, durationMs: t.durationMs + 60000 }
          : { ...t, pausedRemainingMs: (t.pausedRemainingMs || 0) + 60000, durationMs: t.durationMs + 60000 };
      })
    );
  }, []);

  const cancelTimer = useCallback((id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissRinging = useCallback(() => setRinging([]), []);

  return { timers, ringing, startTimer, pauseTimer, resumeTimer, addMinute, cancelTimer, dismissRinging };
}
