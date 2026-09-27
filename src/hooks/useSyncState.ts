import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, ShoppingItem, KitchenNote, DashboardSettings, ShoppingCategory, NoteColor, MealItem, MealType, SingleMeal } from '../types';
import { INITIAL_STATE, normalizeMealItem } from '../utils/defaults';
import { parseISODate, formatISODate, getISOWeek } from '../utils/dateUtils';
import { parseIngredient, categorizeIngredient, ingredientKey } from '../utils/ingredients';

const STORAGE_KEY = 'kitchen_wall_app_state_v1';
const UNSYNCED_KEY = 'kitchen_wall_unsynced_v1';

function isUnsynced(): boolean {
  try {
    return localStorage.getItem(UNSYNCED_KEY) === '1';
  } catch {
    return false;
  }
}

function setUnsynced(flag: boolean) {
  try {
    if (flag) localStorage.setItem(UNSYNCED_KEY, '1');
    else localStorage.removeItem(UNSYNCED_KEY);
  } catch {}
}

export function mergeState(saved: any): AppState {
  if (!saved || typeof saved !== 'object') return INITIAL_STATE;
  return {
    ...INITIAL_STATE,
    ...saved,
    shoppingList: Array.isArray(saved.shoppingList) ? saved.shoppingList : INITIAL_STATE.shoppingList,
    notes: Array.isArray(saved.notes) ? saved.notes : INITIAL_STATE.notes,
    mealPlan: Array.isArray(saved.mealPlan) ? saved.mealPlan.map(normalizeMealItem) : INITIAL_STATE.mealPlan,
    customCalendarEvents: Array.isArray(saved.customCalendarEvents) ? saved.customCalendarEvents : INITIAL_STATE.customCalendarEvents,
    settings: {
      ...INITIAL_STATE.settings,
      ...(saved.settings || {}),
      calendarFeeds: Array.isArray(saved.settings?.calendarFeeds)
        ? saved.settings.calendarFeeds
        : (saved.settings?.googleCalendarIcalUrl
            ? [{ id: 'feed_default', name: 'Hauptkalender', url: saved.settings.googleCalendarIcalUrl, enabled: true }]
            : []),
      wasteCalendarEvents: Array.isArray(saved.settings?.wasteCalendarEvents)
        ? saved.settings.wasteCalendarEvents
        : [],
      bring: saved.settings?.bring || INITIAL_STATE.settings.bring
    }
  };
}

/**
 * Resolves a MealItem for a specific date (YYYY-MM-DD).
 * 1. Checks exact match by date.
 * 2. If viewing current week and no exact match, falls back to default template.
 * 3. Otherwise returns a clean empty MealItem structure for that date.
 */
export function getMealItemForDate(mealPlan: MealItem[], dateStr: string): MealItem {
  const exact = mealPlan?.find((m) => m.date === dateStr);
  if (exact) return exact;

  const d = parseISODate(dateStr);
  const dayKeys: Array<'so' | 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa'> = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'];
  const dayLabels = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const dayIdx = d.getDay();
  const dayKey = dayKeys[dayIdx];
  const dayLabel = dayLabels[dayIdx];
  const { weekNumber, year } = getISOWeek(d);
  const weekKey = `${year}-W${String(weekNumber).padStart(2, '0')}`;

  // Fallback to template if in current week
  const today = new Date();
  const currentWeek = getISOWeek(today);
  if (currentWeek.weekNumber === weekNumber && currentWeek.year === year) {
    const template = mealPlan?.find((m) => m.day === dayKey && !m.date);
    if (template) {
      return {
        ...template,
        date: dateStr,
        weekKey
      };
    }
  }

  return {
    id: 'meal_' + dateStr,
    date: dateStr,
    weekKey,
    day: dayKey as any,
    dayLabel,
    meals: {}
  };
}

