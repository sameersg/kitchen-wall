import React, { useEffect, useState } from 'react';
import { MealItem, MealType, SingleMeal } from '../../types';
import { MEAL_SLOTS } from '../../utils/mealSlots';
import { autoFindFoodImage } from '../../utils/foodImageFinder';
import { parseISODate } from '../../utils/dateUtils';

interface DayMealsModalProps {
  isOpen: boolean;
  dateStr: string;
  mealItem: MealItem | null;
  onSaveSlot: (dateStr: string, type: MealType, slot: SingleMeal | null) => void;
  /** Opens the detailed editor (image, ingredients, cooking time) for one meal */
  onOpenDetails?: (dateStr: string, type: MealType) => void;
  onClose: () => void;
}

type Drafts = Record<MealType, string>;

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/** "Montag, 28. September" – the year only when it isn't the current one */
function dayTitle(dateStr: string): string {
  const d = parseISODate(dateStr);
  const year = d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : '';
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}${year}`;
}

const emptyDrafts = (): Drafts => ({ fruehstueck: '', mittagessen: '', abendessen: '' });

export const DayMealsModal: React.FC<DayMealsModalProps> = ({
  isOpen,
  dateStr,
  mealItem,
  onSaveSlot,
  onOpenDetails,
  onClose
}) => {
  const [drafts, setDrafts] = useState<Drafts>(emptyDrafts);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const next = emptyDrafts();
    MEAL_SLOTS.forEach(({ type }) => {
      next[type] = mealItem?.meals?.[type]?.title || '';
    });
    setDrafts(next);
  }, [isOpen, dateStr, mealItem]);

  if (!isOpen) return null;

  const plannedCount = MEAL_SLOTS.filter(({ type }) => drafts[type].trim()).length;

  /** Writes every changed slot; new dishes get an image looked up automatically. */
  const saveChanges = async () => {
    setIsSaving(true);
    try {
      await Promise.all(
        MEAL_SLOTS.map(async ({ type, label }) => {
          const previous = mealItem?.meals?.[type] || null;
          const title = drafts[type].trim();
          if (title === (previous?.title || '')) return;
          if (!title) {
            onSaveSlot(dateStr, type, null);
            return;
          }
          const image = await autoFindFoodImage(title).catch(() => '');
          onSaveSlot(dateStr, type, {
            title,
            category: label,
            cookTime: previous?.cookTime || '',
            image,
            ingredients: []
          });
        })
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDone = async () => {
    await saveChanges();
    onClose();
  };

  const handleDetails = async (type: MealType) => {
    await saveChanges();
    onOpenDetails?.(dateStr, type);
  };

  return (
    <div
      onClick={handleDone}
      className="fixed inset-0 bg-[rgba(20,19,16,0.72)] flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] bg-[var(--bg)] text-[var(--ink)] rounded-[28px] p-[28px_30px] flex flex-col gap-[18px] shadow-2xl"
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-serif text-[30px] md:text-[34px] leading-none">
            {dayTitle(dateStr)}
          </span>
          <span className="text-[12px] font-[700] text-[var(--muted)] shrink-0">
            {plannedCount} von 3 Mahlzeiten
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {MEAL_SLOTS.map(({ type, label, color, bg }) => (
            <div
              key={type}
              className="flex items-center gap-3 rounded-[16px] p-[10px_12px_10px_16px]"
              style={{ background: bg }}
            >
              <span
                className="w-[82px] shrink-0 text-[11px] tracking-[0.1em] uppercase font-[800]"
                style={{ color }}
              >
                {label}
              </span>
              <input
                value={drafts[type]}
                onChange={(e) => setDrafts((d) => ({ ...d, [type]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleDone()}
                placeholder="Nichts geplant"
                className="flex-1 min-w-0 bg-[var(--wash)] border-none rounded-[12px] p-[12px_14px] text-[16px] font-[600] text-[var(--ink)] placeholder-[var(--faint)] outline-none"
              />
              {drafts[type].trim() && onOpenDetails && (
                <button
                  type="button"
                  onClick={() => handleDetails(type)}
                  title="Bild, Zutaten & Kochzeit"
                  className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[15px] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--wash)] cursor-pointer"
                >
                  ✎
                </button>
              )}
              {drafts[type] && (
                <button
                  type="button"
                  onClick={() => setDrafts((d) => ({ ...d, [type]: '' }))}
                  title="Leeren"
                  className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[18px] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--wash)] cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleDone}
          disabled={isSaving}
          className="self-end text-[14px] font-[800] text-white bg-[#23231f] px-6 py-[13px] rounded-full cursor-pointer hover:opacity-85 disabled:opacity-60"
        >
          {isSaving ? 'Speichert …' : 'Fertig'}
        </button>
      </div>
    </div>
  );
};
