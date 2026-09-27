import React, { useState } from 'react';
import { 
  X, Settings, Calendar, Timer, Bookmark, 
  MapPin, Plus, Trash2, RotateCcw, Check, Sparkles, ExternalLink, Upload, Search,
  ShoppingCart, RefreshCw, LogOut
} from 'lucide-react';
import { DashboardSettings, TimerPreset, QuickBookmark, CalendarFeed, DashboardPalette } from '../types';
import { parseIcsContent } from '../utils/wasteParser';
import { sounds } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DashboardSettings;
  onUpdateSettings: (partial: Partial<DashboardSettings>) => void;
  onReset: () => void;
  initialTab?: 'name' | 'widgets' | 'calendar' | 'bring' | 'weather' | 'timers' | 'bookmarks';
}

const PALETTES: Array<{ name: DashboardPalette; colors: string[] }> = [
  { name: 'Salbei', colors: ['#dfe8da', '#f3ded5', '#f4ead0'] },
  { name: 'Terrakotta', colors: ['#e4e1c9', '#eecdbb', '#eadcc4'] },
  { name: 'Nordisch', colors: ['#d9e7e2', '#e2dfee', '#dce5ee'] },
  { name: 'Gewürz', colors: ['#d3e2c1', '#f3c3ab', '#f4d98c'] }
];

