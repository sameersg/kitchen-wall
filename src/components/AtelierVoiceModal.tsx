import React, { useState } from 'react';
import { ShoppingCategory } from '../types';
import { sounds } from '../utils/audio';

interface AtelierVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShoppingItem: (name: string, amount: string, category: ShoppingCategory) => void;
  onAddNote: (text: string, author?: string) => void;
}

export const AtelierVoiceModal: React.FC<AtelierVoiceModalProps> = ({
  isOpen,
  onClose,
  onAddShoppingItem,
  onAddNote
}) => {
  const [inputText, setInputText] = useState('');
  const [targetType, setTargetType] = useState<'shopping' | 'note'>('shopping');
  const [isListening, setIsListening] = useState(false);
  const [authorName, setAuthorName] = useState('Papa');

  if (!isOpen) return null;

  const handleVoiceListen = () => {
    // Check Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Spracherkennung wird in diesem Browser nicht unterstützt. Bitte Tastatur verwenden.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'de-DE';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sounds.playTick();
    if (targetType === 'shopping') {
      onAddShoppingItem(inputText.trim(), '', 'sonstiges');
    } else {
      onAddNote(inputText.trim(), authorName);
    }

    setInputText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#fcfaf6] rounded-2xl border border-white shadow-2xl p-5 max-w-sm w-full relative">
        <button 
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-parchment-200 hover:bg-parchment-300 text-ink flex items-center justify-center absolute top-3 right-3 text-[14px] font-bold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-terracotta-soft text-terracotta flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">mic</span>
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-ink">Schnellnotiz &amp; Diktat</h4>
            <p className="text-[11px] text-[#786b5f]">Per Sprache oder Tastatur hinzufügen</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex rounded-xl bg-parchment-200 p-1 mb-3">
          <button
            type="button"
            onClick={() => setTargetType('shopping')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              targetType === 'shopping' ? 'bg-white text-terracotta shadow-xs' : 'text-[#6e6155]'
            }`}
          >
            Einkaufsliste
          </button>
          <button
            type="button"
            onClick={() => setTargetType('note')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              targetType === 'note' ? 'bg-white text-terracotta shadow-xs' : 'text-[#6e6155]'
            }`}
          >
            Pinnwand-Memo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={targetType === 'shopping' ? 'Zutat eintragen (z.B. Hafermilch)...' : 'Nachricht an die Familie...'}
              className="w-full bg-white px-3 py-2 pr-10 text-sm rounded-xl border border-parchment-300 focus:outline-none focus:ring-1 focus:ring-terracotta"
              autoFocus
            />
            <button
              type="button"
              onClick={handleVoiceListen}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-parchment-100 text-terracotta hover:bg-parchment-200'
              }`}
              title="Mikrofon starten"
            >
              <span className="material-symbols-outlined text-[16px]">mic</span>
            </button>
          </div>

          {targetType === 'note' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#786b5f]">Absender:</span>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Name"
                className="w-24 bg-white px-2 py-1 text-xs rounded-lg border border-parchment-300 focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#786b5f] hover:bg-parchment-200 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors shadow-xs"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
