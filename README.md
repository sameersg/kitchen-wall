# 🍳 Kitchen Wall | iPad All-In-One Küchen-Dashboard

Ein modernes, hochelegantes Dashboard für das iPad an der Küchenwand – im zeitlosen **Claude-Design**, mit **Live-Synchronisation zum iPhone**, **2-Wege-Bring!-Integration**, **Wochen-Speiseplan**, **Google- & Müllkalender**, **Multi-Timer**, **Wetter**, **Notizwand** und **Webradio**.

100% unabhängig von externen Plattformen wie Home Assistant.

---

## ✨ Features

- **📱 iPad Kiosk & PWA**: Speziell für iPad-Displays optimiert (Zero-Scroll, Wake-Lock gegen Display-Abschalten, automatischer Bildschirmschoner / Nachtuhr).
- **🛒 Bring! 2-Wege-Synchronisation**: Nahtlose Anbindung an dein Bring!-Konto (`api.getbring.com`). Einkäufe synchronisieren in Echtzeit zwischen Wand-Tablet, Bring!-App und iPhone Begleiter.
- **📅 Kalender & Abfallwirtschaft**: Direkter iCal-Import für Google Kalender und regionale Müllabfuhr-Termine (Restmüll, Bio, Papier, Gelber Sack).
- **🍲 Wochen-Speiseplan**: Interaktiver 7-Tage-Planer mit automatischer Bildersuche und 1-Klick-Übertrag von Zutaten auf die Einkaufsliste.
- **📲 iPhone Companion (`/companion`)**: Begleiter-Webapp für die Hosentasche – einfach per QR-Code vom iPad scannen, Einkäufe abhaken oder Notizen live an die Wand pinnen.
- **⏱️ Multi-Timer & Webradio**: Gleichzeitige Küchen-Timer mit Koch-Presets und integrierter Audioplayer für Radio & Lo-Fi Streams.

---

## 🚀 Schnellstart (Lokal)

### Voraussetzungen
- Node.js (v18 oder neuer)
- npm

### Installation & Start
```bash
# Repository klonen
git clone https://github.com/sameersg/kitchen-wall.git
cd kitchen-wall

# Abhängigkeiten installieren
npm install

# Frontend bauen
npm run build

# Server starten (Dashboard + WebSocket + API auf Port 3000)
npm start
```

Für die Entwicklung startet `npm run dev` Server (Port 3000) und Vite (Port 5173) gemeinsam.

Im Terminal wird direkt deine lokale WLAN-Adresse angezeigt:
* **iPad Dashboard:** `http://<Deine-IP>:3000/` (z.B. `http://192.168.178.20:3000/`)
* **iPhone Begleiter:** `http://<Deine-IP>:3000/companion`

---

## 📱 Einrichtung auf dem iPad (Vollbild Kiosk-Modus)

1. Öffne **Safari** auf deinem iPad und rufe die Adresse auf:
   `http://<Deine-IP>:3000/`
2. Tippe oben auf das **Teilen-Symbol** (Viereck mit Pfeil nach oben).
3. Wähle **„Zum Home-Bildschirm“** (Add to Home Screen).
4. Vergib einen Namen (z.B. *Kitchen Wall*) und tippe auf **Hinzufügen**.
5. Starte die App über das neue Icon auf dem Homescreen:
   ✨ **Sie öffnet sich im echten Vollbildmodus ohne störende Browserleisten oder URL-Eingabezeilen.**
6. Der integrierte **Screen Wake Lock** verhindert automatisch das Ausschalten des Bildschirms während des Betriebs.

---

## ⚡ Automatische Installation

### Proxmox: fertiger LXC-Container mit einem Befehl
Im **Proxmox-Host** unter *Shell* ausführen:
```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/sameersg/kitchen-wall/main/deploy/proxmox-lxc.sh)"
```
Das Skript lädt das Debian-12-Template, erstellt einen unprivilegierten LXC (1 Kern, 1 GB RAM, 4 GB Disk, Autostart mit Proxmox) und installiert darin Kitchen Wall als Dienst. Am Ende wird die Adresse fürs iPad angezeigt.

