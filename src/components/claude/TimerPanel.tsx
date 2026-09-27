import React, { useState } from 'react';
import { TimerPreset } from '../../types';
import { KitchenTimer, RingingTimer, formatRemaining, remainingMs, useNow } from '../../hooks/useKitchenTimers';

interface TimerPanelProps {
  isOpen: boolean;
  timers: KitchenTimer[];
  presets: TimerPreset[];
  /** Today's dish and its cooking time in minutes, offered as a one-tap timer */
  todayDish?: { title: string; minutes: number } | null;
  onStart: (label: string, minutes: number) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onAddMinute: (id: string) => void;
  onCancel: (id: string) => void;
  onClose: () => void;
}

const QUICK_MINUTES = [1, 3, 5, 10, 15, 20, 30, 45];

const formatPresetTime = (seconds: number) =>
  seconds % 60 === 0 ? `${seconds / 60} Min` : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} Min`;

export const TimerPanel: React.FC<TimerPanelProps> = ({
  isOpen,
  timers,
  presets,
  todayDish,
  onStart,
  onPause,
  onResume,
  onAddMinute,
  onCancel,
  onClose
}) => {
  const [label, setLabel] = useState('');
  const [minutes, setMinutes] = useState('');
  const now = useNow(isOpen && timers.length > 0);

  if (!isOpen) return null;

  const startCustom = (mins: number) => {
    onStart(label, mins);
    setLabel('');
    setMinutes('');
  };

  const chip =
    'px-3.5 py-2.5 rounded-[14px] bg-[var(--wash)] text-[14px] font-[700] text-[var(--ink)] hover:text-[var(--blushInk)] active:scale-95 transition-all cursor-pointer text-left';

  return (
    <div onClick={onClose} className="fixed inset-0 bg-[rgba(20,19,16,0.72)] flex items-center justify-center z-50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[600px] max-h-[92%] overflow-y-auto bg-[var(--bg)] text-[var(--ink)] rounded-[28px] p-[26px_28px] flex flex-col gap-5 shadow-2xl"
      >
        <div className="flex items-baseline justify-between">
          <span className="font-serif text-[34px] leading-none">Küchen-Timer</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] font-[800] text-white bg-[#23231f] px-5 py-2.5 rounded-full cursor-pointer hover:opacity-85"
          >
            Fertig
          </button>
        </div>

        {/* Running timers */}
        {timers.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {timers.map((t) => {
              const left = remainingMs(t, now);
              const paused = t.endsAt === null;
              const progress = t.durationMs > 0 ? 1 - left / t.durationMs : 0;
              return (
                <div key={t.id} className="bg-[var(--blush)] rounded-[18px] p-[14px_16px] flex items-center gap-3">
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-[32px] font-[800] tabular-nums leading-none text-[var(--blushInk)]">
                        {formatRemaining(left)}
                      </span>
                      <span className="text-[14px] font-[700] truncate">{t.label}</span>
                      {paused && <span className="text-[11px] font-[800] text-[var(--muted)] uppercase tracking-[0.1em]">Pause</span>}
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--wash)] overflow-hidden">
                      <div className="h-full bg-[var(--blushInk)]" style={{ width: `${Math.min(100, progress * 100)}%` }} />
                    </div>
                  </div>
                  <button type="button" onClick={() => onAddMinute(t.id)} className="px-3 py-2 rounded-full bg-[var(--wash)] text-[12px] font-[800] cursor-pointer">
                    +1 Min
                  </button>
                  <button
                    type="button"
                    onClick={() => (paused ? onResume(t.id) : onPause(t.id))}
                    className="px-3 py-2 rounded-full bg-[var(--wash)] text-[12px] font-[800] cursor-pointer min-w-[72px]"
                  >
                    {paused ? 'Weiter' : 'Pause'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onCancel(t.id)}
                    title="Timer beenden"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[18px] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--wash)] cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Today's dish */}
        {todayDish && (
          <button
            type="button"
            onClick={() => onStart(todayDish.title, todayDish.minutes)}
            className="bg-[var(--green)] rounded-[18px] p-[14px_16px] flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] transition-all text-left"
          >
            <span className="flex flex-col min-w-0">
              <span className="text-[10px] tracking-[0.14em] uppercase font-[800] text-[var(--greenSoft)]">Heutiges Gericht</span>
              <span className="text-[16px] font-[700] truncate">{todayDish.title}</span>
            </span>
            <span className="shrink-0 text-[14px] font-[800] text-[var(--greenInk)]">▶ {todayDish.minutes} Min</span>
          </button>
        )}

        {/* Presets from the settings */}
        {presets.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] tracking-[0.12em] uppercase font-[800] text-[var(--muted)]">Vorlagen</span>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button key={p.id} type="button" onClick={() => onStart(p.label, p.seconds / 60)} className={chip}>
                  <span className="block truncate">{p.label}</span>
                  <span className="block text-[12px] font-[600] text-[var(--muted)]">{formatPresetTime(p.seconds)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom timer */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] tracking-[0.12em] uppercase font-[800] text-[var(--muted)]">Eigener Timer</span>
          <div className="flex gap-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Name (optional)"
              className="flex-1 min-w-0 bg-[var(--wash)] rounded-[12px] p-[12px_14px] text-[15px] font-[600] outline-none placeholder-[var(--faint)]"
            />
            <input
              value={minutes}
              onChange={(e) => setMinutes(e.target.value.replace(/[^\d.,]/g, ''))}
              inputMode="decimal"
              placeholder="Min"
              className="w-[80px] bg-[var(--wash)] rounded-[12px] p-[12px_14px] text-[15px] font-[700] text-center outline-none placeholder-[var(--faint)]"
            />
            <button
              type="button"
              disabled={!(Number(minutes.replace(',', '.')) > 0)}
              onClick={() => startCustom(Number(minutes.replace(',', '.')))}
              className="px-5 rounded-[12px] bg-[#23231f] text-white text-[14px] font-[800] cursor-pointer disabled:opacity-40"
            >
              Start
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_MINUTES.map((m) => (
              <button key={m} type="button" onClick={() => startCustom(m)} className="px-3.5 py-2 rounded-full bg-[var(--wash)] text-[13px] font-[800] cursor-pointer active:scale-95">
                {m} Min
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimerAlarmProps {
  ringing: RingingTimer[];
  onDismiss: () => void;
}

/** Full-screen notice while a finished timer rings; any tap silences it. */
export const TimerAlarm: React.FC<TimerAlarmProps> = ({ ringing, onDismiss }) => {
  if (ringing.length === 0) return null;
  const names = ringing.map((r) => r.label).join(', ');
  return (
    <div onClick={onDismiss} className="fixed inset-0 z-[60] bg-[var(--blushInk)] text-white flex flex-col items-center justify-center gap-6 p-8 cursor-pointer select-none">
      <span className="text-[14px] tracking-[0.2em] uppercase font-[800] text-white/80">Timer abgelaufen</span>
      <span className="font-serif text-[64px] leading-[1.05] text-center">{names}</span>
      <span className="text-[16px] font-[600] text-white/85">ist fertig</span>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-4 text-[20px] font-[800] text-[var(--blushInk)] bg-white px-12 py-4 rounded-full shadow-xl cursor-pointer"
      >
        Aus
      </button>
    </div>
  );
};

/** Small countdown chips on the hero card */
export const TimerChips: React.FC<{ timers: KitchenTimer[]; onOpen: () => void }> = ({ timers, onOpen }) => {
  const now = useNow(timers.length > 0);
  if (timers.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {timers.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="text-[13px] font-[800] text-[#23231f] bg-[#e8b98e] px-3 py-1.5 rounded-full tabular-nums cursor-pointer active:scale-95"
        >
          {t.endsAt === null ? '⏸' : '⏱'} {t.label} · {formatRemaining(remainingMs(t, now))}
        </button>
      ))}
    </div>
  );
};