const CITY_PRESETS = [
  { name: 'Hamburg', lat: 53.551, lon: 9.993 },
  { name: 'Berlin', lat: 52.52, lon: 13.405 },
  { name: 'München', lat: 48.137, lon: 11.576 },
  { name: 'Köln', lat: 50.937, lon: 6.96 },
  { name: 'Frankfurt', lat: 50.11, lon: 8.682 },
  { name: 'Wien', lat: 48.208, lon: 16.373 }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onReset,
  initialTab = 'name'
}) => {
  const [activeTab, setActiveTab] = useState<'name' | 'widgets' | 'calendar' | 'bring' | 'weather' | 'timers' | 'bookmarks'>(initialTab);
  const [dashboardNameInput, setDashboardNameInput] = useState(settings.dashboardName || 'Cucina Atelier');
  const [calUrlInput, setCalUrlInput] = useState(settings.googleCalendarIcalUrl || '');

  // Multi Calendar Feeds
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');

  // Waste Calendar
  const [wasteUrlInput, setWasteUrlInput] = useState(settings.wasteCalendarUrl || '');
  const [wasteFeedback, setWasteFeedback] = useState<string | null>(null);

  // Weather & Geolocation
  const [searchCityQuery, setSearchCityQuery] = useState('');
  const [citySearchResults, setCitySearchResults] = useState<any[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Bring Shopping
  const [bringEmail, setBringEmail] = useState(settings.bring?.email || '');
  const [bringPassword, setBringPassword] = useState('');
  const [bringLoading, setBringLoading] = useState(false);
  const [bringSyncing, setBringSyncing] = useState(false);
  const [bringError, setBringError] = useState<string | null>(null);
  const [bringSuccess, setBringSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      setCalUrlInput(settings.googleCalendarIcalUrl || '');
      setDashboardNameInput(settings.dashboardName || 'Cucina Atelier');
      setWasteUrlInput(settings.wasteCalendarUrl || '');
      setWasteFeedback(null);
      setSearchCityQuery('');
      setCitySearchResults([]);
      setBringEmail(settings.bring?.email || '');
      setBringPassword('');
      setBringError(null);
      setBringSuccess(null);
    }
  }, [isOpen, initialTab, settings.googleCalendarIcalUrl, settings.dashboardName, settings.wasteCalendarUrl, settings.bring]);

  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetMinutes, setNewPresetMinutes] = useState('5');


  const [newBmTitle, setNewBmTitle] = useState('');
  const [newBmUrl, setNewBmUrl] = useState('');
  const [newBmCategory, setNewBmCategory] = useState('');

  if (!isOpen) return null;

  const toggleWidget = (key: keyof DashboardSettings) => {
    sounds.playTick();
    onUpdateSettings({ [key]: !settings[key] });
  };

  const handleSelectCity = (preset: { name: string; lat: number; lon: number }) => {
    sounds.playTick();
    onUpdateSettings({
      weatherCity: preset.name,
      weatherLat: preset.lat,
      weatherLon: preset.lon
    });
  };

  const handleSaveCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTick();
    onUpdateSettings({ googleCalendarIcalUrl: calUrlInput.trim() });
    alert('Kalender-Adresse gespeichert! Die Termine werden jetzt synchronisiert.');
  };

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedUrl.trim()) return;
    sounds.playTick();
    const currentFeeds = settings.calendarFeeds || [];
    const newFeed: CalendarFeed = {
      id: 'feed_' + Date.now(),
      name: newFeedName.trim() || 'Kalender ' + (currentFeeds.length + 1),
      url: newFeedUrl.trim(),
      enabled: true
    };
    onUpdateSettings({ calendarFeeds: [...currentFeeds, newFeed] });
    setNewFeedName('');
    setNewFeedUrl('');
  };

  const handleToggleFeed = (id: string) => {
    sounds.playTick();
    const currentFeeds = settings.calendarFeeds || [];
    onUpdateSettings({
      calendarFeeds: currentFeeds.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    });
  };

  const handleRemoveFeed = (id: string) => {
    sounds.playTick();
    const currentFeeds = settings.calendarFeeds || [];
    onUpdateSettings({
      calendarFeeds: currentFeeds.filter((f) => f.id !== id)
    });
  };

  const handleWasteFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sounds.playTick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const parsed = parseIcsContent(text);
      if (parsed.length === 0) {
        alert('Keine Termine im iCal-Format in dieser Datei gefunden.');
        return;
      }
      onUpdateSettings({
        wasteCalendarEvents: parsed,
        wasteCalendarName: file.name.replace(/\.ics$/i, '')
      });
      setWasteFeedback(`✓ ${parsed.length} Abholtermine aus „${file.name}“ erfolgreich geladen!`);
    };
    reader.readAsText(file);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Standortbestimmung wird von deinem Browser nicht unterstützt.');
      return;
    }
    setIsLocatingGps(true);
    sounds.playTick();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 1000) / 1000;
        const lon = Math.round(pos.coords.longitude * 1000) / 1000;
        onUpdateSettings({
          weatherCity: 'Mein Standort (GPS)',
          weatherLat: lat,
          weatherLon: lon
        });
        setIsLocatingGps(false);
      },
      () => {
        setIsLocatingGps(false);
        alert('Standort konnte nicht ermittelt werden (Standort-Berechtigung erforderlich).');
      },
      { timeout: 10000 }
    );
  };

  const handleSearchCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCityQuery.trim()) return;
    setIsSearchingCity(true);
    sounds.playTick();
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCityQuery.trim())}&count=5&language=de&format=json`
      );
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        setCitySearchResults(data.results);
      } else {
        setCitySearchResults([]);
      }
    } catch {
      setCitySearchResults([]);
    } finally {
      setIsSearchingCity(false);
    }
  };

  const handleSelectSearchResult = (res: any) => {
    sounds.playTick();
    const displayName = `${res.name}${res.admin1 ? ` (${res.admin1})` : ''}`;
    onUpdateSettings({
      weatherCity: displayName,
      weatherLat: Math.round(res.latitude * 1000) / 1000,
      weatherLon: Math.round(res.longitude * 1000) / 1000
    });
    setCitySearchResults([]);
    setSearchCityQuery('');
  };

  const handleBringLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bringEmail.trim() || !bringPassword.trim()) {
      setBringError('Bitte Bring!-E-Mail und Passwort eingeben.');
      return;
    }
    setBringLoading(true);
    setBringError(null);
    setBringSuccess(null);
    sounds.playTick();
    try {
      const res = await fetch('/api/bring/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: bringEmail.trim(), password: bringPassword.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Anmeldung fehlgeschlagen');
      }

      const activeList = data.lists?.find((l: any) => l.listUuid === data.activeListUuid) || data.lists?.[0];
      const activeListName = activeList ? activeList.name : 'Standard';

      onUpdateSettings({
        bring: {
          enabled: true,
          email: bringEmail.trim(),
          userName: data.userName,
          listUuid: data.activeListUuid,
          listName: activeListName,
          availableLists: data.lists || [],
          autoSync: settings.bring?.autoSync ?? true,
          lastSync: Date.now()
        }
      });
      setBringPassword('');
      setBringSuccess(`Erfolgreich verbunden als ${data.userName}! Liste: "${activeListName}"`);
      sounds.playTick();

      // Trigger background sync
      fetch('/api/bring/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listUuid: data.activeListUuid })
      }).catch(console.warn);
    } catch (err: any) {
      setBringError(err.message || 'Fehler beim Verbinden mit Bring!');
    } finally {
      setBringLoading(false);
    }
  };

  const handleBringDisconnect = () => {
    sounds.playTick();
    onUpdateSettings({
      bring: {
        enabled: false,
        email: '',
        autoSync: false
      }
    });
    fetch('/api/bring/logout', { method: 'POST' }).catch(console.warn);
    setBringEmail('');
    setBringPassword('');
    setBringSuccess('Bring!-Konto getrennt.');
  };

  const handleBringManualSync = async () => {
    const bring = settings.bring;
    if (!bring?.enabled || !bring?.listUuid) return;
    setBringSyncing(true);
    setBringError(null);
    sounds.playTick();
    try {
      const res = await fetch('/api/bring/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listUuid: bring.listUuid })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync fehlgeschlagen');
      setBringSuccess(`✓ ${data.itemsCount} Artikel mit Bring! synchronisiert.`);
    } catch (e: any) {
      setBringError(e.message || 'Synchronisation fehlgeschlagen');
    } finally {
      setBringSyncing(false);
    }
  };

  const handleSelectBringList = (listUuid: string) => {
    const target = settings.bring?.availableLists?.find((l) => l.listUuid === listUuid);
    if (!target || !settings.bring) return;
    sounds.playTick();
    onUpdateSettings({
      bring: {
        ...settings.bring,
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

  const handleAddTimerPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetLabel.trim()) return;
    const mins = parseFloat(newPresetMinutes) || 5;
    const newPreset: TimerPreset = {
      id: 'custom_' + Date.now(),
      label: newPresetLabel.trim(),
      seconds: Math.round(mins * 60),
      iconName: 'Timer'
    };
    onUpdateSettings({
      customTimerPresets: [...settings.customTimerPresets, newPreset]
    });
    setNewPresetLabel('');
    sounds.playTick();
  };

  const handleRemoveTimerPreset = (id: string) => {
    sounds.playTick();
    onUpdateSettings({
      customTimerPresets: settings.customTimerPresets.filter((p) => p.id !== id)
    });
  };

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBmTitle.trim() || !newBmUrl.trim()) return;
    const newBm: QuickBookmark = {
      id: 'bm_' + Date.now(),
      title: newBmTitle.trim(),
      url: newBmUrl.startsWith('http') ? newBmUrl.trim() : `https://${newBmUrl.trim()}`,
      category: newBmCategory.trim() || 'Kochen'
    };
    onUpdateSettings({
      customBookmarks: [...settings.customBookmarks, newBm]
    });
    setNewBmTitle('');
    setNewBmUrl('');
    setNewBmCategory('');
    sounds.playTick();
  };

  const handleRemoveBookmark = (id: string) => {
    sounds.playTick();
    onUpdateSettings({
      customBookmarks: settings.customBookmarks.filter((b) => b.id !== id)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl bg-white border border-[#ece7de] rounded-[32px] p-6 shadow-clean-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#ece7de]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#fef2eb] border border-[#fbdcd0] flex items-center justify-center text-[#e06236]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#221e1a]">Dashboard bearbeiten & anpassen</h2>
              <p className="text-xs text-[#786f65]">Personalisiere dein iPad-Küchen-Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playTick();
              onClose();
            }}
            className="p-2 rounded-full bg-[#f4efe8] hover:bg-[#ece7de] text-[#786f65] hover:text-[#221e1a] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-b border-[#ece7de] py-2.5 my-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('name')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'name'
                ? 'bg-terracotta text-white shadow-sm'
                : 'text-[#786f65] hover:text-[#221e1a]'
            }`}
          >
            Titel &amp; Name
          </button>
          <button
            onClick={() => setActiveTab('widgets')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'widgets'
                ? 'bg-terracotta text-white shadow-sm'
                : 'text-[#786f65] hover:text-[#221e1a]'
            }`}
          >
            Kacheln an/aus
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'calendar'
                ? 'bg-[#e06236] text-white shadow-sm'
                : 'text-[#786f65] hover:text-[#221e1a]'
            }`}
          >
            Kalender (Google &amp; Apple)
          </button>
          <button
            onClick={() => setActiveTab('bring')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 ${
              activeTab === 'bring'
                ? 'bg-[#e06236] text-white shadow-sm'
                : 'text-[#786f65] hover:text-[#221e1a]'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Bring! App</span>
            {settings.bring?.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'weather'
                ? 'bg-[#e06236] text-white shadow-sm'
                : 'text-[#786f65] hover:text-[#221e1a]'
            }`}
          >
            Wetter &amp; Stadt
          </button>
          <button
            onClick={() => setActiveTab('timers')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'timers'
                ? 'bg-[#e06236] text-white shadow-sm'
                : 'text-[#786f65] hover:text-[#221e1a]'
            }`}
          >
            Timer-Vorlagen
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'bookmarks'
                ? 'bg-[#e06236] text-white shadow-sm'
                : 'text-[#786f65] hover:text-[#221e1a]'
            }`}
          >
            Rezept-Links
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 my-2 space-y-4 scrollbar-thin">
          {/* Tab 0: Dashboard Name & Suggestions */}
          {activeTab === 'name' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">Farbpalette</label>
                <div className="grid grid-cols-4 gap-2">
                  {PALETTES.map((p) => {
                    const active = (settings.palette || 'Salbei') === p.name;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          sounds.playTick();
                          onUpdateSettings({ palette: p.name });
                        }}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          active ? 'border-terracotta ring-1 ring-terracotta/40 bg-white' : 'border-parchment-300 bg-white hover:bg-parchment-50'
                        }`}
                      >
                        <div className="flex gap-1 mb-1.5">
                          {p.colors.map((c) => (
                            <span key={c} className="w-4 h-4 rounded-full border border-black/5" style={{ background: c }} />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-ink">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  Name des Küchen-Dashboards
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dashboardNameInput}
                    onChange={(e) => setDashboardNameInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-white border border-parchment-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-terracotta font-serif font-bold"
                    placeholder="z.B. Cucina Atelier"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTick();
                      onUpdateSettings({ dashboardName: dashboardNameInput.trim() });
                    }}
                    className="px-4 py-2 bg-terracotta text-white font-semibold text-xs rounded-xl hover:bg-terracotta-dark transition-colors shadow-xs"
                  >
                    Speichern
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-[#786f65] block mb-2">
                  ✨ Inspirierende Namensvorschläge (Klick zum Auswählen):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Cucina Atelier', style: 'Atelier & Handwerk (Italienisch)' },
                    { name: 'Bottega Cucina', style: 'Traditionelle Feinkost-Werkstatt' },
                    { name: 'Tavola & Co.', style: 'Familiäre Essenstafel & Genuss' },
                    { name: 'Casa & Cucina', style: 'Haus & Herd Gemütlichkeit' },
                    { name: 'Das Küchenjournal', style: 'Klassischer Magazin-Look' },
                    { name: 'Speisekammer & Herd', style: 'Bodenständig, warm & edel' },
                    { name: 'Almanach Culinaire', style: 'Französischer Bistro-Flair' },
                    { name: 'Atelier Zuhause', style: 'Persönlich & Familiär' },
                    { name: 'Kombüse & Kalender', style: 'Charmant mit Humor' },
                    { name: 'Heimathafen Küche', style: 'Zentraler Familienanker' },
                  ].map((sug) => (
                    <button
                      key={sug.name}
                      type="button"
                      onClick={() => {
                        sounds.playTick();
                        setDashboardNameInput(sug.name);
                        onUpdateSettings({ dashboardName: sug.name });
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        (settings.dashboardName || 'Cucina Atelier') === sug.name
                          ? 'border-terracotta bg-terracotta-soft text-ink font-bold ring-1 ring-terracotta/40'
                          : 'border-parchment-300 bg-white hover:bg-parchment-50 text-ink'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-sm text-ink">{sug.name}</span>
                        {(settings.dashboardName || 'Cucina Atelier') === sug.name && (
                          <span className="text-xs text-terracotta font-bold">✓</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#786f65] block mt-0.5">{sug.style}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 1: Widgets Toggle */}
          {activeTab === 'widgets' && (
            <div className="space-y-2">
              <p className="text-xs text-[#786f65] mb-3">
                Wähle, welche Kacheln auf dem iPad-Dashboard angezeigt werden sollen:
              </p>
              {[
                { key: 'showMealPlan', title: 'Wochen-Essensplan mit Food-Fotos' },
                { key: 'showCalendar', title: 'Familien-Kalender (Google & iPad)' },
                { key: 'showWeather', title: 'Live-Wetter & 5-Tage-Vorhersage' },
                { key: 'showTimers', title: 'Multi-Küchen-Timer & Presets' },
                { key: 'showShopping', title: 'Einkaufsliste (Sync mit iPhone)' },
                { key: 'showNotes', title: 'Familien-Pinnwand & Notizen' },
                { key: 'showConverter', title: 'Küchen-Umrechner (Cups, Ofen, Portionen)' },
                { key: 'showBookmarks', title: 'Rezept-Schnell-Lesezeichen' }
              ].map((w) => {
                const isVisible = settings[w.key as keyof DashboardSettings] as boolean;
                return (
                  <div
                    key={w.key}
                    onClick={() => toggleWidget(w.key as keyof DashboardSettings)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition select-none ${
                      isVisible
                        ? 'bg-[#fef2eb] border-[#fbdcd0] text-[#221e1a]'
                        : 'bg-[#faf8f4] border-[#ece7de] text-[#786f65]'
                    }`}
                  >
                    <span className="text-xs font-semibold">{w.title}</span>
                    <div
                      className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                        isVisible ? 'bg-[#e06236] justify-end' : 'bg-stone-300 justify-start'
                      }`}
                    >
                      <div className="bg-white w-4 h-4 rounded-full shadow-sm transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Multi-Calendar & Müllabfuhr Integration */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              {/* SECTION A: MULTI-KALENDER */}
              <div className="p-4 bg-white rounded-2xl border border-parchment-300 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-ink flex items-center gap-1.5">
                    <span>📅</span>
                    <span>Verknüpfte Kalender (Google &amp; Apple)</span>
                  </h4>
                  <span className="text-[11px] text-[#786f65]">
                    {(settings.calendarFeeds || []).length} aktiv
                  </span>
                </div>

                <p className="text-xs text-[#554d44]">
                  Füge beliebig viele Kalender hinzu (z. B. Familie, Arbeit, Schule, Sport). Termine werden zusammengeführt und im Dashboard unter <b>„Anlässe“</b> angezeigt.
                </p>

                {/* List of existing feeds */}
                <div className="space-y-2">
                  {(settings.calendarFeeds || []).map((feed) => (
                    <div
                      key={feed.id}
                      className="p-3 bg-parchment-50 rounded-xl border border-parchment-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleFeed(feed.id)}
                          className={`w-3.5 h-3.5 rounded-full shrink-0 transition-colors ${
                            feed.enabled ? 'bg-emerald-600' : 'bg-stone-300'
                          }`}
                          title={feed.enabled ? 'Aktiv (Klick zum Pausieren)' : 'Pausiert'}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-ink block truncate">{feed.name}</span>
                          <span className="text-[10px] text-[#786f65] font-mono truncate block">
                            {feed.url}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeed(feed.id)}
                        className="text-[#786f65] hover:text-[#c2410c] p-1 transition-colors cursor-pointer"
                        title="Kalender entfernen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new feed form */}
                <form onSubmit={handleAddFeed} className="pt-2 border-t border-parchment-200 flex flex-col gap-2">
                  <span className="text-xs font-bold text-ink block">+ Weiteren Kalender hinzufügen</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Name (z.B. Familie)"
                      value={newFeedName}
                      onChange={(e) => setNewFeedName(e.target.value)}
                      className="bg-[#faf8f4] text-xs text-ink px-3 py-2 rounded-xl border border-parchment-300"
                    />
                    <input
                      type="text"
                      placeholder="iCal / Webcal URL (https://... oder webcal://...)"
                      value={newFeedUrl}
                      onChange={(e) => setNewFeedUrl(e.target.value)}
                      className="col-span-2 bg-[#faf8f4] text-xs text-ink px-3 py-2 rounded-xl border border-parchment-300 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newFeedUrl.trim()}
                    className="self-end px-4 py-2 bg-terracotta hover:bg-terracotta-dark disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                  >
                    Kalender hinzufügen
                  </button>
                </form>
              </div>

              {/* SECTION B: MÜLLABFUHR KALENDER & ICS UPLOAD */}
              <div className="p-4 bg-white rounded-2xl border border-parchment-300 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-ink flex items-center gap-1.5">
                    <span>🗑️</span>
                    <span>Müllabfuhr-Kalender (.ics-Datei oder Weblink)</span>
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      (settings.wasteCalendarEvents || []).length > 0
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {(settings.wasteCalendarEvents || []).length > 0
                      ? `${settings.wasteCalendarEvents?.length} Termine aktiv`
                      : 'Standard-Zyklus'}
                  </span>
                </div>

                <p className="text-xs text-[#554d44]">
                  Lade die offizielle <b>.ics-Abfallkalender-Datei</b> deiner Gemeinde bzw. deines Landkreises hoch (meist auf der Webseite des Abfallentsorgers zu finden). Das Dashboard ordnet automatisch Restmüll, Biotonne, Gelber Sack und Altpapier mit exakten Abholterminen zu!
                </p>

                {/* File Upload Dropzone */}
                <div className="p-4 bg-parchment-50 rounded-xl border border-dashed border-parchment-300 flex flex-col items-center justify-center text-center gap-2">
                  <Upload className="w-6 h-6 text-terracotta" />
                  <div>
                    <label className="text-xs font-bold text-ink cursor-pointer hover:underline block">
                      Klicke hier, um deine .ics-Datei auszuwählen
                      <input
                        type="file"
                        accept=".ics,text/calendar"
                        onChange={handleWasteFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-[#786f65]">
                      Unterstützt alle Standard-Abfallkalender (Landkreise, Städte, Entsorger)
                    </span>
                  </div>
                </div>

                {wasteFeedback && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center">
                    {wasteFeedback}
                  </div>
                )}

                {(settings.wasteCalendarEvents || []).length > 0 && (
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[#786f65]">
                      Aktive Datei: <b>{settings.wasteCalendarName || 'Abfallkalender'}</b>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playTick();
                        onUpdateSettings({
                          wasteCalendarEvents: [],
                          wasteCalendarName: ''
                        });
                        setWasteFeedback(null);
                      }}
                      className="text-xs font-bold text-terracotta hover:underline cursor-pointer"
                    >
                      Zurücksetzen auf Standard-Zyklus
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Bring! App Integration */}
          {activeTab === 'bring' && (
            <div className="space-y-4">
              {/* Bring Header / Status Card */}
              <div className="p-4 bg-[#f8f5ee] rounded-2xl border border-[#ece7de] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#2ecc71]/10 text-[#27ae60] flex items-center justify-center font-bold">
                      🛒
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#221e1a]">Bring! Einkaufsliste</h3>
                      <p className="text-xs text-[#786f65]">Automatischer 2-Wege-Sync mit deiner Bring!-App</p>
                    </div>
                  </div>
                  {settings.bring?.enabled ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ● Verbunden
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#ece7de] text-[#786f65]">
                      Nicht verbunden
                    </span>
                  )}
                </div>

                {settings.bring?.enabled ? (
                  <div className="pt-2 border-t border-[#ece7de] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                      <div>
                        <span className="text-[#786f65]">Konto: </span>
                        <span className="font-bold text-[#221e1a]">{settings.bring.userName || settings.bring.email}</span>
                      </div>
                      {settings.bring.lastSync && (
                        <span className="text-[#786f65]">
                          Letzter Sync: {new Date(settings.bring.lastSync).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                        </span>
                      )}
                    </div>

                    {/* List Selection */}
                    {settings.bring.availableLists && settings.bring.availableLists.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#221e1a]">Aktive Bring!-Liste:</label>
                        <div className="flex flex-wrap gap-2">
                          {settings.bring.availableLists.map((l) => (
                            <button
                              key={l.listUuid}
                              type="button"
                              onClick={() => handleSelectBringList(l.listUuid)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                                settings.bring?.listUuid === l.listUuid
                                  ? 'bg-[#e06236] text-white shadow-sm'
                                  : 'bg-white border border-[#ece7de] text-[#221e1a] hover:bg-[#f4efe8]'
                              }`}
                            >
                              <span>{l.name}</span>
                              {settings.bring?.listUuid === l.listUuid && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Auto Sync Toggle */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-[#221e1a] font-medium">Hintergrund-Synchronisation (alle 5 Min.):</span>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playTick();
                          onUpdateSettings({
                            bring: {
                              ...settings.bring!,
                              autoSync: !settings.bring!.autoSync
                            }
                          });
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          settings.bring.autoSync ? 'bg-[#2ecc71]' : 'bg-[#ece7de]'
                        }`}
                      >
                        <span
                          className={`block w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                            settings.bring.autoSync ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={handleBringManualSync}
                        disabled={bringSyncing}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#ece7de] text-xs font-bold text-[#221e1a] hover:bg-[#f4efe8] flex items-center justify-center space-x-1.5 shadow-2xs transition disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${bringSyncing ? 'animate-spin text-[#e06236]' : ''}`} />
                        <span>{bringSyncing ? 'Synchronisiere …' : 'Jetzt synchronisieren'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleBringDisconnect}
                        className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Trennen</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Login Form */
                  <form onSubmit={handleBringLogin} className="pt-2 border-t border-[#ece7de] space-y-3">
                    <p className="text-xs text-[#786f65] leading-relaxed">
                      Melde dich mit deinen Bring!-Zugangsdaten an. Alle Artikel werden fortan automatisch zwischen Dashboard, iPhone und deiner Bring!-App synchronisiert.
                    </p>

                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                      <p className="font-bold flex items-center space-x-1">
                        <span>💡 Nutzt du Bring! über Apple ID oder Google?</span>
                      </p>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        Falls du noch kein separates Passwort hast: Öffne die <b>Bring!-App</b> auf deinem Smartphone &rarr; <b>Profil / Einstellungen ⚙️</b> &rarr; <b>Konto</b> &rarr; <b>Passwort festlegen</b>. Danach kannst du dich hier mit deiner E-Mail und dem Passwort einloggen.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-bold text-[#221e1a] mb-1">Bring! E-Mail-Adresse:</label>
                        <input
                          type="email"
                          value={bringEmail}
                          onChange={(e) => setBringEmail(e.target.value)}
                          placeholder="deine-email@beispiel.de"
                          required
                          className="w-full px-3 py-2 text-xs bg-white border border-[#ece7de] rounded-xl text-[#221e1a] focus:outline-none focus:border-[#e06236]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#221e1a] mb-1">Bring! Passwort:</label>
                        <input
                          type="password"
                          value={bringPassword}
                          onChange={(e) => setBringPassword(e.target.value)}
                          placeholder="••••••••••••"
                          required
                          className="w-full px-3 py-2 text-xs bg-white border border-[#ece7de] rounded-xl text-[#221e1a] focus:outline-none focus:border-[#e06236]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={bringLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#e06236] text-white text-xs font-bold hover:bg-[#c8532b] flex items-center justify-center space-x-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
                    >
                      {bringLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verbinde mit Bring! …</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Mit Bring! verbinden</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Feedback messages */}
                {bringError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                    ⚠️ {bringError}
                  </div>
                )}
                {bringSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                    {bringSuccess}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Weather & City (GPS & Geocoding Search) */}
          {activeTab === 'weather' && (
            <div className="space-y-4">
              {/* GPS Button */}
              <div className="p-4 bg-white rounded-2xl border border-parchment-300 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">📍 Automatische Standortbestimmung:</span>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocatingGps}
                    className="px-3.5 py-1.5 bg-terracotta-soft text-terracotta hover:bg-terracotta hover:text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isLocatingGps ? 'Ermittle GPS…' : 'Meinen Standort erkennen (GPS)'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#786f65]">
                  Nutzt den aktuellen GPS-Standort deines iPads oder Browsers für präzises Wetter.
                </p>
              </div>

              {/* City Search Form */}
              <div className="p-4 bg-white rounded-2xl border border-parchment-300 space-y-2 shadow-2xs">
                <label className="text-xs font-bold text-ink block">
                  🔍 Beliebige Stadt / Gemeinde suchen:
                </label>
                <form onSubmit={handleSearchCity} className="flex gap-2">
                  <input
                    type="text"
                    value={searchCityQuery}
                    onChange={(e) => setSearchCityQuery(e.target.value)}
                    placeholder="z.B. Hamburg, München, Köln …"
                    className="flex-1 bg-[#faf8f4] text-xs text-ink px-3 py-2 rounded-xl border border-parchment-300"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingCity || !searchCityQuery.trim()}
                    className="px-4 py-2 bg-terracotta hover:bg-terracotta-dark disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    {isSearchingCity ? 'Sucht…' : 'Suchen'}
                  </button>
                </form>

                {/* Search Results Dropdown */}
                {citySearchResults.length > 0 && (
                  <div className="mt-2 divide-y divide-parchment-200 border border-parchment-300 rounded-xl overflow-hidden bg-white shadow-sm">
                    {citySearchResults.map((res: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSearchResult(res)}
                        className="w-full text-left p-2.5 hover:bg-parchment-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-ink">{res.name}</span>
                          <span className="text-[10px] text-[#786f65] ml-2">
                            {res.admin1 ? `${res.admin1}, ` : ''}{res.country}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-terracotta font-semibold">
                          {Math.round(res.latitude * 100) / 100}°, {Math.round(res.longitude * 100) / 100}°
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Presets */}
              <div>
                <label className="text-xs font-bold text-ink block mb-2">
                  Schnellauswahl regionaler Orte
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CITY_PRESETS.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleSelectCity(city)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        settings.weatherCity === city.name
                          ? 'bg-terracotta text-white border-terracotta shadow-xs'
                          : 'bg-white border-parchment-300 text-ink hover:bg-parchment-50'
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current active coordinates */}
              <div className="p-3 bg-parchment-50 rounded-xl border border-parchment-200 text-xs flex items-center justify-between">
                <span className="text-[#786f65]">
                  Aktiv: <b>{settings.weatherCity}</b> ({settings.weatherLat}°, {settings.weatherLon}°)
                </span>
                <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Open-Meteo Live
                </span>
              </div>
            </div>
          )}

          {/* Tab 4: Timer Presets */}
          {activeTab === 'timers' && (
            <div className="space-y-3">
              <form onSubmit={handleAddTimerPreset} className="p-3.5 rounded-2xl bg-[#faf8f4] border border-[#ece7de] flex gap-2">
                <input
                  type="text"
                  placeholder="Name (z.B. Espresso)"
                  value={newPresetLabel}
                  onChange={(e) => setNewPresetLabel(e.target.value)}
                  className="flex-1 bg-white text-xs text-[#221e1a] px-3 py-2 rounded-xl border border-[#ece7de]"
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Minuten"
                  value={newPresetMinutes}
                  onChange={(e) => setNewPresetMinutes(e.target.value)}
                  className="w-20 bg-white text-xs text-[#221e1a] px-2 py-2 rounded-xl border border-[#ece7de] text-center"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e06236] hover:bg-[#c2410c] text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  Hinzufügen
                </button>
              </form>

              <div className="space-y-1.5">
                {settings.customTimerPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8f4] border border-[#ece7de] text-xs"
                  >
                    <span className="text-[#221e1a] font-medium">{preset.label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#786f65] font-mono">{Math.round(preset.seconds / 60)} Min</span>
                      <button
                        onClick={() => handleRemoveTimerPreset(preset.id)}
                        className="text-[#786f65] hover:text-[#c2410c] p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 6: Bookmarks */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-3">
              <form onSubmit={handleAddBookmark} className="p-3.5 rounded-2xl bg-[#faf8f4] border border-[#ece7de] space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Titel (z.B. Chefkoch)"
                    value={newBmTitle}
                    onChange={(e) => setNewBmTitle(e.target.value)}
                    className="bg-white text-xs text-[#221e1a] px-3 py-2 rounded-xl border border-[#ece7de]"
                  />
                  <input
                    type="text"
                    placeholder="Kategorie (z.B. Backen)"
                    value={newBmCategory}
                    onChange={(e) => setNewBmCategory(e.target.value)}
                    className="bg-white text-xs text-[#221e1a] px-3 py-2 rounded-xl border border-[#ece7de]"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL (z.B. https://chefkoch.de)"
                    value={newBmUrl}
                    onChange={(e) => setNewBmUrl(e.target.value)}
                    className="flex-1 bg-white text-xs text-[#221e1a] px-3 py-2 rounded-xl border border-[#ece7de]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#e06236] hover:bg-[#c2410c] text-white font-bold rounded-xl text-xs shadow-sm"
                  >
                    Hinzufügen
                  </button>
                </div>
              </form>

              <div className="space-y-1.5">
                {settings.customBookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8f4] border border-[#ece7de] text-xs"
                  >
                    <div>
                      <span className="text-[#221e1a] font-medium block">{bm.title}</span>
                      <span className="text-[10px] text-[#786f65]">{bm.url}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveBookmark(bm.id)}
                      className="text-[#786f65] hover:text-[#c2410c] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#ece7de] flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Möchtest du alle Einstellungen und Vorlagen auf die Standardwerte zurücksetzen?')) {
                onReset();
              }
            }}
            className="text-xs text-[#786f65] hover:text-[#c2410c] flex items-center space-x-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zurücksetzen</span>
          </button>
          <button
            onClick={() => {
              sounds.playTick();
              onClose();
            }}
            className="px-6 py-2 bg-[#e06236] hover:bg-[#c2410c] text-white font-bold rounded-xl text-xs transition shadow-sm"
          >
            Fertig ✨
          </button>
        </div>
      </div>
    </div>
  );
};
