import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  bringLogin,
  bringGetLists,
  bringGetItems,
  bringSaveItem,
  bringMoveToRecent,
  bringRemoveItem
} from './bring.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const BACKUP_FILE = path.join(DATA_DIR, 'data.backup.json');
const SECRETS_FILE = path.join(DATA_DIR, 'secrets.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.set('trust proxy', 'loopback, linklocal, uniquelocal');
app.use(express.json({ limit: '10mb' }));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

// Only the dashboard itself may talk to the API. Blocks other websites opened on
// a device in the home network from reading or changing the state (CSRF).
function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // same-origin GETs, curl, etc.
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

app.use('/api', (req, res, next) => {
  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }
  next();
});

// Helper to get local Wi-Fi IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf-8');
  return JSON.parse(raw);
}

// Load or initialize persistent data
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return readJson(DATA_FILE);
    } catch (err) {
      console.error('data.json is corrupt, trying backup:', err.message);
      try {
        if (fs.existsSync(BACKUP_FILE)) return readJson(BACKUP_FILE);
      } catch (backupErr) {
        console.error('Backup is corrupt as well:', backupErr.message);
      }
      // Keep the broken file for manual recovery instead of overwriting it
      try {
        fs.copyFileSync(DATA_FILE, `${DATA_FILE}.corrupt-${Date.now()}`);
      } catch {}
      return null;
    }
  }
  try {
    const EXAMPLE_FILE = path.join(__dirname, 'data.example.json');
    if (fs.existsSync(EXAMPLE_FILE)) {
      const data = readJson(EXAMPLE_FILE);
      saveData(data);
      return data;
    }
  } catch (err) {
    console.error('Error reading data.example.json:', err);
  }
  return null;
}

// Atomic write (temp file + rename) so a power cut on the Pi never leaves a half-written data.json
function saveData(data) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      fs.copyFileSync(DATA_FILE, BACKUP_FILE);
    }
    const tmpFile = `${DATA_FILE}.tmp`;
    const fd = fs.openSync(tmpFile, 'w');
    fs.writeSync(fd, JSON.stringify(data, null, 2));
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fs.renameSync(tmpFile, DATA_FILE);
    return true;
  } catch (err) {
    console.error(`Error saving ${DATA_FILE} (write permission?):`, err.message);
    return false;
  }
}

function isValidState(state) {
  return (
    state !== null &&
    typeof state === 'object' &&
    !Array.isArray(state) &&
    Array.isArray(state.shoppingList) &&
    typeof state.settings === 'object'
  );
}

// ---------------------------------------------------------------------------
// Bring! credentials live only on the server (secrets.json, mode 600) and are
// never sent to browsers.
// ---------------------------------------------------------------------------
const SECRET_BRING_FIELDS = ['password', 'token', 'userUuid'];

function loadSecrets() {
  try {
    if (fs.existsSync(SECRETS_FILE)) return readJson(SECRETS_FILE);
  } catch (err) {
    console.error('Error reading secrets.json:', err.message);
  }
  return {};
}

