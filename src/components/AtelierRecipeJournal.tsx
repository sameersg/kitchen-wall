import React, { useState, useEffect, useRef } from 'react';
import { MealItem, SingleMeal } from '../types';
import { sounds } from '../utils/audio';

interface AtelierRecipeJournalProps {
  currentMeal?: SingleMeal | null;
  onOpenRecipeSelector?: () => void;
  onTimerFinished?: () => void;
}

export const AtelierRecipeJournal: React.FC<AtelierRecipeJournalProps> = ({
  currentMeal,
  onOpenRecipeSelector,
  onTimerFinished
}) => {
  // Recipe Details (defaults to Pasta al Forno as in mockup)
  const defaultRecipe = {
    title: 'Pasta al Forno mit Feta & Gartenkräutern',
    category: 'Ofenfrischer Auflauf',
    pageNote: 'Seite 14 · Frische Kräuterküche',
    timeSlot: '19:00 Abendessen',
    portions: '4 Portionen',
    description: 'Knusprige Kruste, geschmorte Strauchtomaten, cremig gebackener Schafskäse und erntefrisches Basilikum aus dem Küchenfenster.',
    cookTime: '25 Min.',
    ovenTemp: '200°C',
    heatType: 'Ober-/Unterhitze',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAd90PalFk-9-L7Tg4HDUQu0OsDAo0o5XZBtGEvz8Jzo8CAVZB9YwAYyT0weCwS_sHZ9Swzd-TfW4WOqv9hrtGr-l3lspMrlVvbNrSODpyoKq5GyXoICb5bDLS_5VavUviNdTQkQ1FFYJ5gyHhtdkjygnL6Ha9Pmd2hf9LlGaIfYTmxSBAy3aBqajNWrzykaKqcLVtzoupDDI7UU4mdujIh7x0ZKH5NJhM32R4Yi9vnEujogAOHyAHlCg',
    caption: 'Bio-Strauchtomaten & Feta'
  };

  const recipe = currentMeal ? {
    title: currentMeal.title || defaultRecipe.title,
    category: currentMeal.category || defaultRecipe.category,
    pageNote: 'Frische Zutaten & Handwerk',
    timeSlot: '19:00 Abendessen',
    portions: '4 Portionen',
    description: currentMeal.ingredients && currentMeal.ingredients.length > 0 
      ? `Zutaten: ${currentMeal.ingredients.join(', ')}`
      : defaultRecipe.description,
    cookTime: currentMeal.cookTime || defaultRecipe.cookTime,
    ovenTemp: '200°C',
    heatType: 'Ober-/Unterhitze',
    image: currentMeal.image || defaultRecipe.image,
    caption: currentMeal.category || defaultRecipe.caption
  } : defaultRecipe;

  // Oven Timer State
  const [timerSeconds, setTimerSeconds] = useState(10 * 60 + 31);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [activePreset, setActivePreset] = useState<'3' | '8' | '25' | null>('25');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            sounds.playAlarm();
            if (onTimerFinished) onTimerFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, onTimerFinished]);

  const toggleTimer = () => {
    sounds.playTick();
    setIsTimerRunning(!isTimerRunning);
  };

  const stepTimer = (deltaSeconds: number) => {
    sounds.playTick();
    setTimerSeconds((prev) => Math.max(0, prev + deltaSeconds));
  };

  const setPresetTimer = (minutes: number, presetKey: '3' | '8' | '25') => {
    sounds.playTick();
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
    setActivePreset(presetKey);
  };

  const timerMins = Math.floor(timerSeconds / 60);
  const timerSecs = timerSeconds % 60;
  const formattedTimer = `${String(timerMins).padStart(2, '0')}:${String(timerSecs).padStart(2, '0')}`;

  return (
    <section className="col-span-12 lg:col-span-7 magazine-page rounded-2xl p-4 flex flex-col justify-between min-h-0 border border-parchment-300 shadow-folio relative overflow-hidden">
      {/* Top Folio Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-parchment-300 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-terracotta font-bold">
            Menu du Jour
          </span>
          <span className="text-parchment-400">/</span>
          <span className="text-[11px] font-editorial italic text-[#7a6b5e]">
            {recipe.pageNote}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span 
            onClick={onOpenRecipeSelector}
            className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-sage-subtle text-sage-dark border border-sage/30 px-2 py-0.5 rounded-full cursor-pointer hover:bg-sage/10 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sage"></span>
            {recipe.timeSlot}
          </span>
          <span className="text-[10px] font-mono text-[#8e8174]">
            {recipe.portions}
          </span>
        </div>
      </div>

      {/* Center Hero: Editorial Culinary Feature */}
      <div className="grid grid-cols-12 gap-3.5 my-auto items-center">
        {/* Prominent Food Photography with Photo-Journal Frame */}
        <div className="col-span-5 relative group">
          {/* Washi Tape Accent */}
          <div className="absolute -top-2 left-6 w-16 h-4 washi-tape-amber rounded-xs -rotate-2 z-10 pointer-events-none"></div>
          
          <div className="bg-white p-2 rounded-xl shadow-md border border-parchment-300 transition-transform group-hover:scale-[1.01] duration-300">
            <div className="w-full aspect-[4/3.8] rounded-lg overflow-hidden relative shadow-inner bg-parchment-200">
              <img 
                alt={recipe.title}
                className="w-full h-full object-cover"
                src={recipe.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
              <span className="absolute bottom-1.5 left-2 text-[9px] font-mono uppercase tracking-wider text-white/95 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs">
                Atelier No. 04
              </span>
            </div>
            <div className="pt-1.5 px-0.5 flex items-center justify-between text-[10px] text-[#7e6f62]">
              <span className="font-editorial italic truncate max-w-[130px]">
                {recipe.caption}
              </span>
              <span className="font-mono text-[9px] text-terracotta whitespace-nowrap">
                Rezeptkarte ✓
              </span>
            </div>
          </div>
        </div>

        {/* Editorial Typography & Recipe Details */}
        <div className="col-span-7 flex flex-col justify-between pr-1">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-terracotta font-bold block mb-1">
              {recipe.category}
            </span>
            <h2 className="font-editorial text-[26px] lg:text-[29px] leading-[1.12] text-ink font-semibold tracking-tight">
              {recipe.title}
            </h2>
            <p className="font-sans text-[12.5px] text-[#695d52] leading-relaxed mt-2 line-clamp-2">
              {recipe.description}
            </p>
          </div>

          {/* Recipe Spec Badges */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-parchment-300/80">
            <div className="bg-white/85 rounded-xl p-2 border border-parchment-200">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#887a6d] block">
                Zubereitung
              </span>
              <div className="flex items-center gap-1 text-ink font-semibold text-[13px] mt-0.5">
                <span className="material-symbols-outlined text-[15px] text-sage">skillet</span>
                <span>{recipe.cookTime}</span>
              </div>
            </div>

            <div className="bg-terracotta-soft/80 rounded-xl p-2 border border-terracotta/20">
              <span className="text-[9px] font-mono uppercase tracking-wider text-terracotta font-semibold block">
                Backofen
              </span>
              <div className="flex items-center gap-1 text-terracotta font-bold text-[13.5px] mt-0.5 font-mono">
                <span className="material-symbols-outlined text-[15px]">local_fire_department</span>
                <span>{recipe.ovenTemp}</span>
              </div>
            </div>

            <div className="bg-white/85 rounded-xl p-2 border border-parchment-200">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#887a6d] block">
                Hitzeart
              </span>
              <span className="text-ink font-medium text-[12px] block mt-0.5 truncate">
                {recipe.heatType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Block: Craft Kitchen Timer & Tactile Machine Dock */}
      <div className="mt-2.5 pt-2.5 border-t border-parchment-300 grid grid-cols-12 gap-2.5 shrink-0 items-center">
        {/* Tactile Terracotta Oven Precision Timer (Cols 7) */}
        <div className="col-span-7 bg-[#f7f0e6] rounded-xl p-2.5 border border-parchment-300 shadow-emboss flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Terracotta Dial Wheel Button */}
            <div 
              onClick={toggleTimer}
              className="w-12 h-12 rounded-full terracotta-dial flex items-center justify-center text-white shrink-0 relative cursor-pointer active:scale-95 transition-transform"
              title={isTimerRunning ? 'Timer pausieren' : 'Timer starten'}
            >
              <span className="material-symbols-outlined text-[22px]">
                {isTimerRunning ? 'pause' : 'play_arrow'}
              </span>
              <div className="absolute inset-0 rounded-full border border-white/20"></div>
            </div>

            {/* Large Display Readout */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-terracotta">
                  Backofen Timer
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${isTimerRunning ? 'bg-emerald-600 animate-pulse' : 'bg-stone-400'}`}></span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono font-bold text-[28px] tracking-tight text-ink tabular-nums leading-none">
                  {formattedTimer}
                </span>
                <span className="text-[11px] font-mono text-[#8a7a6c] font-semibold">
                  min
                </span>
              </div>
            </div>
          </div>

          {/* Step & Preset Chips */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => stepTimer(-60)}
                className="w-6 h-6 rounded-lg bg-white hover:bg-parchment-100 text-ink text-[11px] font-mono font-bold border border-parchment-300 active:scale-95 transition-all shadow-2xs cursor-pointer"
                title="-1 Minute"
              >
                -1
              </button>
              <button 
                onClick={() => stepTimer(60)}
                className="w-6 h-6 rounded-lg bg-white hover:bg-parchment-100 text-ink text-[11px] font-mono font-bold border border-parchment-300 active:scale-95 transition-all shadow-2xs cursor-pointer"
                title="+1 Minute"
              >
                +1
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPresetTimer(3, '3')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border border-parchment-300 transition-colors cursor-pointer ${
                  activePreset === '3' && isTimerRunning 
                    ? 'bg-terracotta text-white font-bold shadow-2xs' 
                    : 'bg-white hover:bg-parchment-100 text-[#504439]'
                }`}
              >
                3m
              </button>
              <button 
                onClick={() => setPresetTimer(8, '8')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border border-parchment-300 transition-colors cursor-pointer ${
                  activePreset === '8' && isTimerRunning 
                    ? 'bg-terracotta text-white font-bold shadow-2xs' 
                    : 'bg-white hover:bg-parchment-100 text-[#504439]'
                }`}
              >
                8m
              </button>
              <button 
                onClick={() => setPresetTimer(25, '25')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border border-parchment-300 transition-colors cursor-pointer ${
                  activePreset === '25' && isTimerRunning 
                    ? 'bg-terracotta text-white font-bold shadow-2xs' 
                    : 'bg-white hover:bg-parchment-100 text-[#504439]'
                }`}
              >
                25m
              </button>
            </div>
          </div>
        </div>

        {/* Siebträger Espresso Status (Cols 5) */}
        <div className="col-span-5 bg-white/80 rounded-xl p-2.5 border border-parchment-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-parchment-200 text-[#544131] flex items-center justify-center shrink-0 border border-parchment-300">
              <span className="material-symbols-outlined text-[19px]">coffee_maker</span>
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#827263]">
                  Siebträger
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <span className="font-mono font-bold text-[17px] text-ink block">
                93.0 °C
              </span>
              <span className="text-[9.5px] text-emerald-800 font-medium">
                Brühgruppe bereit
              </span>
            </div>
          </div>

          <div className="text-right border-l border-parchment-200 pl-2">
            <span className="text-[8.5px] font-mono uppercase text-[#918171] block">
              Kessel
            </span>
            <span className="text-[11px] font-mono font-semibold text-terracotta">
              1.3 bar
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
