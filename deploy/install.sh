#!/usr/bin/env bash
# Kitchen Wall installer / updater for Debian, Ubuntu and Raspberry Pi OS.
#
# Installs Node.js, clones the app to /opt/kitchenwall, builds it and runs it as
# a systemd service under its own user. Running it again updates the app;
# the data in /var/lib/kitchenwall is kept.
#
#   curl -fsSL https://raw.githubusercontent.com/sameersg/kitchen-wall/main/deploy/install.sh | sudo bash
#
# Options (environment variables):
#   KW_BRANCH=main            Git branch to install
#   KW_REPO=<git url>         Repository to clone
#   KW_DIR=/opt/kitchenwall   Install directory
#   KW_DATA_DIR=/var/lib/kitchenwall
#   KW_PORT=3000
#   KW_TZ=Europe/Berlin
#   KW_IMPORT=/path/data.json Import data (and secrets.json next to it) from an old install
set -euo pipefail

REPO_URL="${KW_REPO:-https://github.com/sameersg/kitchen-wall.git}"
BRANCH="${KW_BRANCH:-main}"
APP_DIR="${KW_DIR:-/opt/kitchenwall}"
DATA_DIR="${KW_DATA_DIR:-/var/lib/kitchenwall}"
PORT="${KW_PORT:-3000}"
TZ_NAME="${KW_TZ:-Europe/Berlin}"
SERVICE_USER="kitchenwall"
SERVICE_NAME="kitchenwall"
NODE_MAJOR_MIN=18

