import React, { useState, useEffect } from 'react';
import { ClaudeQuadrantDashboard } from './components/claude/ClaudeQuadrantDashboard';
import { ClaudeColumnarDashboard } from './components/claude/ClaudeColumnarDashboard';
import { ClaudeQrModal } from './components/claude/ClaudeQrModal';
import { AtelierRecipeModal } from './components/AtelierRecipeModal';
import { SettingsModal } from './components/SettingsModal';
import { AmbientScreensaver } from './components/AmbientScreensaver';
import { MobileCompanion } from './components/mobile/MobileCompanion';
import { useSyncState } from './hooks/useSyncState';
import { useWakeLock } from './hooks/useWakeLock';
import { useDashboardCalendar } from './hooks/useDashboardCalendar';
import { SingleMeal, ShoppingCategory } from './types';
import { formatISODate, parseISODate, formatFullGermanDate } from './utils/dateUtils';
import { getMealItemForDate } from './hooks/useSyncState';

export function App() {
  const isCompanionRoute =
    window.location.pathname.includes('/companion') ||
    window.location.hash.includes('/companion') ||
    new URLSearchParams(window.location.search).get('view') === 'companion';

  if (isCompanionRoute) {
    return <MobileCompanion />;
  }

  const {
    state,
    isConnected,
    companionUrl,
    addShoppingItem,
    toggleShoppingItem,
    clearCheckedShopping,
    addNote,
    removeNote,
    updateMealSlot,
    addMealIngredientsToShopping,
    updateSettings,
    resetToDefaults,
    syncBring
  } = useSyncState();

  useWakeLock();

  // Modals state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'name' | 'widgets' | 'calendar' | 'bring' | 'weather' | 'timers' | 'radio' | 'bookmarks'>('name');
  const [isScreensaverOpen, setIsScreensaverOpen] = useState(false);
  const [editingDayKey, setEditingDayKey] = useState<string | null>(null);

  const handleOpenSettings = (tab: 'name' | 'widgets' | 'calendar' | 'bring' | 'weather' | 'timers' | 'radio' | 'bookmarks' = 'name') => {
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const settingsParam = params.get('settings');
    if (settingsParam && ['name', 'widgets', 'calendar', 'bring', 'weather', 'timers', 'radio', 'bookmarks'].includes(settingsParam)) {
      setSettingsInitialTab(settingsParam as any);
      setIsSettingsOpen(true);
    }
  }, []);

  // Live calendar synchronization (multi-feed & waste)
  const {
    events: calendarEvents,
    wasteEvents: liveWasteEvents,
    isLive: isCalendarLive,
    isSyncing: isCalendarSyncing
  } = useDashboardCalendar(
    (state.settings?.calendarFeeds && state.settings.calendarFeeds.length > 0)
      ? state.settings.calendarFeeds
      : state.settings?.googleCalendarIcalUrl,
    state.customCalendarEvents,
    state.settings?.wasteCalendarUrl
  );

  const effectiveWasteEvents =
    (state.settings?.wasteCalendarEvents && state.settings.wasteCalendarEvents.length > 0)
      ? state.settings.wasteCalendarEvents
      : liveWasteEvents;

  // Theme state: dark / light
  const [isNight, setIsNight] = useState<boolean>(() => {
    const saved = localStorage.getItem('kitchen_theme_mode');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    const h = new Date().getHours();
    return h >= 21 || h < 6;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isNight ? 'dark' : 'light');
    localStorage.setItem('kitchen_theme_mode', isNight ? 'dark' : 'light');
  }, [isNight]);

  const handleToggleNight = () => {
    setIsNight((prev) => !prev);
  };

  // Layout mode state: 'quadrant' (default) vs 'columnar'
  const [layoutMode, setLayoutMode] = useState<'quadrant' | 'columnar'>(() => {
    return (localStorage.getItem('kitchen_layout_mode') as 'quadrant' | 'columnar') || 'quadrant';
  });

  const handleToggleLayout = () => {
    setLayoutMode((prev) => {
      const next = prev === 'quadrant' ? 'columnar' : 'quadrant';
      localStorage.setItem('kitchen_layout_mode', next);
      return next;
    });
  };

  // Current day item (date-aware)
  const todayStr = formatISODate(new Date());
  const activeDateOrKey = editingDayKey || todayStr;
  const currentDayItem = getMealItemForDate(state.mealPlan, activeDateOrKey);

  const currentMeal: SingleMeal | null =
    currentDayItem?.meals?.abendessen ||
    currentDayItem?.meals?.mittagessen ||
    currentDayItem?.meals?.fruehstueck ||
    null;

  const handleSelectMeal = (newMeal: SingleMeal) => {
    updateMealSlot(activeDateOrKey, 'abendessen', newMeal);
  };

  const handleOpenDayMeal = (dayOrDateKey: string, _meal: SingleMeal | null) => {
    setEditingDayKey(dayOrDateKey);
    setIsRecipeModalOpen(true);
  };

  const handleOpenTodayMeal = () => {
    setEditingDayKey(todayStr);
    setIsRecipeModalOpen(true);
  };

  const handleAddShoppingItem = (name: string, amount?: string, category?: ShoppingCategory) => {
    addShoppingItem(name, amount || '', category || 'sonstiges');
  };

  const handleAddNote = (text: string, author?: string) => {
    addNote(text, author || 'Küche', 'amber');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[var(--bg)] text-[var(--ink)] font-sans select-none relative">
      {/* Dashboard View (Quadrant or Columnar) */}
      {layoutMode === 'quadrant' ? (
        <ClaudeQuadrantDashboard
          state={state}
          isNight={isNight}
          onToggleNight={handleToggleNight}
          onOpenQr={() => setIsQrModalOpen(true)}
          onOpenSettings={() => handleOpenSettings('name')}
          onOpenCalendarSettings={() => handleOpenSettings('calendar')}
          onOpenWasteSettings={() => handleOpenSettings('calendar')}
          onOpenRecipeModal={handleOpenTodayMeal}
          onToggleShoppingItem={toggleShoppingItem}
          onAddShoppingItem={handleAddShoppingItem}
          onClearCheckedShopping={clearCheckedShopping}
          onAddNote={handleAddNote}
          onRemoveNote={removeNote}
          onSelectWeekMeal={handleOpenDayMeal}
          calendarEvents={calendarEvents}
          isCalendarLive={isCalendarLive}
          isCalendarSyncing={isCalendarSyncing}
          wasteEvents={effectiveWasteEvents}
          wasteCalendarName={state.settings?.wasteCalendarName}
          onSyncBring={syncBring}
        />
      ) : (
        <ClaudeColumnarDashboard
          state={state}
          isNight={isNight}
          onToggleNight={handleToggleNight}
          onOpenQr={() => setIsQrModalOpen(true)}
          onOpenSettings={() => handleOpenSettings('name')}
          onOpenCalendarSettings={() => handleOpenSettings('calendar')}
          onOpenRecipeModal={handleOpenTodayMeal}
          onToggleShoppingItem={toggleShoppingItem}
          onAddShoppingItem={handleAddShoppingItem}
          onClearCheckedShopping={clearCheckedShopping}
          onAddNote={handleAddNote}
          onRemoveNote={removeNote}
          onSelectWeekMeal={handleOpenDayMeal}
          calendarEvents={calendarEvents}
          isCalendarLive={isCalendarLive}
          isCalendarSyncing={isCalendarSyncing}
        />
      )}

      {/* Discreet floating layout switch indicator on bottom edge (double-tap or click) */}
      <button
        type="button"
        onClick={handleToggleLayout}
        title={`Layout wechseln zu: ${layoutMode === 'quadrant' ? 'Spalten-Design' : '4-Quadranten-Design'}`}
        className="fixed bottom-2 right-4 text-[10px] font-[700] text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--wash)]/60 hover:bg-[var(--wash)] backdrop-blur-xs px-2.5 py-1 rounded-full border border-black/5 opacity-50 hover:opacity-100 transition-all z-20 cursor-pointer"
      >
        {layoutMode === 'quadrant' ? 'Ansicht: Quadranten' : 'Ansicht: Spalten'}
      </button>

      {/* ================= MODALS ================= */}
      {/* Claude iPhone QR Pairing Modal */}
      <ClaudeQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        companionUrl={companionUrl}
      />

      {/* Recipe Modal */}
      <AtelierRecipeModal
        isOpen={isRecipeModalOpen}
        dayLabel={
          activeDateOrKey && /^\d{4}-\d{2}-\d{2}$/.test(activeDateOrKey)
            ? formatFullGermanDate(parseISODate(activeDateOrKey))
            : 'Heute'
        }
        onClose={() => {
          setIsRecipeModalOpen(false);
          setEditingDayKey(null);
        }}
        currentMeal={currentMeal}
        onSelectMeal={handleSelectMeal}
        onAddIngredientsToShopping={addMealIngredientsToShopping}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={state.settings}
        onUpdateSettings={updateSettings}
        onReset={resetToDefaults}
        initialTab={settingsInitialTab}
      />

      {/* Screensaver */}
      <AmbientScreensaver
        isOpen={isScreensaverOpen}
        onExit={() => setIsScreensaverOpen(false)}
        city={state.settings.weatherCity}
      />
    </div>
  );
}

export default App;
