import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Plus, Trash2, Bell, 
  Flame, Coffee, Egg, Utensils, Timer as TimerIcon, 
  CheckCircle2, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { KitchenTimer, TimerPreset } from '../types';
import { sounds } from '../utils/audio';

interface MultiTimerWidgetProps {
  presets: TimerPreset[];
}

export const MultiTimerWidget: React.FC<MultiTimerWidgetProps> = ({ presets }) => {
  const [timers, setTimers] = useState<KitchenTimer[]>([
    {
      id: 'default_tea',
      name: 'Tee ziehen 🫖',
      totalSeconds: 180,
      remainingSeconds: 180,
      isRunning: false,
      isFinished: false
    }
  ]);

  const [customName, setCustomName] = useState<string>('');
  const [customMinutes, setCustomMinutes] = useState<number>(5);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        let hasJustFinished = false;

        const updated = prevTimers.map((timer) => {
          if (!timer.isRunning || timer.remainingSeconds <= 0) {
            return timer;
          }

          const nextRemaining = timer.remainingSeconds - 1;
          if (nextRemaining === 0) {
            hasJustFinished = true;
            return {
              ...timer,
              remainingSeconds: 0,
              isRunning: false,
              isFinished: true
            };
          }

          return { ...timer, remainingSeconds: nextRemaining };
        });

        if (hasJustFinished) {
          sounds.playAlarm();
          try {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 }
            });
          } catch {
            // ignore
          }
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleTimer = (id: string) => {
    sounds.playTick();
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (t.isFinished) {
            return { ...t, remainingSeconds: t.totalSeconds, isRunning: true, isFinished: false };
          }
          return { ...t, isRunning: !t.isRunning };
        }
        return t;
      })
    );
  };

  const resetTimer = (id: string) => {
    sounds.playTick();
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false, isFinished: false } : t))
    );
  };

  const addTime = (id: string, extraSeconds: number) => {
    sounds.playTick();
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              totalSeconds: t.totalSeconds + extraSeconds,
              remainingSeconds: t.remainingSeconds + extraSeconds,
              isFinished: false
            }
          : t
      )
    );
  };

  const deleteTimer = (id: string) => {
    sounds.playTick();
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  const startPreset = (preset: TimerPreset) => {
    sounds.playChime();
    const newTimer: KitchenTimer = {
      id: 'timer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      name: preset.label,
      totalSeconds: preset.seconds,
      remainingSeconds: preset.seconds,
      isRunning: true,
      isFinished: false
    };
    setTimers((prev) => [newTimer, ...prev]);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || customMinutes <= 0) return;
    const sec = customMinutes * 60;
    const newTimer: KitchenTimer = {
      id: 'timer_' + Date.now(),
      name: customName.trim(),
      totalSeconds: sec,
      remainingSeconds: sec,
      isRunning: true,
      isFinished: false
    };
    setTimers((prev) => [newTimer, ...prev]);
    setCustomName('');
    setIsAdding(false);
    sounds.playChime();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPresetIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Egg': return <Egg className="w-3.5 h-3.5 text-[#d97706]" />;
      case 'Coffee': return <Coffee className="w-3.5 h-3.5 text-[#e06236]" />;
      case 'Utensils': return <Utensils className="w-3.5 h-3.5 text-[#15803d]" />;
      case 'Flame': return <Flame className="w-3.5 h-3.5 text-[#c2410c]" />;
      default: return <TimerIcon className="w-3.5 h-3.5 text-[#e06236]" />;
    }
  };

  return (
    <div className="bg-white rounded-[28px] border border-[#ece7de] shadow-clean p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ece7de]">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-[#d97706]" />
          <h2 className="font-semibold text-sm tracking-tight text-[#221e1a]">Küchen-Timer</h2>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#fef9ee] text-[#b45309] font-medium border border-[#fde68a]">
            {timers.filter((t) => t.isRunning).length} aktiv
          </span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs flex items-center space-x-1 px-3 py-1 rounded-xl bg-[#f4efe8] hover:bg-[#ece7de] text-[#221e1a] border border-[#ece7de] font-medium transition"
        >
          <Plus className="w-3.5 h-3.5 text-[#e06236]" />
          <span>Timer +</span>
        </button>
      </div>

      {/* Add Custom Timer Drawer */}
      {isAdding && (
        <form onSubmit={handleCreateCustom} className="my-3 p-3.5 rounded-2xl bg-[#faf8f4] border border-[#ece7de]">
          <div className="flex flex-col space-y-2.5">
            <input
              type="text"
              placeholder="Name (z.B. Kartoffeln kochen)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="bg-white text-xs text-[#221e1a] px-3.5 py-2.5 rounded-xl border border-[#ece7de] focus:outline-none focus:border-[#e06236]"
              autoFocus
            />
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#786f65]">Minuten:</span>
              <input
                type="number"
                min="1"
                max="180"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                className="w-16 bg-white text-xs text-[#221e1a] px-2 py-1.5 rounded-xl border border-[#ece7de] text-center font-bold"
              />
              <div className="flex-1 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#786f65] hover:text-[#221e1a]"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#e06236] hover:bg-[#c2410c] text-white shadow-sm"
                >
                  Starten
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Active Timers List */}
      <div className="flex-1 overflow-y-auto my-2 space-y-2.5 pr-1 max-h-56 scrollbar-thin">
        {timers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[#786f65] text-xs space-y-1">
            <TimerIcon className="w-8 h-8 opacity-30 mb-1 text-[#e06236]" />
            <span>Keine aktiven Timer</span>
            <span className="text-[10px] text-[#786f65]/70">Wähle unten ein Schnellstart-Preset</span>
          </div>
        ) : (
          timers.map((timer) => {
            const percent = Math.max(0, Math.min(100, ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100));

            return (
              <div
                key={timer.id}
                className={`relative overflow-hidden p-3.5 rounded-2xl border transition-all ${
                  timer.isFinished
                    ? 'bg-[#fef2eb] border-[#e06236] shadow-sm animate-pulse-subtle'
                    : timer.isRunning
                    ? 'bg-[#fef9ee] border-[#fde68a] shadow-sm'
                    : 'bg-[#faf8f4] border-[#ece7de]'
                }`}
              >
                {/* Progress bar background in soft warm tone */}
                <div
                  className={`absolute left-0 bottom-0 top-0 opacity-15 transition-all duration-1000 ${
                    timer.isFinished ? 'bg-[#15803d]' : 'bg-[#e06236]'
                  }`}
                  style={{ width: `${percent}%` }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold text-[#221e1a]">{timer.name}</span>
                      {timer.isFinished && (
                        <span className="text-[10px] font-bold text-[#15803d] flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>FERTIG! 🌸</span>
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-mono font-bold text-[#221e1a] tracking-wider mt-0.5">
                      {formatTime(timer.remainingSeconds)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => addTime(timer.id, 60)}
                      className="px-2.5 py-1 text-[10px] font-bold text-[#554d44] hover:text-[#221e1a] bg-white rounded-xl border border-[#ece7de] transition active:scale-95 shadow-sm"
                      title="+1 Minute"
                    >
                      +1m
                    </button>
                    <button
                      onClick={() => addTime(timer.id, 300)}
                      className="px-2.5 py-1 text-[10px] font-bold text-[#554d44] hover:text-[#221e1a] bg-white rounded-xl border border-[#ece7de] transition active:scale-95 shadow-sm"
                      title="+5 Minuten"
                    >
                      +5m
                    </button>
                    <button
                      onClick={() => toggleTimer(timer.id)}
                      className={`p-2 rounded-xl transition shadow-sm active:scale-95 ${
                        timer.isRunning
                          ? 'bg-[#fef2eb] text-[#e06236] border border-[#fbdcd0]'
                          : 'bg-[#e06236] hover:bg-[#c2410c] text-white font-bold'
                      }`}
                      title={timer.isRunning ? 'Pause' : 'Start'}
                    >
                      {timer.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </button>
                    <button
                      onClick={() => resetTimer(timer.id)}
                      className="p-2 text-[#786f65] hover:text-[#221e1a] hover:bg-white rounded-xl transition active:scale-95"
                      title="Zurücksetzen"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTimer(timer.id)}
                      className="p-2 text-[#786f65] hover:text-[#c2410c] hover:bg-[#fef2eb] rounded-xl transition active:scale-95"
                      title="Löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick 1-Touch Presets */}
      <div className="pt-2.5 border-t border-[#ece7de]">
        <div className="text-[10px] font-semibold text-[#786f65] uppercase tracking-wider mb-2">
          Schnellstart
        </div>
        <div className="flex flex-wrap gap-1.5">
          {presets.slice(0, 6).map((preset) => (
            <button
              key={preset.id}
              onClick={() => startPreset(preset)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#faf8f4] hover:bg-[#fef2eb] border border-[#ece7de] hover:border-[#fbdcd0] text-[#221e1a] transition active:scale-95 text-xs font-medium"
            >
              <span>{getPresetIcon(preset.iconName)}</span>
              <span>{preset.label}</span>
              <span className="text-[10px] text-[#786f65]">({Math.round(preset.seconds / 60)}m)</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
