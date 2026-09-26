import React, { useState } from 'react';
import { 
  ShoppingCart, Check, Plus, Trash2, Smartphone, 
  Sparkles, CheckCircle2, ChevronDown
} from 'lucide-react';
import { ShoppingItem, ShoppingCategory } from '../types';
import { sounds } from '../utils/audio';

interface ShoppingListWidgetProps {
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (name: string, amount: string, category: ShoppingCategory) => void;
  onClearChecked: () => void;
  onOpenQrModal: () => void;
}

const CATEGORY_LABELS: Record<ShoppingCategory, { label: string; color: string }> = {
  gemuese: { label: 'Obst & Gemüse', color: 'text-[#15803d] bg-[#eef8f2] border-[#c2e7d0]' },
  kuehlregal: { label: 'Kühlregal', color: 'text-[#0284c7] bg-[#f0f9ff] border-[#bae6fd]' },
  vorrat: { label: 'Vorrat', color: 'text-[#b45309] bg-[#fef9ee] border-[#fde68a]' },
  getraenke: { label: 'Getränke', color: 'text-[#0369a1] bg-[#e0f2fe] border-[#bae6fd]' },
  baeckerei: { label: 'Bäckerei', color: 'text-[#c2410c] bg-[#fef2eb] border-[#fbdcd0]' },
  haushalt: { label: 'Haushalt', color: 'text-[#7e22ce] bg-[#faf5ff] border-[#e9d5ff]' },
  sonstiges: { label: 'Sonstiges', color: 'text-[#786f65] bg-[#f4efe8] border-[#ece7de]' }
};

export const ShoppingListWidget: React.FC<ShoppingListWidgetProps> = ({
  items,
  onToggle,
  onRemove,
  onAdd,
  onClearChecked,
  onOpenQrModal
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ShoppingCategory>('sonstiges');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    sounds.playTick();
    onAdd(name, amount, category);
    setName('');
    setAmount('');
  };

  const handleToggle = (id: string) => {
    sounds.playTick();
    onToggle(id);
  };

  const activeItems = items.filter((i) => !i.checked);
  const completedItems = items.filter((i) => i.checked);

  return (
    <div className="bg-white rounded-[28px] border border-[#ece7de] shadow-clean p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ece7de]">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-4 h-4 text-[#e06236]" />
          <h2 className="font-semibold text-sm tracking-tight text-[#221e1a]">Einkaufsliste</h2>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#fef2eb] text-[#e06236] font-medium border border-[#fbdcd0]">
            {activeItems.length} offen
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onOpenQrModal}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#fef2eb] hover:bg-[#fde5d7] border border-[#fbdcd0] text-[#e06236] text-xs font-medium transition active:scale-95"
            title="Auf iPhone öffnen"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">iPhone</span>
          </button>
          {completedItems.length > 0 && (
            <button
              onClick={onClearChecked}
              className="text-xs text-[#786f65] hover:text-[#c2410c] p-1 rounded-lg transition"
              title="Erledigte löschen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAdd} className="my-3 flex items-center space-x-2">
        <input
          type="text"
          placeholder="z.B. Hafermilch, Beeren..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-[#faf8f4] text-xs text-[#221e1a] px-3.5 py-2.5 rounded-xl border border-[#ece7de] focus:outline-none focus:border-[#e06236] placeholder:text-[#786f65]/60"
        />
        <input
          type="text"
          placeholder="Menge"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-16 bg-[#faf8f4] text-xs text-[#221e1a] px-2 py-2.5 rounded-xl border border-[#ece7de] focus:outline-none focus:border-[#e06236] placeholder:text-[#786f65]/60 text-center"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ShoppingCategory)}
          className="bg-[#faf8f4] text-xs text-[#221e1a] px-2.5 py-2.5 rounded-xl border border-[#ece7de] focus:outline-none focus:border-[#e06236]"
        >
          <option value="gemuese">Gemüse & Obst</option>
          <option value="kuehlregal">Kühlregal</option>
          <option value="vorrat">Vorrat</option>
          <option value="baeckerei">Bäckerei</option>
          <option value="getraenke">Getränke</option>
          <option value="haushalt">Haushalt</option>
          <option value="sonstiges">Sonstiges</option>
        </select>
        <button
          type="submit"
          disabled={!name.trim()}
          className="p-2.5 bg-[#e06236] hover:bg-[#c2410c] disabled:opacity-40 text-white font-bold rounded-xl transition shadow-sm active:scale-95"
          title="Hinzufügen"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-60 pr-1 scrollbar-thin">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[#786f65] text-xs space-y-1">
            <CheckCircle2 className="w-8 h-8 opacity-30 text-[#15803d] mb-1" />
            <span>Kühlschrank ist voll & glücklich! ✨</span>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer select-none ${
                item.checked
                  ? 'bg-stone-50 border-stone-200/50 opacity-40'
                  : 'bg-[#faf8f4] border-[#ece7de] hover:border-[#ded6ca]'
              }`}
            >
              <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                    item.checked
                      ? 'bg-[#15803d] border-[#15803d] text-white'
                      : 'border-stone-400 group-hover:border-[#e06236]'
                  }`}
                >
                  {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span
                  className={`text-xs font-medium truncate ${
                    item.checked ? 'line-through text-stone-400' : 'text-[#221e1a]'
                  }`}
                >
                  {item.name}
                </span>
                {item.amount && (
                  <span className="text-[10px] text-[#786f65] px-1.5 py-0.5 rounded bg-white font-mono border border-stone-200">
                    {item.amount}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${
                    CATEGORY_LABELS[item.category]?.color || CATEGORY_LABELS.sonstiges.color
                  }`}
                >
                  {CATEGORY_LABELS[item.category]?.label || 'Sonstiges'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playTick();
                    onRemove(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-[#786f65] hover:text-[#c2410c] p-1 transition"
                  title="Entfernen"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-[#ece7de] flex items-center justify-between text-[11px] text-[#786f65]">
        <span>{completedItems.length} erledigt</span>
        <button
          onClick={onOpenQrModal}
          className="text-[#e06236] hover:text-[#c2410c] font-medium flex items-center space-x-1"
        >
          <span>iPhone synchronisieren</span>
          <Smartphone className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