export function useSyncState() {
  const [state, setStateRaw] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return mergeState(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not parse saved state from localStorage', e);
    }
    return INITIAL_STATE;
  });

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [companionUrl, setCompanionUrl] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  // Always holds the latest state, so action helpers never read a stale closure
  const stateRef = useRef<AppState>(state);

  // Apply a state locally (React + localStorage) without sending it anywhere
  const applyLocalState = useCallback((next: AppState) => {
    stateRef.current = next;
    setStateRaw(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }, []);

  // Deliver a state to the server: WebSocket if open, otherwise HTTP POST.
  // Until the server has it, the state is flagged as unsynced in localStorage so
  // it is re-sent after a reload or reconnect instead of being overwritten.
  const pushToServer = useCallback((next: AppState) => {
    setUnsynced(true);
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'UPDATE_STATE', payload: next }));
      setUnsynced(false);
      return;
    }
    fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next)
    })
      .then((res) => {
        if (res.ok && stateRef.current === next) setUnsynced(false);
        if (!res.ok) console.warn('Server could not save state:', res.status);
      })
      .catch((e) => console.warn('State not yet saved on server (offline?):', e));
  }, []);

  // Sync state helper to update locally and inform server/broadcast
  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    const next = { ...updater(stateRef.current), lastUpdated: Date.now() };
    applyLocalState(next);
    pushToServer(next);

    // Broadcast to other tabs/windows in same browser
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'STATE_UPDATE', payload: next });
    }
  }, [applyLocalState, pushToServer]);

  // Accept a state coming from the server, unless we still hold unsynced local edits
  const receiveServerState = useCallback((serverState: any) => {
    if (!serverState || !(serverState.shoppingList || serverState.settings)) return;
    if (isUnsynced()) {
      pushToServer(stateRef.current);
      return;
    }
    applyLocalState(mergeState(serverState));
  }, [applyLocalState, pushToServer]);

  // Fetch initial server state and companion info
  useEffect(() => {
    fetch('/api/state')
      .then((res) => res.json())
      .then(receiveServerState)
      .catch((e) => console.warn('Could not fetch state from server:', e));

    fetch('/api/info')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.companionUrl) {
          setCompanionUrl(data.companionUrl);
        }
      })
      .catch(() => {
        // Fallback: Use current host
        setCompanionUrl(`${window.location.origin}/companion`);
      });
  }, [receiveServerState]);

  // Initialize WebSocket and BroadcastChannel
  useEffect(() => {
    // BroadcastChannel for same-device tabs
    try {
      const bc = new BroadcastChannel('kitchen_wall_sync');
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
        if (event.data?.type === 'STATE_UPDATE' && event.data.payload) {
          const merged = mergeState(event.data.payload);
          stateRef.current = merged;
          setStateRaw(merged);
        }
      };
    } catch {
      // BroadcastChannel not supported in older browsers
    }

    // Connect WebSocket on the same host/port the page was served from.
    // In dev mode (vite on 5173) the /ws path is proxied to the backend.
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;

    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let disposed = false;

    function connect() {
      if (disposed) return;
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          if (isUnsynced()) {
            // We have edits the server never received: send them first
            ws.send(JSON.stringify({ type: 'UPDATE_STATE', payload: stateRef.current }));
            setUnsynced(false);
          } else {
            ws.send(JSON.stringify({ type: 'REQUEST_STATE' }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'SYNC_STATE' && msg.payload) {
              receiveServerState(msg.payload);
            }
          } catch (e) {
            console.warn('Error parsing incoming sync state:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Try reconnecting every 3 seconds
          if (!disposed) reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        setIsConnected(false);
      }
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [receiveServerState]);

  // Retry unsynced edits periodically (e.g. server was briefly down)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isUnsynced()) pushToServer(stateRef.current);
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [pushToServer]);

  // Bring! background action helper
  const pushBringAction = useCallback(async (action: 'save' | 'check' | 'remove', itemName: string, specification: string = '') => {
    const bring = stateRef.current.settings.bring;
    if (!bring?.enabled || !bring?.listUuid || !itemName) return;
    try {
      fetch('/api/bring/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          listUuid: bring.listUuid,
          itemName,
          specification
        })
      }).catch((err) => console.warn('Bring action sync warning:', err));
    } catch {
      // ignore
    }
  }, []);

  // Bring! manual or automated fetch & sync
  const syncBring = useCallback(async () => {
    const bring = stateRef.current.settings.bring;
    if (!bring?.enabled || !bring?.listUuid) return { success: false, error: 'Bring nicht aktiviert' };
    try {
      const res = await fetch('/api/bring/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listUuid: bring.listUuid })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.shoppingList) {
          updateState((prev) => ({
            ...prev,
            shoppingList: data.shoppingList,
            settings: {
              ...prev.settings,
              bring: {
                ...prev.settings.bring!,
                lastSync: data.lastSync
              }
            }
          }));
        }
        return { success: true, count: data.itemsCount };
      } else {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, error: errJson.error || 'Sync fehlgeschlagen' };
      }
    } catch (e: any) {
      console.error('Bring sync error:', e);
      return { success: false, error: e.message || 'Verbindungsfehler' };
    }
  }, [updateState]);

  // Auto-sync Bring every 15 minutes if enabled
  useEffect(() => {
    const bring = state.settings.bring;
    if (!bring?.enabled || !bring?.listUuid || !bring?.autoSync) return;

    // Initial sync after 2 seconds
    const initialTimer = setTimeout(() => {
      syncBring();
    }, 2000);

    // Auto-sync every 15 minutes to be conservative and prevent rate-limiting
    const interval = setInterval(() => {
      syncBring();
    }, 15 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [state.settings.bring?.enabled, state.settings.bring?.listUuid, state.settings.bring?.autoSync, syncBring]);

  // Action Helpers
  const addShoppingItem = useCallback((name: string, amount: string = '', category: ShoppingCategory = 'sonstiges') => {
    if (!name.trim()) return;
    const cleanName = name.trim();
    const cleanAmount = amount.trim();
    const newItem: ShoppingItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: cleanName,
      amount: cleanAmount,
      category,
      checked: false,
      createdAt: Date.now()
    };
    updateState((prev) => ({
      ...prev,
      shoppingList: [newItem, ...prev.shoppingList]
    }));
    pushBringAction('save', cleanName, cleanAmount);
  }, [updateState, pushBringAction]);

  const toggleShoppingItem = useCallback((id: string) => {
    const targetItem = stateRef.current.shoppingList.find((i) => i.id === id);
    updateState((prev) => {
      return {
        ...prev,
        shoppingList: prev.shoppingList.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        )
      };
    });
    if (targetItem) {
      if (!targetItem.checked) {
        pushBringAction('check', targetItem.name);
      } else {
        pushBringAction('save', targetItem.name, targetItem.amount || '');
      }
    }
  }, [updateState, pushBringAction]);

  const removeShoppingItem = useCallback((id: string) => {
    const targetItem = stateRef.current.shoppingList.find((i) => i.id === id);
    updateState((prev) => {
      return {
        ...prev,
        shoppingList: prev.shoppingList.filter((item) => item.id !== id)
      };
    });
    if (targetItem) {
      pushBringAction('remove', targetItem.name);
    }
  }, [updateState, pushBringAction]);

  const clearCheckedShopping = useCallback(() => {
    const checkedItems = stateRef.current.shoppingList.filter((item) => item.checked);
    updateState((prev) => {
      return {
        ...prev,
        shoppingList: prev.shoppingList.filter((item) => !item.checked)
      };
    });
    checkedItems.forEach((item) => {
      pushBringAction('remove', item.name);
    });
  }, [updateState, pushBringAction]);

  const addNote = useCallback((text: string, author: string = 'Küche', color: NoteColor = 'amber') => {
    if (!text.trim()) return;
    const newNote: KitchenNote = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      text: text.trim(),
      author: author.trim() || 'Küche',
      color,
      createdAt: Date.now()
    };
    updateState((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes]
    }));
  }, [updateState]);

  const removeNote = useCallback((id: string) => {
    updateState((prev) => ({
      ...prev,
      notes: prev.notes.filter((note) => note.id !== id)
    }));
  }, [updateState]);

  /**
   * Puts a dish's ingredients on the shopping list (and into Bring! when connected).
   * Items already open on the list are skipped, ticked-off ones are re-opened.
   * Returns how many items were added or re-opened.
   */
  const addMealIngredientsToShopping = useCallback((mealOrIngredients: string[] | { ingredients?: string[] }) => {
    const rawList = Array.isArray(mealOrIngredients) ? mealOrIngredients : mealOrIngredients?.ingredients || [];
    const current = stateRef.current.shoppingList;
    const byKey = new Map(current.map((item) => [ingredientKey(item.name), item]));
    const newItems: ShoppingItem[] = [];
    const reopened: ShoppingItem[] = [];

    for (const raw of rawList) {
      const { name, amount } = parseIngredient(raw);
      if (!name) continue;
      const key = ingredientKey(name);
      const existing = byKey.get(key);
      if (existing) {
        if (existing.checked && !reopened.includes(existing)) reopened.push(existing);
        continue;
      }
      const item: ShoppingItem = {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name,
        amount,
        category: categorizeIngredient(name),
        checked: false,
        createdAt: Date.now()
      };
      newItems.push(item);
      byKey.set(key, item);
    }

    if (newItems.length === 0 && reopened.length === 0) return 0;
    const reopenedIds = new Set(reopened.map((i) => i.id));
    updateState((prev) => ({
      ...prev,
      shoppingList: [
        ...newItems,
        ...prev.shoppingList.map((item) => (reopenedIds.has(item.id) ? { ...item, checked: false } : item))
      ]
    }));
    [...newItems, ...reopened].forEach((item) => pushBringAction('save', item.name, item.amount || ''));
    return newItems.length + reopened.length;
  }, [updateState, pushBringAction]);

  const updateMeal = useCallback((dayOrDate: string, partial: Partial<MealItem>) => {
    updateState((prev) => {
      const isDate = /^\d{4}-\d{2}-\d{2}$/.test(dayOrDate);
      const existingIdx = prev.mealPlan.findIndex((m) =>
        isDate ? m.date === dayOrDate : m.day === dayOrDate
      );

      if (existingIdx >= 0) {
        const updated = [...prev.mealPlan];
        updated[existingIdx] = { ...updated[existingIdx], ...partial };
        return { ...prev, mealPlan: updated };
      }

      if (isDate) {
        const d = parseISODate(dayOrDate);
        const dayKeys: Array<'so' | 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa'> = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'];
        const dayLabels = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        const dayIdx = d.getDay();
        const { weekNumber, year } = getISOWeek(d);
        const newItem: MealItem = {
          id: 'meal_' + dayOrDate,
          date: dayOrDate,
          weekKey: `${year}-W${String(weekNumber).padStart(2, '0')}`,
          day: dayKeys[dayIdx] as any,
          dayLabel: dayLabels[dayIdx],
          meals: {},
          ...partial
        };
        return {
          ...prev,
          mealPlan: [...prev.mealPlan, newItem]
        };
      }

      return prev;
    });
  }, [updateState]);

  const updateMealSlot = useCallback((dayOrDate: string, mealType: MealType, slot: SingleMeal | null) => {
    const isDateKey = /^\d{4}-\d{2}-\d{2}$/.test(dayOrDate);
    const previousSlot = stateRef.current.mealPlan.find((m) =>
      isDateKey ? m.date === dayOrDate : m.day === dayOrDate
    )?.meals?.[mealType];

    updateState((prev) => {
      const isDate = /^\d{4}-\d{2}-\d{2}$/.test(dayOrDate);
      const existingIdx = prev.mealPlan.findIndex((m) =>
        isDate ? m.date === dayOrDate : m.day === dayOrDate
      );

      if (existingIdx >= 0) {
        const updated = [...prev.mealPlan];
        const current = updated[existingIdx];
        updated[existingIdx] = {
          ...current,
          meals: {
            ...(current.meals || {}),
            [mealType]: slot
          }
        };
        return { ...prev, mealPlan: updated };
      }

      // If item for this date doesn't exist yet, create a fresh one!
      if (isDate) {
        const d = parseISODate(dayOrDate);
        const dayKeys: Array<'so' | 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa'> = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'];
        const dayLabels = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        const dayIdx = d.getDay();
        const { weekNumber, year } = getISOWeek(d);
        const newItem: MealItem = {
          id: 'meal_' + dayOrDate,
          date: dayOrDate,
          weekKey: `${year}-W${String(weekNumber).padStart(2, '0')}`,
          day: dayKeys[dayIdx] as any,
          dayLabel: dayLabels[dayIdx],
          meals: {
            [mealType]: slot
          }
        };
        return {
          ...prev,
          mealPlan: [...prev.mealPlan, newItem]
        };
      }

      return prev;
    });

    // New dish or newly added ingredients go straight onto the shopping list (and Bring!)
    if (slot?.ingredients?.length) {
      const sameDish = previousSlot && previousSlot.title.trim().toLowerCase() === slot.title.trim().toLowerCase();
      const known = new Set((sameDish ? previousSlot?.ingredients || [] : []).map((ing) => ingredientKey(parseIngredient(ing).name)));
      const added = slot.ingredients.filter((ing) => !known.has(ingredientKey(parseIngredient(ing).name)));
      if (added.length > 0) addMealIngredientsToShopping(added);
    }
  }, [updateState, addMealIngredientsToShopping]);

  const updateSettings = useCallback((partial: Partial<DashboardSettings>) => {
    updateState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...partial }
    }));
  }, [updateState]);

  const resetToDefaults = useCallback(() => {
    updateState(() => INITIAL_STATE);
  }, [updateState]);

  return {
    state,
    isConnected,
    companionUrl: companionUrl || `${window.location.origin}/companion`,
    addShoppingItem,
    toggleShoppingItem,
    removeShoppingItem,
    clearCheckedShopping,
    addNote,
    removeNote,
    updateMeal,
    updateMealSlot,
    addMealIngredientsToShopping,
    updateSettings,
    resetToDefaults,
    syncBring
  };
}