function saveSecrets(data) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmpFile = `${SECRETS_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), { encoding: 'utf-8', mode: 0o600 });
    fs.renameSync(tmpFile, SECRETS_FILE);
  } catch (err) {
    console.error('Error saving secrets.json:', err.message);
  }
}

let secrets = loadSecrets();

// Remove secret fields from a state object. Secrets found in it (older clients or
// an old data.json) are moved into secrets.json instead of being dropped.
function stripSecrets(state) {
  const bring = state?.settings?.bring;
  if (!bring || typeof bring !== 'object') return state;
  const found = {};
  for (const key of [...SECRET_BRING_FIELDS, 'email']) {
    if (bring[key]) found[key] = bring[key];
  }
  if (found.password || found.token) {
    secrets.bring = { ...(secrets.bring || {}), ...found };
    saveSecrets(secrets);
  }
  const cleanBring = { ...bring };
  for (const key of SECRET_BRING_FIELDS) delete cleanBring[key];
  return { ...state, settings: { ...state.settings, bring: cleanBring } };
}

// ---------------------------------------------------------------------------
// Earlier versions seeded new installs with demo content. Remove exactly those
// entries (matched by their fixed ids and texts); anything the user created is kept.
// ---------------------------------------------------------------------------
const DEMO_SHOPPING = new Map([
  ['1', 'Hafermilch Barista'], ['2', 'Bio-Eier'], ['3', 'Avocado'], ['4', 'Sauerteigbrot'], ['5', 'Espressobohnen']
]);
const DEMO_NOTES = new Map([
  ['1', 'Guten Morgen! ☕ Frische Brötchen sind im Korb. Schönes Wochenende!'],
  ['2', 'Heute Abend: Selbstgemachte Pizza um 19:30 Uhr 🍕'],
  ['note_demo_1', 'Guten Morgen! ☕ Frische Brötchen sind im Korb.'],
  ['note_demo_2', 'Heute Abend: Selbstgemachte Pizza um 19:30 Uhr 🍕']
]);
const DEMO_EVENTS = new Map([
  ['ev_1', 'Zahnarzt Kontrolltermin'], ['ev_2', 'Mamas Geburtstag 🎂'],
  ['ev_3', 'Elternabend Schule 🏫'], ['ev_4', 'Yoga & Pilates 🧘‍♀️']
]);
const DEMO_MEAL_TITLES = new Set([
  'Bunte Buddha Bowl mit Avocado & Kichererbsen', 'Cremiges Steinpilz-Risotto mit Parmesan',
  'Cremiges Thai Kokos-Curry mit Reis', 'Daal and Rice', 'Frische Pasta mit Tomaten & Burrata',
  'Knusprige Steinofen Pizza Funghi & Rucola', 'Würzige Mexican Street Tacos'
]);

function isDemoMealTemplate(item) {
  if (!item || item.date || !/^meal_(mo|di|mi|do|fr|sa|so)$/.test(item.id || '')) return false;
  const titles = [item.title, ...Object.values(item.meals || {}).map((m) => m?.title)].filter(Boolean);
  return titles.length > 0 && titles.every((t) => DEMO_MEAL_TITLES.has(t));
}

function removeDemoData(state) {
  if (!state || typeof state !== 'object') return { state, removed: 0 };
  let removed = 0;
  const keep = (list, isDemo) => {
    if (!Array.isArray(list)) return list;
    const kept = list.filter((entry) => !isDemo(entry));
    removed += list.length - kept.length;
    return kept;
  };
  const next = {
    ...state,
    shoppingList: keep(state.shoppingList, (i) =>
      /^item_demo_\d+$/.test(i?.id || '') || DEMO_SHOPPING.get(i?.id) === i?.name),
    notes: keep(state.notes, (n) => DEMO_NOTES.get(n?.id) === n?.text),
    customCalendarEvents: keep(state.customCalendarEvents, (e) => DEMO_EVENTS.get(e?.id) === e?.title),
    mealPlan: keep(state.mealPlan, isDemoMealTemplate)
  };
  return { state: next, removed };
}

let currentState = loadData();
if (currentState) {
  const hadSecrets = SECRET_BRING_FIELDS.some((k) => currentState.settings?.bring?.[k]);
  currentState = stripSecrets(currentState);
  if (hadSecrets) {
    // Saved twice so the rotated backup no longer contains the credentials either
    saveData(currentState);
    saveData(currentState);
    console.log('🔐 Bring!-Zugangsdaten aus data.json nach secrets.json verschoben.');
  }
  const cleaned = removeDemoData(currentState);
  if (cleaned.removed > 0) {
    currentState = cleaned.state;
    saveData(currentState); // the previous version stays in data.backup.json
    console.log(`🧹 ${cleaned.removed} Beispiel-Einträge entfernt (vorherige Version: data.backup.json).`);
  }
}

// API Endpoints
app.get('/api/info', (req, res) => {
  // Prefer the address the dashboard was opened with (correct behind Docker/proxies);
  // PUBLIC_URL overrides it, the detected LAN IP is the last resort.
  const localIp = getLocalIp();
  let host = req.headers.host || `${localIp}:${PORT}`;
  if (/^(localhost|127\.0\.0\.1)(:|$)/.test(host)) {
    host = host.replace(/^(localhost|127\.0\.0\.1)/, localIp);
  }
  const base = (process.env.PUBLIC_URL || `${req.protocol}://${host}`).replace(/\/$/, '');
  const url = new URL(base);
  res.json({
    ip: url.hostname,
    port: url.port || (url.protocol === 'https:' ? '443' : '80'),
    companionUrl: `${base}/companion`,
    dashboardUrl: `${base}/`
  });
});