Der Speicher (z.B. `local-lvm` oder `local-zfs`) wird automatisch erkannt. Anpassen per Variablen, z.B. feste IP und bestimmter Speicher:
```bash
CT_IP=192.168.178.50/24 CT_GATEWAY=192.168.178.1 CT_STORAGE=local-zfs \
  bash -c "$(curl -fsSL https://raw.githubusercontent.com/sameersg/kitchen-wall/main/deploy/proxmox-lxc.sh)"
```
Alle Optionen stehen oben in `deploy/proxmox-lxc.sh`.

### Raspberry Pi, Debian- oder Ubuntu-Server / VM
```bash
curl -fsSL https://raw.githubusercontent.com/sameersg/kitchen-wall/main/deploy/install.sh | sudo bash
```
Installiert Node.js, legt den Benutzer `kitchenwall` an, baut die App nach `/opt/kitchenwall` und startet den Dienst `kitchenwall`. Daten liegen in `/var/lib/kitchenwall`.

- **Update:** denselben Befehl erneut ausführen – die Daten bleiben erhalten.
- **Umzug von einer alten Installation:** `KW_IMPORT=/pfad/zur/alten/server/data.json` voranstellen (eine `secrets.json` daneben wird mitgenommen):
  ```bash
  curl -fsSL https://raw.githubusercontent.com/sameersg/kitchen-wall/main/deploy/install.sh \
    | sudo KW_IMPORT=/home/pi/kitchen-wall-dashboard/server/data.json bash
  ```
- **Logs:** `journalctl -u kitchenwall -f`

---

## 🐳 Betrieb mit Docker (z.B. Proxmox, NAS, Heimserver)

```bash
git clone https://github.com/sameersg/kitchen-wall.git
cd kitchen-wall
docker compose up -d --build
```

Das Dashboard läuft dann unter `http://<Server-IP>:3000/`.
Alle Daten (`data.json`, Backup, `secrets.json`) liegen im Docker-Volume `kitchenwall-data` und überleben Updates.

**Update:**
```bash
git pull
docker compose up -d --build
```

**Backup der Daten:**
```bash
docker run --rm -v kitchen-wall_kitchenwall-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/kitchenwall-backup.tgz -C /data .
```

Optional: Mit `PUBLIC_URL=http://kitchen.fritz.box:3000` in `docker-compose.yml` lässt sich die Adresse für den iPhone-QR-Code fest vorgeben.

### Proxmox: VM, LXC oder Docker?

| Variante | Ressourcen | Wann sinnvoll |
|---|---|---|
| **Debian-LXC + Node + systemd** | ~256–512 MB RAM, 4 GB Disk | Nur dieses Dashboard – am leichtesten |
| **Kleine Debian-VM + Docker Compose** | ~1 GB RAM, 8–10 GB Disk | Mehrere Docker-Dienste geplant (von Proxmox offiziell für Docker empfohlen) |
| Docker in LXC | wie LXC | Funktioniert (Nesting aktivieren), wird von Proxmox aber nicht offiziell unterstützt |

Für die LXC-Variante gilt die Anleitung „Raspberry Pi“ unten 1:1 (Debian-Template, Benutzer statt `pi` anpassen).
Gib dem Container/der VM in der FritzBox eine **feste IP**, damit das iPad die Adresse behält.

---

## 🍓 24/7 Dauerbetrieb auf dem Raspberry Pi

Läuft auf Raspberry Pi 3/4/5 (Raspberry Pi OS, 64-bit empfohlen).

### 1. Node.js installieren (v18 oder neuer)
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git
node -v
```

### 2. Projekt holen & bauen
```bash
cd ~
git clone https://github.com/sameersg/kitchen-wall.git
cd kitchen-wall
npm install
npm run build
```

### 3. Als Dienst starten (Autostart nach Reboot)

**Variante A – systemd (empfohlen, nichts extra nötig):**
```bash
# User/Pfad in der Datei anpassen, falls dein Benutzer nicht "pi" heißt
sudo cp deploy/kitchenwall.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now kitchenwall

