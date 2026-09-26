import React, { useState } from 'react';
import { StickyNote, Plus, Trash2, Send, User, Heart } from 'lucide-react';
import { KitchenNote, NoteColor } from '../types';
import { sounds } from '../utils/audio';

interface NotesBoardWidgetProps {
  notes: KitchenNote[];
  onAddNote: (text: string, author: string, color: NoteColor) => void;
  onRemoveNote: (id: string) => void;
}

const COLOR_MAP: Record<NoteColor, { bg: string; border: string; text: string; pin: string }> = {
  yellow: { bg: 'bg-[#fefce8]', border: 'border-[#fde047]', text: 'text-[#854d0e]', pin: 'bg-[#eab308]' },
  rose: { bg: 'bg-[#fff1f2]', border: 'border-[#fecdd3]', text: 'text-[#9f1239]', pin: 'bg-[#f43f5e]' },
  emerald: { bg: 'bg-[#f0fdf4]', border: 'border-[#bbf7d0]', text: 'text-[#166534]', pin: 'bg-[#22c55e]' },
  blue: { bg: 'bg-[#f0f9ff]', border: 'border-[#bae6fd]', text: 'text-[#075985]', pin: 'bg-[#38bdf8]' },
  purple: { bg: 'bg-[#faf5ff]', border: 'border-[#e9d5ff]', text: 'text-[#6b21a8]', pin: 'bg-[#c084fc]' },
  amber: { bg: 'bg-[#fffbeb]', border: 'border-[#fde68a]', text: 'text-[#92400e]', pin: 'bg-[#f59e0b]' }
};

export const NotesBoardWidget: React.FC<NotesBoardWidgetProps> = ({
  notes,
  onAddNote,
  onRemoveNote
}) => {
  const [isComposing, setIsComposing] = useState(false);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [color, setColor] = useState<NoteColor>('yellow');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sounds.playTick();
    onAddNote(text, author, color);
    setText('');
    setIsComposing(false);
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 60000);
    if (diff < 1) return 'Gerade eben';
    if (diff < 60) return `vor ${diff} Min`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `vor ${hours} Std`;
    return 'Gestern';
  };

  return (
    <div className="bg-white rounded-[28px] border border-[#ece7de] shadow-clean p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ece7de]">
        <div className="flex items-center space-x-2">
          <StickyNote className="w-4 h-4 text-[#e06236]" />
          <h2 className="font-semibold text-sm tracking-tight text-[#221e1a]">Familien-Pinnwand</h2>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#fef2eb] text-[#e06236] font-medium border border-[#fbdcd0]">
            {notes.length} Zettel
          </span>
        </div>
        <button
          onClick={() => setIsComposing(!isComposing)}
          className="text-xs flex items-center space-x-1 px-3 py-1 rounded-xl bg-[#f4efe8] hover:bg-[#ece7de] text-[#221e1a] border border-[#ece7de] font-medium transition"
        >
          <Plus className="w-3.5 h-3.5 text-[#e06236]" />
          <span>Zettel +</span>
        </button>
      </div>

      {/* Compose Form */}
      {isComposing && (
        <form onSubmit={handleAdd} className="my-3 p-3.5 rounded-2xl bg-[#faf8f4] border border-[#ece7de] space-y-2.5">
          <textarea
            placeholder="Kleine Nachricht für die Küche an der Wand..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full bg-white text-xs text-[#221e1a] p-3 rounded-xl border border-[#ece7de] focus:outline-none focus:border-[#e06236] resize-none"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {(['yellow', 'rose', 'emerald', 'blue', 'purple'] as NoteColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border transition-transform ${COLOR_MAP[c].pin} ${
                    color === c ? 'scale-125 ring-2 ring-stone-800' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Von wem?"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-24 bg-white text-[11px] text-[#221e1a] px-2.5 py-1.5 rounded-xl border border-[#ece7de] text-center"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#e06236] hover:bg-[#c2410c] text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                Anpinnen
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-56 pr-1 scrollbar-thin my-2">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[#786f65] text-xs space-y-1">
            <StickyNote className="w-8 h-8 opacity-30 text-[#e06236] mb-1" />
            <span>Pinnwand ist leer</span>
            <span className="text-[10px] text-[#786f65]/70">Schreibe eine liebe Botschaft ✨</span>
          </div>
        ) : (
          notes.map((note) => {
            const style = COLOR_MAP[note.color] || COLOR_MAP.yellow;
            return (
              <div
                key={note.id}
                className={`relative p-3.5 rounded-2xl border shadow-sm transition-all group ${style.bg} ${style.border}`}
              >
                <div className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ${style.pin} shadow-sm`} />

                <p className={`text-xs leading-relaxed ${style.text} pr-4 whitespace-pre-line font-medium`}>
                  {note.text}
                </p>

                <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-[#786f65]">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-[#786f65]" />
                    <span className="font-semibold">{note.author || 'Küche'}</span>
                    <span>• {formatRelativeTime(note.createdAt)}</span>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playTick();
                      onRemoveNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[#786f65] hover:text-[#c2410c] p-0.5 transition"
                    title="Notiz entfernen"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-[#ece7de] text-[11px] text-[#786f65] flex items-center justify-between">
        <span>Tipp: Notizen können auch direkt vom iPhone geschickt werden</span>
      </div>
    </div>
  );
};