app.get('/api/state', (req, res) => {
  res.json(currentState || {});
});

app.post('/api/state', (req, res) => {
  if (!isValidState(req.body)) {
    return res.status(400).json({ error: 'Invalid state payload' });
  }
  currentState = stripSecrets(req.body);
  const saved = saveData(currentState);
  broadcastState(currentState);
  if (!saved) {
    return res.status(500).json({ error: 'State could not be written to disk' });
  }
  res.json({ success: true });
});

// Google Calendar iCal proxy & parser
app.get('/api/calendar', async (req, res) => {
  const icalUrl = req.query.url;
  if (!icalUrl || typeof icalUrl !== 'string') {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  try {
    let targetUrl = icalUrl.trim();
    if (targetUrl.startsWith('webcal://')) {
      targetUrl = 'https://' + targetUrl.slice('webcal://'.length);
    }
    const parsedUrl = new URL(targetUrl);
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return res.status(400).json({ error: 'Only http(s) calendar URLs are supported' });
    }

    const response = await fetch(parsedUrl, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch calendar from remote provider' });
    }
    const icsText = await response.text();

    // Parse VEVENT items
    const events = [];
    const eventBlocks = icsText.split('BEGIN:VEVENT');

    for (let i = 1; i < eventBlocks.length; i++) {
      const block = eventBlocks[i].split('END:VEVENT')[0];
      
      const summaryMatch = block.match(/SUMMARY.*?:(.*?)(\r?\n[A-Z]|\r?\nEND)/s);
      const dtstartMatch = block.match(/DTSTART.*?:(\d{8}(T\d{6}Z?)?)/);
      const dtendMatch = block.match(/DTEND.*?:(\d{8}(T\d{6}Z?)?)/);
      const locationMatch = block.match(/LOCATION.*?:(.*?)(\r?\n[A-Z]|\r?\nEND)/s);

      if (summaryMatch && dtstartMatch) {
        const title = summaryMatch[1].replace(/\r?\n\s+/g, '').trim();
        const rawStart = dtstartMatch[1];
        const isAllDay = !rawStart.includes('T');

        let dateStr = '';
        let timeStr = '';

        const year = rawStart.substring(0, 4);
        const month = rawStart.substring(4, 6);
        const day = rawStart.substring(6, 8);
        dateStr = `${year}-${month}-${day}`;

        if (!isAllDay) {
          const hour = rawStart.substring(9, 11);
          const min = rawStart.substring(11, 13);
          timeStr = `${hour}:${min}`;
        }

        events.push({
          id: 'event_' + i,
          title,
          date: dateStr,
          time: timeStr || undefined,
          isAllDay,
          location: locationMatch ? locationMatch[1].replace(/\r?\n\s+/g, '').trim() : undefined
        });
      }
    }

    // Filter events from today onwards (within next 45 days)
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = events
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => (a.date + (a.time || '00:00')).localeCompare(b.date + (b.time || '00:00')))
      .slice(0, 15);

    res.json({ events: upcoming, total: upcoming.length });
  } catch (err) {
    console.error('Error fetching/parsing Google Calendar:', err);
    res.status(500).json({ error: 'Failed to parse Google calendar feed' });
  }
});

