import React, { useState, useRef } from 'react';
import { 
  Utensils, Clock, Flame, ShoppingBag, Edit3, 
  Check, Sparkles, X, Plus, Upload, RefreshCw, Trash2, Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MealItem, MealType, SingleMeal } from '../types';
import { PRESET_DISH_TEMPLATES } from '../utils/defaults';
import { autoFindFoodImage, getNextFoodImage, getFoodImageOptions, processUploadedImage } from '../utils/foodImageFinder';
import { splitIngredientText } from '../utils/ingredients';
import { sounds } from '../utils/audio';

interface MealPlanWidgetProps {
  mealPlan: MealItem[];
  onUpdateMeal?: (day: string, partial: Partial<MealItem>) => void;
  onUpdateMealSlot?: (day: string, mealType: MealType, slot: SingleMeal | null) => void;
  onAddIngredientsToShopping: (ingredients: string[]) => number | void;
}

export const MealPlanWidget: React.FC<MealPlanWidgetProps> = ({
  mealPlan,
  onUpdateMeal,
  onUpdateMealSlot,
  onAddIngredientsToShopping
}) => {
  const dayIndexToKey = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'];
  const todayKey = dayIndexToKey[new Date().getDay()];

  const [selectedDay, setSelectedDay] = useState<string>(todayKey);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('abendessen');
  const [isEditing, setIsEditing] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [isSearchingImage, setIsSearchingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeDay = mealPlan.find((m) => m.day === selectedDay) || mealPlan[0];
  const activeMeals = activeDay?.meals || {};
  const currentSlot: SingleMeal | null | undefined = activeMeals[selectedMealType];

  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCookTime, setEditCookTime] = useState('20 Min');
  const [editImage, setEditImage] = useState('');
  const [editIngredients, setEditIngredients] = useState('');
  const [imageAlternatives, setImageAlternatives] = useState<string[]>([]);

  const getMealTypeLabel = (type: MealType) => {
    switch (type) {
      case 'fruehstueck': return 'Frühstück';
      case 'mittagessen': return 'Mittagessen';
      case 'abendessen': return 'Abendessen';
    }
  };

  const handleOpenEdit = () => {
    sounds.playTick();
    if (currentSlot) {
      setEditTitle(currentSlot.title);
      setEditCategory(currentSlot.category);
      setEditCookTime(currentSlot.cookTime || '20 Min');
      setEditImage(currentSlot.image);
      setEditIngredients(currentSlot.ingredients ? currentSlot.ingredients.join(', ') : '');
      if (currentSlot.title) {
        getFoodImageOptions(currentSlot.title).then(setImageAlternatives).catch(() => {});
      }
    } else {
      setEditTitle('');
      setEditCategory(getMealTypeLabel(selectedMealType));
      setEditCookTime(selectedMealType === 'fruehstueck' ? '15 Min' : '25 Min');
      setEditImage('');
      setEditIngredients('');
      setImageAlternatives([]);
    }
    setIsEditing(true);
  };

  const handleCycleImage = async (titleToSearch?: string) => {
    const term = titleToSearch || editTitle;
    if (!term.trim()) return;
    setIsSearchingImage(true);
    sounds.playTick();
    try {
      const nextImage = await getNextFoodImage(term, editImage);
      setEditImage(nextImage);
      const options = await getFoodImageOptions(term);
      setImageAlternatives(options);
    } catch {
      // ignore
    } finally {
      setIsSearchingImage(false);
    }
  };

  const handleAutoSearch = handleCycleImage;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sounds.playTick();
    try {
      const dataUrl = await processUploadedImage(file);
      setEditImage(dataUrl);
    } catch (err) {
      console.error('File upload error:', err);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    sounds.playTick();
    const ings = splitIngredientText(editIngredients);

    const slotPayload: SingleMeal = {
      title: editTitle.trim(),
      category: editCategory.trim() || getMealTypeLabel(selectedMealType),
      cookTime: editCookTime.trim() || '20 Min',
      image: editImage.trim() || (currentSlot ? currentSlot.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'),
      ingredients: ings
    };

    if (onUpdateMealSlot) {
      onUpdateMealSlot(selectedDay, selectedMealType, slotPayload);
    } else if (onUpdateMeal) {
      onUpdateMeal(selectedDay, {
        meals: {
          ...(activeDay.meals || {}),
          [selectedMealType]: slotPayload
        }
      });
    }

    setIsEditing(false);
  };

  const handleRemoveSlot = () => {
    sounds.playTick();
    if (onUpdateMealSlot) {
      onUpdateMealSlot(selectedDay, selectedMealType, null);
    } else if (onUpdateMeal) {
      onUpdateMeal(selectedDay, {
        meals: {
          ...(activeDay.meals || {}),
          [selectedMealType]: null
        }
      });
    }
    setIsEditing(false);
  };

  const handleSelectTemplate = (template: typeof PRESET_DISH_TEMPLATES[0]) => {
    sounds.playTick();
    setEditTitle(template.title);
    setEditCategory(template.category);
    setEditCookTime(template.cookTime);
    setEditImage(template.image);
    setEditIngredients(template.ingredients.join(', '));
  };

  const handleTransferToShopping = () => {
    if (!currentSlot || !currentSlot.ingredients) return;
    sounds.playChime();
    onAddIngredientsToShopping(currentSlot.ingredients);
    setAddedNotice(true);
    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const getDayThumbnail = (dayItem: MealItem) => {
    const meals = dayItem.meals || {};
    if (meals[selectedMealType]?.image) return meals[selectedMealType]!.image;
    if (meals.abendessen?.image) return meals.abendessen.image;
    if (meals.mittagessen?.image) return meals.mittagessen.image;
    if (meals.fruehstueck?.image) return meals.fruehstueck.image;
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="bg-white rounded-[28px] border border-[#ece7de] shadow-clean p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#ece7de]">
        <div className="flex items-center space-x-2">
          <Utensils className="w-4 h-4 text-[#e06236]" />
          <h2 className="font-semibold text-sm tracking-tight text-[#221e1a]">Essensplan</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fef2eb] text-[#e06236] font-medium border border-[#fbdcd0]">
            Bis zu 3 Mahlzeiten
          </span>
        </div>

        {currentSlot && (
          <button
            onClick={handleOpenEdit}
            className="text-xs flex items-center space-x-1 px-3 py-1 rounded-xl bg-[#f4efe8] hover:bg-[#ece7de] text-[#221e1a] border border-[#ece7de] font-medium transition active:scale-95"
            title="Gericht anpassen"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#e06236]" />
            <span>Ändern</span>
          </button>
        )}
      </div>

      {/* 3 Meals Selector Subtabs: Frühstück / Mittagessen / Abendessen */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#faf8f4] rounded-2xl border border-[#ece7de] my-2">
        {(['fruehstueck', 'mittagessen', 'abendessen'] as MealType[]).map((type) => {
          const isSlotSet = !!activeMeals[type];
          const label = type === 'fruehstueck' ? 'Frühstück' : type === 'mittagessen' ? 'Mittagessen' : 'Abendessen';
          const icon = type === 'fruehstueck' ? '🌅' : type === 'mittagessen' ? '☀️' : '🌙';
          const isSelected = selectedMealType === type;
          return (
            <button
              key={type}
              onClick={() => {
                sounds.playTick();
                setSelectedMealType(type);
              }}
              className={`py-1 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                isSelected
                  ? 'bg-white text-[#e06236] shadow-sm border border-[#ece7de]'
                  : 'text-[#786f65] hover:text-[#221e1a]'
              }`}
            >
              <span>{icon}</span>
              <span className="truncate">{label}</span>
              {isSlotSet && (
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-[#e06236]' : 'bg-[#15803d]'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Featured Meal Display (or Empty State) */}
      {currentSlot ? (
        <div className="relative my-1 rounded-2xl overflow-hidden border border-[#ece7de] shadow-sm group flex-1 min-h-[190px] max-h-[220px] flex flex-col justify-end">
          {/* Background Food Photo */}
          <img
            src={currentSlot.image}
            alt={currentSlot.title}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />

          {/* Soft Warm Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/40 text-[11px] font-bold text-[#221e1a] uppercase tracking-wider flex items-center space-x-1 shadow-sm">
              <span>{activeDay.dayLabel}</span>
              {activeDay.day === todayKey && (
                <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse ml-1" />
              )}
            </span>

            <div className="flex items-center space-x-1.5">
              <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/40 text-[10px] font-semibold text-[#221e1a] flex items-center space-x-1 shadow-sm">
                <Clock className="w-3 h-3 text-[#e06236]" />
                <span>{currentSlot.cookTime}</span>
              </span>
              {currentSlot.calories && (
                <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/40 text-[10px] font-semibold text-[#221e1a] hidden sm:inline-flex items-center space-x-1 shadow-sm">
                  <Flame className="w-3 h-3 text-[#e06236]" />
                  <span>{currentSlot.calories}</span>
                </span>
              )}
            </div>
          </div>

          {/* Bottom Content Info */}
          <div className="relative z-10 p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#fed7aa] tracking-wider drop-shadow-sm">
              {currentSlot.category}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white drop-shadow-md leading-snug mt-0.5 truncate">
              {currentSlot.title}
            </h3>

            {/* Key ingredients pills */}
            {currentSlot.ingredients && currentSlot.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {currentSlot.ingredients.slice(0, 3).map((ing, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-md text-white border border-white/20 font-medium"
                  >
                    {ing}
                  </span>
                ))}
                {currentSlot.ingredients.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-black/40 text-white/80 border border-white/10">
                    +{currentSlot.ingredients.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Action button: add to grocery list */}
            <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-white/20">
              <button
                onClick={handleTransferToShopping}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#e06236] hover:bg-[#c2410c] text-white font-bold text-xs shadow-sm transition active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Zutaten auf Einkaufsliste</span>
              </button>

              {addedNotice && (
                <span className="text-xs text-[#a7f3d0] font-semibold flex items-center space-x-1 animate-in fade-in drop-shadow">
                  <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-400" />
                  <span>Hinzugefügt! ✨</span>
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty Slot State */
        <div className="my-1 rounded-2xl border border-dashed border-[#ece7de] bg-[#faf8f4] p-5 flex-1 min-h-[190px] flex flex-col items-center justify-center text-center space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#ece7de] flex items-center justify-center text-lg shadow-2xs">
            {selectedMealType === 'fruehstueck' ? '🌅' : selectedMealType === 'mittagessen' ? '☀️' : '🌙'}
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#221e1a]">
              Kein {getMealTypeLabel(selectedMealType)} für {activeDay.dayLabel}
            </h3>
            <p className="text-[11px] text-[#786f65] mt-0.5">
              (Optional – klicke zum Planen)
            </p>
          </div>
          <button
            onClick={handleOpenEdit}
            className="px-4 py-2 bg-[#e06236] hover:bg-[#c2410c] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{getMealTypeLabel(selectedMealType)} eintragen</span>
          </button>
        </div>
      )}

      {/* Week Strip (7 Days with mini photos) */}
      <div className="grid grid-cols-7 gap-1.5 pt-2.5 border-t border-[#ece7de]">
        {mealPlan.map((m) => {
          const isSelected = m.day === selectedDay;
          const isToday = m.day === todayKey;

          return (
            <button
              key={m.id}
              onClick={() => {
                sounds.playTick();
                setSelectedDay(m.day);
              }}
              className={`relative flex flex-col items-center p-1.5 rounded-2xl border transition group overflow-hidden ${
                isSelected
                  ? 'bg-[#fef2eb] border-[#e06236] ring-2 ring-[#e06236]/20 shadow-sm'
                  : 'bg-[#faf8f4] border-[#ece7de] hover:border-[#ded6ca]'
              }`}
            >
              <span
                className={`text-[10px] font-bold mb-1 ${
                  isToday ? 'text-[#15803d]' : isSelected ? 'text-[#e06236]' : 'text-[#786f65]'
                }`}
              >
                {m.dayLabel.slice(0, 2)}
              </span>

              <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#ece7de] my-0.5">
                <img
                  src={getDayThumbnail(m)}
                  alt={m.dayLabel}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>

              {isToday && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#15803d] mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Edit Dish Modal with Automatic Image Search & Upload */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white border border-[#ece7de] rounded-3xl p-6 shadow-clean-lg max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#f4efe8] hover:bg-[#ece7de] text-[#786f65] hover:text-[#221e1a]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#221e1a] mb-1">
              {getMealTypeLabel(selectedMealType)} für {activeDay.dayLabel} planen ✨
            </h3>
            <p className="text-xs text-[#786f65] mb-4">
              Tippe den Namen ein – das Bild wird automatisch gesucht, oder lade ein eigenes Foto hoch!
            </p>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {/* Dish Title & Auto-Search */}
              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#221e1a] block mb-1">
                    Gericht-Name
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => {
                        if (editTitle.trim() && editTitle !== (currentSlot?.title || '')) {
                          handleAutoSearch();
                        }
                      }}
                      className="flex-1 bg-[#faf8f4] text-xs text-[#221e1a] px-3.5 py-2.5 rounded-xl border border-[#ece7de] focus:outline-none focus:border-[#e06236]"
                      placeholder="z.B. Spaghetti Carbonara, Pancakes, Curry..."
                    />
                    <button
                      type="button"
                      onClick={() => handleCycleImage()}
                      disabled={isSearchingImage || !editTitle.trim()}
                      className="px-3 py-2.5 bg-[#fef2eb] hover:bg-[#fde5d7] border border-[#fbdcd0] text-[#e06236] rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition active:scale-95 disabled:opacity-40"
                      title="Nächstes Bild für dieses Gericht laden"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSearchingImage ? 'animate-spin' : ''}`} />
                      <span>{isSearchingImage ? 'Sucht...' : 'Anderes Bild 🔄'}</span>
                    </button>
                  </div>
                </div>

                {/* Auto-Discovered Image Preview, Cycle & File Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#221e1a]">
                      Bildvorschau & Alternativen
                    </label>
                    {editImage && (
                      <span className="text-[10px] text-[#15803d] font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Ausgewählt</span>
                      </span>
                    )}
                  </div>

                  <div className="bg-[#faf8f4] p-3 rounded-2xl border border-[#ece7de] space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#ece7de] flex-shrink-0 bg-stone-100 flex items-center justify-center shadow-xs">
                        {editImage ? (
                          <img src={editImage} alt="Vorschau" className="w-full h-full object-cover transition-all" />
                        ) : (
                          <ImageIcon className="w-7 h-7 text-[#786f65] opacity-50" />
                        )}
                        {isSearchingImage && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 animate-spin text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2 text-xs">
                        <p className="text-[11px] text-[#786f65]">
                          {isSearchingImage
                            ? 'Lade neues kulinarisches Foto...'
                            : 'Klicke auf "Anderes Bild", um zwischen verschiedenen Fotos zu wechseln.'}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleCycleImage()}
                            disabled={isSearchingImage || !editTitle.trim()}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#e06236] hover:bg-[#c2410c] text-white text-xs font-bold transition active:scale-95 shadow-sm disabled:opacity-40"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSearchingImage ? 'animate-spin' : ''}`} />
                            <span>Anderes Bild 🔄</span>
                          </button>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#f4efe8] border border-[#ece7de] text-[#221e1a] text-xs font-medium transition active:scale-95 shadow-2xs"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#e06236]" />
                            <span>Eigenes Foto</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Clickable thumbnail strip of alternatives */}
                    {imageAlternatives.length > 1 && (
                      <div className="pt-2 border-t border-[#ece7de]/70">
                        <span className="text-[10px] text-[#786f65] font-semibold block mb-1.5">
                          Gefundene Alternativen direkt anklicken:
                        </span>
                        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
                          {imageAlternatives.slice(0, 10).map((imgUrl, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                sounds.playTick();
                                setEditImage(imgUrl);
                              }}
                              className={`relative w-12 h-12 rounded-lg overflow-hidden border flex-shrink-0 transition-transform active:scale-90 ${
                                editImage === imgUrl
                                  ? 'ring-2 ring-[#e06236] border-[#e06236] scale-105 shadow-xs'
                                  : 'border-[#ece7de] opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={imgUrl} alt={`Option ${i + 1}`} className="w-full h-full object-cover" />
                              {editImage === imgUrl && (
                                <div className="absolute inset-0 bg-[#e06236]/30 flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#786f65] block mb-1">Kategorie</label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-[#faf8f4] text-xs text-[#221e1a] px-3 py-2 rounded-xl border border-[#ece7de]"
                      placeholder="z.B. Pasta, Frühstück, Bowl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#786f65] block mb-1">Kochzeit</label>
                    <input
                      type="text"
                      value={editCookTime}
                      onChange={(e) => setEditCookTime(e.target.value)}
                      className="w-full bg-[#faf8f4] text-xs text-[#221e1a] px-3 py-2 rounded-xl border border-[#ece7de]"
                      placeholder="z.B. 20 Min"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#786f65] block mb-1">
                    Zutaten (mit Komma getrennt)
                  </label>
                  <textarea
                    rows={2}
                    value={editIngredients}
                    onChange={(e) => setEditIngredients(e.target.value)}
                    className="w-full bg-[#faf8f4] text-xs text-[#221e1a] px-3 py-2 rounded-xl border border-[#ece7de] focus:outline-none focus:border-[#e06236] resize-none"
                    placeholder="z.B. Nudeln, Tomatensauce, Basilikum, Parmesan"
                  />
                </div>

                {/* Quick Recipes Picker */}
                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-[#221e1a] block mb-1.5">
                    Oder 1-Klick Vorlage für {getMealTypeLabel(selectedMealType)} wählen:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_DISH_TEMPLATES.filter((p) => p.mealType === selectedMealType).slice(0, 4).map((tmpl, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectTemplate(tmpl)}
                        className="flex items-center space-x-2 p-2 rounded-xl bg-[#faf8f4] hover:bg-[#fef2eb] border border-[#ece7de] hover:border-[#fbdcd0] cursor-pointer transition"
                      >
                        <img
                          src={tmpl.image}
                          alt={tmpl.title}
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                        />
                        <span className="text-xs font-medium text-[#221e1a] truncate">
                          {tmpl.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-[#ece7de]">
                  {currentSlot ? (
                    <button
                      type="button"
                      onClick={handleRemoveSlot}
                      className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-medium py-1.5 px-2 rounded-lg hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Mahlzeit entfernen</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-xs text-[#786f65] hover:text-[#221e1a]"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#e06236] hover:bg-[#c2410c] text-white font-bold rounded-xl text-xs transition shadow-sm"
                    >
                      Speichern ✨
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
