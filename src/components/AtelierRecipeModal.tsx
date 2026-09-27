import React, { useState, useEffect } from 'react';
import { SingleMeal } from '../types';
import { PRESET_DISH_TEMPLATES } from '../utils/defaults';
import { autoFindFoodImage, getNextFoodImage } from '../utils/foodImageFinder';
import { splitIngredientText } from '../utils/ingredients';
import { sounds } from '../utils/audio';

interface AtelierRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayLabel?: string;
  currentMeal?: SingleMeal | null;
  onSelectMeal: (meal: SingleMeal) => void;
  onAddIngredientsToShopping: (ingredients: string[]) => number | void;
}

export const AtelierRecipeModal: React.FC<AtelierRecipeModalProps> = ({
  isOpen,
  onClose,
  dayLabel,
  currentMeal,
  onSelectMeal,
  onAddIngredientsToShopping
}) => {
  const [selectedTab, setSelectedTab] = useState<'details' | 'edit' | 'presets'>('details');

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Hauptgericht');
  const [editCookTime, setEditCookTime] = useState('25 Min');
  const [editImage, setEditImage] = useState('');
  const [editIngredientsText, setEditIngredientsText] = useState('');
  const [isSearchingImg, setIsSearchingImg] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditTitle(currentMeal?.title || '');
      setEditCategory(currentMeal?.category || 'Hauptgericht');
      setEditCookTime(currentMeal?.cookTime || '25 Min');
      setEditImage(currentMeal?.image || '');
      setEditIngredientsText(
        currentMeal?.ingredients && currentMeal.ingredients.length > 0
          ? currentMeal.ingredients.join('\n')
          : ''
      );
      setSelectedTab('details');
      setSavedFeedback(false);
    }
  }, [isOpen, currentMeal]);

  if (!isOpen) return null;

  const currentIngredients = currentMeal?.ingredients || [];

  const handleAddIngredients = () => {
    sounds.playTick();
    const added = onAddIngredientsToShopping(currentIngredients);
    alert(added === 0 ? 'Alle Zutaten stehen bereits auf der Einkaufsliste.' : 'Zutaten wurden zur Einkaufsliste hinzugefügt! ✨');
  };

  const handleCycleImage = async () => {
    const term = editTitle.trim();
    if (!term) return;
    setIsSearchingImg(true);
    sounds.playTick();
    try {
      const nextImg = await getNextFoodImage(term, editImage);
      setEditImage(nextImg);
    } catch {
      // ignore
    } finally {
      setIsSearchingImg(false);
    }
  };

  const handleSaveCustomMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    sounds.playTick();
    let finalImg = editImage;
    if (!finalImg) {
      finalImg = await autoFindFoodImage(editTitle);
    }

    const parsedIngredients = splitIngredientText(editIngredientsText || '');

    const updated: SingleMeal = {
      title: editTitle.trim(),
      category: editCategory.trim() || 'Hauptgericht',
      cookTime: editCookTime.trim() || '25 Min',
      image: finalImg || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      ingredients: parsedIngredients
    };

    onSelectMeal(updated);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#fcfaf6] rounded-[24px] border border-white/80 shadow-2xl p-5 md:p-6 max-w-lg w-full max-h-[90vh] flex flex-col relative text-[var(--ink)]">
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-parchment-200 hover:bg-parchment-300 text-ink flex items-center justify-center absolute top-4 right-4 text-[14px] font-bold transition-all active:scale-95 cursor-pointer"
          title="Schließen"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-3.5 pr-8">
          <div className="w-9 h-9 rounded-xl bg-terracotta-soft text-terracotta flex items-center justify-center font-serif font-bold text-lg shadow-2xs">
            🍳
          </div>
          <div>
            <h4 className="font-serif font-bold text-lg md:text-xl text-ink leading-tight">
              {dayLabel ? `Menü für ${dayLabel}` : 'Heutiges Küchenmenü'}
            </h4>
            <p className="text-[11.5px] text-[#786b5f]">
              Rezept ansehen, direkt auf dem iPad bearbeiten oder tauschen
            </p>
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="flex rounded-xl bg-parchment-200/90 p-1 mb-3.5 shrink-0 text-xs font-bold shadow-2xs">
          <button
            type="button"
            onClick={() => setSelectedTab('details')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedTab === 'details' ? 'bg-white text-terracotta shadow-xs' : 'text-[#6e6155] hover:text-ink'
            }`}
          >
            Aktuelles Rezept
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('edit')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              selectedTab === 'edit' ? 'bg-white text-terracotta shadow-xs' : 'text-[#6e6155] hover:text-ink'
            }`}
          >
            <span>✏️ Gericht bearbeiten</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('presets')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedTab === 'presets' ? 'bg-white text-terracotta shadow-xs' : 'text-[#6e6155] hover:text-ink'
            }`}
          >
            Vorlagen
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 scrollbar-thin pr-1 space-y-3">
          {/* TAB 1: DETAILS */}
          {selectedTab === 'details' && (
            <div className="space-y-3.5">
              <div className="bg-white p-3.5 rounded-2xl border border-parchment-300 flex items-center gap-3.5 shadow-xs">
                {currentMeal?.image && (
                  <img
                    src={currentMeal.image}
                    alt={currentMeal?.title || 'Gericht'}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-black/5"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h5 className="font-serif font-bold text-lg text-ink truncate">
                    {currentMeal?.title || 'Pasta al Forno'}
                  </h5>
                  <span className="text-xs text-terracotta font-semibold block mt-0.5">
                    {currentMeal?.category || 'Hauptgericht'} · {currentMeal?.cookTime || '25 Min.'}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold uppercase text-[#786b5f]">
                    Zutaten ({currentIngredients.length})
                  </span>
                  {currentIngredients.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddIngredients}
                      className="text-xs text-terracotta font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>+ Alle auf Einkaufsliste</span>
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-parchment-300 divide-y divide-parchment-200 overflow-hidden shadow-xs">
                  {currentIngredients.length === 0 && (
                    <div className="px-3.5 py-2.5 text-xs text-[#786b5f]">Noch keine Zutaten eingetragen.</div>
                  )}
                  {currentIngredients.map((ing, i) => (
                    <div key={i} className="px-3.5 py-2 text-xs text-ink flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                      <span>{ing}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTab('edit')}
                className="w-full py-2.5 bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-xs font-bold text-ink rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>✏️ Name, Bild oder Zutaten anpassen</span>
              </button>
            </div>
          )}

          {/* TAB 2: DIRECT EDIT ON IPAD */}
          {selectedTab === 'edit' && (
            <form onSubmit={handleSaveCustomMeal} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  Name des Gerichts *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="z.B. Linseneintopf mit Würstchen"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-parchment-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-terracotta font-serif font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">
                    Kategorie
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="z.B. Pasta, Suppe, Salat"
                    className="w-full px-3 py-2 text-xs bg-white border border-parchment-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-terracotta text-ink"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">
                    Zubereitungszeit
                  </label>
                  <input
                    type="text"
                    value={editCookTime}
                    onChange={(e) => setEditCookTime(e.target.value)}
                    placeholder="z.B. 25 Min"
                    className="w-full px-3 py-2 text-xs bg-white border border-parchment-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-terracotta text-ink"
                  />
                </div>
              </div>

              {/* Photo preview & switcher */}
              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  Food-Foto
                </label>
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-parchment-300">
                  <img
                    src={editImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                    alt="Vorschau"
                    className="w-14 h-14 rounded-lg object-cover border border-black/5 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={handleCycleImage}
                      disabled={isSearchingImg}
                      className="text-xs px-3 py-1.5 bg-terracotta-soft text-terracotta hover:bg-terracotta hover:text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🔄 {isSearchingImg ? 'Sucht Bild…' : 'Passendes Bild wechseln'}</span>
                    </button>
                    <span className="text-[10px] text-[#786b5f] block mt-1">
                      Wählt automatisch tolle Fotos passend zum Namen
                    </span>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  Zutaten (zeilenweise oder mit Komma getrennt)
                </label>
                <textarea
                  rows={4}
                  value={editIngredientsText}
                  onChange={(e) => setEditIngredientsText(e.target.value)}
                  placeholder="250g Spaghetti&#10;1 Knoblauchzehe&#10;Olivenöl&#10;Chili"
                  className="w-full px-3 py-2 text-xs bg-white border border-parchment-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-terracotta text-ink font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-terracotta hover:bg-terracotta-dark active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span>✓ Gericht speichern</span>
                </button>
              </div>

              {savedFeedback && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center">
                  Gericht erfolgreich aktualisiert! ✨
                </div>
              )}
            </form>
          )}

          {/* TAB 3: PRESETS */}
          {selectedTab === 'presets' && (
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-[#786b5f] block mb-1">
                Köstliche Rezept-Vorlagen (Klick übernimmt Gericht)
              </span>
              {PRESET_DISH_TEMPLATES.map((dish, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    sounds.playTick();
                    onSelectMeal({
                      title: dish.title,
                      category: dish.category,
                      cookTime: dish.cookTime,
                      calories: dish.calories,
                      image: dish.image,
                      ingredients: dish.ingredients
                    });
                    onClose();
                  }}
                  className="bg-white hover:bg-parchment-50 p-2.5 rounded-xl border border-parchment-300 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={dish.image} 
                      alt={dish.title}
                      className="w-12 h-12 rounded-lg object-cover border border-parchment-200 shrink-0" 
                    />
                    <div className="min-w-0">
                      <span className="font-editorial font-medium text-sm text-ink block group-hover:text-terracotta transition-colors truncate">
                        {dish.title}
                      </span>
                      <span className="text-[11px] font-mono text-[#8b7c6d]">
                        {dish.category} · {dish.cookTime}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-terracotta shrink-0 pl-2">
                    Wählen →
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-parchment-200 flex items-center justify-between mt-2 shrink-0">
          <span className="text-[11px] text-[#786b5f]">
            {selectedTab === 'edit' ? 'Tipp: Änderungen synchronisieren sofort live' : 'iPad Touchscreen-Menü'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold bg-parchment-200 hover:bg-parchment-300 text-ink rounded-lg transition-colors cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
