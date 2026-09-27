import React, { useState, useEffect } from 'react';
import { AppState, ShoppingCategory, SingleMeal, CalendarEvent } from '../../types';
import { useDashboardWeather } from '../../hooks/useDashboardWeather';
import { getUpcomingWasteSchedule } from '../../utils/wasteParser';
import { formatISODate } from '../../utils/dateUtils';
import { getMealItemForDate } from '../../hooks/useSyncState';

interface ClaudeColumnarDashboardProps {
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
  calendarEvents?: CalendarEvent[];
  isCalendarLive?: boolean;
  isCalendarSyncing?: boolean;
  onOpenCalendarSettings?: () => void;
}

const GERMAN_WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const GERMAN_MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];
const GERMAN_MONTHS_SHORT = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];

export const ClaudeColumnarDashboard: React.FC<ClaudeColumnarDashboardProps> = ({
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
  calendarEvents,
  isCalendarLive = false,
  isCalendarSyncing = false,
  onOpenCalendarSettings
}) => {
  const [now, setNow] = useState(new Date());
  const [shopInput, setShopInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  const settings = state?.settings || { dashboardName: 'Unsere Küche', weatherLat: 52.52, weatherLon: 13.405 };
  const mealPlan = state?.mealPlan || [];
  const shoppingList = state?.shoppingList || [];
  const customCalendarEvents = state?.customCalendarEvents || [];
  const notes = state?.notes || [];

  const weather = useDashboardWeather(settings.weatherLat, settings.weatherLon);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${pad(hours)}:${pad(now.getMinutes())}`;
  const dayName = GERMAN_WEEKDAYS[now.getDay()];
  const dateStr = `${dayName}, ${now.getDate()}. ${GERMAN_MONTHS[now.getMonth()]}`;

  const householdName = settings.dashboardName || 'Unsere Küche';
  const greeting =
    hours < 11
      ? `Guten Morgen, ${householdName}`
      : hours < 17
      ? `Hallo, ${householdName}`
      : `Guten Abend, ${householdName}`;

  // Today's meal
  const dayKeys: Array<'so' | 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa'> = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'];
  const todayKey = dayKeys[now.getDay()];
  const currentDayItem = getMealItemForDate(mealPlan, formatISODate(now));
  const currentMeal =
    currentDayItem?.meals?.abendessen ||
    currentDayItem?.meals?.mittagessen ||
    currentDayItem?.meals?.fruehstueck ||
    null;

  // Next 6 week meals
  const next6Meals = [];
  const dayIndexToShort = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];
  for (let i = 1; i <= 6; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dKey = formatISODate(d);
    const mItem = getMealItemForDate(mealPlan, dKey);
    const single = mItem?.meals?.abendessen || mItem?.meals?.mittagessen || mItem?.meals?.fruehstueck || null;
    next6Meals.push({
      dayKey: dKey,
      dayShort: dayIndexToShort[d.getDay()],
      dish: single?.title || 'Menü planen',
      cook: single?.cookTime || '',
      img: single?.image || '',
      raw: single
    });
  }

  // Week date range
  const todayIdx = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - todayIdx);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekLabel = `Woche ${monday.getDate()}. – ${sunday.getDate()}. ${GERMAN_MONTHS_SHORT[sunday.getMonth()]}`;

  // Waste pickups from the uploaded calendar only (no invented dates)
  const wasteEvents = state.settings.wasteCalendarEvents || [];
  const wasteItems = wasteEvents.length > 0 ? getUpcomingWasteSchedule(wasteEvents, now) : [];

  // Shopping list counts & categorization
  const openCount = state.shoppingList.filter((i) => !i.checked).length;
  const openLabel = `${openCount} offen · ${state.shoppingList.length} total`;

  const handleShopAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const v = shopInput.trim();
      if (!v) return;
      onAddShoppingItem(v);
      setShopInput('');
    }
  };

  const handleNoteAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const v = noteInput.trim();
      if (!v) return;
      onAddNote(v, householdName.split(' ')[0]);
      setNoteInput('');
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden p-3.5 bg-[var(--bg)] text-[var(--ink)] font-sans antialiased select-none flex gap-3.5 transition-colors">
      {/* Left Column: Big Hero Card + Waste Schedule */}
      <div className="w-[340px] lg:w-[356px] shrink-0 flex flex-col gap-3.5 min-h-0">
        {/* Today's Dish Hero Card */}
        <div className="flex-1 min-h-0 relative rounded-[24px] overflow-hidden bg-[var(--photo)] shadow-sm">
          <img
            src={currentMeal?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80'}
            alt={currentMeal?.title || 'Heute'}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,13,11,0.92)] via-[rgba(14,13,11,0.42)] to-[rgba(14,13,11,0.06)]" />

          {/* Weather Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/18 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
            <span className="text-[18px] font-[800] text-white leading-none">
              {weather.temp}°
            </span>
            <span className="text-[11px] font-[600] text-white/85">
              {weather.conditionText} · morgen {weather.tomorrowTemp}°
            </span>
          </div>

          {/* Dish Information */}
          <div
            onClick={onOpenRecipeModal}
            className="absolute bottom-0 inset-x-0 p-5 flex flex-col gap-1 cursor-pointer group"
          >
            <span className="text-[10px] tracking-[0.2em] uppercase font-[800] text-[#e8b98e]">
              Heute · {dayName}
            </span>
            <h2 className="font-serif text-[38px] lg:text-[42px] leading-[1.04] text-white drop-shadow-sm group-hover:text-amber-100 transition-colors">
              {currentMeal?.title || 'Noch nichts geplant'}
            </h2>
            <p className="text-[12.5px] font-[500] text-white/85 line-clamp-1">
              {currentMeal ? (currentMeal.category ? `${currentMeal.category} · frisch zubereitet` : 'Frisch aus der Küche') : 'Tippen, um ein Gericht zu planen'}
            </p>
            <div className="flex items-center gap-2.5 mt-1.5">
              {currentMeal?.cookTime && (
                <span className="text-[11.5px] font-[700] text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  ⏱ {currentMeal.cookTime}
                </span>
              )}
              <span className="text-[11.5px] font-[600] text-white/70">
                {weekLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Waste Schedule Card (Sky Blue) */}
        <div className="shrink-0 bg-[var(--sky)] rounded-[22px] p-4 flex flex-col gap-2 border border-[var(--wash)]/40">
          <span className="text-[13px] font-[800] text-[var(--skyInk)]">
            Müllabfuhr
          </span>
          <div className="flex flex-col gap-1.5">
            {wasteItems.length === 0 && (
              <span className="text-[12.5px] font-[600] text-[var(--skyInk)]">Noch kein Müllkalender hinterlegt</span>
            )}
            {wasteItems.map((w) => (
              <div key={w.id} className="flex items-center gap-2.5 text-[13.5px]">
                <span
                  className="w-[9px] h-[9px] rounded-[3px] shrink-0"
                  style={{ backgroundColor: w.dot }}
                />
                <span className="flex-1 font-[600] text-[var(--ink)] truncate">
                  {w.name}
                </span>
                <span className={`text-[12px] font-[600] ${w.isSoon ? 'text-[var(--blushInk)] font-[700]' : 'text-[var(--skyInk)]'}`}>
                  {w.when}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Top Bar + Week Strip + 3-Column Bottom Cards */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 min-h-0">
        {/* Top Header Row */}
        <div className="shrink-0 flex items-center justify-between gap-4 px-1">
          <div className="flex items-baseline gap-4">
            <span className="text-[52px] lg:text-[58px] font-[800] leading-[0.9] tracking-[-0.035em]">
              {timeStr}
            </span>
            <div className="flex flex-col">
              <span className="text-[16px] font-[700]">{dateStr}</span>
              <span className="text-[12px] font-[500] text-[var(--muted)]">{greeting}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleNight}
              className="text-[12px] font-[700] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--wash)] bg-[var(--wash)] px-4 py-2.5 rounded-[16px] cursor-pointer active:scale-95 transition-all"
            >
              {isNight ? 'Tag' : 'Nacht'}
            </button>
            <button
              type="button"
              onClick={onOpenQr}
              className="flex items-center gap-2.5 bg-[var(--btn)] text-[var(--btnInk)] rounded-[16px] px-4 py-2.5 active:scale-95 cursor-pointer font-[700] text-[13px] shadow-sm transition-all"
            >
              <div className="grid grid-cols-3 grid-rows-3 gap-[2px] w-[13px] h-[13px]">
                <span className="bg-current rounded-[0.5px]" />
                <span className="bg-current opacity-40 rounded-[0.5px]" />
                <span className="bg-current rounded-[0.5px]" />
                <span className="bg-current opacity-40 rounded-[0.5px]" />
                <span className="bg-[#e8a05e] rounded-[0.5px]" />
                <span className="bg-current opacity-40 rounded-[0.5px]" />
                <span className="bg-current rounded-[0.5px]" />
                <span className="bg-current opacity-40 rounded-[0.5px]" />
                <span className="bg-current rounded-[0.5px]" />
              </div>
              <span>iPhone</span>
            </button>

            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="w-9 h-9 flex items-center justify-center bg-[var(--wash)] text-[var(--muted)] hover:text-[var(--ink)] rounded-[16px] active:scale-95 cursor-pointer border border-black/5"
                title="Einstellungen"
              >
                ⚙
              </button>
            )}
          </div>
        </div>

        {/* Middle: Week Meals Strip */}
        <div className="shrink-0 h-[175px] lg:h-[188px] flex gap-2.5 overflow-hidden">
          {next6Meals.map((m) => (
            <div
              key={m.dayKey}
              onClick={() => onSelectWeekMeal?.(m.dayKey, m.raw || null)}
              className="flex-1 min-w-0 bg-[var(--card)] rounded-[18px] overflow-hidden flex flex-col shadow-2xs border border-[var(--wash)] cursor-pointer group hover:shadow-xs active:scale-[0.98] transition-all"
            >
              <div className="h-[95px] lg:h-[105px] shrink-0 bg-[var(--photo)] overflow-hidden">
                {m.img ? (
                  <img
                    src={m.img}
                    alt={m.dish}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[24px] font-[300] text-[var(--faint)]">+</div>
                )}
              </div>
              <div className="flex-1 min-h-0 p-2.5 flex flex-col justify-between">
                <span className="text-[9.5px] tracking-[0.14em] font-[800] text-[var(--faint)]">
                  {m.dayShort}
                </span>
                <span className="text-[12.5px] font-[700] leading-[1.22] line-clamp-2 text-[var(--ink)]">
                  {m.dish}
                </span>
                <span className="text-[11px] font-[600] text-[var(--faint)] truncate">
                  {m.cook}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: 3 Cards (Einkauf, Anlässe, Pinnwand) */}
        <div className="flex-1 min-h-0 grid grid-cols-[1.12fr_1fr_0.92fr] gap-3">
          {/* Einkauf (Green) */}
          <div className="bg-[var(--green)] rounded-[22px] p-4 flex flex-col gap-2 min-h-0 border border-[var(--wash)]/40">
            <div className="flex items-baseline justify-between shrink-0">
              <span className="text-[14px] font-[800] text-[var(--greenInk)]">Einkauf</span>
              <span className="text-[11px] font-[600] text-[var(--greenSoft)]">{openLabel}</span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-none">
              {state.shoppingList.slice(0, 15).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onToggleShoppingItem(item.id)}
                  className="flex items-center gap-2.5 p-1 rounded-[10px] hover:bg-[var(--wash)] cursor-pointer active:scale-[0.98]"
                >
                  <span
                    className={`w-4 h-4 rounded-[4px] border-2 shrink-0 flex items-center justify-center ${
                      item.checked ? 'border-[var(--greenInk)] bg-[var(--greenInk)] text-white' : 'border-[var(--greenSoft)]'
                    }`}
                  >
                    {item.checked && (
                      <svg className="w-2.5 h-2.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className={`flex-1 text-[13.5px] font-[600] truncate ${item.checked ? 'line-through text-[var(--greenSoft)]' : 'text-[var(--ink)]'}`}>
                    {item.name}
                  </span>
                  {item.amount && <span className="text-[11px] text-[var(--greenSoft)]">{item.amount}</span>}
                </div>
              ))}
            </div>
            <div className="shrink-0 flex flex-col gap-1">
              <input
                type="text"
                value={shopInput}
                onChange={(e) => setShopInput(e.target.value)}
                onKeyDown={handleShopAdd}
                placeholder="Artikel hinzufügen …"
                className="w-full bg-[var(--wash)] border-none rounded-[12px] p-2.5 text-[13.5px] font-[600] text-[var(--ink)] placeholder-[var(--faint)] outline-none"
              />
              {state.shoppingList.some((i) => i.checked) && (
                <button
                  type="button"
                  onClick={onClearCheckedShopping}
                  className="text-center text-[11px] font-[700] text-[var(--greenSoft)] hover:text-[var(--ink)] cursor-pointer"
                >
                  Erledigte entfernen
                </button>
              )}
            </div>
          </div>

          {/* Anlässe (Blush) */}
          <div className="bg-[var(--blush)] rounded-[22px] p-4 flex flex-col gap-2 min-h-0 border border-[var(--wash)]/40">
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[14px] font-[800] text-[var(--blushInk)]">Anlässe</span>
              {(onOpenCalendarSettings || onOpenSettings) && (
                <button
                  type="button"
                  onClick={onOpenCalendarSettings || onOpenSettings}
                  className="text-[10.5px] font-[700] text-[var(--blushSoft)] hover:text-[var(--blushInk)] cursor-pointer"
                >
                  {isCalendarLive ? '• Live Kalender' : '+ Kalender verknüpfen'}
                </button>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-none">
              {(calendarEvents || customCalendarEvents).map((e) => {
                const parts = e.date.split('-');
                const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                return (
                  <div key={e.id} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 shrink-0 bg-[var(--wash)] rounded-[11px] flex flex-col items-center justify-center leading-none">
                      <span className="text-[15px] font-[800] text-[var(--ink)]">{d.getDate()}</span>
                      <span className="text-[8.5px] font-[800] uppercase text-[var(--blushSoft)]">{GERMAN_MONTHS_SHORT[d.getMonth()]}</span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="text-[13px] font-[700] truncate text-[var(--ink)]">{e.title}</span>
                      <span className="text-[11px] text-[var(--blushSoft)] truncate">{e.location || (e.time ? `um ${e.time}` : 'Termin')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pinnwand (Butter) */}
          <div className="bg-[var(--butter)] rounded-[22px] p-4 flex flex-col gap-2 min-h-0 border border-[var(--wash)]/40">
            <span className="text-[14px] font-[800] text-[var(--butterInk)] shrink-0">Pinnwand</span>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-none">
              {state.notes.map((n) => (
                <div key={n.id} className="bg-[var(--wash)] rounded-[14px] p-2.5 flex flex-col gap-1 border border-black/5">
                  <span className="text-[12.5px] font-[600] leading-[1.3] text-[var(--ink)]">{n.text}</span>
                  <div className="flex items-center justify-between text-[10px] font-[700] text-[var(--butterInk)]">
                    <span>{n.author || 'Notiz'}</span>
                    <button type="button" onClick={() => onRemoveNote(n.id)} className="hover:text-[var(--ink)] cursor-pointer">
                      entfernen
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onKeyDown={handleNoteAdd}
              placeholder="Notiz anpinnen …"
              className="shrink-0 w-full bg-[var(--wash)] border-none rounded-[12px] p-2.5 text-[12.5px] font-[600] text-[var(--ink)] placeholder-[var(--faint)] outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
