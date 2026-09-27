import { AppState, TimerPreset, QuickBookmark, MealItem } from '../types';
import { getISOWeek, parseISODate } from './dateUtils';

export const DEFAULT_TIMER_PRESETS: TimerPreset[] = [
  { id: 'tea', label: 'Tee ziehen', seconds: 180, iconName: 'Coffee' },
  { id: 'soft-egg', label: 'Weiches Ei', seconds: 330, iconName: 'Egg' },
  { id: 'hard-egg', label: 'Hartes Ei', seconds: 510, iconName: 'Egg' },
  { id: 'pasta', label: 'Nudeln al dente', seconds: 540, iconName: 'Utensils' },
  { id: 'pizza', label: 'Pizza / Ofen', seconds: 900, iconName: 'Flame' },
  { id: 'dough', label: 'Teig gehen lassen', seconds: 1800, iconName: 'Timer' },
];

export const DEFAULT_BOOKMARKS: QuickBookmark[] = [
  { id: 'chefkoch', title: 'Chefkoch Rezepte', url: 'https://www.chefkoch.de', category: 'Kochen' },
  { id: 'kitchenstories', title: 'Kitchen Stories', url: 'https://www.kitchenstories.com/de', category: 'Inspiration' },
  { id: 'eatsmarter', title: 'EatSmarter Gesund', url: 'https://eatsmarter.de', category: 'Gesund' },
  { id: 'springlane', title: 'Back-Ideen', url: 'https://www.springlane.de/magazin/rezeptideen/', category: 'Backen' }
];

const DATE_ID = /^meal_(\d{4}-\d{2}-\d{2})$/;

/**
 * Brings a stored meal-plan entry into the current shape.
 * Keeps the entry's date: earlier versions dropped it here, which made dated
 * meals vanish after a reload. Entries hit by that still carry the date in
 * their id ("meal_2026-09-28"), so it is restored from there.
 */
export function normalizeMealItem(item: any): MealItem {
  if (!item) {
    return {
      id: 'meal_' + Math.random().toString(36).substring(2, 6),
      day: 'mo',
      dayLabel: 'Montag',
      meals: { fruehstueck: null, mittagessen: null, abendessen: null }
    };
  }

  const date: string | undefined = item.date || (typeof item.id === 'string' ? item.id.match(DATE_ID)?.[1] : undefined);
  const dated = date
    ? { date, weekKey: item.weekKey || (() => {
        const { weekNumber, year } = getISOWeek(parseISODate(date));
        return `${year}-W${String(weekNumber).padStart(2, '0')}`;
      })() }
    : {};

  if (item.meals && typeof item.meals === 'object') {
    return {
      id: item.id || 'meal_' + (date || item.day || 'mo'),
      day: item.day || 'mo',
      dayLabel: item.dayLabel || '',
      ...dated,
      meals: {
        fruehstueck: item.meals.fruehstueck || null,
        mittagessen: item.meals.mittagessen || null,
        abendessen: item.meals.abendessen || null
      }
    };
  }

  // Legacy single-meal migration: put legacy item into abendessen slot
  const legacyDinner = item.title
    ? {
        title: item.title,
        category: item.category || 'Hauptgericht',
        cookTime: item.cookTime || '25 Min',
        calories: item.calories,
        image: item.image || '',
        ingredients: item.ingredients || []
      }
    : null;

  return {
    id: item.id || 'meal_' + (date || item.day),
    day: item.day,
    dayLabel: item.dayLabel,
    ...dated,
    meals: {
      fruehstueck: null,
      mittagessen: null,
      abendessen: legacyDinner
    }
  };
}

/**
 * One entry per date. The lost-date bug made edits append a second entry for the
 * same day; the later one is the user's latest change, so it wins.
 */
export function dedupeMealPlan(items: MealItem[]): MealItem[] {
  const byKey = new Map<string, MealItem>();
  for (const item of items) {
    const key = item.date ? `date:${item.date}` : `id:${item.id}`;
    byKey.delete(key);
    byKey.set(key, item);
  }
  return Array.from(byKey.values());
}

