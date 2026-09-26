import React, { useState } from 'react';
import { KitchenNote, CalendarEvent } from '../types';

interface AtelierPinboardProps {
  notes: KitchenNote[];
  events?: CalendarEvent[];
  onOpenNoteModal?: () => void;
}

export const AtelierPinboard: React.FC<AtelierPinboardProps> = ({
  notes = [],
  events = [],
  onOpenNoteModal
}) => {
  // Current note index to allow cycling notes on tap
  const [noteIndex, setNoteIndex] = useState(0);

  const defaultNote = {
    id: 'default_note',
    author: 'Papa',
    text: '„Bitte unbedingt die blaue Barista-Hafermilch mitbringen! Bin ca. 18:50 zurück vom Studio.“',
    timeAgo: 'vor 25 Min.'
  };

  const currentNote = notes.length > 0 
    ? {
        id: notes[noteIndex % notes.length].id,
        author: notes[noteIndex % notes.length].author || 'Familie',
        text: `„${notes[noteIndex % notes.length].text}“`,
        timeAgo: 'Neu'
      }
    : defaultNote;

  const handleNextNote = () => {
    if (notes.length > 1) {
      setNoteIndex((prev) => (prev + 1) % notes.length);
    } else if (onOpenNoteModal) {
      onOpenNoteModal();
    }
  };

  return (
    <div className="bg-[#faf7f2]/95 rounded-2xl p-3 border border-parchment-300 shadow-folio flex flex-col justify-between gap-2 shrink-0">
      {/* Header & Sync Pill */}
      <div className="flex items-center justify-between pb-1 border-b border-parchment-200">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-terracotta"></div>
          <h3 className="font-serif font-bold text-[13.5px] text-ink tracking-tight">
            Familien-Pinnwand &amp; Tagestakt
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {notes.length > 1 && (
            <span className="text-[9px] font-mono text-terracotta cursor-pointer hover:underline" onClick={handleNextNote}>
              Notiz {((noteIndex % notes.length) + 1)}/{notes.length} ↻
            </span>
          )}
          <span className="text-[9.5px] font-mono text-[#7b6d5f]">
            4 Profile aktiv
          </span>
        </div>
      </div>

      {/* Horizontaler kompakter Tagesablauf */}
      <div className="grid grid-cols-4 gap-1.5">
        {/* Event 1: Erledigt */}
        <div className="bg-white/60 rounded-lg p-1.5 border border-parchment-200 opacity-60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px] font-mono">
            <span className="line-through text-[#63574c]">08:30</span>
            <span className="material-symbols-outlined text-[11px] text-emerald-700">check</span>
          </div>
          <span className="font-medium text-[10.5px] text-ink truncate line-through">
            Wald-Tag
          </span>
          <span className="text-[8.5px] text-[#7d6f61]">Sophie</span>
        </div>

        {/* Event 2: Erledigt */}
        <div className="bg-white/60 rounded-lg p-1.5 border border-parchment-200 opacity-60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px] font-mono">
            <span className="line-through text-[#63574c]">13:15</span>
            <span className="material-symbols-outlined text-[11px] text-emerald-700">check</span>
          </div>
          <span className="font-medium text-[10.5px] text-ink truncate line-through">
            Zahnarzt
          </span>
          <span className="text-[8.5px] text-[#7d6f61]">Elias</span>
        </div>

        {/* Event 3: Jetzt aktiv */}
        <div className="bg-amber-100/75 rounded-lg p-1.5 border border-amber-300 shadow-2xs flex flex-col justify-between relative ring-1 ring-amber-400/40">
          <div className="flex items-center justify-between text-[9px] font-mono font-bold text-amber-900">
            <span>16:30</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
          </div>
          <span className="font-bold text-[10.5px] text-ink truncate">
            REWE Markt
          </span>
          <span className="text-[8.5px] font-medium text-amber-900 truncate">
            Mama (Auto)
          </span>
        </div>

        {/* Event 4: Abendessen */}
        <div className="bg-terracotta-soft rounded-lg p-1.5 border border-terracotta/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px] font-mono font-bold text-terracotta">
            <span>19:00</span>
            <span className="material-symbols-outlined text-[11px]">dinner_dining</span>
          </div>
          <span className="font-bold text-[10.5px] text-ink truncate">
            Abendessen
          </span>
          <span className="text-[8.5px] text-terracotta font-medium truncate">
            Alle (Sophie deckt)
          </span>
        </div>
      </div>

      {/* Liebevoll arrangierter Notizzettel (Post-It mit Washi Tape) */}
      <div className="relative mt-1 cursor-pointer" onClick={handleNextNote} title="Klicken für nächste Notiz oder neue Notiz">
        <div className="postit-note rounded-xl p-2.5 pt-3.5 relative rotate-[-0.8deg] border-t border-amber-200 transition-transform hover:rotate-0 duration-200">
          {/* Washi Tape Effect across top */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-4 washi-tape-amber rounded-xs rotate-1 pointer-events-none z-10"></div>

          <div className="flex items-center justify-between text-[#856315] border-b border-amber-200/80 pb-1">
            <span className="text-[9.5px] font-mono font-bold tracking-wider uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-terracotta">push_pin</span>
              {currentNote.author}'s Atelier-Memo
            </span>
            <span className="text-[9px] font-mono opacity-75">
              {currentNote.timeAgo}
            </span>
          </div>

          <p className="font-hand font-semibold text-[19px] text-[#4d3708] leading-tight mt-1.5 line-clamp-3">
            {currentNote.text}
          </p>

          <div className="mt-1 flex items-center justify-between pt-1 border-t border-amber-200/60 text-[#7a5e18]">
            <span className="font-hand text-[15px] font-bold">
              — {currentNote.author} ♡
            </span>
            <span className="text-[9.5px] font-mono bg-amber-200/60 px-1.5 py-0.2 rounded border border-amber-300/60">
              Gelesen ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
