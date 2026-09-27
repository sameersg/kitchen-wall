import React from 'react';
import { QuadrantHeroCard } from './QuadrantHeroCard';
import { QuadrantShoppingCard } from './QuadrantShoppingCard';
import { QuadrantWeekCard } from './QuadrantWeekCard';
import { QuadrantMultiTabCard } from './QuadrantMultiTabCard';
import { AppState, ShoppingCategory, SingleMeal, CalendarEvent } from '../../types';
import { formatISODate } from '../../utils/dateUtils';
import { getMealItemForDate } from '../../hooks/useSyncState';
import { mainMealType, plannedSlots } from '../../utils/mealSlots';
import { KitchenTimer } from '../../hooks/useKitchenTimers';

interface ClaudeQuadrantDashboardProps {
  state: AppState;
  isNight: boolean;
  onToggleNight: () => void;
  onOpenQr: () => void;
  onOpenSettings?: () => void;
  onOpenRecipeModal?: () => void;
  onToggleShoppingItem: (id: string) => void;
  onAddShoppingItem: (name: string, amount?: string, category?: ShoppingCategory) => void;
  onClearCheckedShopping: () => void;
  onAddNote: (text: string, author?: string) => void;
  onRemoveNote: (id: string) => void;
  onSelectWeekMeal?: (dayKey: string, meal: SingleMeal | null) => void;
  onOpenDay?: (dateStr: string) => void;
  timers?: KitchenTimer[];
  onOpenTimers?: () => void;
  calendarEvents?: CalendarEvent[];
  isCalendarLive?: boolean;
  isCalendarSyncing?: boolean;
  onOpenCalendarSettings?: () => void;
  wasteEvents?: CalendarEvent[];
  wasteCalendarName?: string;
  onOpenWasteSettings?: () => void;
  onSyncBring?: () => Promise<{ success: boolean; count?: number; error?: string } | undefined>;
}

export const ClaudeQuadrantDashboard: React.FC<ClaudeQuadrantDashboardProps> = ({
  state,
  isNight,
  onToggleNight,
  onOpenQr,
  onOpenSettings,
  onOpenRecipeModal,
  onToggleShoppingItem,
  onAddShoppingItem,
  onClearCheckedShopping,
  onAddNote,
  onRemoveNote,
  onSelectWeekMeal,
  onOpenDay,
  timers,
  onOpenTimers,
  calendarEvents,
  isCalendarLive = false,
  isCalendarSyncing = false,
  onOpenCalendarSettings,
  wasteEvents,
  wasteCalendarName,
  onOpenWasteSettings,
  onSyncBring
}) => {
  const todayStr = formatISODate(new Date());
  const mealPlan = state?.mealPlan || [];
  const settings = state?.settings || { dashboardName: 'Unsere Küche', weatherLat: 52.52, weatherLon: 13.405 };
  const shoppingList = state?.shoppingList || [];
  const customCalendarEvents = state?.customCalendarEvents || [];
  const notes = state?.notes || [];

  const currentDayItem = getMealItemForDate(mealPlan, todayStr);

  const mainType = mainMealType(currentDayItem);
  const currentMeal = mainType ? currentDayItem?.meals?.[mainType] || null : null;
  const otherMeals = plannedSlots(currentDayItem)
    .filter((s) => s.type !== mainType)
    .map((s) => ({ short: s.short, dish: s.meal.title }));

  const todayCook = currentMeal?.cookTime ? `⏱ ${currentMeal.cookTime}` : '';
  const todayNote = currentMeal
    ? (currentMeal.category ? `${currentMeal.category} · frisch zubereitet` : 'Frisch aus der Küche')
    : 'Tippen, um ein Gericht zu planen';

  return (
    <div className="w-full h-full kw-safe overflow-hidden p-3 md:p-3.5 bg-[var(--bg)] text-[var(--ink)] font-sans antialiased select-none grid grid-cols-2 grid-rows-2 gap-3 md:gap-3.5 transition-colors">
      {/* Quadrant 1: Top-Left Hero Card */}
      <QuadrantHeroCard
        householdName={settings.dashboardName || 'Unsere Küche'}
        isNight={isNight}
        onToggleNight={onToggleNight}
        onOpenQr={onOpenQr}
        onOpenSettings={onOpenSettings}
        todayDishName={currentMeal?.title || 'Noch nichts geplant'}
        todayDishImg={currentMeal?.image}
        todayCook={todayCook}
        todayNote={todayNote}
        otherMeals={otherMeals}
        timers={timers}
        onOpenTimers={onOpenTimers}
        onOpenRecipe={onOpenRecipeModal}
        weatherLat={settings.weatherLat}
        weatherLon={settings.weatherLon}
      />

      {/* Quadrant 2: Top-Right Einkauf (Shopping List) */}
      <QuadrantShoppingCard
        items={shoppingList}
        onToggle={onToggleShoppingItem}
        onAdd={onAddShoppingItem}
        onClearDone={onClearCheckedShopping}
        bringSettings={settings.bring}
        onSyncBring={onSyncBring}
        onOpenSettings={onOpenSettings}
      />

      {/* Quadrant 3: Bottom-Left Woche (Weekly Meal Plan) */}
      <QuadrantWeekCard
        mealPlan={mealPlan}
        onOpenDay={onOpenDay || ((dateStr) => onSelectWeekMeal?.(dateStr, null))}
      />

      {/* Quadrant 4: Bottom-Right Multi-Tab (Anlässe, Pinnwand, Müll) */}
      <QuadrantMultiTabCard
        events={calendarEvents || customCalendarEvents}
        notes={notes}
        onAddNote={onAddNote}
        onRemoveNote={onRemoveNote}
        householdAuthor={settings.dashboardName?.split(' ')[0] || 'Küche'}
        onOpenCalendarSettings={onOpenCalendarSettings || onOpenSettings}
        isCalendarLive={isCalendarLive}
        isCalendarSyncing={isCalendarSyncing}
        wasteEvents={wasteEvents}
        wasteCalendarName={wasteCalendarName}
        onOpenWasteSettings={onOpenWasteSettings || onOpenSettings}
      />
    </div>
  );
};
