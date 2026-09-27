import { CalendarEvent } from '../types';
import { categorizeWasteTitle } from './wasteParser';
import { formatISODate } from './dateUtils';

/** From this hour on the evening before a pickup the bins should go out */
export const REMINDER_EVENING_FROM_HOUR = 16;
/** Until this hour on the pickup day a late reminder is still shown */
export const REMINDER_MORNING_UNTIL_HOUR = 9;

export interface WasteReminder {
  /** Pickup date (YYYY-MM-DD); used to mark the reminder as done */
  pickupDate: string;
  mode: 'evening' | 'morning';
  headline: string;
  bins: Array<{ name: string; dot: string }>;
}

/**
 * The reminder to show right now, or null.
 * Evening before a pickup: "Heute Abend rausstellen"; pickup morning: "Heute wird abgeholt".
 */
export function getWasteReminder(
  events: CalendarEvent[] | undefined,
  now: Date,
  doneDates: string[] = []
): WasteReminder | null {
  if (!events || events.length === 0) return null;

  const today = formatISODate(now);
  const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrow = formatISODate(tomorrowDate);
  const hour = now.getHours();

  let pickupDate: string | null = null;
  let mode: WasteReminder['mode'] = 'evening';
  if (hour >= REMINDER_EVENING_FROM_HOUR && events.some((e) => e.date === tomorrow)) {
    pickupDate = tomorrow;
  } else if (hour < REMINDER_MORNING_UNTIL_HOUR && events.some((e) => e.date === today)) {
    pickupDate = today;
    mode = 'morning';
  }
  if (!pickupDate || doneDates.includes(pickupDate)) return null;

  const bins: WasteReminder['bins'] = [];
  for (const event of events) {
    if (event.date !== pickupDate) continue;
    const { name, dot } = categorizeWasteTitle(event.title);
    if (!bins.some((b) => b.name === name)) bins.push({ name, dot });
  }

  return {
    pickupDate,
    mode,
    headline: mode === 'evening' ? 'Heute Abend raus' : 'Heute Abholung',
    bins
  };
}
