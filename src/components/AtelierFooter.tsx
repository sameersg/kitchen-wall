import React, { useState } from 'react';

interface AtelierFooterProps {
  onOpenVoiceModal?: () => void;
  onToggleScreensaver?: () => void;
  onLockKiosk?: () => void;
}

export const AtelierFooter: React.FC<AtelierFooterProps> = ({
  onOpenVoiceModal,
  onToggleScreensaver,
  onLockKiosk
}) => {
  const [isLocked, setIsLocked] = useState(false);

  const handleLockToggle = () => {
    setIsLocked(!isLocked);
    if (onLockKiosk) onLockKiosk();
  };

  return (
    <footer className="w-full bg-[#faf7f2]/90 backdrop-blur-md rounded-xl px-4 py-1.5 flex items-center justify-between shrink-0 border border-white/80 shadow-xs text-[11px]">
      {/* Left: Haustechnik Status & Machine Restlaufzeiten */}
      <div className="flex items-center gap-5">
        {/* Dishwasher */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-terracotta">
            countertops
          </span>
          <span className="text-[#7c6e61]">Spülmaschine:</span>
          <span className="font-mono font-bold text-terracotta text-[12px]">
            34 Min. Rest
          </span>
          <span className="text-[9.5px] text-[#938578] font-mono">(Eco 50°)</span>
        </div>

        <div className="h-4 w-px bg-parchment-300"></div>

        {/* Refrigerator */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-sky-700">
            kitchen
          </span>
          <span className="text-[#7c6e61]">Kühlschrank:</span>
          <span className="font-mono font-semibold text-ink text-[12px]">
            4.0°C
          </span>
          <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
            Optimal
          </span>
        </div>

        <div className="h-4 w-px bg-parchment-300"></div>

        {/* Müllabfuhr */}
        <div className="hidden md:flex items-center gap-1.5 text-[#5e5145]">
          <span className="material-symbols-outlined text-[16px] text-sage">
            recycling
          </span>
          <span>
            Morgen 07:00: <strong className="text-sage-dark font-semibold">Biomüll</strong>
          </span>
        </div>

        <div className="h-4 w-px bg-parchment-300 hidden md:block"></div>

        {/* Household presence badge */}
        <div className="flex items-center gap-1.5 font-medium text-ink">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>4 anwesend</span>
        </div>
      </div>

      {/* Right: Quick Touch Tools (Sprachnotiz, Dimmen, Lock) */}
      <div className="flex items-center gap-2">
        <button 
          type="button"
          onClick={onOpenVoiceModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-parchment-100 text-ink border border-parchment-300 text-[11px] font-medium shadow-2xs active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px] text-terracotta">mic</span>
          <span>Sprachnotiz</span>
        </button>

        <button 
          type="button"
          onClick={onToggleScreensaver}
          className="w-7 h-7 rounded-lg bg-white hover:bg-parchment-100 text-ink border border-parchment-300 flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer"
          title="Display dimmen (Nachtmodus)"
        >
          <span className="material-symbols-outlined text-[15px]">bedtime</span>
        </button>

        <button 
          type="button"
          onClick={handleLockToggle}
          className={`w-7 h-7 rounded-lg border flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer ${
            isLocked ? 'bg-terracotta text-white border-terracotta' : 'bg-white hover:bg-parchment-100 text-ink border-parchment-300'
          }`}
          title={isLocked ? 'Kiosk entsperren' : 'Kiosk sperren'}
        >
          <span className="material-symbols-outlined text-[15px]">
            {isLocked ? 'lock' : 'lock_open'}
          </span>
        </button>
      </div>
    </footer>
  );
};