// Helper for auto-categorizing items from Bring
function categorizeBringItem(name) {
  const n = (name || '').toLowerCase().trim();

  // 1. Obst & Gemüse (including potatoes / aloo, tomatoes, herbs, mushrooms)
  if (/apfel|äpfel|banan|birn|erdbeer|beere|salat|tomat|gurk|kartoffel|aloo|alu|zwiebel|knoblauch|karott|möhre|paprika|avocado|zitrone|orange|spinat|kohl|pilz|champignon|ingwer|zucchini|kürbis|brokkoli|obst|gemüse|kräuter|koriander|basilikum|petersilie|minze/.test(n)) {
    return 'gemuese';
  }

  // 2. Kühlregal (Milchprodukte, Käse, Feta, Fleisch, Fisch, Tofu - be careful with 'ei')
  if (/milch|butter|käse|cheese|feta|mozzarella|parmesan|gouda|cheddar|joghurt|quark|sahne|\beier?\b|frischkäse|tofu|fleisch|hähnchen|rind|schwein|hack|wurst|schinken|lachs|fisch/.test(n)) {
    if (/erdnussbutter|mandelbutter|nussbutter|sheabutter|kokosbutter/.test(n)) {
      return 'vorrat';
    }
    return 'kuehlregal';
  }

  // 3. Bäckerei
  if (/\bbrot\b|brötchen|toast|croissant|baguette|semmel|brezel|laib/.test(n)) {
    return 'baeckerei';
  }

  // 4. Getränke
  if (/wasser|saft|cola|bier|wein|kaffee|tea|tee|limo|sprudel|drink|hafermilch|sojamilch/.test(n)) {
    return 'getraenke';
  }

  // 5. Vorrat & Gewürze (Nudeln, Reis, Reishunger, Miso, Nüsse, Cashew, Kokosraspel, Hülsenfrüchte, Chole, Kichererbsen, Erdnussbutter)
  if (/nudel|pasta|spaghetti|reis|reishunger|mehl|zucker|salz|pfeffer|öl|essig|müsli|hafer|bohne|erbse|kichererbse|chole|chana|dal|daal|dose|sauce|passata|pesto|gewürz|chips|schokolade|keks|cashew|nuss|nüsse|mandel|erdnuss|kokos|kokosraspel|miso|sesam|tahini|curry|sojasauce/.test(n)) {
    return 'vorrat';
  }

  // 6. Haushalt
  if (/papier|toilettenpapier|klo|spül|reiniger|müll|seife|shampoo|duschgel|zahnpasta|waschmittel|küchenrolle|serviette|taschentuch/.test(n)) {
    return 'haushalt';
  }

  return 'sonstiges';
}

// Bring! Shopping API Endpoints
// All calls use the credentials stored in secrets.json; the browser only sends list ids.
async function bringLoginAndStore(email, password) {
  const auth = await bringLogin(email, password);
  secrets.bring = { email, password, token: auth.token, userUuid: auth.userUuid };
  saveSecrets(secrets);
  return auth;
}

// Runs fn(userUuid, token) and re-logs in once if the stored token has expired
async function withBring(fn) {
  const creds = secrets.bring;
  if (!creds?.email || !creds?.password) {
    throw new Error('Kein Bring!-Konto verbunden. Bitte in den Einstellungen anmelden.');
  }
  if (!creds.token || !creds.userUuid) {
    await bringLoginAndStore(creds.email, creds.password);
  }
  try {
    return await fn(secrets.bring.userUuid, secrets.bring.token);
  } catch (err) {
    if (!/\((401|403)\)/.test(err.message)) throw err;
    await bringLoginAndStore(creds.email, creds.password);
    return fn(secrets.bring.userUuid, secrets.bring.token);
  }
}

app.post('/api/bring/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich' });
    }
    const auth = await bringLoginAndStore(email, password);
    res.json({
      success: true,
      userName: auth.userName,
      lists: auth.lists,
      activeListUuid: auth.activeListUuid
    });
  } catch (err) {
    console.error('Bring login error:', err.message);
    res.status(400).json({ error: err.message || 'Anmeldung fehlgeschlagen' });
  }
});

app.post('/api/bring/logout', (req, res) => {
  delete secrets.bring;
  saveSecrets(secrets);
  res.json({ success: true });
});

app.post('/api/bring/lists', async (req, res) => {
  try {
    const lists = await withBring((userUuid, token) => bringGetLists(userUuid, token));
    res.json({ lists });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Listen konnten nicht geladen werden' });
  }
});

app.post('/api/bring/items', async (req, res) => {
  try {
    const { listUuid } = req.body;
    if (!listUuid) {
      return res.status(400).json({ error: 'Fehlende Parameter' });
    }
    const items = await withBring((userUuid, token) => bringGetItems(listUuid, userUuid, token));
    res.json(items);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Artikel konnten nicht geladen werden' });
  }
});

