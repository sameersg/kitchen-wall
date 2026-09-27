import { MealItem, MealType, SingleMeal } from '../types';

export interface MealSlotInfo {
  type: MealType;
  label: string;
  short: string;
  /** Text colour of the slot label */
  color: string;
  /** Row background in the day editor */
  bg: string;
}

export const MEAL_SLOTS: MealSlotInfo[] = [
  { type: 'fruehstueck', label: 'Frühstück', short: 'FRÜH', color: 'var(--butterInk)', bg: 'var(--butter)' },
  { type: 'mittagessen', label: 'Mittag', short: 'MITTAG', color: 'var(--greenInk)', bg: 'var(--green)' },
  { type: 'abendessen', label: 'Abend', short: 'ABEND', color: 'var(--blushInk)', bg: 'var(--blush)' }
];

// The dish shown big for a day: dinner first, then lunch, then breakfast
const MAIN_PRIORITY: MealType[] = ['abendessen', 'mittagessen', 'fruehstueck'];

export function mainMealType(item: MealItem | null | undefined): MealType | null {
  return MAIN_PRIORITY.find((type) => item?.meals?.[type]?.title) || null;
}

export interface PlannedSlot extends MealSlotInfo {
  meal: SingleMeal;
}

/** Planned meals of a day in breakfast → dinner order. */
export function plannedSlots(item: MealItem | null | undefined): PlannedSlot[] {
  return MEAL_SLOTS.flatMap((slot) => {
    const meal = item?.meals?.[slot.type];
    return meal?.title ? [{ ...slot, meal }] : [];
  });
}
