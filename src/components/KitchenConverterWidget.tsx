import React, { useState } from 'react';
import { Scale, Flame, Calculator, Sparkles, ArrowRightLeft } from 'lucide-react';

type ConverterTab = 'baking' | 'oven' | 'portions';

const INGREDIENTS: Record<string, { label: string; gramsPerCup: number }> = {
  flour: { label: 'Weizenmehl (Type 405/550)', gramsPerCup: 120 },
  sugar: { label: 'Kristallzucker', gramsPerCup: 200 },
  powderedSugar: { label: 'Puderzucker', gramsPerCup: 125 },
  brownSugar: { label: 'Brauner Rohrzucker', gramsPerCup: 220 },
  butter: { label: 'Butter / Margarine', gramsPerCup: 225 },
  oats: { label: 'Zarte Haferflocken', gramsPerCup: 90 },
  liquid: { label: 'Milch / Sahne / Wasser (ml)', gramsPerCup: 240 }
};

export const KitchenConverterWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConverterTab>('baking');

  // Baking state
  const [selectedIngredient, setSelectedIngredient] = useState('flour');
  const [cupsValue, setCupsValue] = useState('1');

  // Oven state
  const [fahrenheit, setFahrenheit] = useState('350');
  const [oberUnter, setOberUnter] = useState('180');

  // Portions state
  const [origPersons, setOrigPersons] = useState('4');
  const [targetPersons, setTargetPersons] = useState('6');
  const [sampleAmount, setSampleAmount] = useState('250');

  // Calculations
  const calculatedGrams = () => {
    const numCups = parseFloat(cupsValue) || 0;
    const factor = INGREDIENTS[selectedIngredient]?.gramsPerCup || 120;
    return Math.round(numCups * factor);
  };

  const calcCelsius = () => {
    const f = parseFloat(fahrenheit) || 0;
    return Math.round(((f - 32) * 5) / 9);
  };

  const calcUmluft = () => {
    const ou = parseFloat(oberUnter) || 0;
    return Math.max(0, ou - 20);
  };

  const portionFactor = () => {
    const orig = parseFloat(origPersons) || 1;
    const target = parseFloat(targetPersons) || 1;
    return (target / orig);
  };

  const calcScaledAmount = () => {
    const amt = parseFloat(sampleAmount) || 0;
    const factor = portionFactor();
    const result = amt * factor;
    return Number.isInteger(result) ? result : result.toFixed(1);
  };

  return (
    <div className="bg-white rounded-[28px] border border-[#ece7de] shadow-clean p-5 flex flex-col justify-between h-full">
      {/* Header & Tabs */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#ece7de]">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-[#e06236]" />
            <h2 className="font-semibold text-sm tracking-tight text-[#221e1a]">Back- & Koch-Umrechner</h2>
          </div>
          <div className="flex items-center space-x-1 bg-[#faf8f4] p-1 rounded-2xl border border-[#ece7de]">
            <button
              onClick={() => setActiveTab('baking')}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition ${
                activeTab === 'baking'
                  ? 'bg-white text-[#221e1a] shadow-sm'
                  : 'text-[#786f65] hover:text-[#221e1a]'
              }`}
            >
              Cups (Backen)
            </button>
            <button
              onClick={() => setActiveTab('oven')}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition ${
                activeTab === 'oven'
                  ? 'bg-white text-[#221e1a] shadow-sm'
                  : 'text-[#786f65] hover:text-[#221e1a]'
              }`}
            >
              Ofen
            </button>
            <button
              onClick={() => setActiveTab('portions')}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition ${
                activeTab === 'portions'
                  ? 'bg-white text-[#221e1a] shadow-sm'
                  : 'text-[#786f65] hover:text-[#221e1a]'
              }`}
            >
              Portionen
            </button>
          </div>
        </div>

        {/* Tab 1: Baking / Cups to Grams */}
        {activeTab === 'baking' && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#786f65] block mb-1">Zutat wählen</label>
                <select
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  className="w-full bg-[#faf8f4] text-xs text-[#221e1a] p-2.5 rounded-xl border border-[#ece7de] focus:outline-none focus:border-[#e06236]"
                >
                  {Object.entries(INGREDIENTS).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#786f65] block mb-1">US Cups</label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={cupsValue}
                    onChange={(e) => setCupsValue(e.target.value)}
                    className="w-full bg-[#faf8f4] text-xs font-bold text-[#221e1a] p-2.5 rounded-xl border border-[#ece7de] text-center focus:outline-none focus:border-[#e06236]"
                  />
                  <span className="text-xs text-[#786f65] font-medium">Cup</span>
                </div>
              </div>
            </div>

            {/* Result Box */}
            <div className="p-3.5 rounded-2xl bg-[#fef2eb] border border-[#fbdcd0] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#e06236] tracking-wider">Ergebnis in Gramm</span>
                <div className="text-2xl font-bold text-[#221e1a] font-mono mt-0.5">
                  {calculatedGrams()} <span className="text-sm font-normal text-[#e06236]">g</span>
                </div>
              </div>
              <div className="text-right text-[11px] text-[#786f65] space-y-0.5 font-medium">
                <div>1 EL = 15 ml / 15 g</div>
                <div>1 TL = 5 ml / 5 g</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Oven temperatures */}
        {activeTab === 'oven' && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-[#ece7de] space-y-1.5">
                <div className="flex items-center space-x-1 text-xs text-[#d97706] font-medium">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Fahrenheit in Celsius</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={fahrenheit}
                    onChange={(e) => setFahrenheit(e.target.value)}
                    className="w-20 bg-white text-xs font-bold text-[#221e1a] p-2 rounded-xl border border-[#ece7de] text-center"
                  />
                  <span className="text-xs text-[#786f65]">°F =</span>
                  <span className="text-base font-bold text-[#221e1a] font-mono">{calcCelsius()} °C</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-[#ece7de] space-y-1.5">
                <div className="flex items-center space-x-1 text-xs text-[#e06236] font-medium">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Ober-/Unterhitze in Umluft</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={oberUnter}
                    onChange={(e) => setOberUnter(e.target.value)}
                    className="w-20 bg-white text-xs font-bold text-[#221e1a] p-2 rounded-xl border border-[#ece7de] text-center"
                  />
                  <span className="text-xs text-[#786f65]">°C =</span>
                  <span className="text-base font-bold text-[#221e1a] font-mono">{calcUmluft()} °C</span>
                </div>
              </div>
            </div>

            {/* Quick Guide */}
            <div className="grid grid-cols-4 gap-1 text-center text-[10px] text-[#786f65] pt-1">
              <div className="bg-[#faf8f4] border border-[#ece7de] p-1 rounded-lg">300°F ≈ 150°C</div>
              <div className="bg-[#faf8f4] border border-[#ece7de] p-1 rounded-lg">350°F ≈ 175°C</div>
              <div className="bg-[#faf8f4] border border-[#ece7de] p-1 rounded-lg">400°F ≈ 200°C</div>
              <div className="bg-[#faf8f4] border border-[#ece7de] p-1 rounded-lg">450°F ≈ 230°C</div>
            </div>
          </div>
        )}

        {/* Tab 3: Portion scaler */}
        {activeTab === 'portions' && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-[#786f65] block mb-1">Rezept für</label>
                <input
                  type="number"
                  min="1"
                  value={origPersons}
                  onChange={(e) => setOrigPersons(e.target.value)}
                  className="w-full bg-[#faf8f4] text-xs text-[#221e1a] p-2.5 rounded-xl border border-[#ece7de] text-center font-bold"
                />
              </div>
              <div className="flex items-center justify-center pt-4 text-[#e06236]">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div>
                <label className="text-[10px] text-[#786f65] block mb-1">Gewünscht für</label>
                <input
                  type="number"
                  min="1"
                  value={targetPersons}
                  onChange={(e) => setTargetPersons(e.target.value)}
                  className="w-full bg-[#faf8f4] text-xs text-[#221e1a] p-2.5 rounded-xl border border-[#ece7de] text-center font-bold text-[#e06236]"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-[#ece7de] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-[#786f65]">Zutat im Rezept:</span>
                <input
                  type="number"
                  value={sampleAmount}
                  onChange={(e) => setSampleAmount(e.target.value)}
                  className="w-16 bg-white text-xs text-[#221e1a] p-1.5 rounded-xl border border-[#ece7de] text-center font-mono"
                />
                <span className="text-xs text-[#786f65]">g / ml</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#786f65] block">Neue Menge:</span>
                <span className="text-lg font-bold text-[#15803d] font-mono">
                  {calcScaledAmount()} <span className="text-xs font-normal">g / ml</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="pt-2.5 border-t border-[#ece7de] text-[10px] text-[#786f65]">
        Präzise Umrechnung nach Gewicht für perfekte Kuchen, Muffins & Desserts ✨
      </div>
    </div>
  );
};