app.post('/api/bring/action', async (req, res) => {
  try {
    const { action, listUuid, itemName, specification } = req.body;
    if (!listUuid || !itemName) {
      return res.status(400).json({ error: 'Fehlende Bring!-Parameter' });
    }

    await withBring((userUuid, token) => {
      if (action === 'save') return bringSaveItem(listUuid, userUuid, token, itemName, specification || '');
      if (action === 'check') return bringMoveToRecent(listUuid, userUuid, token, itemName);
      if (action === 'remove') return bringRemoveItem(listUuid, userUuid, token, itemName);
      throw new Error('Unbekannte Aktion');
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error in Bring action:', err.message);
    res.status(500).json({ error: err.message || 'Aktion fehlgeschlagen' });
  }
});

app.post('/api/bring/sync', async (req, res) => {
  try {
    const { listUuid } = req.body;
    if (!listUuid) {
      return res.status(400).json({ error: 'Keine Bring!-Liste gewählt.' });
    }

    const { purchase, recently } = await withBring((userUuid, token) => bringGetItems(listUuid, userUuid, token));

    if (!currentState) {
      currentState = loadData() || { shoppingList: [], notes: [], mealPlan: [], settings: {} };
    }
    if (!Array.isArray(currentState.shoppingList)) {
      currentState.shoppingList = [];
    }

    const now = Date.now();
    const existingList = currentState.shoppingList;
    const updatedList = [];

    // 1. Process active purchase items (checked = false)
    for (const p of purchase) {
      const pName = (p.name || '').trim();
      if (!pName) continue;
      const match = existingList.find(item => item.name.toLowerCase() === pName.toLowerCase());
      if (match) {
        updatedList.push({
          ...match,
          name: pName,
          category: categorizeBringItem(pName),
          amount: p.specification || match.amount || '',
          checked: false
        });
      } else {
        updatedList.push({
          id: 'bring_' + Math.random().toString(36).substring(2, 9),
          name: pName,
          amount: p.specification || '',
          category: categorizeBringItem(pName),
          checked: false,
          createdAt: now
        });
      }
    }

    // 2. Process recently bought items (checked = true)
    for (const r of recently.slice(0, 15)) {
      const rName = (r.name || '').trim();
      if (!rName) continue;
      const match = existingList.find(item => item.name.toLowerCase() === rName.toLowerCase());
      if (match && !updatedList.some(item => item.name.toLowerCase() === rName.toLowerCase())) {
        updatedList.push({
          ...match,
          name: rName,
          checked: true
        });
      }
    }

    currentState.shoppingList = updatedList;
    if (!currentState.settings) currentState.settings = {};
    if (!currentState.settings.bring) currentState.settings.bring = {};
    currentState.settings.bring.lastSync = now;
    currentState.lastUpdated = now;

    saveData(currentState);
    broadcastState(currentState);

    res.json({
      success: true,
      itemsCount: updatedList.length,
      shoppingList: updatedList,
      lastSync: now
    });
  } catch (err) {
    console.error('Error syncing Bring list:', err.message);
    res.status(500).json({ error: err.message || 'Synchronisation fehlgeschlagen' });
  }
});

// Serve static frontend build if dist folder exists
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcastState(state, senderWs = null) {
  const message = JSON.stringify({ type: 'SYNC_STATE', payload: state });
  wss.clients.forEach((client) => {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws, req) => {
  if (!isSameOrigin(req)) {
    ws.close(1008, 'Forbidden origin');
    return;
  }

  // Keep-alive so idle connections (iPad on the wall) are not silently dropped
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.type === 'REQUEST_STATE') {
        if (currentState) {
          ws.send(JSON.stringify({ type: 'SYNC_STATE', payload: currentState }));
        }
      } else if (parsed.type === 'UPDATE_STATE' && isValidState(parsed.payload)) {
        currentState = stripSecrets(parsed.payload);
        saveData(currentState);
        broadcastState(currentState, ws);
      }
    } catch (e) {
      console.error('Error handling WebSocket message:', e);
    }
  });
});

const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
wss.on('close', () => clearInterval(heartbeat));

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIp();
  console.log(`=================================================`);
  console.log(`🍳 Kitchen Wall All-In-One Dashboard`);
  console.log(`📍 Lokale IP: http://${ip}:${PORT}`);
  console.log(`📱 iPhone Begleiter URL: http://${ip}:${PORT}/companion`);
  console.log(`📺 iPad Dashboard URL:   http://${ip}:${PORT}/`);
  console.log(`💾 Daten:                ${DATA_FILE}`);
  if (!fs.existsSync(DIST_DIR)) {
    console.log(`⚠️  Kein dist/ Ordner gefunden – bitte zuerst "npm run build" ausführen!`);
  }
  console.log(`=================================================`);
});