# Status & Logs
systemctl status kitchenwall
journalctl -u kitchenwall -f
```

**Variante B – PM2:**
```bash
sudo npm install -g pm2
pm2 start server/index.js --name kitchenwall
pm2 startup   # ausgegebenen Befehl ausführen
pm2 save
```

Das Dashboard ist dann unter `http://<Pi-IP>:3000/` erreichbar (Port über `PORT=...` änderbar).

### Updates einspielen
```bash
cd ~/kitchen-wall
git pull
npm install
npm run build
sudo systemctl restart kitchenwall   # bzw. pm2 restart kitchenwall
```

### Wo werden die Daten gespeichert?
Alle Einträge liegen in `server/data.json` (plus automatische Sicherung `server/data.backup.json`).
Bring!-Passwort und Token liegen getrennt in `server/secrets.json` (nur für den Server-Benutzer lesbar).
Geschrieben wird atomar, damit ein Stromausfall die Datei nicht zerstört.
Mit `DATA_DIR=/pfad/zum/ordner` kann ein anderer Speicherort (z.B. USB-Stick) gewählt werden.
Der Server-Benutzer braucht **Schreibrechte** auf diesen Ordner.

### 🩺 Fehlerbehebung: „Einträge werden nicht gespeichert“
1. **Server läuft und dist/ existiert?** Beim Start zeigt der Server den Datenpfad an und warnt, falls `npm run build` fehlt.
2. **Schreibrechte:** `ls -l server/` – gehört der Ordner dem Benutzer, unter dem der Dienst läuft? Sonst: `sudo chown -R pi:pi ~/kitchen-wall`.
3. **Reverse Proxy (nginx/Caddy):** WebSocket-Upgrades für `/ws` durchreichen. Ohne WebSocket speichert die App trotzdem über HTTP, aber Live-Sync zwischen Geräten braucht den WebSocket.
   ```nginx
   location / {
     proxy_pass http://127.0.0.1:3000;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection "upgrade";
     proxy_set_header Host $host;
   }
   ```
4. **Logs prüfen:** `journalctl -u kitchenwall -f` – Schreibfehler werden dort gemeldet.

---

## 🛒 Bring!-Anbindung einrichten

1. Öffne das iPad-Dashboard oder rufe `http://localhost:3000/` auf.
2. Klicke auf das **Zahnrad-Symbol (⚙️ Einstellungen)**.
3. Scrolle zum Abschnitt **Bring! Einkaufsliste**.
4. Trage deine Bring!-Zugangsdaten (E-Mail & Passwort) ein und klicke auf **Anmelden**.
5. Wähle deine gewünschte Liste (z.B. *Zuhause*) aus und aktiviere den Haken bei **Automatisch synchronisieren**.
6. **Fertig!** Alle Artikel werden in einer sauberen, zweispaltigen Checkliste synchronisiert.

## 🔐 Sicherheit

- **Bring!-Zugangsdaten bleiben auf dem Server** (`secrets.json`, Rechte `600`). Browser, iPad und iPhone bekommen weder Passwort noch Token zu sehen. Ältere Installationen werden beim Start automatisch umgestellt.
- **Schutz vor fremden Webseiten:** API und WebSocket akzeptieren nur Anfragen vom Dashboard selbst (Origin-Prüfung). Eine andere Webseite im Browser eines Geräts im WLAN kann die Daten nicht auslesen oder ändern.
- **Nicht ins Internet freigeben.** Das Dashboard hat bewusst kein Login (Kiosk-Betrieb). Für Zugriff von unterwegs einen VPN nutzen (z.B. **WireGuard über die FritzBox** oder **Tailscale**) statt einer Portfreigabe.
- Daten- und Secret-Dateien sind per `.gitignore` / `.dockerignore` von Git und Docker-Images ausgeschlossen.

---

## 🛠️ Tech-Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend:** Node.js, Express, WebSockets (`ws`) für latenzfreie Echtzeit-Events
- **Synchronisation:** Bring! REST API (`api.getbring.com`), Node-iCal
- **Design-System:** Warmes Claude Ivory / Warm Stone Theme mit Manrope-Typografie

---

## 📄 Lizenz
Privates Projekt.
