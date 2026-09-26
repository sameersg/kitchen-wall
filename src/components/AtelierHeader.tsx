import React, { useState, useEffect } from 'react';

interface AtelierHeaderProps {
  brandName?: string;
  issueLabel?: string;
  tagline?: string;
  isSyncConnected?: boolean;
  onOpenQrModal: () => void;
  onOpenSettings: () => void;
}

export const AtelierHeader: React.FC<AtelierHeaderProps> = ({
  brandName = 'Kitchen Wall',
  issueLabel,
  tagline = 'Täglicher Küchen-Almanach & Notiztafel',
  isSyncConnected = true,
  onOpenQrModal,
  onOpenSettings,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLightOn, setIsLightOn] = useState(true);
  const [weatherTemp, setWeatherTemp] = useState<number | null>(21);
  const [weatherCondition, setWeatherCondition] = useState('Klarer Abend');
  const [duskTime, setDuskTime] = useState('18:54');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute German Day of week and date
  const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const dayName = weekdays[currentTime.getDay()];
  const formattedDate = `${currentTime.getDate()}. ${months[currentTime.getMonth()]}`;

  // Dynamically calculate season journal
  const currentMonth = currentTime.getMonth();
  const season = 
    currentMonth >= 2 && currentMonth <= 4 ? 'Frühlingsjournal' :
    currentMonth >= 5 && currentMonth <= 7 ? 'Sommerjournal' :
    currentMonth >= 8 && currentMonth <= 10 ? 'Herbstjournal' : 'Winterjournal';

  const issueText = issueLabel || `Ausgabe No. ${currentTime.getDate()} · ${season}`;

  const words = brandName.split(' ').filter(Boolean);
  const brandInitial = words.length > 1 
    ? words.map(w => w[0]).join('').slice(0, 2).toUpperCase() 
    : brandName.charAt(0).toUpperCase();

  return (
    <header className="w-full bg-[#faf7f2]/90 backdrop-blur-md rounded-2xl px-5 py-2 flex items-center justify-between shrink-0 border border-white/80 shadow-folio">
      {/* Left: Editorial Brand & Issue Mark */}
      <div className="flex items-center gap-3">
        <div 
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl bg-terracotta text-white flex items-center justify-center font-serif font-bold text-base shadow-stamp tracking-tight cursor-pointer hover:opacity-90 transition-opacity"
          title="Einstellungen öffnen"
        >
          {brandInitial}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-[21px] tracking-tight text-ink leading-none">
              {brandName}
            </h1>
            <span className="text-[9px] font-mono tracking-widest uppercase text-terracotta font-bold bg-terracotta-soft px-2 py-0.5 rounded-full border border-terracotta/20">
              {issueText}
            </span>
          </div>
          <p className="text-[11px] text-[#786b5f] font-editorial italic tracking-wide mt-0.5">
            {tagline}
          </p>
        </div>
      </div>

      {/* Center: Bold Editorial Time & Day/Weather Balance */}
      <div className="flex items-center gap-6">
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-3xl lg:text-4xl font-semibold tracking-tighter text-ink tabular-nums">
            {hours}:{minutes}
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[9.5px] uppercase font-mono font-bold tracking-widest text-terracotta">
              {dayName}
            </span>
            <span className="text-[12px] font-editorial italic text-[#6e6155] leading-none">
              {formattedDate}
            </span>
          </div>
        </div>

        <div className="h-7 w-px bg-parchment-300"></div>

        {/* Atmosphere Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1 rounded-xl bg-white/75 border border-parchment-200">
          <span className="material-symbols-outlined text-[20px] text-ochre">
            wb_twilight
          </span>
          <div className="text-left leading-tight">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-[12.5px] text-ink">
                {weatherTemp !== null ? `${weatherTemp}°C` : '--°C'}
              </span>
              <span className="text-[11px] text-[#6d6154]">{weatherCondition}</span>
            </div>
            <span className="text-[9.5px] font-mono text-[#8e8174]">
              Dämmerung {duskTime}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Lighting Scene & Discreet Stamp QR Badge & Settings */}
      <div className="flex items-center gap-3">
        {/* Ambient Light Touch */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/70 border border-parchment-200">
          <span className="material-symbols-outlined text-[17px] text-amber-600">candle</span>
          <div className="text-left mr-1">
            <span className="text-[10.5px] font-semibold text-ink block leading-none">Atelier-Licht</span>
            <span className="text-[9px] text-[#807264]">
              {isLightOn ? 'Warmweiß 75%' : 'Ausgeschaltet'}
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => setIsLightOn(!isLightOn)}
            className={`w-8 h-4.5 rounded-full p-0.5 flex items-center transition-all cursor-pointer ${
              isLightOn ? 'bg-terracotta justify-end' : 'bg-stone-300 justify-start'
            }`}
          >
            <span className="w-3.5 h-3.5 bg-white rounded-full shadow-xs"></span>
          </button>
        </div>

        {/* QR Hand-Stamp Pairing Badge */}
        <button 
          type="button"
          onClick={onOpenQrModal}
          title="Handy via QR verbinden"
          className="flex items-center gap-2 bg-parchment-100 hover:bg-white border border-dashed border-terracotta/40 hover:border-terracotta text-ink px-2.5 py-1 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer group"
        >
          <div className="w-5 h-5 rounded-md bg-terracotta-soft group-hover:bg-terracotta text-terracotta group-hover:text-white flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[14px]">qr_code_2</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase font-bold text-terracotta tracking-wider block leading-none">
              Handy Sync
            </span>
            <span className="text-[9px] text-[#7a6c5f]">QR koppeln</span>
          </div>
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Einstellungen"
          className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white border border-parchment-200 flex items-center justify-center text-[#786b5f] hover:text-ink transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">settings</span>
        </button>
      </div>
    </header>
  );
};
