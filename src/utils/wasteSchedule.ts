export interface WasteItem {
  id: string;
  name: string;
  dot: string;
  inDays: number;
  when: string;
  isSoon: boolean;
}

const GERMAN_DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const GERMAN_MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];

export function calculateWasteSchedule(now: Date = new Date()): WasteItem[] {
  // Configured cycle simulation based on day of month to stay deterministic and realistic
  const dayOfMonth = now.getDate();

  // Biotonne: every week (e.g. Wednesday)
  // Restmüll: every 2 weeks
  // Papier: every 3 weeks
  // Gelber Sack: every 2 weeks
  const baseOffsets = [
    { id: 'restmuell', name: 'Restmüll', dot: '#7a756c', cycle: 14, shift: 1 },
    { id: 'biotonne', name: 'Biotonne', dot: '#5d8a5f', cycle: 7, shift: 1 },
    { id: 'papier', name: 'Papier', dot: '#4f7ba8', cycle: 21, shift: 6 },
    { id: 'gelber_sack', name: 'Gelber Sack', dot: '#d9a13f', cycle: 14, shift: 5 }
  ];

  return baseOffsets.map((item) => {
    // Determine days until next collection
    const inDays = (item.shift - (dayOfMonth % item.cycle) + item.cycle) % item.cycle || item.cycle;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + inDays);

    const isSoon = inDays <= 1;
    let whenStr = '';
    if (inDays === 0) {
      whenStr = 'heute abholen';
    } else if (inDays === 1) {
      whenStr = 'morgen · abends raus';
    } else {
      const dName = GERMAN_DAYS[targetDate.getDay()].slice(0, 2);
      const mName = GERMAN_MONTHS[targetDate.getMonth()];
      whenStr = `${dName}, ${targetDate.getDate()}. ${mName}`;
    }

    return {
      id: item.id,
      name: item.name,
      dot: item.dot,
      inDays,
      when: whenStr,
      isSoon
    };
  }).sort((a, b) => a.inDays - b.inDays);
}
