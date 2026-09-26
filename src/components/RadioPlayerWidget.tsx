import React, { useState, useRef, useEffect } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Sparkles, Music } from 'lucide-react';
import { RadioStation } from '../types';

interface RadioPlayerWidgetProps {
  stations: RadioStation[];
}

export const RadioPlayerWidget: React.FC<RadioPlayerWidgetProps> = ({ stations }) => {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentStation = stations[currentStationIndex] || stations[0];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setHasError(false);
      audioRef.current.src = currentStation.url;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
          setIsLoading(false);
          setHasError(true);
        });
    }
  };

  const changeStation = (idx: number) => {
    setCurrentStationIndex(idx);
    setHasError(false);
    if (audioRef.current) {
      audioRef.current.src = stations[idx].url;
      if (isPlaying) {
        setIsLoading(true);
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
            setHasError(true);
          });
      }
    }
  };

  return (
    <div className="bg-white rounded-[28px] border border-[#ece7de] shadow-clean p-5 flex flex-col justify-between h-full">
      <audio
        ref={audioRef}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
          setHasError(true);
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ece7de]">
        <div className="flex items-center space-x-2">
          <Music className="w-4 h-4 text-[#e06236]" />
          <h2 className="font-semibold text-sm tracking-tight text-[#221e1a]">Küchen-Radio & Sound</h2>
        </div>
        {isPlaying && (
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-3 bg-[#e06236] rounded-full animate-pulse" />
            <span className="w-1.5 h-4 bg-[#f59e0b] rounded-full animate-pulse delay-75" />
            <span className="w-1.5 h-2 bg-[#15803d] rounded-full animate-pulse delay-150" />
          </div>
        )}
      </div>

      {/* Now Playing Banner */}
      <div className="my-3 p-3.5 rounded-2xl bg-[#faf8f4] border border-[#ece7de] flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] uppercase font-bold text-[#e06236] tracking-wider">
              {currentStation?.genre || 'Stream'}
            </span>
            {hasError && <span className="text-[10px] text-rose-500 font-medium">(Offline)</span>}
          </div>
          <h3 className="text-sm font-bold text-[#221e1a] truncate mt-0.5">{currentStation?.name}</h3>
        </div>

        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="p-3.5 rounded-2xl bg-[#e06236] hover:bg-[#c2410c] text-white shadow-sm active:scale-95 transition"
          title={isPlaying ? 'Pause' : 'Abspielen'}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Stations list */}
      <div className="flex-1 overflow-y-auto space-y-1 max-h-40 pr-1 scrollbar-thin">
        {stations.map((st, idx) => (
          <button
            key={st.id}
            onClick={() => changeStation(idx)}
            className={`w-full text-left px-3 py-2 rounded-2xl text-xs flex items-center justify-between transition ${
              idx === currentStationIndex
                ? 'bg-[#fef2eb] border border-[#fbdcd0] text-[#e06236] font-bold shadow-sm'
                : 'bg-[#faf8f4] border border-[#ece7de] text-[#554d44] hover:bg-stone-100'
            }`}
          >
            <span className="truncate">{st.name}</span>
            <span className="text-[10px] text-[#786f65]">{st.genre}</span>
          </button>
        ))}
      </div>

      {/* Volume slider */}
      <div className="pt-2.5 border-t border-[#ece7de] flex items-center space-x-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-[#786f65] hover:text-[#221e1a] transition"
          title={isMuted ? 'Ton an' : 'Stumm'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-500" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            setIsMuted(false);
          }}
          className="flex-1 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#e06236]"
        />
        <span className="text-[10px] text-[#786f65] font-mono w-7 text-right">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </div>
  );
};
