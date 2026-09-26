import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ShoppingItem, BringSettings } from '../../types';

interface QuadrantShoppingCardProps {
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onAdd: (name: string, amount?: string) => void;
  onClearDone?: () => void;
  bringSettings?: BringSettings;
  onSyncBring?: () => Promise<{ success: boolean; count?: number; error?: string } | undefined>;
  onOpenSettings?: () => void;
}

export const QuadrantShoppingCard: React.FC<QuadrantShoppingCardProps> = ({
  items,
  onToggle,
  onAdd,
  onClearDone,
  bringSettings,
  onSyncBring,
  onOpenSettings
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSync = async () => {
    if (!onSyncBring || isSyncing) return;
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await onSyncBring();
      if (res && res.success) {
        setSyncMessage(`✓ synchronisiert`);
        setTimeout(() => setSyncMessage(null), 3000);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const openCount = items.filter((i) => !i.checked).length;
  const openLabel = `${openCount} offen`;

  // Sort: open items first (by creation / order), completed items at the bottom
  const sortedItems = [...items].sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  // Distribute across 2 balanced columns
  const half = Math.ceil(sortedItems.length / 2);
  const col1 = sortedItems.slice(0, half);
  const col2 = sortedItems.slice(half);

  const addItem = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onAdd(trimmed, '');
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  const renderItem = (item: ShoppingItem) => {
    const isDone = item.checked;
    return (
      <div
        key={item.id}
        onClick={() => onToggle(item.id)}
        className="group flex items-center gap-2.5 p-[6px_8px] rounded-[12px] hover:bg-[var(--wash)] active:scale-[0.98] cursor-pointer transition-all min-w-0"
      >
        {/* Custom Square Checkbox */}
        <span
          className={`w-[18px] h-[18px] shrink-0 rounded-[5px] border-2 flex items-center justify-center transition-all ${
            isDone
              ? 'border-[var(--greenInk)] bg-[var(--greenInk)] text-white'
              : 'border-[var(--greenSoft)] bg-transparent group-hover:border-[var(--greenInk)]'
          }`}
        >
          {isDone && (
            <svg className="w-2.5 h-2.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>

        {/* Item Name */}
        <span
          className={`flex-1 min-w-0 text-[13.5px] md:text-[14px] font-[600] truncate transition-colors ${
            isDone
              ? 'text-[var(--greenSoft)] line-through'
              : 'text-[var(--ink)]'
          }`}
        >
          {item.name}
        </span>

        {/* Quantity if available */}
        {item.amount && (
          <span className="text-[11px] font-[600] text-[var(--greenSoft)] shrink-0 pl-1">
            {item.amount}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[var(--green)] rounded-[26px] p-[22px_24px_16px] md:p-[24px_26px_18px] flex flex-col gap-3 min-h-0 h-full w-full select-none shadow-xs border border-[var(--wash)]/40 transition-colors">
      {/* Header: Title & open count */}
      <div className="flex items-baseline justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-[20px] md:text-[22px] font-[800] text-[var(--greenInk)] tracking-tight">
            Einkauf
          </span>
          {bringSettings?.enabled && (
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              title={`Bring! (${bringSettings.listName || 'Standard'}) synchronisieren`}
              className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-[700] bg-white/70 hover:bg-white text-[var(--greenInk)] border border-[var(--wash)] transition cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Bring!</span>
              <RefreshCw className={`w-2.5 h-2.5 ml-0.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {syncMessage && (
            <span className="text-[11px] font-[700] text-emerald-800 animate-fade-in">
              {syncMessage}
            </span>
          )}
          <span className="text-[12px] font-[600] text-[var(--greenSoft)]">
            {openLabel}
          </span>
        </div>
      </div>

      {/* Clean 2-Column List without rigid categories */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden grid grid-cols-2 gap-x-4.5 content-start pr-1 scrollbar-none">
        {items.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center h-full py-12 text-[var(--greenSoft)] text-[14px] font-[600]">
            Alle Einkäufe erledigt! 🎉
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-0.5 min-w-0">
              {col1.map(renderItem)}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              {col2.map(renderItem)}
            </div>
          </>
        )}
      </div>

      {/* Bottom Bar: Input field & Erledigte entfernen */}
      <div className="flex items-center gap-2 shrink-0 pt-1">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Artikel hinzufügen …"
            className="w-full bg-[var(--wash)] border-none rounded-[14px] p-[10px_38px_10px_14px] text-[13.5px] font-[600] text-[var(--ink)] placeholder-[var(--faint)] outline-none focus:ring-1 focus:ring-[var(--greenInk)] transition-all"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={addItem}
              className="absolute right-2 w-6 h-6 rounded-full bg-[var(--greenInk)] text-white flex items-center justify-center font-bold text-sm shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Hinzufügen"
            >
              +
            </button>
          )}
        </div>
        {onClearDone && items.some((i) => i.checked) && (
          <button
            type="button"
            onClick={onClearDone}
            className="shrink-0 text-[11px] font-[700] text-[var(--greenSoft)] hover:text-[var(--ink)] active:scale-95 transition-all text-center leading-tight cursor-pointer px-1 py-1"
          >
            Erledigte<br />entfernen
          </button>
        )}
      </div>
    </div>
  );
};