info() { printf '\033[1;32m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!!\033[0m  %s\n' "$*" >&2; }
die() { printf '\033[1;31mxx\033[0m  %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Bitte als root ausführen (sudo bash install.sh)."
command -v apt-get >/dev/null || die "Nur Debian/Ubuntu/Raspberry Pi OS werden unterstützt."

export DEBIAN_FRONTEND=noninteractive

# --- Base packages ----------------------------------------------------------
info "Installiere Basis-Pakete ..."
apt-get update -qq
apt-get install -y -qq curl ca-certificates git >/dev/null

# --- Node.js ----------------------------------------------------------------
node_major() {
  if command -v node >/dev/null; then
    node -v | sed -E 's/^v([0-9]+).*/\1/'
  else
    echo 0
  fi
}

if [ "$(node_major)" -lt "$NODE_MAJOR_MIN" ]; then
  info "Installiere Node.js 22 (NodeSource) ..."
  if curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null 2>&1 \
    && apt-get install -y -qq nodejs >/dev/null 2>&1; then
    :
  else
    warn "NodeSource nicht verfügbar (z.B. 32-bit Pi) – nutze Node.js aus den Distributions-Paketen."
    apt-get install -y -qq nodejs npm >/dev/null
  fi
fi
command -v node >/dev/null || die "Node.js konnte nicht installiert werden."
command -v npm >/dev/null || apt-get install -y -qq npm >/dev/null
[ "$(node_major)" -ge "$NODE_MAJOR_MIN" ] || die "Node.js $(node -v) ist zu alt, mindestens v$NODE_MAJOR_MIN nötig."
info "Node.js $(node -v), npm $(npm -v)"

# --- Service user & directories ---------------------------------------------
if ! id "$SERVICE_USER" >/dev/null 2>&1; then
  info "Lege System-Benutzer '$SERVICE_USER' an ..."
  useradd --system --home-dir "$DATA_DIR" --no-create-home --shell /usr/sbin/nologin "$SERVICE_USER"
fi
mkdir -p "$DATA_DIR"
chown "$SERVICE_USER:$SERVICE_USER" "$DATA_DIR"
chmod 750 "$DATA_DIR"

# --- Code -------------------------------------------------------------------
if [ -d "$APP_DIR/.git" ]; then
  info "Aktualisiere $APP_DIR (Branch $BRANCH) ..."
  git -C "$APP_DIR" fetch --depth 1 origin "$BRANCH"
  git -C "$APP_DIR" reset --hard FETCH_HEAD
else
  info "Klone $REPO_URL (Branch $BRANCH) nach $APP_DIR ..."
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

# Data from an older install inside the app directory
if [ -f "$APP_DIR/server/data.json" ] && [ ! -f "$DATA_DIR/data.json" ]; then
  KW_IMPORT="${KW_IMPORT:-$APP_DIR/server/data.json}"
fi
if [ -n "${KW_IMPORT:-}" ]; then
  [ -f "$KW_IMPORT" ] || die "KW_IMPORT: Datei $KW_IMPORT nicht gefunden."
  if [ -f "$DATA_DIR/data.json" ]; then
    warn "$DATA_DIR/data.json existiert bereits – Import übersprungen."
  else
    info "Importiere Daten aus $KW_IMPORT ..."
    install -o "$SERVICE_USER" -g "$SERVICE_USER" -m 640 "$KW_IMPORT" "$DATA_DIR/data.json"
    SECRETS_SRC="$(dirname "$KW_IMPORT")/secrets.json"
    if [ -f "$SECRETS_SRC" ]; then
      install -o "$SERVICE_USER" -g "$SERVICE_USER" -m 600 "$SECRETS_SRC" "$DATA_DIR/secrets.json"
    fi
  fi
fi

# --- Build ------------------------------------------------------------------
info "Installiere Abhängigkeiten und baue das Frontend (kann auf dem Pi ein paar Minuten dauern) ..."
cd "$APP_DIR"
npm ci --no-audit --no-fund --loglevel=error
npm run build --silent
npm prune --omit=dev --no-audit --no-fund --loglevel=error

# --- systemd service --------------------------------------------------------
if ! command -v systemctl >/dev/null || [ ! -d /run/systemd/system ]; then
  warn "Kein systemd gefunden – Dienst wird nicht eingerichtet."
  warn "Manuell starten: cd $APP_DIR && runuser -u $SERVICE_USER -- env DATA_DIR=$DATA_DIR PORT=$PORT node server/index.js"
  exit 0
fi

info "Richte systemd-Dienst '$SERVICE_NAME' ein ..."
cat > "/etc/systemd/system/$SERVICE_NAME.service" <<EOF
[Unit]
Description=Kitchen Wall Dashboard
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$APP_DIR
ExecStart=$(command -v node) server/index.js
Environment=NODE_ENV=production
Environment=PORT=$PORT
Environment=DATA_DIR=$DATA_DIR
Environment=TZ=$TZ_NAME
Restart=always
RestartSec=5
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "$SERVICE_NAME" >/dev/null 2>&1
systemctl restart "$SERVICE_NAME"

# --- Update command & login info -------------------------------------------
info "Richte Befehl 'kitchenwall-update' und Login-Info ein ..."
cat > /usr/local/bin/kitchenwall-update <<EOF
#!/usr/bin/env bash
# Updates Kitchen Wall with the settings used at install time.
set -euo pipefail
[ "\$(id -u)" -eq 0 ] || exec sudo "\$0" "\$@"
curl -fsSL "https://raw.githubusercontent.com/sameersg/kitchen-wall/$BRANCH/deploy/install.sh" \\
  | KW_REPO="$REPO_URL" KW_BRANCH="$BRANCH" KW_DIR="$APP_DIR" KW_DATA_DIR="$DATA_DIR" KW_PORT="$PORT" KW_TZ="$TZ_NAME" bash
EOF
chmod 755 /usr/local/bin/kitchenwall-update

# Shown on every interactive login (console, SSH, pct enter)
cat > /etc/profile.d/kitchenwall.sh <<'EOF'
# Kitchen Wall login info (generated by deploy/install.sh)
[ -n "${KW_INFO_SHOWN:-}" ] && return 0
export KW_INFO_SHOWN=1
_kw_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
if systemctl is-active --quiet __SERVICE__ 2>/dev/null; then
  _kw_state="\033[1;32mläuft\033[0m"
else
  _kw_state="\033[1;31mgestoppt\033[0m (journalctl -u __SERVICE__ -n 50)"
fi
printf '\n  \033[1m🍳 Kitchen Wall\033[0m  –  Status: %b\n' "$_kw_state"
printf '  iPad Dashboard:   http://%s:__PORT__/\n' "${_kw_ip:-<IP>}"
printf '  iPhone Begleiter: http://%s:__PORT__/companion\n' "${_kw_ip:-<IP>}"
printf '  Update:           kitchenwall-update\n'
printf '  Logs:             journalctl -u __SERVICE__ -f\n\n'
unset _kw_ip _kw_state
EOF
sed -i "s/__SERVICE__/$SERVICE_NAME/g; s/__PORT__/$PORT/g" /etc/profile.d/kitchenwall.sh
# pct enter and other non-login shells do not read /etc/profile.d, so hook into bash.bashrc too
if ! grep -q '/etc/profile.d/kitchenwall.sh' /etc/bash.bashrc 2>/dev/null; then
  echo '[ -f /etc/profile.d/kitchenwall.sh ] && . /etc/profile.d/kitchenwall.sh' >> /etc/bash.bashrc
fi

info "Warte auf den Server ..."
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$PORT/api/info" >/dev/null 2>&1; then
    IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
    echo
    info "Fertig! Kitchen Wall läuft."
    echo "    iPad Dashboard:   http://${IP:-<IP>}:$PORT/"
    echo "    iPhone Begleiter: http://${IP:-<IP>}:$PORT/companion"
    echo "    Daten:            $DATA_DIR"
    echo "    Logs:             journalctl -u $SERVICE_NAME -f"
    echo "    Update:           kitchenwall-update"
    exit 0
  fi
  sleep 1
done
die "Server antwortet nicht. Logs prüfen: journalctl -u $SERVICE_NAME -n 50"
