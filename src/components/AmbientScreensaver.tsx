import React, { useState, useEffect } from 'react';
import { Moon, Sparkles, Heart } from 'lucide-react';

interface AmbientScreensaverProps {
  isOpen: boolean;
  onExit: () => void;
  city: string;
}

export const AmbientScreensaver: React.FC<AmbientScreensaverProps> = ({ isOpen, onExit, city }) => {
  const [time, setTime] = useState(new Date());
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => setTime(new Date()), 1000);

    // Subtle drift every minute to prevent OLED burn-in
    const driftTimer = setInterval(() => {
      setOffsetY((prev) => (prev === 0 ? 15 : prev === 15 ? -15 : 0));
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(driftTimer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onExit}
      className="fixed inset-0 z-50 bg-[#0f0b12] flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-1000"
    >
      <div
        className="flex flex-col items-center transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateY(${offsetY}px)` }}
      >
        <div className="flex items-center space-x-2 text-rose-300/40 mb-3">
          <Heart className="w-4 h-4 text-rose-400 opacity-60 fill-current" />
          <span className="text-xs uppercase tracking-widest font-mono text-rose-300/40">
            Küche • {city}
          </span>
        </div>

        <div className="text-8xl md:text-9xl font-mono font-bold tracking-tighter text-rose-100/80 drop-shadow-lg select-none">
          {time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </div>

        <div className="text-base text-rose-300/50 font-medium mt-3">
          {time.toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </div>

        <div className="mt-12 text-xs text-rose-400/40 font-mono tracking-wider animate-pulse">
          Tippen zum Aufwecken ✨
        </div>
      </div>
    </div>
  );
};
