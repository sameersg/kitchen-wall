import { CalendarEvent } from '../types';
import { WasteItem } from './wasteSchedule';

export interface WasteCategoryInfo {
  type: 'restmuell' | 'biotonne' | 'gelber_sack' | 'papier' | 'sondermuell' | 'sonstiges';
  name: string;
  dot: string;
}

const GERMAN_DAYS_SHORT = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
const GERMAN_MONTHS_SHORT = [
  'Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni',
  'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'
];

/**
 * Categorize waste title into standard German disposal bins and colors
 */
export function categorizeWasteTitle(title: string): WasteCategoryInfo {
  const lower = (title || '').toLowerCase();

  // 1. Biotonne / Bioabfall
  if (
    lower.includes('bio') ||
    lower.includes('grünabfall') ||
    lower.includes('gartenabfall') ||
    lower.includes('braune tonne')
  ) {
    return {
      type: 'biotonne',
      name: 'Biotonne',
      dot: '#5d8a5f' // Forest Green
    };
  }

  // 2. Gelber Sack / Wertstoff
  if (
    lower.includes('gelb') ||
    lower.includes('wertstoff') ||
    lower.includes('verpackung') ||
    lower.includes('dsd') ||
    lower.includes('lvp')
  ) {
    return {
      type: 'gelber_sack',
      name: 'Gelber Sack',
      dot: '#d9a13f' // Amber Yellow
    };
  }

  // 3. Altpapier / Papiertonne
  if (
    lower.includes('papier') ||
    lower.includes('blaue tonne') ||
    lower.includes('pappe') ||
    lower.includes('karton')
  ) {
    return {
      type: 'papier',
      name: 'Altpapier',
      dot: '#4f7ba8' // Steel Blue
    };
  }

  // 4. Restmüll / Restabfall / Schwarze / Graue Tonne
  if (
    lower.includes('rest') ||
    lower.includes('schwarz') ||
    lower.includes('grau') ||
    lower.includes('hausmüll')
  ) {
    return {
      type: 'restmuell',
      name: 'Restmüll',
      dot: '#7a756c' // Slate Gray
    };
  }

  // 5. Schadstoff, Sperrmüll, Sonderabfall
  if (
    lower.includes('schadstoff') ||
    lower.includes('sperrmüll') ||
    lower.includes('sonder') ||
    lower.includes('elektro') ||
    lower.includes('tannen') ||
    lower.includes('baum')
  ) {
    return {
      type: 'sondermuell',
      name: title.length > 20 ? title.slice(0, 18) + '…' : title,
      dot: '#a855f7' // Purple
    };
  }

  return {
    type: 'sonstiges',
    name: title.length > 20 ? title.slice(0, 18) + '…' : title,
    dot: '#9e9992'
  };
}

/**
 * Parse standard .ics calendar string into CalendarEvent array
 */
export function parseIcsContent(icsContent: string): CalendarEvent[] {
  if (!icsContent || typeof icsContent !== 'string') return [];

  // Line unfolding (RFC 5545)
  const cleanIcs = icsContent.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const events: CalendarEvent[] = [];
  const eventBlocks = cleanIcs.split('BEGIN:VEVENT');

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split('END:VEVENT')[0];

    const summaryMatch = block.match(/SUMMARY.*?:(.*?)(\r?\n[A-Z]|\r?\nEND)/s);
    const dtstartMatch = block.match(/DTSTART.*?:(\d{8}(T\d{6}Z?)?)/);
    const locationMatch = block.match(/LOCATION.*?:(.*?)(\r?\n[A-Z]|\r?\nEND)/s);

    if (summaryMatch && dtstartMatch) {
      let title = summaryMatch[1].replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, ' ').trim();
      // Remove trailing quotes if present
      title = title.replace(/^["']|["']$/g, '');

      const rawStart = dtstartMatch[1];
      const isAllDay = !rawStart.includes('T');

      const year = rawStart.substring(0, 4);
      const month = rawStart.substring(4, 6);
      const day = rawStart.substring(6, 8);
      const dateStr = `${year}-${month}-${day}`;

      let timeStr: string | undefined = undefined;
      if (!isAllDay && rawStart.length >= 13) {
        const hour = rawStart.substring(9, 11);
        const min = rawStart.substring(11, 13);
        timeStr = `${hour}:${min}`;
      }

      events.push({
        id: 'ics_' + i + '_' + dateStr,
        title,
        date: dateStr,
        time: timeStr,
        isAllDay,
        location: locationMatch ? locationMatch[1].trim() : undefined
      });
    }
  }

  return events;
}

/**
 * Convert parsed waste events into displayed WasteItem list for the dashboard
 */
export function getUpcomingWasteSchedule(
  events: CalendarEvent[],
  now: Date = new Date()
): WasteItem[] {
  if (!events || events.length === 0) return [];

  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStr = startToday.toISOString().split('T')[0];

  // Filter future events
  const futureEvents = events.filter((e) => e.date >= todayStr);
  if (futureEvents.length === 0) return [];

  // Group by waste category to get the next date for each bin type
  const nextPerCategory = new Map<string, { event: CalendarEvent; inDays: number; cat: WasteCategoryInfo }>();

  for (const e of futureEvents) {
    const parts = e.date.split('-');
    const eventDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const diffDays = Math.round((eventDate.getTime() - startToday.getTime()) / 86400000);

    if (diffDays < 0) continue;

    const cat = categorizeWasteTitle(e.title);
    const existing = nextPerCategory.get(cat.type);

    if (!existing || diffDays < existing.inDays) {
      nextPerCategory.set(cat.type, {
        event: e,
        inDays: diffDays,
        cat
      });
    }
  }

  // Sort by inDays ascending
  const sorted = Array.from(nextPerCategory.values()).sort((a, b) => a.inDays - b.inDays);

  return sorted.slice(0, 5).map(({ event, inDays, cat }) => {
    const parts = event.date.split('-');
    const eventDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));

    let whenStr = '';
    if (inDays === 0) {
      whenStr = 'heute abholen';
    } else if (inDays === 1) {
      whenStr = 'morgen · abends raus';
    } else {
      const dName = GERMAN_DAYS_SHORT[eventDate.getDay()];
      const mName = GERMAN_MONTHS_SHORT[eventDate.getMonth()];
      whenStr = `${dName}, ${eventDate.getDate()}. ${mName}`;
    }

    return {
      id: event.id,
      name: cat.name,
      dot: cat.dot,
      inDays,
      when: whenStr,
      isSoon: inDays <= 1
    };
  });
}
