import React, { useState, useEffect } from 'react';
import { useDashboardWeather } from '../../hooks/useDashboardWeather';

interface QuadrantHeroCardProps {
  householdName?: string;
  isNight: boolean;
  onToggleNight: () => void;
  onOpenQr: () => void;
  onOpenSettings?: () => void;
  todayDishName: string;
  todayDishImg?: string;
  todayCook: string;
  todayNote: string;
  onOpenRecipe?: () => void;
  weatherLat?: number;
  weatherLon?: number;
}

const GERMAN_WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const GERMAN_MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

export const QuadrantHeroCard: React.FC<QuadrantHeroCardProps> = ({
  householdName = 'Unsere Küche',
  isNight,
  onToggleNight,
  onOpenQr,
  onOpenSettings,
  todayDishName,
  todayDishImg,
  todayCook,
  todayNote,
  onOpenRecipe,
  weatherLat,
  weatherLon
}) => {
  const [now, setNow] = useState(new Date());
  const weather = useDashboardWeather(weatherLat, weatherLon);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${pad(hours)}:${pad(now.getMinutes())}`;
  const dayName = GERMAN_WEEKDAYS[now.getDay()];
  const dateStr = `${dayName}, ${now.getDate()}. ${GERMAN_MONTHS[now.getMonth()]}`;

  const greeting =
    hours < 11
      ? `Guten Morgen, ${householdName}`
      : hours < 17
      ? `Hallo, ${householdName}`
      : `Guten Abend, ${householdName}`;

  // Default fallback image if none provided
  const bgImage =
    todayDishImg ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="relative rounded-[26px] overflow-hidden bg-[var(--photo)] min-h-0 h-full w-full select-none shadow-sm transition-all">
      {/* Background Food Photo */}
      <img
        src={bgImage}
        alt={todayDishName}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* Atmospheric dark gradient overlay from Claude Design */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(12,11,9,0.78)] via-[rgba(12,11,9,0.28)] to-[rgba(12,11,9,0.92)]" />

      {/* Inner Content Grid */}
      <div className="absolute inset-0 p-[24px_26px] md:p-[26px_28px] flex flex-col justify-between">
        {/* Top Bar: Time, Date, Weather & Quick Controls */}
        <div className="flex items-start justify-between gap-4">
          {/* Time & Greeting */}
          <div className="flex flex-col">
            <span className="text-[58px] md:text-[62px] font-[800] leading-[0.88] tracking-[-0.04em] text-white">
              {timeStr}
            </span>
            <span className="text-[14px] md:text-[15px] font-[700] text-white/90 mt-1.5">
              {dateStr}
            </span>
            <span className="text-[12px] font-[500] text-white/65 mt-0.5">
              {greeting}
            </span>
          </div>

          {/* Right Action Chips: Weather + Night Toggle + iPhone QR */}
          <div className="flex flex-col items-end gap-2">
            {/* Live Weather Badge */}
            <div className="flex items-center gap-2 bg-white/16 backdrop-blur-md rounded-full px-3.5 py-1.5 border border-white/10 shadow-xs">
              <span className="text-[18px] md:text-[20px] font-[800] text-white leading-none">
                {weather.temp}°
              </span>
              <span className="text-[11px] font-[600] text-white/85">
                {weather.conditionText} · morgen {weather.tomorrowTemp}°
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Tag / Nacht Umschalter */}
              <button
                type="button"
                onClick={onToggleNight}
                className="text-[11px] font-[700] text-white bg-white/16 hover:bg-white/28 active:scale-95 transition-all backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 cursor-pointer"
                title={isNight ? 'Tag-Modus aktivieren' : 'Nacht-Modus aktivieren'}
              >
                {isNight ? 'Tag' : 'Nacht'}
              </button>

              {/* iPhone Sync Button with 3x3 Dot Matrix */}
              <button
                type="button"
                onClick={onOpenQr}
                className="flex items-center gap-2 bg-white text-[#23231f] hover:bg-white/90 active:scale-95 transition-all px-3.5 py-2 rounded-full shadow-md cursor-pointer font-[800] text-[11px]"
                title="iPhone verbinden"
              >
                <div className="grid grid-cols-3 grid-rows-3 gap-[2px] w-[14px] h-[14px] place-items-center">
                  <span className="w-[3px] h-[3px] bg-[#23231f] rounded-[0.5px]"></span>
                  <span className="w-[3px] h-[3px] bg-[#b8b6ae] rounded-[0.5px]"></span>
                  <span className="w-[3px] h-[3px] bg-[#23231f] rounded-[0.5px]"></span>
                  <span className="w-[3px] h-[3px] bg-[#b8b6ae] rounded-[0.5px]"></span>
                  <span className="w-[3px] h-[3px] bg-[#e8a05e] rounded-[0.5px]"></span>
                  <span className="w-[3px] h-[3px] bg-[#b8b6ae] rounded-[0.5px]"></span>
                  <span className="w-[3px] h-[3px] bg-[#23231f] rounded-[0.5px]"></span>
                  <span className="w-[3px] h-[3px] bg-[#b8b6ae] rounded-[0.5px]"></span>
                  <span className="w-[3px] h-[3px] bg-[#23231f] rounded-[0.5px]"></span>
                </div>
                <span>iPhone</span>
              </button>

              {/* Discreet Settings Cog */}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="w-7 h-7 flex items-center justify-center bg-white/14 hover:bg-white/28 active:scale-95 transition-all backdrop-blur-md rounded-full text-white/80 hover:text-white cursor-pointer"
                  title="Einstellungen öffnen"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Area: Today's Featured Dish in Instrument Serif */}
        <div
          onClick={onOpenRecipe}
          className="flex flex-col gap-1.5 group cursor-pointer active:scale-[0.99] transition-transform"
          title="Rezept ansehen oder ändern"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase font-[800] text-[#e8b98e]">
            Heute · {dayName}
          </span>
          <h2 className="font-serif font-[400] text-[40px] md:text-[46px] leading-[1.02] text-white drop-shadow-sm group-hover:text-amber-100 transition-colors">
            {todayDishName || 'Noch nichts geplant'}
          </h2>
          <div className="flex items-center gap-2.5 mt-1 flex-wrap">
            {todayCook && (
              <span className="text-[11px] md:text-[12px] font-[700] text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-xs">
                {todayCook}
              </span>
            )}
            {todayNote && (
              <span className="text-[12px] md:text-[13px] font-[500] text-white/85 line-clamp-1">
                {todayNote}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
