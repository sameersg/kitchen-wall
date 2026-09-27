import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, StickyNote, Plus, Trash2, Check, 
  Wifi, Send, CheckCircle2, ShieldCheck, ArrowLeft,
  Smartphone, Utensils, Clock, Flame, ShoppingBag,
  RefreshCw, Upload, Camera, Image as ImageIcon, Calendar,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useSyncState, getMealItemForDate } from '../../hooks/useSyncState';
import { ShoppingCategory, NoteColor, MealItem, MealType, SingleMeal } from '../../types';
import { PRESET_DISH_TEMPLATES } from '../../utils/defaults';
import { autoFindFoodImage, getNextFoodImage, getFoodImageOptions, processUploadedImage } from '../../utils/foodImageFinder';
import { splitIngredientText } from '../../utils/ingredients';
import { sounds } from '../../utils/audio';
import { formatISODate, parseISODate, getWeekDates, GERMAN_MONTHS_SHORT } from '../../utils/dateUtils';

export const MobileCompanion: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.add('companion-mode');
    document.body.classList.add('companion-mode');
    return () => {
      document.documentElement.classList.remove('companion-mode');
      document.body.classList.remove('companion-mode');
    };
  }, []);

  const {
    state,
    isConnected,
    addShoppingItem,
    toggleShoppingItem,
    removeShoppingItem,
    clearCheckedShopping,
    addNote,
    removeNote,
    updateMealSlot,
    addMealIngredientsToShopping,
    updateSettings,
    syncBring
  } = useSyncState();

  const [activeTab, setActiveTab] = useState<'shopping' | 'mealPlan' | 'note' | 'calendar'>('shopping');
  const [calUrlInput, setCalUrlInput] = useState(state.settings?.googleCalendarIcalUrl || '');
  const [calSavedSuccess, setCalSavedSuccess] = useState(false);

  // Bring Shopping state
  const [bringEmail, setBringEmail] = useState(state.settings?.bring?.email || '');
  const [bringPassword, setBringPassword] = useState('');
  const [bringLoading, setBringLoading] = useState(false);
  const [bringSyncing, setBringSyncing] = useState(false);
  const [bringError, setBringError] = useState<string | null>(null);
  const [bringSuccess, setBringSuccess] = useState<string | null>(null);
  const [showBringDetails, setShowBringDetails] = useState(false);

  useEffect(() => {
    if (state.settings?.bring?.email) {
      setBringEmail(state.settings.bring.email);
    }
  }, [state.settings?.bring?.email]);

  useEffect(() => {
    if (state.settings?.googleCalendarIcalUrl !== undefined) {
      setCalUrlInput(state.settings.googleCalendarIcalUrl);
    }
  }, [state.settings?.googleCalendarIcalUrl]);

  // Shopping form
  const [shopName, setShopName] = useState('');
  const [shopAmount, setShopAmount] = useState('');

  // Note form
  const [noteText, setNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('');
  const [noteColor, setNoteColor] = useState<NoteColor>('yellow');
  const [noteSuccess, setNoteSuccess] = useState(false);

  // Multi-Week Meal Plan state
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const weekInfo = getWeekDates(weekOffset);
  const [selectedDate, setSelectedDate] = useState<string>(() => formatISODate(new Date()));
  const [selectedMealType, setSelectedMealType] = useState<MealType>('abendessen');
  const [mealTransferSuccess, setMealTransferSuccess] = useState(false);

  // Quick edit on mobile
  const [isEditingMeal, setIsEditingMeal] = useState(false);
  const [mobileDishName, setMobileDishName] = useState('');
  const [mobileIngredients, setMobileIngredients] = useState('');
  const [mobileCookTime, setMobileCookTime] = useState('25 Min');
  const [mobileImage, setMobileImage] = useState('');
  const [imageAlternatives, setImageAlternatives] = useState<string[]>([]);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const mobileFileRef = useRef<HTMLInputElement | null>(null);

  const activeShopping = state.shoppingList.filter((i) => !i.checked);
  const completedShopping = state.shoppingList.filter((i) => i.checked);
  const currentDayItem = getMealItemForDate(state.mealPlan, selectedDate);
  const currentMeals = currentDayItem?.meals || {};
  const currentSlot: SingleMeal | null | undefined = (currentMeals as Record<string, SingleMeal | null | undefined>)[selectedMealType];

  const handleBringLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bringEmail.trim() || !bringPassword.trim()) {
      setBringError('Bitte Bring!-E-Mail und Passwort eingeben.');
      return;
    }
    setBringLoading(true);
    setBringError(null);
    sounds.playTick();
    try {
      const res = await fetch('/api/bring/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: bringEmail.trim(), password: bringPassword.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Anmeldung fehlgeschlagen');

      const activeList = data.lists?.find((l: any) => l.listUuid === data.activeListUuid) || data.lists?.[0];
      const activeListName = activeList ? activeList.name : 'Standard';

      updateSettings({
        bring: {
          enabled: true,
          email: bringEmail.trim(),
          userName: data.userName,
          listUuid: data.activeListUuid,
          listName: activeListName,
          availableLists: data.lists || [],
          autoSync: true,
          lastSync: Date.now()
        }
      });
      setBringPassword('');
      setBringSuccess(`Verbunden als ${data.userName}!`);
      setShowBringDetails(false);
      sounds.playTick();

      // Trigger initial sync
      fetch('/api/bring/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listUuid: data.activeListUuid })
      }).catch(console.warn);
    } catch (e: any) {
      setBringError(e.message || 'Verbindung fehlgeschlagen');
    } finally {
      setBringLoading(false);
    }
  };

  const handleBringManualSync = async () => {
    if (bringSyncing) return;
    setBringSyncing(true);
    setBringError(null);
    sounds.playTick();
    try {
      const res = await syncBring();
      if (res && res.success) {
        setBringSuccess('✓ Mit Bring! synchronisiert');
        setTimeout(() => setBringSuccess(null), 3000);
      } else if (res && res.error) {
        setBringError(res.error);
      }
    } finally {
      setBringSyncing(false);
    }
  };

  const handleBringDisconnect = () => {
    sounds.playTick();
    updateSettings({
      bring: {
        enabled: false,
        email: '',
        autoSync: false
      }
    });
    fetch('/api/bring/logout', { method: 'POST' }).catch(console.warn);
    setBringEmail('');
    setBringPassword('');
    setBringSuccess('Getrennt.');
  };

  const handleSelectBringList = (listUuid: string) => {
    const bring = state.settings?.bring;
    const target = bring?.availableLists?.find((l) => l.listUuid === listUuid);
    if (!target || !bring) return;
    sounds.playTick();
    updateSettings({
      bring: {
        ...bring,
        listUuid: target.listUuid,
        listName: target.name
      }
    });
    fetch('/api/bring/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listUuid: target.listUuid })
    }).catch(console.warn);
  };

  const handleOpenEdit = () => {
    sounds.playTick();
    if (currentSlot) {
      setMobileDishName(currentSlot.title);
      setMobileIngredients(currentSlot.ingredients ? currentSlot.ingredients.join(', ') : '');
      setMobileCookTime(currentSlot.cookTime || '25 Min');
      setMobileImage(currentSlot.image || '');
      if (currentSlot.title) {
        getFoodImageOptions(currentSlot.title).then(setImageAlternatives).catch(() => {});
      }
    } else {
      setMobileDishName('');
      setMobileIngredients('');
      setMobileCookTime(selectedMealType === 'fruehstueck' ? '15 Min' : '25 Min');
      setMobileImage('');
      setImageAlternatives([]);
    }
    setIsEditingMeal(true);
  };

  const handleCycleImage = async () => {
    const term = mobileDishName.trim() || (selectedMealType === 'fruehstueck' ? 'Pancakes' : selectedMealType === 'mittagessen' ? 'Bowl' : 'Pasta');
    setIsSearchingImage(true);
    sounds.playTick();
    try {
      const nextImg = await getNextFoodImage(term, mobileImage);
      setMobileImage(nextImg);
      // Fetch options to populate quick picker strip
      const options = await getFoodImageOptions(term);
      setImageAlternatives(options);
    } catch {
      // ignore
    } finally {
      setIsSearchingImage(false);
    }
  };

  const handleAddShopping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) return;
    sounds.playTick();
    addShoppingItem(shopName, shopAmount, 'sonstiges');
    setShopName('');
    setShopAmount('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    sounds.playTick();
    addNote(noteText, noteAuthor || 'iPhone', noteColor);
    setNoteText('');
    setNoteSuccess(true);
    setTimeout(() => setNoteSuccess(false), 2500);
  };

  const handleAddMealIngredients = (ingredients: string[]) => {
    sounds.playTick();
    addMealIngredientsToShopping(ingredients);
    setMealTransferSuccess(true);
    setTimeout(() => setMealTransferSuccess(false), 2000);
  };

  const handleSaveMobileDish = async () => {
    if (!mobileDishName.trim()) return;
    setIsSearchingImage(true);
    try {
      let finalImage = mobileImage;
      if (!finalImage) {
        finalImage = await autoFindFoodImage(mobileDishName);
      }
      const parsedIngredients = splitIngredientText(mobileIngredients || '');

      const slotCategory = 
        selectedMealType === 'fruehstueck' ? 'Frühstück' :
        selectedMealType === 'mittagessen' ? 'Mittagessen' : 'Abendessen';

      updateMealSlot(selectedDate, selectedMealType, {
        title: mobileDishName.trim(),
        image: finalImage,
        category: slotCategory,
        cookTime: mobileCookTime.trim() || '25 Min',
        ingredients: parsedIngredients
      });
      setIsEditingMeal(false);
      setMobileDishName('');
      setMobileIngredients('');
      setMobileImage('');
      setImageAlternatives([]);
    } finally {
      setIsSearchingImage(false);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_DISH_TEMPLATES[0]) => {
    sounds.playTick();
    setMobileDishName(preset.title);
    setMobileCookTime(preset.cookTime);
    setMobileImage(preset.image);
    setMobileIngredients(preset.ingredients.join(', '));
    getFoodImageOptions(preset.title).then(setImageAlternatives).catch(() => {});
  };

  const handleRemoveMealSlot = () => {
    sounds.playTick();
    updateMealSlot(selectedDate, selectedMealType, null);
    setIsEditingMeal(false);
  };

  const handleMobilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processUploadedImage(file);
      setMobileImage(dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const getMealTypeLabel = (type: MealType) => {
    switch (type) {
      case 'fruehstueck': return 'Frühstück';
      case 'mittagessen': return 'Mittagessen';
      case 'abendessen': return 'Abendessen';
    }
  };

  return (
    <div className="min-h-screen atelier-canvas-bg text-ink flex flex-col font-sans max-w-md mx-auto relative border-x border-parchment-300 pb-36">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-20 px-4 py-3 bg-[#faf7f2]/95 backdrop-blur-md border-b border-parchment-300 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-terracotta text-white flex items-center justify-center font-serif font-bold text-sm shadow-stamp">
            {(state.settings.dashboardName || 'Cucina Atelier').charAt(0)}
          </div>
          <div>
            <h1 className="text-sm font-bold text-ink flex items-center space-x-1.5 font-serif">
              <span>{state.settings.dashboardName || 'Cucina Atelier'}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
                }`}
              />
            </h1>
            <p className="text-[10px] text-[#786f65]">
              {isConnected ? 'Live mit iPad synchronisiert' : 'Lokal gespeichert'}
            </p>
          </div>
        </div>

        <a
          href="/"
          className="text-xs px-3 py-1.5 rounded-xl bg-parchment-100 hover:bg-white text-ink border border-parchment-300 font-medium flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-terracotta" />
          <span>iPad</span>
        </a>
      </header>

      {/* Segmented Control Switcher */}
      <div className="p-2.5 bg-parchment-100/80 border-b border-parchment-300">
        <div className="grid grid-cols-4 p-1 bg-white rounded-2xl border border-parchment-300 text-[11px] font-bold shadow-xs">
          <button
            onClick={() => setActiveTab('shopping')}
            className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'shopping'
                ? 'bg-terracotta text-white shadow-xs'
                : 'text-[#786f65] hover:text-ink'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Einkauf</span>
            {activeShopping.length > 0 && (
              <span className={`text-[9px] px-1 rounded-full ${activeTab === 'shopping' ? 'bg-white/25 text-white' : 'bg-parchment-200 text-[#786f65]'}`}>
                {activeShopping.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mealPlan')}
            className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'mealPlan'
                ? 'bg-terracotta text-white shadow-xs'
                : 'text-[#786f65] hover:text-ink'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Essen</span>
          </button>

          <button
            onClick={() => setActiveTab('note')}
            className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'note'
                ? 'bg-terracotta text-white shadow-xs'
                : 'text-[#786f65] hover:text-ink'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Notiz</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-terracotta text-white shadow-xs'
                : 'text-[#786f65] hover:text-ink'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Kalender</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Mobile Shopping */}
      {activeTab === 'shopping' && (
        <div className="p-4 flex flex-col">
          {/* Bring! Integration Card */}
          <div className="mb-4 p-3.5 bg-white rounded-3xl border border-[#ece7de] shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">🛒</span>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-[#221e1a]">Bring! Einkaufsliste</span>
                    {state.settings?.bring?.enabled && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#786f65]">
                    {state.settings?.bring?.enabled
                      ? `${state.settings.bring.userName || state.settings.bring.email} · ${state.settings.bring.listName || 'Standard'}`
                      : 'Konto verbinden für automatischen Sync'}
                  </p>
                </div>
              </div>

              {state.settings?.bring?.enabled ? (
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={handleBringManualSync}
                    disabled={bringSyncing}
                    className="p-2 rounded-xl bg-[#faf8f4] border border-[#ece7de] text-[#221e1a] text-xs font-bold flex items-center space-x-1 active:scale-95 transition cursor-pointer"
                    title="Synchronisieren"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${bringSyncing ? 'animate-spin text-[#e06236]' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBringDetails(!showBringDetails)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#faf8f4] border border-[#ece7de] text-[11px] font-bold text-[#786f65] active:scale-95 transition cursor-pointer"
                  >
                    {showBringDetails ? 'Schließen' : 'Optionen'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowBringDetails(!showBringDetails)}
                  className="px-3 py-1.5 rounded-xl bg-[#e06236] text-white text-[11px] font-bold shadow-2xs active:scale-95 transition cursor-pointer"
                >
                  {showBringDetails ? 'Abbrechen' : 'Verbinden'}
                </button>
              )}
            </div>

            {/* Feedback message */}
            {bringSuccess && (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-medium">
                {bringSuccess}
              </div>
            )}
            {bringError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 font-medium">
                ⚠️ {bringError}
              </div>
            )}

            {/* Expandable Form / Options */}
            {showBringDetails && (
              <div className="mt-3 pt-3 border-t border-[#ece7de] space-y-3">
                {state.settings?.bring?.enabled ? (
                  <div className="space-y-2.5">
                    {/* List switch */}
                    {state.settings.bring.availableLists && state.settings.bring.availableLists.length > 1 && (
                      <div>
                        <label className="block text-[11px] font-bold text-[#221e1a] mb-1">Liste auswählen:</label>
                        <div className="flex flex-wrap gap-1.5">
                          {state.settings.bring.availableLists.map((l) => (
                            <button
                              key={l.listUuid}
                              type="button"
                              onClick={() => handleSelectBringList(l.listUuid)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                                state.settings?.bring?.listUuid === l.listUuid
                                  ? 'bg-[#e06236] text-white shadow-2xs'
                                  : 'bg-[#faf8f4] border border-[#ece7de] text-[#221e1a]'
                              }`}
                            >
                              {l.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#786f65]">
                        {state.settings.bring.lastSync
                          ? `Sync: ${new Date(state.settings.bring.lastSync).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`
                          : 'Noch nicht synchronisiert'}
                      </span>
                      <button
                        type="button"
                        onClick={handleBringDisconnect}
                        className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Konto trennen
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBringLogin} className="space-y-2.5">
                    <p className="text-[11px] text-[#786f65] leading-relaxed">
                      E-Mail und Passwort deines Bring!-Kontos eingeben.
                    </p>
                    <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-800 leading-snug">
                      💡 <b>Tipp bei Apple/Google-Login:</b> In der Bring!-App unter <i>Profil ⚙️ &rarr; Konto &rarr; Passwort festlegen</i> ein Passwort vergeben.
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Bring! E-Mail"
                        value={bringEmail}
                        onChange={(e) => setBringEmail(e.target.value)}
                        required
                        className="w-full bg-[#faf8f4] text-xs text-[#221e1a] px-3 py-2 rounded-xl border border-[#ece7de] focus:outline-none focus:border-[#e06236]"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Bring! Passwort"
                        value={bringPassword}
                        onChange={(e) => setBringPassword(e.target.value)}
                        required
                        className="w-full bg-[#faf8f4] text-xs text-[#221e1a] px-3 py-2 rounded-xl border border-[#ece7de] focus:outline-none focus:border-[#e06236]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={bringLoading}
                      className="w-full py-2 bg-[#e06236] text-white rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
                    >
                      {bringLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verbinden …</span>
                        </>
                      ) : (
                        <span>Jetzt anmelden & verknüpfen</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleAddShopping} className="mb-4 p-3.5 bg-white rounded-3xl border border-[#ece7de] flex items-center space-x-2 shadow-clean">
            <input
              type="text"
              placeholder="Neuer Artikel (z.B. Mandelmilch)"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="flex-1 bg-[#faf8f4] text-xs text-[#221e1a] px-3.5 py-2.5 rounded-2xl border border-[#ece7de] focus:outline-none focus:border-[#e06236]"
            />
            <input
              type="text"
              placeholder="Menge"
              value={shopAmount}
              onChange={(e) => setShopAmount(e.target.value)}
              className="w-20 bg-[#faf8f4] text-xs text-[#221e1a] px-2 py-2.5 rounded-2xl border border-[#ece7de] text-center"
            />
            <button
              type="submit"
              disabled={!shopName.trim()}
              className="px-3.5 py-2.5 bg-[#e06236] hover:bg-[#c2410c] disabled:opacity-40 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center space-x-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* List items */}
          <div className="space-y-2">
            {state.shoppingList.length === 0 ? (
              <div className="text-center py-12 text-[#786f65] text-xs">
                Keine Artikel auf der Einkaufsliste ✨
              </div>
            ) : (
              [...state.shoppingList]
                .sort((a, b) => {
                  if (a.checked !== b.checked) return a.checked ? 1 : -1;
                  return (b.createdAt || 0) - (a.createdAt || 0);
                })
                .map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    sounds.playTick();
                    toggleShoppingItem(item.id);
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                    item.checked
                      ? 'bg-stone-50 border-stone-200/50 opacity-40 line-through'
                      : 'bg-white border-[#ece7de] shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                        item.checked
                          ? 'bg-[#15803d] border-[#15803d] text-white'
                          : 'border-stone-400'
                      }`}
                    >
                      {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-semibold text-[#221e1a]">{item.name}</span>
                    {item.amount && (
                      <span className="text-[10px] text-[#786f65] px-1.5 py-0.5 rounded bg-[#f4efe8] font-mono">
                        {item.amount}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playTick();
                      removeShoppingItem(item.id);
                    }}
                    className="text-[#786f65] hover:text-[#c2410c] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Bottom actions */}
          {completedShopping.length > 0 && (
            <div className="pt-3 border-t border-[#ece7de] mt-3 flex justify-end">
              <button
                onClick={() => {
                  sounds.playTick();
                  clearCheckedShopping();
                }}
                className="text-xs text-[#c2410c] font-medium flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Erledigte ({completedShopping.length}) löschen</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Mobile Meal Plan */}
      {activeTab === 'mealPlan' && (
        <div className="flex-1 p-4 flex flex-col space-y-3.5">
          {/* Multi-Week Navigation Header */}
          <div className="bg-white p-3 rounded-2xl border border-[#ece7de] shadow-2xs flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  sounds.playTick();
                  const newOffset = weekOffset - 1;
                  setWeekOffset(newOffset);
                  const info = getWeekDates(newOffset);
                  setSelectedDate(info.days[0].dateStr);
                  setIsEditingMeal(false);
                }}
                className="p-1.5 rounded-xl hover:bg-[#faf8f4] text-[#786f65] active:scale-95 transition"
                title="Vorwoche"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center">
                <span className="text-xs font-bold text-[#221e1a] block">
                  {weekInfo.label.split('·')[0].trim()}
                </span>
                <span className="text-[10px] text-[#786f65] font-medium block">
                  {weekInfo.label.split('·')[1]?.trim() || ''}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playTick();
                  const newOffset = weekOffset + 1;
                  setWeekOffset(newOffset);
                  const info = getWeekDates(newOffset);
                  setSelectedDate(info.days[0].dateStr);
                  setIsEditingMeal(false);
                }}
                className="p-1.5 rounded-xl hover:bg-[#faf8f4] text-[#786f65] active:scale-95 transition"
                title="Nächste Woche"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Week Chips */}
            <div className="flex items-center space-x-1.5 justify-center pt-1.5 border-t border-[#f4efe8]">
              <button
                type="button"
                onClick={() => {
                  sounds.playTick();
                  setWeekOffset(0);
                  setSelectedDate(formatISODate(new Date()));
                  setIsEditingMeal(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  weekOffset === 0
                    ? 'bg-[#e06236] text-white shadow-2xs'
                    : 'bg-[#faf8f4] text-[#786f65] hover:text-[#221e1a]'
                }`}
              >
                Diese Woche
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playTick();
                  setWeekOffset(1);
                  const nextMon = getWeekDates(1).days[0].dateStr;
                  setSelectedDate(nextMon);
                  setIsEditingMeal(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  weekOffset === 1
                    ? 'bg-[#e06236] text-white shadow-2xs'
                    : 'bg-[#faf8f4] text-[#786f65] hover:text-[#221e1a]'
                }`}
              >
                Nächste Woche
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playTick();
                  setWeekOffset(2);
                  const in2Mon = getWeekDates(2).days[0].dateStr;
                  setSelectedDate(in2Mon);
                  setIsEditingMeal(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  weekOffset === 2
                    ? 'bg-[#e06236] text-white shadow-2xs'
                    : 'bg-[#faf8f4] text-[#786f65] hover:text-[#221e1a]'
                }`}
              >
                +2 Wochen
              </button>
            </div>
          </div>

          {/* 7 Days Grid with Day Name and Number */}
          <div className="grid grid-cols-7 gap-1">
            {weekInfo.days.map((d) => {
              const dayMeal = getMealItemForDate(state.mealPlan, d.dateStr);
              const hasAnyMeal = !!(dayMeal?.meals?.fruehstueck || dayMeal?.meals?.mittagessen || dayMeal?.meals?.abendessen);
              const isSelected = d.dateStr === selectedDate;
              return (
                <button
                  key={d.dateStr}
                  onClick={() => {
                    sounds.playTick();
                    setSelectedDate(d.dateStr);
                    setIsEditingMeal(false);
                  }}
                  className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center space-y-0.5 transition active:scale-95 relative ${
                    isSelected
                      ? 'bg-[#e06236] text-white shadow-sm ring-2 ring-[#e06236]/30'
                      : d.isToday
                      ? 'bg-[#fbeee5] text-[#e06236] border border-[#e06236]/40'
                      : 'bg-white text-[#786f65] border border-[#ece7de]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-extrabold tracking-wider opacity-90">
                    {d.dayShort}
                  </span>
                  <span className="text-xs font-bold leading-tight">
                    {d.dayNumber}.
                  </span>
                  <div className="h-1.5 flex items-center justify-center">
                    {hasAnyMeal ? (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-[#15803d]'
                        }`}
                      />
                    ) : (
                      <span className="w-1.5 h-1.5 opacity-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 3 Meals Selector: Frühstück, Mittagessen, Abendessen */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-2xl border border-[#ece7de] shadow-2xs">
            {(['fruehstueck', 'mittagessen', 'abendessen'] as MealType[]).map((type) => {
              const isSlotSet = !!currentMeals[type];
              const label = type === 'fruehstueck' ? 'Frühstück' : type === 'mittagessen' ? 'Mittag' : 'Abendessen';
              const icon = type === 'fruehstueck' ? '🌅' : type === 'mittagessen' ? '☀️' : '🌙';
              const isSelected = selectedMealType === type;
              return (
                <button
                  key={type}
                  onClick={() => {
                    sounds.playTick();
                    setSelectedMealType(type);
                    setIsEditingMeal(false);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition active:scale-95 ${
                    isSelected
                      ? 'bg-[#e06236] text-white shadow-sm'
                      : 'text-[#786f65] hover:text-[#221e1a] hover:bg-[#faf8f4]'
                  }`}
                >
                  <span className="text-xs">{icon}</span>
                  <span>{label}</span>
                  {isSlotSet && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#15803d]'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* If meal is present in selected slot */}
          {currentSlot ? (
            <div className="rounded-3xl overflow-hidden border border-[#ece7de] bg-white shadow-clean flex flex-col">
              <div className="relative h-48">
                <img
                  src={currentSlot.image}
                  alt={currentSlot.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-[#221e1a] shadow-sm flex items-center space-x-1">
                  <span>{currentDayItem.dayLabel}, {parseISODate(selectedDate).getDate()}. {GERMAN_MONTHS_SHORT[parseISODate(selectedDate).getMonth()]}</span>
                  <span>•</span>
                  <span className="text-[#e06236]">{getMealTypeLabel(selectedMealType)}</span>
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-semibold text-[#221e1a] flex items-center space-x-1 shadow-sm">
                  <Clock className="w-3 h-3 text-[#e06236]" />
                  <span>{currentSlot.cookTime}</span>
                </div>
              </div>

              <div className="p-4">
                <span className="text-[10px] uppercase font-bold text-[#e06236] tracking-wider">
                  {currentSlot.category || getMealTypeLabel(selectedMealType)}
                </span>
                <h2 className="text-base font-bold text-[#221e1a] mt-0.5">
                  {currentSlot.title}
                </h2>

                {currentSlot.ingredients && currentSlot.ingredients.length > 0 && (
                  <div className="mt-3">
                    <label className="text-[11px] font-bold text-[#554d44] block mb-1.5">
                      Zutaten:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {currentSlot.ingredients.map((ing, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-1 rounded-xl bg-[#faf8f4] border border-[#ece7de] text-[#221e1a]"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-[#ece7de] flex flex-col space-y-2">
                  {currentSlot.ingredients && currentSlot.ingredients.length > 0 && (
                    <button
                      onClick={() => handleAddMealIngredients(currentSlot.ingredients)}
                      className="w-full py-2.5 bg-[#e06236] hover:bg-[#c2410c] text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center space-x-1.5 active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Zutaten auf Einkaufsliste</span>
                    </button>
                  )}

                  {mealTransferSuccess && (
                    <span className="text-xs text-[#15803d] font-bold text-center flex items-center justify-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Erfolgreich hinzugefügt! ✨</span>
                    </span>
                  )}

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={handleOpenEdit}
                      className="flex-1 py-2.5 bg-[#f4efe8] hover:bg-[#ece7de] text-[#221e1a] font-bold text-xs rounded-2xl border border-[#ece7de] transition flex items-center justify-center space-x-1.5 active:scale-95"
                    >
                      <Utensils className="w-3.5 h-3.5 text-[#e06236]" />
                      <span>Gericht anpassen</span>
                    </button>

                    <button
                      onClick={handleRemoveMealSlot}
                      className="px-3.5 py-2.5 bg-[#faf8f4] hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-2xl border border-[#ece7de] hover:border-rose-200 transition active:scale-95"
                      title="Mahlzeit entfernen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State for Optional Meal Slot */
            <div className="rounded-3xl border border-dashed border-[#ece7de] bg-white p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#faf8f4] border border-[#ece7de] flex items-center justify-center text-2xl">
                {selectedMealType === 'fruehstueck' ? '🌅' : selectedMealType === 'mittagessen' ? '☀️' : '🌙'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#221e1a]">
                  Kein {getMealTypeLabel(selectedMealType)} für {currentDayItem.dayLabel}
                </h3>
                <p className="text-xs text-[#786f65] mt-1 max-w-xs">
                  Mahlzeiten sind optional. Du kannst für diesen Tag ein {getMealTypeLabel(selectedMealType)} eintragen oder frei lassen.
                </p>
              </div>

              {!isEditingMeal && (
                <button
                  onClick={handleOpenEdit}
                  className="px-5 py-2.5 bg-[#e06236] hover:bg-[#c2410c] text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center space-x-1.5 active:scale-95 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{getMealTypeLabel(selectedMealType)} eintragen</span>
                </button>
              )}
            </div>
          )}

          {/* Edit / Add Meal Form */}
          {isEditingMeal && (
            <div className="p-4 bg-white rounded-3xl border border-[#ece7de] space-y-3 shadow-clean">
              <div className="flex items-center justify-between pb-2 border-b border-[#ece7de]">
                <span className="text-xs font-bold text-[#221e1a]">
                  {getMealTypeLabel(selectedMealType)} für {currentDayItem.dayLabel} eintragen ✨
                </span>
                <button
                  onClick={() => setIsEditingMeal(false)}
                  className="text-[11px] text-[#786f65] hover:text-[#221e1a] font-medium"
                >
                  Abbrechen ✕
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#554d44] block mb-1">
                  Name des Gerichts:
                </label>
                <input
                  type="text"
                  value={mobileDishName}
                  onChange={(e) => setMobileDishName(e.target.value)}
                  onBlur={() => {
                    if (mobileDishName.trim() && !mobileImage) {
                      handleCycleImage();
                    }
                  }}
                  placeholder={
                    selectedMealType === 'fruehstueck' ? 'z.B. Heidelbeer Pancakes, Rührei, Porridge' :
                    selectedMealType === 'mittagessen' ? 'z.B. Buddha Bowl, Caesar Salad, Wrap' :
                    'z.B. Selbstgemachte Lasagne, Ofenlachs, Curry'
                  }
                  className="w-full bg-[#faf8f4] text-sm text-[#221e1a] px-3.5 py-3 rounded-2xl border border-[#ece7de] focus:outline-none focus:border-[#e06236]"
                />
              </div>

              {/* Live Image Preview & Multi-Image Rotation Card */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-[#554d44]">
                    Bild für das Gericht:
                  </label>
                  {mobileImage && (
                    <span className="text-[10px] text-[#15803d] font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Bild aktiv</span>
                    </span>
                  )}
                </div>

                <div className="bg-[#faf8f4] p-3 rounded-2xl border border-[#ece7de] space-y-2.5">
                  <div className="relative h-44 rounded-xl overflow-hidden border border-[#ece7de] bg-stone-100 flex items-center justify-center">
                    {mobileImage ? (
                      <img
                        src={mobileImage}
                        alt="Vorschau"
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#786f65] space-y-1">
                        <ImageIcon className="w-8 h-8 opacity-40" />
                        <span className="text-[11px]">Noch kein Bild geladen</span>
                      </div>
                    )}
                    {isSearchingImage && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                        <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl shadow-lg border border-[#ece7de]">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#e06236]" />
                          <span className="text-xs font-bold text-[#221e1a]">Sucht neues Bild...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cycle & Upload Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleCycleImage}
                      disabled={isSearchingImage}
                      className="flex-1 py-2.5 px-3 bg-[#e06236] hover:bg-[#c2410c] active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-sm disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSearchingImage ? 'animate-spin' : ''}`} />
                      <span>Anderes Bild suchen 🔄</span>
                    </button>

                    <input
                      ref={mobileFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleMobilePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => mobileFileRef.current?.click()}
                      className="px-3.5 py-2.5 bg-white hover:bg-[#f4efe8] active:scale-95 border border-[#ece7de] text-[#221e1a] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-2xs"
                      title="Kamera / Foto aus Mediathek"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#e06236]" />
                      <span>Foto</span>
                    </button>
                  </div>

                  {/* Clickable Alternative Thumbnails strip */}
                  {imageAlternatives.length > 1 && (
                    <div className="pt-1 border-t border-[#ece7de]/60">
                      <span className="text-[10px] text-[#786f65] font-semibold block mb-1.5">
                        Oder direkt ein passendes Bild antippen:
                      </span>
                      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
                        {imageAlternatives.slice(0, 8).map((imgUrl: string, i: number) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              sounds.playTick();
                              setMobileImage(imgUrl);
                            }}
                            className={`relative w-12 h-12 rounded-lg overflow-hidden border flex-shrink-0 transition-transform active:scale-90 ${
                              mobileImage === imgUrl
                                ? 'ring-2 ring-[#e06236] border-[#e06236] scale-105 shadow-xs'
                                : 'border-[#ece7de] opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={imgUrl} alt={`Option ${i + 1}`} className="w-full h-full object-cover" />
                            {mobileImage === imgUrl && (
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

              <div>
                <label className="text-[11px] font-bold text-[#554d44] block mb-1">
                  Zutaten (optional, kommagetrennt):
                </label>
                <input
                  type="text"
                  value={mobileIngredients}
                  onChange={(e) => setMobileIngredients(e.target.value)}
                  placeholder="z.B. Haferflocken, Heidelbeeren, Mandelmilch"
                  className="w-full bg-[#faf8f4] text-sm text-[#221e1a] px-3.5 py-3 rounded-2xl border border-[#ece7de] focus:outline-none focus:border-[#e06236]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#554d44] block mb-1">
                  Zubereitungszeit:
                </label>
                <div className="flex items-center space-x-1.5">
                  {['10 Min', '15 Min', '20 Min', '30 Min', '45 Min'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMobileCookTime(t)}
                      className={`text-[11px] px-3 py-1.5 rounded-xl border font-semibold transition active:scale-95 ${
                        mobileCookTime === t
                          ? 'bg-[#e06236] text-white border-[#e06236] shadow-2xs'
                          : 'bg-[#faf8f4] text-[#554d44] border-[#ece7de]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestions filtered by meal type */}
              <div>
                <span className="text-[10px] text-[#786f65] font-semibold block mb-1.5">
                  Schnelle Inspiration für {getMealTypeLabel(selectedMealType)}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_DISH_TEMPLATES.filter((p) => p.mealType === selectedMealType).map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="text-[11px] px-3 py-1.5 rounded-xl bg-[#faf8f4] border border-[#ece7de] text-[#221e1a] hover:border-[#e06236] transition shadow-2xs active:scale-95"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save & Cancel Buttons */}
              <div className="pt-3 border-t border-[#ece7de] flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingMeal(false)}
                  className="px-4 py-3 bg-[#faf8f4] hover:bg-[#ece7de] text-[#786f65] hover:text-[#221e1a] text-xs font-bold rounded-2xl border border-[#ece7de] transition active:scale-95"
                >
                  Abbrechen
                </button>

                <button
                  type="button"
                  onClick={handleSaveMobileDish}
                  disabled={!mobileDishName.trim() || isSearchingImage}
                  className="flex-1 py-3 bg-[#e06236] hover:bg-[#c2410c] disabled:opacity-40 text-white text-xs font-bold rounded-2xl flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Gericht speichern ✨</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Mobile Note */}
      {activeTab === 'note' && (
        <div className="flex-1 p-4">
          <form onSubmit={handleAddNote} className="p-4 bg-white rounded-3xl border border-[#ece7de] space-y-4 shadow-clean">
            <div>
              <label className="text-xs font-bold text-[#221e1a] block mb-1">
                Nachricht für das Küchen-iPad ✨:
              </label>
              <textarea
                placeholder="z.B. Bin um 18:30 Uhr zu Hause! Bitte Ofen vorheizen 🍕"
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-[#faf8f4] text-xs text-[#221e1a] p-3 rounded-2xl border border-[#ece7de] focus:outline-none focus:border-[#e06236] resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-[10px] text-[#786f65] block mb-1">Zettelfarbe:</label>
                <div className="flex items-center space-x-2">
                  {(['yellow', 'rose', 'emerald', 'blue', 'purple'] as NoteColor[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNoteColor(c)}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        c === 'yellow' ? 'bg-[#fefce8] border-[#fde047]' :
                        c === 'rose' ? 'bg-[#fff1f2] border-[#fecdd3]' :
                        c === 'emerald' ? 'bg-[#f0fdf4] border-[#bbf7d0]' :
                        c === 'blue' ? 'bg-[#f0f9ff] border-[#bae6fd]' : 'bg-[#faf5ff] border-[#e9d5ff]'
                      } ${noteColor === c ? 'scale-125 ring-2 ring-stone-800' : 'opacity-70'}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#786f65] block mb-1">Dein Name:</label>
                <input
                  type="text"
                  placeholder="Name"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  className="w-24 bg-[#faf8f4] text-xs text-[#221e1a] px-2 py-1.5 rounded-xl border border-[#ece7de] text-center"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!noteText.trim()}
              className="w-full py-3 bg-[#e06236] hover:bg-[#c2410c] disabled:opacity-40 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-sm transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>An die Küchenwand pinnen</span>
            </button>

            {noteSuccess && (
              <div className="p-2.5 rounded-2xl bg-[#eef8f2] border border-[#c2e7d0] text-[#15803d] text-xs font-medium text-center flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Notiz wurde live auf das iPad übertragen! ✨</span>
              </div>
            )}
          </form>

          {/* Existing notes preview */}
          <div className="mt-6">
            <h3 className="text-xs font-bold text-[#554d44] mb-2">Aktuelle Zettel an der Wand:</h3>
            <div className="space-y-2">
              {state.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 bg-white rounded-2xl border border-[#ece7de] flex items-center justify-between text-xs shadow-sm"
                >
                  <div>
                    <p className="text-[#221e1a] font-medium">{note.text}</p>
                    <span className="text-[10px] text-[#786f65]">Von {note.author || 'Küche'}</span>
                  </div>
                  <button
                    onClick={() => removeNote(note.id)}
                    className="text-[#786f65] hover:text-[#c2410c] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Mobile Calendar Settings */}
      {activeTab === 'calendar' && (
        <div className="p-4 flex flex-col space-y-4">
          {/* Status Header */}
          <div className="p-4 bg-white rounded-3xl border border-[#ece7de] shadow-clean space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#fef2eb] text-[#e06236] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-ink">Kalender-Synchronisation</h2>
                  <p className="text-[10px] text-[#786f65]">Google Kalender & Apple iCloud</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  state.settings?.googleCalendarIcalUrl
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    state.settings?.googleCalendarIcalUrl ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {state.settings?.googleCalendarIcalUrl ? 'Live aktiv' : 'Nicht verknüpft'}
              </span>
            </div>

            <p className="text-xs text-[#554d44] leading-relaxed">
              Verknüpfe deinen Familienkalender. Termine werden alle 15 Minuten automatisch im Hintergrund abgerufen und auf dem Wand-Dashboard unter <b>„Anlässe“</b> angezeigt.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sounds.playTick();
              updateSettings({ googleCalendarIcalUrl: calUrlInput.trim() });
              setCalSavedSuccess(true);
              setTimeout(() => setCalSavedSuccess(false), 3000);
            }}
            className="p-4 bg-white rounded-3xl border border-[#ece7de] space-y-3 shadow-clean"
          >
            <label className="text-xs font-bold text-ink block">
              Kalender-Web-Adresse (iCal / Webcal)
            </label>
            <input
              type="text"
              placeholder="https://... oder webcal://..."
              value={calUrlInput}
              onChange={(e) => setCalUrlInput(e.target.value)}
              className="w-full bg-[#faf8f4] text-xs text-ink px-3.5 py-2.5 rounded-xl border border-[#ece7de] font-mono focus:outline-none focus:ring-1 focus:ring-terracotta"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-terracotta hover:bg-[#c2410c] text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Kalender verknüpfen</span>
              </button>

              {calUrlInput && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTick();
                    setCalUrlInput('');
                    updateSettings({ googleCalendarIcalUrl: '' });
                  }}
                  className="px-3.5 py-3 bg-parchment-100 hover:bg-parchment-200 text-[#786f65] text-xs font-semibold rounded-2xl transition cursor-pointer"
                  title="Link löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {calSavedSuccess && (
              <div className="p-2.5 rounded-2xl bg-[#eef8f2] border border-[#c2e7d0] text-[#15803d] text-xs font-medium text-center flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Kalender gespeichert & sofort synchronisiert! ✨</span>
              </div>
            )}
          </form>

          {/* Quick Step-by-Step Instructions */}
          <div className="p-4 bg-[#fbf9f5] rounded-3xl border border-[#ece7de] space-y-3 text-xs">
            <h3 className="font-bold text-ink flex items-center gap-1.5">
              <span>📖 So erhältst du deinen Kalender-Link:</span>
            </h3>

            {/* Apple Calendar */}
            <div className="p-3 bg-white rounded-2xl border border-[#ece7de] space-y-1">
              <p className="font-bold text-ink text-[11.5px]">🍏 Apple iCloud Kalender (iPhone / Mac):</p>
              <ol className="list-decimal pl-4 space-y-1 text-[#554d44] text-[11px] leading-relaxed">
                <li>Öffne die <b>Kalender</b>-App auf deinem iPhone.</li>
                <li>Tippe unten auf <b>„Kalender“</b>.</li>
                <li>Tippe beim gewünschten Kalender auf das <b>Info-Symbol (ℹ️)</b>.</li>
                <li>Aktiviere <b>„Öffentlicher Kalender“</b>.</li>
                <li>Tippe auf <b>„Link teilen…“</b> und dann auf <b>„Kopieren“</b>.</li>
                <li>Füge den Link oben ein (wir wandeln <code>webcal://</code> automatisch um!).</li>
              </ol>
            </div>

            {/* Google Calendar */}
            <div className="p-3 bg-white rounded-2xl border border-[#ece7de] space-y-1">
              <p className="font-bold text-ink text-[11.5px]">🔵 Google Kalender:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[#554d44] text-[11px] leading-relaxed">
                <li>Öffne Google Kalender im Browser auf dem Computer oder Tablet.</li>
                <li>Klicke oben rechts auf das <b>Zahnrad ⚙️</b> → <b>Einstellungen</b>.</li>
                <li>Wähle links unter <b>„Einstellungen für meine Kalender“</b> deinen Kalender.</li>
                <li>Scrolle nach unten zum Bereich <b>„Kalender integrieren“</b>.</li>
                <li>Kopiere die <b>„Privatadresse im iCal-Format“</b> und füge sie oben ein.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
