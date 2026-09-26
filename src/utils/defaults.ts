import { AppState, TimerPreset, RadioStation, QuickBookmark, MealItem, CalendarEvent } from '../types';

export const DEFAULT_TIMER_PRESETS: TimerPreset[] = [
  { id: 'tea', label: 'Tee ziehen', seconds: 180, iconName: 'Coffee' },
  { id: 'soft-egg', label: 'Weiches Ei', seconds: 330, iconName: 'Egg' },
  { id: 'hard-egg', label: 'Hartes Ei', seconds: 510, iconName: 'Egg' },
  { id: 'pasta', label: 'Nudeln al dente', seconds: 540, iconName: 'Utensils' },
  { id: 'pizza', label: 'Pizza / Ofen', seconds: 900, iconName: 'Flame' },
  { id: 'dough', label: 'Teig gehen lassen', seconds: 1800, iconName: 'Timer' },
];

export const DEFAULT_RADIO_STATIONS: RadioStation[] = [
  {
    id: 'lofi',
    name: 'Lofi Hip Hop / Chillout',
    genre: 'Lo-Fi Chill',
    url: 'https://stream.zeno.fm/f3wvbbqmdg8uv'
  },
  {
    id: 'jazz',
    name: 'Café Paris Jazz',
    genre: 'Jazz & Swing',
    url: 'https://stream.zeno.fm/87v5t1e2m0hvv'
  },
  {
    id: 'pop',
    name: 'Hitradio Pop & Dance',
    genre: 'Pop / Charts',
    url: 'https://stream.zeno.fm/4w9rzqz1xh8uv'
  },
  {
    id: 'classical',
    name: 'Klassik Radio Küche',
    genre: 'Klassik & Piano',
    url: 'https://stream.zeno.fm/0r0xa792kwzuv'
  },
  {
    id: 'news',
    name: 'Info & Talk',
    genre: 'Nachrichten',
    url: 'https://stream.zeno.fm/wr7a2v73d8zuv'
  }
];

export const DEFAULT_BOOKMARKS: QuickBookmark[] = [
  { id: 'chefkoch', title: 'Chefkoch Rezepte', url: 'https://www.chefkoch.de', category: 'Kochen' },
  { id: 'kitchenstories', title: 'Kitchen Stories', url: 'https://www.kitchenstories.com/de', category: 'Inspiration' },
  { id: 'eatsmarter', title: 'EatSmarter Gesund', url: 'https://eatsmarter.de', category: 'Gesund' },
  { id: 'springlane', title: 'Back-Ideen', url: 'https://www.springlane.de/magazin/rezeptideen/', category: 'Backen' }
];

export const DEFAULT_MEALS: MealItem[] = [
  {
    id: 'meal_mo',
    day: 'mo',
    dayLabel: 'Montag',
    meals: {
      fruehstueck: {
        title: 'Fluffige Heidelbeer Pancakes',
        category: 'Frühstück',
        cookTime: '15 Min',
        calories: '440 kcal',
        image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Mehl', 'Milch', 'Eier', 'Heidelbeeren', 'Ahornsirup']
      },
      mittagessen: null,
      abendessen: {
        title: 'Frische Pasta mit Tomaten & Burrata',
        category: 'Pasta',
        cookTime: '20 Min',
        calories: '540 kcal',
        image: 'https://images.unsplash.com/photo-1621996346565-e3d5d62811b4?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Tagliatelle 500g', 'Kirschtomaten 250g', 'Burrata 2x', 'Knoblauch', 'Basilikum']
      }
    }
  },
  {
    id: 'meal_di',
    day: 'di',
    dayLabel: 'Dienstag',
    meals: {
      fruehstueck: null,
      mittagessen: {
        title: 'Bunte Buddha Bowl mit Avocado',
        category: 'Bowl / Veggie',
        cookTime: '20 Min',
        calories: '490 kcal',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Quinoa 200g', 'Kichererbsen Dose', 'Avocado', 'Babyspinat', 'Tahini-Dressing']
      },
      abendessen: {
        title: 'Knusprige Steinofen Pizza Funghi & Rucola',
        category: 'Pizza',
        cookTime: '20 Min',
        calories: '680 kcal',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Pizzateig', 'Passierte Tomaten', 'Mozzarella', 'Braune Champignons', 'Rucola']
      }
    }
  },
  {
    id: 'meal_mi',
    day: 'mi',
    dayLabel: 'Mittwoch',
    meals: {
      fruehstueck: null,
      mittagessen: null,
      abendessen: {
        title: 'Cremiges Thai Kokos-Curry mit Reis',
        category: 'Curry',
        cookTime: '30 Min',
        calories: '610 kcal',
        image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Kokosmilch 1 Dose', 'Rote Currypaste', 'Basmatireis', 'Paprika', 'Zuckerschoten', 'Tofu']
      }
    }
  },
  {
    id: 'meal_do',
    day: 'do',
    dayLabel: 'Donnerstag',
    meals: {
      fruehstueck: {
        title: 'Avocado Toast mit Bio-Ei',
        category: 'Frühstück',
        cookTime: '10 Min',
        calories: '390 kcal',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Sauerteigbrot', 'Avocado', 'Bio-Eier', 'Chiliflocken']
      },
      mittagessen: null,
      abendessen: {
        title: 'Gebratener Wildlachs mit Ofengemüse',
        category: 'Fisch',
        cookTime: '25 Min',
        calories: '520 kcal',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Lachsfilet 400g', 'Zucchini', 'Drillinge Kartoffeln', 'Zitrone', 'Rosmarin']
      }
    }
  },
  {
    id: 'meal_fr',
    day: 'fr',
    dayLabel: 'Freitag',
    meals: {
      fruehstueck: null,
      mittagessen: {
        title: 'Knackiger Caesar Salad',
        category: 'Salat',
        cookTime: '15 Min',
        calories: '380 kcal',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Römersalat', 'Parmesan', 'Croutons', 'Caesar Dressing']
      },
      abendessen: {
        title: 'Gourmet Burger & Süßkartoffelpommes',
        category: 'Burger',
        cookTime: '25 Min',
        calories: '720 kcal',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Brioche Buns', 'Patties', 'Cheddar', 'Süßkartoffel-Pommes']
      }
    }
  },
  {
    id: 'meal_sa',
    day: 'sa',
    dayLabel: 'Samstag',
    meals: {
      fruehstueck: {
        title: 'Frühstücks-Waffeln mit Beeren',
        category: 'Frühstück',
        cookTime: '20 Min',
        calories: '450 kcal',
        image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Waffelteig', 'Beeren', 'Ahornsirup']
      },
      mittagessen: null,
      abendessen: {
        title: 'Würzige Mexican Street Tacos',
        category: 'Street Food',
        cookTime: '30 Min',
        calories: '590 kcal',
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Taco Shells / Tortillas', 'Rinderhack oder Bohnen', 'Cheddar gerieben', 'Limetten', 'Koriander']
      }
    }
  },
  {
    id: 'meal_so',
    day: 'so',
    dayLabel: 'Sonntag',
    meals: {
      fruehstueck: null,
      mittagessen: null,
      abendessen: {
        title: 'Cremiges Steinpilz-Risotto mit Parmesan',
        category: 'Gourmet',
        cookTime: '35 Min',
        calories: '560 kcal',
        image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Arborio Risottoreis', 'Steinpilze', 'Parmesan', 'Weißwein', 'Schalotten', 'Gemüsebrühe']
      }
    }
  }
];

