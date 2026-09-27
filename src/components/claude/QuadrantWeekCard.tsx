import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { MealItem, SingleMeal } from '../../types';
import { formatISODate, getISOWeek, GERMAN_MONTHS_SHORT } from '../../utils/dateUtils';
import { getMealItemForDate } from '../../hooks/useSyncState';

interface WeekMealDisplay {
  dateStr: string;
  dayKey: string;
  dayShort: string;
  dayNumber: number;
  dishName: string;
  cook: string;
  img?: string;
  rawMeal?: SingleMeal | null;
}

interface QuadrantWeekCardProps {
  mealPlan: MealItem[];
  onSelectMeal?: (dayOrDate: string, meal: SingleMeal) => void;
  onOpenMealDetails?: (dayOrDate: string, meal: SingleMeal | null) => void;
}

const GERMAN_DAY_KEYS: Array<{ key: 'so' | 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa'; short: string }> = [
  { key: 'so', short: 'SO' },
  { key: 'mo', short: 'MO' },
  { key: 'di', short: 'DI' },
  { key: 'mi', short: 'MI' },
  { key: 'do', short: 'DO' },
  { key: 'fr', short: 'FR' },
  { key: 'sa', short: 'SA' }
];

export const QuadrantWeekCard: React.FC<QuadrantWeekCardProps> = ({
  mealPlan,
  onOpenMealDetails
}) => {
  const now = new Date();
  // 0 = the 6 days after today; each step moves one full page (6 days) back or forward
  const [pageOffset, setPageOffset] = useState(0);
  const DAYS_PER_PAGE = 6;
  const firstDayOffset = 1 + pageOffset * DAYS_PER_PAGE;

  const next6Days: WeekMealDisplay[] = [];
  for (let i = firstDayOffset; i < firstDayOffset + DAYS_PER_PAGE; i++) {
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + i);
    const dayOfWeekIndex = nextDate.getDay();
    const dayInfo = GERMAN_DAY_KEYS[dayOfWeekIndex];
    const dateStr = formatISODate(nextDate);

    // Resolve meal for this exact date (or fallback template)
    const mealItem = getMealItemForDate(mealPlan, dateStr);
    const singleMeal =
      mealItem?.meals?.abendessen ||
      mealItem?.meals?.mittagessen ||
      mealItem?.meals?.fruehstueck ||
      null;


    next6Days.push({
      dateStr,
      dayKey: dayInfo.key,
      dayShort: dayInfo.short,
      dayNumber: nextDate.getDate(),
      dishName: singleMeal?.title || 'Rezept planen',
      cook: '',
      img: singleMeal?.image || undefined,
      rawMeal: singleMeal
    });
  }

  const firstNext = new Date(now);
  firstNext.setDate(now.getDate() + firstDayOffset);
  const lastNext = new Date(now);
  lastNext.setDate(now.getDate() + firstDayOffset + DAYS_PER_PAGE - 1);
  const firstWeek = getISOWeek(firstNext).weekNumber;
  const lastWeek = getISOWeek(lastNext).weekNumber;
  const weekNumberLabel = firstWeek === lastWeek ? `KW ${firstWeek}` : `KW ${firstWeek}/${lastWeek}`;
  const sameMonth = firstNext.getMonth() === lastNext.getMonth();
  const weekLabel = sameMonth
    ? `${firstNext.getDate()}. – ${lastNext.getDate()}. ${GERMAN_MONTHS_SHORT[lastNext.getMonth()]}`
    : `${firstNext.getDate()}. ${GERMAN_MONTHS_SHORT[firstNext.getMonth()]} – ${lastNext.getDate()}. ${GERMAN_MONTHS_SHORT[lastNext.getMonth()]}`;

  return (
    <div className="bg-[var(--blush)] rounded-[26px] p-[22px_24px_18px] md:p-[24px_26px_20px] flex flex-col gap-3 min-h-0 h-full w-full select-none shadow-xs border border-[var(--wash)]/40 transition-colors">
      {/* Header: Woche & Date Range */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <span className="text-[20px] md:text-[22px] font-[800] text-[var(--blushInk)] tracking-tight">
          Woche
        </span>
        <div className="flex items-center gap-1">
          {pageOffset !== 0 && (
            <button
              type="button"
              onClick={() => setPageOffset(0)}
              className="text-[11px] font-[700] text-[var(--blushInk)] bg-[var(--wash)] hover:bg-white/80 px-2.5 py-1 rounded-full border border-black/5 cursor-pointer mr-1"
            >
              Heute
            </button>
          )}
          <button
            type="button"
            onClick={() => setPageOffset((o) => o - 1)}
            aria-label="Vorherige Tage"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--blushInk)] hover:bg-[var(--wash)] active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[12px] font-[600] text-[var(--blushSoft)] text-center min-w-[118px]">
            <span className="font-[800] text-[var(--blushInk)]">{weekNumberLabel}</span> · {weekLabel}
          </span>
          <button
            type="button"
            onClick={() => setPageOffset((o) => o + 1)}
            aria-label="Nächste Tage"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--blushInk)] hover:bg-[var(--wash)] active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3x2 Grid of the other 6 week meals */}
      <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-2.5">
        {next6Days.map((m) => (
          <div
            key={m.dateStr}
            onClick={() => onOpenMealDetails?.(m.dateStr, m.rawMeal || null)}
            className="group min-h-0 bg-[var(--wash)] rounded-[16px] overflow-hidden flex flex-col cursor-pointer active:scale-[0.98] hover:shadow-xs transition-all border border-black/5"
            title={`${m.dayShort} ${m.dayNumber}.: ${m.dishName}`}
          >
            {/* Food Thumbnail */}
            <div className="flex-1 min-h-0 bg-[var(--photo)] relative overflow-hidden">
              {m.img ? (
                <img
                  src={m.img}
                  alt={m.dishName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--blushSoft)] group-hover:text-[var(--blushInk)] transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Label & Cook */}
            <div className="shrink-0 p-[7px_10px_8px] flex flex-col gap-0.5">
              <span className="text-[9px] tracking-[0.14em] uppercase font-[800] text-[var(--blushSoft)] truncate">
                {m.dayShort} {m.dayNumber}.{m.cook ? ` · ${m.cook}` : ''}
              </span>
              <span className="text-[12px] md:text-[13px] font-[700] text-[var(--ink)] leading-[1.2] line-clamp-1 group-hover:text-[var(--blushInk)] transition-colors">
                {m.dishName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
