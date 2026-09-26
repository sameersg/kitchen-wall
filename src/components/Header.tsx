import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Maximize, Minimize, Settings, 
  Smartphone, ShieldCheck, Wifi, WifiOff, Sparkles, Heart, Utensils
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  isWakeLocked: boolean;
  isSyncConnected: boolean;
  onOpenQrModal: () => void;
  onOpenSettings: () => void;
  onToggleScreensaver: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isWakeLocked,
  isSyncConnected,
  onOpenQrModal,
  onOpenSettings,
  onToggleScreensaver
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    sounds.playTick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getCalendarWeek = (date: Date) => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  };

  const getGreeting = (hour: number) => {
    if (hour >= 5 && hour < 11) return 'Guten Morgen, Sonnenschein ☀️';
    if (hour >= 11 && hour < 14) return 'Guten Appetit & Mahlzeit 🥗';
    if (hour >= 14 && hour < 18) return 'Schönen Nachmittag ☕';
    if (hour >= 18 && hour < 22) return 'Gemütlichen Feierabend 🍷';
    return 'Gute Nacht & süße Träume 🌙';
  };

  const formatOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

  const dateString = time.toLocaleDateString('de-DE', formatOptions);
  const hour = time.getHours();
  const calendarWeek = getCalendarWeek(time);

  return (
    <header className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md rounded-[28px] border border-[#ece7de] shadow-clean mb-4 gap-4">
      {/* Left: Greeting & Date */}
      <div className="flex items-center space-x-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#fef2eb] border border-[#fbdcd0] flex items-center justify-center text-[#e06236] shadow-sm">
          <Utensils className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold tracking-wide text-[#e06236]">
              {getGreeting(hour)}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f3efe8] text-[#786f65] font-mono font-medium">
              KW {calendarWeek}
            </span>
          </div>
          <h1 className="text-base font-bold text-[#221e1a] tracking-tight mt-0.5">
            {dateString}
          </h1>
        </div>
      </div>

      {/* Center: Big Crisp Hero Clock */}
      <div className="flex items-baseline space-x-1.5 bg-[#faf8f4] px-6 py-2 rounded-2xl border border-[#ece7de]">
        <span className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-[#221e1a]">
          {time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-xl md:text-2xl font-mono font-medium text-[#e06236]">
          :{time.toLocaleTimeString('de-DE', { second: '2-digit' })}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2">
        {/* Wake Lock Status */}
        <div
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
            isWakeLocked
              ? 'bg-[#eef8f2] border-[#c2e7d0] text-[#15803d]'
              : 'bg-[#f4efe8] border-[#ece7de] text-[#786f65]'
          }`}
          title={isWakeLocked ? 'iPad Bildschirm bleibt dauerhaft an' : 'Bildschirm-Wachhalter inaktiv'}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#15803d]" />
          <span className="hidden lg:inline">{isWakeLocked ? 'Display Aktiv' : 'Standby'}</span>
        </div>

        {/* Sync Status */}
        <div
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
            isSyncConnected
              ? 'bg-[#eef8f2] border-[#c2e7d0] text-[#15803d]'
              : 'bg-[#f4efe8] border-[#ece7de] text-[#786f65]'
          }`}
          title={isSyncConnected ? 'Echtzeit-Sync mit iPhone aktiv' : 'Lokal gespeichert'}
        >
          {isSyncConnected ? <Wifi className="w-3.5 h-3.5 text-[#15803d]" /> : <WifiOff className="w-3.5 h-3.5 text-[#786f65]" />}
          <span className="hidden lg:inline">{isSyncConnected ? 'Live-Sync' : 'Lokal'}</span>
        </div>

        {/* Connect iPhone Button */}
        <button
          onClick={() => {
            sounds.playTick();
            onOpenQrModal();
          }}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#e06236] hover:bg-[#c2410c] text-white text-xs font-semibold shadow-sm active:scale-95 transition"
        >
          <Smartphone className="w-4 h-4" />
          <span>iPhone koppeln</span>
        </button>

        {/* Screensaver / Night Mode Toggle */}
        <button
          onClick={() => {
            sounds.playTick();
            onToggleScreensaver();
          }}
          className="p-2.5 rounded-xl bg-[#f4efe8] hover:bg-[#ece7de] border border-[#ece7de] text-[#554d44] hover:text-[#221e1a] transition active:scale-95"
          title="Nachtmodus / Bildschirmschoner"
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* Settings / Edit Mode */}
        <button
          onClick={() => {
            sounds.playTick();
            onOpenSettings();
          }}
          className="p-2.5 rounded-xl bg-[#f4efe8] hover:bg-[#ece7de] border border-[#ece7de] text-[#554d44] hover:text-[#221e1a] transition active:scale-95"
          title="Dashboard anpassen & bearbeiten"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl bg-[#f4efe8] hover:bg-[#ece7de] border border-[#ece7de] text-[#554d44] hover:text-[#221e1a] transition active:scale-95 hidden sm:flex"
          title="Vollbild"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
