import React, { useState } from 'react';
import { CalendarEvent, KitchenNote } from '../../types';
import { calculateWasteSchedule } from '../../utils/wasteSchedule';
import { getUpcomingWasteSchedule } from '../../utils/wasteParser';

interface QuadrantMultiTabCardProps {
  events: CalendarEvent[];
  notes: KitchenNote[];
  onAddNote: (text: string, author?: string) => void;
  onRemoveNote: (id: string) => void;
  householdAuthor?: string;
  onOpenCalendarSettings?: () => void;
  isCalendarLive?: boolean;
  isCalendarSyncing?: boolean;
  wasteEvents?: CalendarEvent[];
  wasteCalendarName?: string;
  onOpenWasteSettings?: () => void;
}

const GERMAN_MONTHS_SHORT = [
  'JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN',
  'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'
];

// Curated default occasions for lively family kitchen ambiance
const DEFAULT_OCCASIONS = [
  { m: 1, d: 1, title: 'Neujahr', who: 'Feiertag' },
  { m: 5, d: 1, title: 'Tag der Arbeit', who: 'Feiertag' },
  { m: 10, d: 3, title: 'Tag der Deutschen Einheit', who: 'Feiertag' },
  { m: 11, d: 8, title: 'Diwali', who: 'Lichterfest' },
  { m: 12, d: 24, title: 'Heiligabend', who: 'Familienfest' },
  { m: 12, d: 31, title: 'Silvester', who: 'Jahresende' }
];

