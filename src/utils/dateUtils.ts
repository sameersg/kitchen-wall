/**
 * Date & Calendar Week Utility Functions
 */

export const GERMAN_WEEKDAY_NAMES: Record<string, string> = {
  mo: 'Montag',
  di: 'Dienstag',
  mi: 'Mittwoch',
  do: 'Donnerstag',
  fr: 'Freitag',
  sa: 'Samstag',
  so: 'Sonntag'
};

export const GERMAN_DAY_KEYS: Array<{ key: 'so' | 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa'; short: string; label: string }> = [
  { key: 'so', short: 'So', label: 'Sonntag' },
  { key: 'mo', short: 'Mo', label: 'Montag' },
  { key: 'di', short: 'Di', label: 'Dienstag' },
  { key: 'mi', short: 'Mi', label: 'Mittwoch' },
  { key: 'do', short: 'Do', label: 'Donnerstag' },
  { key: 'fr', short: 'Fr', label: 'Freitag' },
  { key: 'sa', short: 'Sa', label: 'Samstag' }
];

export const GERMAN_MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

export const GERMAN_MONTHS_SHORT = [
  'Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni',
  'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'
];

/** Formats a date as YYYY-MM-DD in local time */
export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parses a YYYY-MM-DD string into a Date object at local midnight */
export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Calculates the ISO 8601 calendar week number */
export function getISOWeek(d: Date): { weekNumber: number; year: number } {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return { weekNumber, year: date.getFullYear() };
}

/** Returns Monday of the week for a given date */
export function getMonday(d: Date = new Date()): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  date.setDate(date.getDate() - day);
  return date;
}

export interface DayInfo {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayKey: 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so';
  dayShort: string;
  dayLabel: string;
  dayNumber: number;
  monthShort: string;
  isToday: boolean;
}

/** Returns an array of 7 days (Monday through Sunday) for a week offset from current week (0 = this week, 1 = next week, etc.) */
export function getWeekDates(weekOffset: number = 0): {
  days: DayInfo[];
  monday: Date;
  sunday: Date;
  weekNumber: number;
  year: number;
  label: string;
  weekKey: string;
} {
  const now = new Date();
  const currentMonday = getMonday(now);
  
  const targetMonday = new Date(currentMonday);
  targetMonday.setDate(currentMonday.getDate() + weekOffset * 7);

  const { weekNumber, year } = getISOWeek(targetMonday);
  const todayStr = formatISODate(now);

  const dayKeys: Array<'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so'> = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'];
  const dayShorts = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const dayLabels = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

  const days: DayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(targetMonday);
    d.setDate(targetMonday.getDate() + i);
    const dateStr = formatISODate(d);

    days.push({
      date: d,
      dateStr,
      dayKey: dayKeys[i],
      dayShort: dayShorts[i],
      dayLabel: dayLabels[i],
      dayNumber: d.getDate(),
      monthShort: GERMAN_MONTHS_SHORT[d.getMonth()],
      isToday: dateStr === todayStr
    });
  }

  const sunday = days[6].date;
  const sameMonth = targetMonday.getMonth() === sunday.getMonth();
  const rangeStr = sameMonth
    ? `${targetMonday.getDate()}. – ${sunday.getDate()}. ${GERMAN_MONTHS_SHORT[sunday.getMonth()]}`
    : `${targetMonday.getDate()}. ${GERMAN_MONTHS_SHORT[targetMonday.getMonth()]} – ${sunday.getDate()}. ${GERMAN_MONTHS_SHORT[sunday.getMonth()]}`;

  let weekRel = `KW ${weekNumber}`;
  if (weekOffset === 0) weekRel = `Diese Woche (KW ${weekNumber})`;
  else if (weekOffset === 1) weekRel = `Nächste Woche (KW ${weekNumber})`;
  else if (weekOffset === 2) weekRel = `In 2 Wochen (KW ${weekNumber})`;
  else if (weekOffset === -1) weekRel = `Vorwoche (KW ${weekNumber})`;

  return {
    days,
    monday: targetMonday,
    sunday,
    weekNumber,
    year,
    label: `${weekRel} · ${rangeStr}`,
    weekKey: `${year}-W${String(weekNumber).padStart(2, '0')}`
  };
}

/** Formats a full date in German: e.g. "Dienstag, 22. September 2026" */
export function formatFullGermanDate(date: Date): string {
  const dayIdx = (date.getDay() + 6) % 7;
  const dayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  return `${dayNames[dayIdx]}, ${date.getDate()}. ${GERMAN_MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}