export function normalizeMealItem(item: any): MealItem {
  if (!item) {
    return {
      id: 'meal_' + Math.random().toString(36).substring(2, 6),
      day: 'mo',
      dayLabel: 'Montag',
      meals: { fruehstueck: null, mittagessen: null, abendessen: null }
    };
  }

  if (item.meals && typeof item.meals === 'object') {
    return {
      id: item.id || 'meal_' + (item.day || 'mo'),
      day: item.day || 'mo',
      dayLabel: item.dayLabel || '',
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
        image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        ingredients: item.ingredients || []
      }
    : null;

  return {
    id: item.id || 'meal_' + item.day,
    day: item.day,
    dayLabel: item.dayLabel,
    meals: {
      fruehstueck: null,
      mittagessen: null,
      abendessen: legacyDinner
    }
  };
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

export const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: 'ev_1',
    title: 'Zahnarzt Kontrolltermin',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:30',
    location: 'Praxis Dr. Weber',
    category: 'Gesundheit'
  },
  {
    id: 'ev_2',
    title: 'Mamas Geburtstag 🎂',
    date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    isAllDay: true,
    category: 'Familie'
  },
  {
    id: 'ev_3',
    title: 'Elternabend Schule 🏫',
    date: new Date(Date.now() + 432000000).toISOString().split('T')[0],
    time: '18:00',
    location: 'Aula',
    category: 'Schule'
  },
  {
    id: 'ev_4',
    title: 'Yoga & Pilates 🧘‍♀️',
    date: new Date(Date.now() + 604800000).toISOString().split('T')[0],
    time: '19:15',
    category: 'Sport'
  }
];

export const INITIAL_STATE: AppState = {
  shoppingList: [
    { id: '1', name: 'Hafermilch Barista', amount: '2x', category: 'kuehlregal', checked: false, createdAt: Date.now() - 3600000 },
    { id: '2', name: 'Bio-Eier', amount: '10er', category: 'kuehlregal', checked: false, createdAt: Date.now() - 3000000 },
    { id: '3', name: 'Avocado', amount: '2 Stk', category: 'gemuese', checked: false, createdAt: Date.now() - 2500000 },
    { id: '4', name: 'Sauerteigbrot', amount: '', category: 'baeckerei', checked: true, createdAt: Date.now() - 2000000 },
    { id: '5', name: 'Espressobohnen', amount: '1kg', category: 'vorrat', checked: false, createdAt: Date.now() - 1000000 }
  ],
  notes: [
    {
      id: '1',
      text: 'Guten Morgen! ☕ Frische Brötchen sind im Korb. Schönes Wochenende!',
      author: 'Familie',
      color: 'amber',
      createdAt: Date.now() - 7200000
    },
    {
      id: '2',
      text: 'Heute Abend: Selbstgemachte Pizza um 19:30 Uhr 🍕',
      author: 'Küche',
      color: 'rose',
      createdAt: Date.now() - 3600000
    }
  ],
  mealPlan: DEFAULT_MEALS,
  customCalendarEvents: DEFAULT_EVENTS,
  settings: {
    showWeather: true,
    showCalendar: true,
    showTimers: true,
    showShopping: true,
    showNotes: true,
    showRadio: true,
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
    customStations: DEFAULT_RADIO_STATIONS,
    customBookmarks: DEFAULT_BOOKMARKS
  },
  lastUpdated: Date.now()
};