export const QuadrantMultiTabCard: React.FC<QuadrantMultiTabCardProps> = ({
  events,
  notes,
  onAddNote,
  onRemoveNote,
  householdAuthor = 'Küche',
  onOpenCalendarSettings,
  isCalendarLive = false,
  isCalendarSyncing = false,
  wasteEvents = [],
  wasteCalendarName,
  onOpenWasteSettings
}) => {
  const [activeTab, setActiveTab] = useState<'Anlässe' | 'Pinnwand' | 'Müll'>('Anlässe');
  const [noteInput, setNoteInput] = useState('');

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Merge custom events and curated occasions
  const processedEvents = [
    ...events.map((e) => {
      const parts = e.date.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const diffDays = Math.round((d.getTime() - startToday.getTime()) / 86400000);
      return {
        id: e.id,
        title: e.title,
        who: e.location || (e.time ? `um ${e.time} Uhr` : 'Termin'),
        dayNum: d.getDate(),
        monthShort: GERMAN_MONTHS_SHORT[d.getMonth()] || 'MON',
        countdown: diffDays === 0 ? 'heute' : diffDays === 1 ? 'morgen' : `in ${diffDays} Tagen`,
        days: diffDays
      };
    }),
    ...DEFAULT_OCCASIONS.map((o, idx) => {
      let d = new Date(now.getFullYear(), o.m - 1, o.d);
      if (d < startToday) d = new Date(now.getFullYear() + 1, o.m - 1, o.d);
      const diffDays = Math.round((d.getTime() - startToday.getTime()) / 86400000);
      return {
        id: `occ_${idx}`,
        title: o.title,
        who: o.who,
        dayNum: o.d,
        monthShort: GERMAN_MONTHS_SHORT[o.m - 1],
        countdown: diffDays === 0 ? 'heute' : diffDays === 1 ? 'morgen' : `in ${diffDays} Tagen`,
        days: diffDays
      };
    })
  ]
    .filter((e) => e.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 6);

  // Real waste schedule if available, else simulation fallback
  const realWasteItems = wasteEvents && wasteEvents.length > 0
    ? getUpcomingWasteSchedule(wasteEvents, now)
    : [];
  const isRealWasteActive = realWasteItems.length > 0;
  const wasteItems = isRealWasteActive ? realWasteItems : calculateWasteSchedule(now);

  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const text = noteInput.trim();
      if (!text) return;
      onAddNote(text, householdAuthor);
      setNoteInput('');
    }
  };

  return (
    <div className="bg-[var(--butter)] rounded-[26px] p-[22px_24px_18px] md:p-[24px_26px_20px] flex flex-col gap-3 min-h-0 h-full w-full select-none shadow-xs border border-[var(--wash)]/40 transition-colors">
      {/* Tab Switcher Pills */}
      <div className="flex items-center gap-2 shrink-0">
        {(['Anlässe', 'Pinnwand', 'Müll'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`text-[13px] md:text-[14px] font-[800] px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--wash)] text-[var(--ink)] shadow-2xs'
                  : 'bg-transparent text-[var(--butterInk)] hover:bg-[var(--wash)]/50'
              }`}
            >
              {tab}
            </button>
          );
        })}

        {activeTab === 'Anlässe' && onOpenCalendarSettings && (
          <button
            type="button"
            onClick={onOpenCalendarSettings}
            className={`ml-auto text-[11px] font-[700] px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
              isCalendarLive
                ? 'bg-[var(--wash)] text-[var(--butterInk)] hover:text-[var(--ink)]'
                : 'bg-[var(--wash)] text-[var(--blushInk)] hover:bg-white/80 shadow-2xs'
            }`}
            title="Google oder Apple Kalender konfigurieren"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isCalendarLive ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isCalendarLive ? (isCalendarSyncing ? 'Synchronisiert…' : 'Live Kalender') : '+ Kalender verknüpfen'}</span>
          </button>
        )}

        {activeTab === 'Müll' && onOpenWasteSettings && (
          <button
            type="button"
            onClick={onOpenWasteSettings}
            className={`ml-auto text-[11px] font-[700] px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
              isRealWasteActive
                ? 'bg-[var(--wash)] text-[var(--butterInk)] hover:text-[var(--ink)]'
                : 'bg-[var(--wash)] text-[var(--blushInk)] hover:bg-white/80 shadow-2xs'
            }`}
            title="Müllabfuhr-Kalender (.ics / Link) konfigurieren"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isRealWasteActive ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isRealWasteActive ? (wasteCalendarName || 'Echter Müllkalender') : '+ Müllkalender (.ics)'}</span>
          </button>
        )}
      </div>

      {/* TAB 1: Anlässe */}
      {activeTab === 'Anlässe' && (
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2.5 pr-1 scrollbar-none">
          {processedEvents.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 bg-[var(--wash)] rounded-[16px] p-[9px_13px] border border-black/5 shrink-0"
            >
              {/* Date Box */}
              <div className="w-[42px] h-[42px] shrink-0 bg-[var(--butter)] rounded-[12px] flex flex-col items-center justify-center leading-none border border-black/5">
                <span className="text-[17px] font-[800] text-[var(--ink)]">
                  {e.dayNum}
                </span>
                <span className="text-[9px] font-[800] tracking-[0.08em] uppercase text-[var(--butterInk)] mt-0.5">
                  {e.monthShort}
                </span>
              </div>

              {/* Event Title & Subtitle */}
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-[14px] font-[700] text-[var(--ink)] truncate">
                  {e.title}
                </span>
                <span className="text-[11.5px] font-[500] text-[var(--muted)] truncate">
                  {e.who}
                </span>
              </div>

              {/* Countdown badge */}
              <span className="shrink-0 text-[11.5px] font-[700] text-[var(--butterInk)] pl-1">
                {e.countdown}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Pinnwand */}
      {activeTab === 'Pinnwand' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2.5">
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2.5 pr-1 scrollbar-none">
            {notes.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[var(--butterInk)] text-[13px] font-[600] py-8">
                Keine Notizen angepinnt
              </div>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className="bg-[var(--wash)] rounded-[16px] p-[10px_13px] flex flex-col gap-1 border border-black/5 shrink-0"
                >
                  <span className="text-[13.5px] md:text-[14px] font-[600] leading-[1.35] text-[var(--ink)]">
                    {n.text}
                  </span>
                  <div className="flex items-center justify-between text-[11px] font-[700] text-[var(--butterInk)] pt-0.5">
                    <span>{n.author || 'Notiz'}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveNote(n.id)}
                      className="hover:text-[var(--ink)] active:scale-95 transition-all cursor-pointer font-[700]"
                    >
                      entfernen
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Add note input */}
          <div className="relative flex items-center shrink-0">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onKeyDown={handleNoteKeyDown}
              placeholder="Notiz anpinnen …"
              className="w-full bg-[var(--wash)] border-none rounded-[14px] p-[11px_48px_11px_14px] text-[13.5px] font-[600] text-[var(--ink)] placeholder-[var(--faint)] outline-none focus:ring-1 focus:ring-[var(--butterInk)] transition-all"
            />
            {noteInput.trim() && (
              <button
                type="button"
                onClick={() => {
                  const text = noteInput.trim();
                  if (!text) return;
                  onAddNote(text, householdAuthor);
                  setNoteInput('');
                }}
                className="absolute right-2 px-2.5 py-1 rounded-lg bg-[var(--butterInk)] text-white text-[11.5px] font-bold shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Pinnen
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Müll */}
      {activeTab === 'Müll' && (
        <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 py-0.5">
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-2">
            {wasteItems.map((w) => (
              <div
                key={w.id}
                className="flex-1 flex items-center gap-3 bg-[var(--wash)] rounded-[16px] px-4 border border-black/5"
              >
                <span
                  className="w-[10px] h-[10px] rounded-[3px] shrink-0"
                  style={{ backgroundColor: w.dot }}
                />
                <span className="flex-1 text-[14.5px] md:text-[15.5px] font-[700] text-[var(--ink)]">
                  {w.name}
                </span>
                <span
                  className={`text-[12px] md:text-[12.5px] font-[600] ${
                    w.isSoon ? 'text-[var(--blushInk)] font-[700]' : 'text-[var(--muted)]'
                  }`}
                >
                  {w.when}
                </span>
              </div>
            ))}
          </div>

          {/* Source indicator */}
          <div className="flex items-center justify-between text-[10.5px] font-[600] text-[var(--butterInk)] px-2 pt-1">
            <span>
              {isRealWasteActive ? `📅 ${wasteCalendarName || 'Abfallkalender aktiv'}` : '⚡ Standard-Zyklus aktiv'}
            </span>
            {onOpenWasteSettings && (
              <button
                type="button"
                onClick={onOpenWasteSettings}
                className="underline hover:text-[var(--ink)] cursor-pointer font-bold"
              >
                {isRealWasteActive ? 'Ändern' : 'Jetzt .ics hochladen'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
