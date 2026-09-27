import React, { useState } from 'react';
import { MealItem } from '../../types';
import { formatISODate, getISOWeek, GERMAN_MONTHS_SHORT } from '../../utils/dateUtils';
import { getMealItemForDate } from '../../hooks/useSyncState';
import { plannedSlots, mainMealType, PlannedSlot } from '../../utils/mealSlots';

interface WeekDayDisplay {
  dateStr: string;
  dayLabel: string;
  img?: string;
  slots: PlannedSlot[];
}

interface QuadrantWeekCardProps {
  mealPlan: MealItem[];
  /** Opens the editor for one day (breakfast, lunch and dinner) */
  onOpenDay?: (dateStr: string) => void;
}

const DAY_SHORT = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];
const DAYS_PER_PAGE = 6;

export const QuadrantWeekCard: React.FC<QuadrantWeekCardProps> = ({ mealPlan, onOpenDay }) => {
  const now = new Date();
  // 0 = the 6 days after today; each step moves one full page (6 days) back or forward
  const [pageOffset, setPageOffset] = useState(0);
  const firstDayOffset = 1 + pageOffset * DAYS_PER_PAGE;

  const days: WeekDayDisplay[] = [];
  for (let i = firstDayOffset; i < firstDayOffset + DAYS_PER_PAGE; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    const dateStr = formatISODate(date);
    const item = getMealItemForDate(mealPlan, dateStr);
    const main = mainMealType(item);
    days.push({
      dateStr,
      dayLabel: `${DAY_SHORT[date.getDay()]} ${date.getDate()}.`,
      img: main ? item.meals?.[main]?.image || undefined : undefined,
      slots: plannedSlots(item)
    });
  }

  const first = new Date(now);
  first.setDate(now.getDate() + firstDayOffset);
  const last = new Date(now);
  last.setDate(now.getDate() + firstDayOffset + DAYS_PER_PAGE - 1);
  const weekLabel =
    first.getMonth() === last.getMonth()
      ? `${first.getDate()}. – ${last.getDate()}. ${GERMAN_MONTHS_SHORT[last.getMonth()]}`
      : `${first.getDate()}. ${GERMAN_MONTHS_SHORT[first.getMonth()]} – ${last.getDate()}. ${GERMAN_MONTHS_SHORT[last.getMonth()]}`;
  const firstWeek = getISOWeek(first).weekNumber;
  const lastWeek = getISOWeek(last).weekNumber;
  const weekNumberLabel = firstWeek === lastWeek ? `KW ${firstWeek}` : `KW ${firstWeek}/${lastWeek}`;

  const navButton =
    'w-[38px] h-[38px] rounded-full bg-[var(--wash)] flex items-center justify-center text-[20px] font-[700] text-[var(--blushInk)] hover:text-[var(--ink)] active:scale-95 transition-all cursor-pointer select-none';

  return (
    <div className="bg-[var(--blush)] rounded-[26px] p-[22px_24px_18px] md:p-[24px_26px_20px] flex flex-col gap-3.5 min-h-0 h-full w-full select-none  transition-colors">
      {/* Header: title and page navigation */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <span className="text-[20px] md:text-[22px] font-[800] text-[var(--blushInk)] tracking-tight">
          Woche
        </span>
        <div className="flex items-center gap-1.5">
          {pageOffset !== 0 && (
            <button
              type="button"
              onClick={() => setPageOffset(0)}
              className="text-[12px] font-[800] text-[var(--blushInk)] hover:text-[var(--ink)] bg-[var(--wash)] px-3.5 py-[9px] rounded-full cursor-pointer mr-1"
            >
              Heute
            </button>
          )}
          <button type="button" onClick={() => setPageOffset((o) => o - 1)} aria-label="Vorherige Tage" className={navButton}>
            ‹
          </button>
          <span className="min-w-[118px] text-center text-[12px] md:text-[13px] font-[700] text-[var(--blushSoft)] leading-tight">
            {weekLabel}
            <span className="block text-[10px] font-[800] tracking-[0.08em] text-[var(--blushInk)]/70">{weekNumberLabel}</span>
          </span>
          <button type="button" onClick={() => setPageOffset((o) => o + 1)} aria-label="Nächste Tage" className={navButton}>
            ›
          </button>
        </div>
      </div>

      {/* 3x2 grid, one tile per day with all planned meals */}
      <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-2.5">
        {days.map((day) => (
          <div
            key={day.dateStr}
            onClick={() => onOpenDay?.(day.dateStr)}
            className="group min-h-0 bg-[var(--wash)] rounded-[16px] overflow-hidden flex flex-col cursor-pointer hover:shadow-[0_0_0_2px_var(--blushSoft)] active:scale-[0.98] transition-all"
            title={day.slots.map((s) => `${s.label}: ${s.meal.title}`).join('\n') || 'Mahlzeit planen'}
          >
            <div className="relative flex-1 min-h-0 bg-[var(--photo)] overflow-hidden">
              {day.img && (
                <img
                  src={day.img}
                  alt=""
                  className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              )}
              {day.slots.length > 1 && (
                <span className="absolute top-2 left-2 text-[10px] font-[800] text-white bg-[rgba(20,18,15,0.62)] backdrop-blur-[6px] px-[9px] py-1 rounded-full">
                  {day.slots.length} Mahlzeiten
                </span>
              )}
            </div>
            <div className="shrink-0 p-[8px_10px_9px] flex flex-col gap-[3px]">
              <span className="text-[9px] tracking-[0.14em] font-[800] text-[var(--blushSoft)]">{day.dayLabel}</span>
              {day.slots.map((s) => (
                <div key={s.type} className="flex items-baseline gap-1.5 min-w-0">
                  <span className="shrink-0 w-[42px] text-[8px] tracking-[0.1em] font-[800]" style={{ color: s.color }}>
                    {s.short}
                  </span>
                  <span className="flex-1 min-w-0 text-[12px] font-[700] text-[var(--ink)] truncate">{s.meal.title}</span>
                </div>
              ))}
              {day.slots.length === 0 && (
                <span className="text-[12px] font-[700] text-[var(--blushSoft)] whitespace-nowrap truncate">+ Planen</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
