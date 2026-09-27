export type ShoppingCategory = 
  | 'gemuese' 
  | 'kuehlregal' 
  | 'vorrat' 
  | 'getraenke' 
  | 'baeckerei'
  | 'haushalt' 
  | 'sonstiges';

export interface ShoppingItem {
  id: string;
  name: string;
  amount?: string;
  category: ShoppingCategory;
  checked: boolean;
  createdAt: number;
}

export type NoteColor = 'yellow' | 'emerald' | 'blue' | 'rose' | 'amber' | 'purple';

export interface KitchenNote {
  id: string;
  text: string;
  author?: string;
  color: NoteColor;
  createdAt: number;
}

export interface KitchenTimer {
  id: string;
  name: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
  startedAt?: number;
}

export interface TimerPreset {
  id: string;
  label: string;
  seconds: number;
  iconName?: string;
}

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  genre: string;
}

export interface QuickBookmark {
  id: string;
  title: string;
  url: string;
  category?: string;
}

export type MealType = 'fruehstueck' | 'mittagessen' | 'abendessen';

export interface SingleMeal {
  title: string;
  category: string;
  cookTime: string;
  image: string;
  ingredients: string[];
  calories?: string;
}

export interface MealItem {
  id: string;
  day: 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so';
  dayLabel: string;
  date?: string; // ISO date 'YYYY-MM-DD'
  weekKey?: string; // e.g. '2026-W38'
  meals: {
    fruehstueck?: SingleMeal | null;
    mittagessen?: SingleMeal | null;
    abendessen?: SingleMeal | null;
  };
  // Fallbacks for legacy state
  title?: string;
  category?: string;
  cookTime?: string;
  image?: string;
  ingredients?: string[];
  calories?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  isAllDay?: boolean;
  location?: string;
  category?: string;
}

export interface CalendarFeed {
  id: string;
  name: string;
  url: string;
  color?: string;
  enabled: boolean;
}

export interface BringList {
  listUuid: string;
  name: string;
  theme?: string;
}

export interface BringSettings {
  enabled: boolean;
  email: string;
  // Password and token are kept on the server only (secrets.json)
  userName?: string;
  listUuid?: string;
  listName?: string;
  availableLists?: BringList[];
  autoSync: boolean;
  lastSync?: number;
}

export interface DashboardSettings {
  showWeather: boolean;
  showCalendar: boolean;
  showTimers: boolean;
  showShopping: boolean;
  showNotes: boolean;
  showRadio: boolean;
  showConverter: boolean;
  showBookmarks: boolean;
  showMealPlan: boolean;
  googleCalendarIcalUrl: string;
  calendarFeeds?: CalendarFeed[];
  wasteCalendarUrl?: string;
  wasteCalendarEvents?: CalendarEvent[];
  wasteCalendarName?: string;
  bring?: BringSettings;
  weatherCity: string;
  weatherLat: number;
  weatherLon: number;
  dashboardName?: string;
  /** Colour palette of the dashboard (dark mode overrides it at night) */
  palette?: DashboardPalette;
  customTimerPresets: TimerPreset[];
  customStations: RadioStation[];
  customBookmarks: QuickBookmark[];
}

export type DashboardPalette = 'Salbei' | 'Terrakotta' | 'Nordisch' | 'Gewürz';

export interface AppState {
  shoppingList: ShoppingItem[];
  notes: KitchenNote[];
  mealPlan: MealItem[];
  customCalendarEvents: CalendarEvent[];
  settings: DashboardSettings;
  lastUpdated: number;
}
