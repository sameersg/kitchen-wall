import React, { useState } from 'react';
import { ShoppingItem, ShoppingCategory } from '../types';
import { sounds } from '../utils/audio';

interface AtelierPantryListProps {
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onAdd: (name: string, amount: string, category: ShoppingCategory) => void;
  onRemove?: (id: string) => void;
  storeName?: string;
}

export const AtelierPantryList: React.FC<AtelierPantryListProps> = ({
  items = [],
  onToggle,
  onAdd,
  onRemove,
  storeName = 'REWE City Markt'
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ShoppingCategory>('kuehlregal');

  // Fallback initial items if list is empty
  const displayItems = items.length > 0 ? items : [
    { id: '1', name: 'Hafermilch Barista', amount: 'Kühlregal · 2x Pack', category: 'kuehlregal' as ShoppingCategory, checked: false, createdAt: Date.now() },
    { id: '2', name: 'Bio-Eier (Freiland)', amount: '10er Karton', category: 'kuehlregal' as ShoppingCategory, checked: false, createdAt: Date.now() },
    { id: '3', name: 'Feta & Zucchini', amount: 'Erledigt ✓', category: 'kuehlregal' as ShoppingCategory, checked: true, createdAt: Date.now() },
    { id: '4', name: 'Basilikum Topf', amount: 'Gartenkräuter', category: 'gemuese' as ShoppingCategory, checked: false, createdAt: Date.now() },
    { id: '5', name: 'Sauerteigkruste', amount: 'Holzofen-Bäcker', category: 'baeckerei' as ShoppingCategory, checked: false, createdAt: Date.now() },
    { id: '6', name: 'Olivenöl Nativ', amount: 'Erledigt ✓', category: 'vorrat' as ShoppingCategory, checked: true, createdAt: Date.now() },
  ];

  const openCount = displayItems.filter(i => !i.checked).length;

  // Split items into 2 columns
  const col1Items: ShoppingItem[] = [];
  const col2Items: ShoppingItem[] = [];

  displayItems.forEach((item, idx) => {
    // If category is refrigerated or vegetables, prefer col 1, else col 2, or balance
    if (item.category === 'kuehlregal' || item.category === 'gemuese') {
      if (col1Items.length <= col2Items.length + 1) {
        col1Items.push(item);
      } else {
        col2Items.push(item);
      }
    } else {
      if (col2Items.length <= col1Items.length + 1) {
        col2Items.push(item);
      } else {
        col1Items.push(item);
      }
    }
  });

  const handleToggle = (id: string) => {
    sounds.playTick();
    onToggle(id);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    sounds.playTick();
    onAdd(newItemName.trim(), newItemAmount.trim(), newItemCategory);
    setNewItemName('');
    setNewItemAmount('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white/95 rounded-2xl p-3 border border-parchment-300 shadow-folio flex flex-col justify-between flex-1 min-h-0 relative">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-parchment-300 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[17px] text-ochre">local_mall</span>
          <div>
            <h3 className="font-serif font-bold text-[13.5px] text-ink leading-none">
              Smarte Speisekammer &amp; Marktgang
            </h3>
            <span className="text-[9.5px] font-editorial italic text-[#7f7164]">
              Zweispaltige Atelier-Wunschliste
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9.5px] font-mono font-bold text-terracotta bg-terracotta-soft px-2 py-0.5 rounded-full">
            {openCount} offen
          </span>
          <button 
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="text-[11px] text-terracotta font-semibold hover:underline flex items-center gap-0.5 cursor-pointer ml-1"
          >
            {isAdding ? 'Abbrechen' : '+ Zutat'}
          </button>
        </div>
      </div>

      {/* Inline Add Form */}
      {isAdding && (
        <form onSubmit={handleQuickSubmit} className="my-1.5 p-2 bg-parchment-100 rounded-xl border border-parchment-300 flex items-center gap-2">
          <input
            type="text"
            placeholder="Neue Zutat / Artikel..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 bg-white px-2.5 py-1 text-xs rounded-lg border border-parchment-300 focus:outline-none focus:ring-1 focus:ring-terracotta font-sans"
            autoFocus
          />
          <input
            type="text"
            placeholder="Menge (z.B. 2x)"
            value={newItemAmount}
            onChange={(e) => setNewItemAmount(e.target.value)}
            className="w-24 bg-white px-2 py-1 text-xs rounded-lg border border-parchment-300 focus:outline-none focus:ring-1 focus:ring-terracotta font-sans"
          />
          <button
            type="submit"
            className="bg-terracotta text-white px-3 py-1 text-xs font-semibold rounded-lg hover:bg-terracotta-dark transition-colors"
          >
            Hinzufügen
          </button>
        </form>
      )}

      {/* 2-Spaltige handwerkliche Einkaufsliste mit Checkpoints */}
      <div className="grid grid-cols-2 gap-2 my-1.5 overflow-y-auto flex-1 scrollbar-thin">
        {/* Column 1: Frische & Kühlung */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#8b7d70] font-bold pb-0.5 border-b border-dashed border-parchment-300">
            Frisch &amp; Kühlregal
          </span>
          {col1Items.map((item) => (
            <label 
              key={item.id}
              className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all cursor-pointer ${
                item.checked 
                  ? 'bg-parchment-100/60 border-parchment-200 opacity-50' 
                  : 'bg-parchment-50 hover:bg-parchment-100 border-parchment-200'
              }`}
            >
              <input 
                type="checkbox"
                checked={item.checked}
                onChange={() => handleToggle(item.id)}
                className="w-3.5 h-3.5 rounded text-terracotta focus:ring-terracotta accent-terracotta cursor-pointer"
              />
              <div className="leading-tight truncate">
                <span className={`item-text font-editorial font-medium text-[13.5px] text-ink block truncate ${item.checked ? 'line-through' : ''}`}>
                  {item.name}
                </span>
                <span className={`text-[8.5px] font-mono ${item.checked ? 'text-emerald-800' : 'text-[#8b7c6d]'}`}>
                  {item.checked ? 'Erledigt ✓' : (item.amount || 'Kühlregal / Markt')}
                </span>
              </div>
            </label>
          ))}
        </div>

        {/* Column 2: Markt & Bäckerei */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#8b7d70] font-bold pb-0.5 border-b border-dashed border-parchment-300">
            Kräuter &amp; Handwerk
          </span>
          {col2Items.map((item) => (
            <label 
              key={item.id}
              className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all cursor-pointer ${
                item.checked 
                  ? 'bg-parchment-100/60 border-parchment-200 opacity-50' 
                  : 'bg-parchment-50 hover:bg-parchment-100 border-parchment-200'
              }`}
            >
              <input 
                type="checkbox"
                checked={item.checked}
                onChange={() => handleToggle(item.id)}
                className="w-3.5 h-3.5 rounded text-terracotta focus:ring-terracotta accent-terracotta cursor-pointer"
              />
              <div className="leading-tight truncate">
                <span className={`item-text font-editorial font-medium text-[13.5px] text-ink block truncate ${item.checked ? 'line-through' : ''}`}>
                  {item.name}
                </span>
                <span className={`text-[8.5px] font-mono ${item.checked ? 'text-emerald-800' : 'text-[#8b7c6d]'}`}>
                  {item.checked ? 'Erledigt ✓' : (item.amount || 'Holzofen-Bäcker / Markt')}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Sync Footnote */}
      <div className="pt-1.5 border-t border-parchment-200 flex items-center justify-between text-[9.5px] font-mono text-[#827468] shrink-0">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          Live mit Smartphone synchron
        </span>
        <span>{storeName}</span>
      </div>
    </div>
  );
};