export const PRESET_DISH_TEMPLATES = [
  // Frühstück
  {
    mealType: 'fruehstueck' as const,
    title: 'Fluffige Heidelbeer Pancakes',
    category: 'Frühstück',
    cookTime: '15 Min',
    calories: '440 kcal',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Mehl', 'Milch', 'Eier', 'Heidelbeeren', 'Ahornsirup']
  },
  {
    mealType: 'fruehstueck' as const,
    title: 'Avocado Toast & Rührei',
    category: 'Frühstück',
    cookTime: '10 Min',
    calories: '390 kcal',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Sauerteigbrot', 'Avocado', 'Bio-Eier', 'Schnittlauch']
  },
  {
    mealType: 'fruehstueck' as const,
    title: 'Beeren Overnight Oats',
    category: 'Frühstück',
    cookTime: '5 Min',
    calories: '350 kcal',
    image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Haferflocken', 'Hafermilch', 'Heidelbeeren', 'Chiasamen']
  },
  // Mittagessen
  {
    mealType: 'mittagessen' as const,
    title: 'Bunte Buddha Bowl',
    category: 'Bowl',
    cookTime: '20 Min',
    calories: '490 kcal',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Quinoa', 'Kichererbsen', 'Avocado', 'Spinat', 'Tahini']
  },
  {
    mealType: 'mittagessen' as const,
    title: 'Knackiger Caesar Salad',
    category: 'Salat',
    cookTime: '15 Min',
    calories: '380 kcal',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Römersalat', 'Parmesan', 'Croutons', 'Caesar Dressing']
  },
  {
    mealType: 'mittagessen' as const,
    title: 'Mediterraner Feta Wrap',
    category: 'Wrap',
    cookTime: '10 Min',
    calories: '420 kcal',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Tortilla Wraps', 'Feta', 'Gurke', 'Kirschtomaten', 'Hummus']
  },
  // Abendessen
  {
    mealType: 'abendessen' as const,
    title: 'Frische Pasta mit Burrata',
    category: 'Pasta',
    cookTime: '20 Min',
    calories: '540 kcal',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d62811b4?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Tagliatelle 500g', 'Kirschtomaten', 'Burrata', 'Basilikum']
  },
  {
    mealType: 'abendessen' as const,
    title: 'Thai Kokos Curry',
    category: 'Curry',
    cookTime: '30 Min',
    calories: '610 kcal',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Kokosmilch', 'Currypaste', 'Reis', 'Gemüse']
  },
  {
    mealType: 'abendessen' as const,
    title: 'Steinofen Pizza Funghi',
    category: 'Pizza',
    cookTime: '20 Min',
    calories: '680 kcal',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Pizzateig', 'Tomatensauce', 'Mozzarella', 'Rucola']
  },
  {
    mealType: 'abendessen' as const,
    title: 'Lachs mit Ofengemüse',
    category: 'Fisch',
    cookTime: '25 Min',
    calories: '520 kcal',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Lachsfilet', 'Zucchini', 'Kartoffeln', 'Zitrone']
  }
];

export const INITIAL_STATE: AppState = {
  shoppingList: [],
  notes: [],
  mealPlan: [],
  customCalendarEvents: [],
  settings: {
    showWeather: true,
    showCalendar: true,
    showTimers: true,
    showShopping: true,
    showNotes: true,
    showConverter: true,
    showBookmarks: true,
    showMealPlan: true,
    googleCalendarIcalUrl: '',
    calendarFeeds: [],
    wasteCalendarUrl: '',
    wasteCalendarEvents: [],
    wasteCalendarName: '',
    bring: {
      enabled: false,
      email: '',
      autoSync: true
    },
    weatherCity: 'Berlin',
    weatherLat: 52.52,
    weatherLon: 13.405,
    dashboardName: 'Kitchen Wall',
    customTimerPresets: DEFAULT_TIMER_PRESETS,
    customBookmarks: DEFAULT_BOOKMARKS
  },
  lastUpdated: Date.now()
};
