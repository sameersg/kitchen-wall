#!/usr/bin/env bash
# Creates a Debian 12 LXC container on a Proxmox VE host and installs Kitchen Wall in it.
# Run on the Proxmox host shell as root:
#
#   bash -c "$(curl -fsSL https://raw.githubusercontent.com/sameersg/kitchen-wall/main/deploy/proxmox-lxc.sh)"
#
# Options (environment variables, all optional):
#   CT_ID=<next free id>      Container ID
#   CT_HOSTNAME=kitchenwall
#   CT_STORAGE=local-lvm      Storage for the root disk
#   CT_TEMPLATE_STORAGE=local Storage for the Debian template
#   CT_BRIDGE=vmbr0
#   CT_IP=dhcp                or static, e.g. 192.168.178.50/24
#   CT_GATEWAY=               required with a static IP, e.g. 192.168.178.1
#   CT_MEMORY=1024            MB (the build needs ~1 GB; 512 is enough to run)
#   CT_CORES=1
#   CT_DISK=4                 GB
#   KW_BRANCH=main            Git branch of Kitchen Wall to install
#   KW_PORT=3000
set -euo pipefail

REPO_RAW="${KW_REPO_RAW:-https://raw.githubusercontent.com/sameersg/kitchen-wall}"
KW_BRANCH="${KW_BRANCH:-main}"
KW_PORT="${KW_PORT:-3000}"
CT_HOSTNAME="${CT_HOSTNAME:-kitchenwall}"
CT_STORAGE="${CT_STORAGE:-local-lvm}"
CT_TEMPLATE_STORAGE="${CT_TEMPLATE_STORAGE:-local}"
CT_BRIDGE="${CT_BRIDGE:-vmbr0}"
CT_IP="${CT_IP:-dhcp}"
CT_GATEWAY="${CT_GATEWAY:-}"
CT_MEMORY="${CT_MEMORY:-1024}"
CT_CORES="${CT_CORES:-1}"
CT_DISK="${CT_DISK:-4}"

info() { printf '\033[1;32m==>\033[0m %s\n' "$*"; }
die() { printf '\033[1;31mxx\033[0m  %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Bitte als root auf dem Proxmox-Host ausführen."
command -v pct >/dev/null && command -v pveam >/dev/null || die "pct/pveam nicht gefunden – das ist kein Proxmox-Host."

CT_ID="${CT_ID:-$(pvesh get /cluster/nextid)}"
if pct status "$CT_ID" >/dev/null 2>&1; then
  die "Container $CT_ID existiert bereits. Anderen CT_ID wählen."
fi
if [ "$CT_IP" != "dhcp" ] && [ -z "$CT_GATEWAY" ]; then
  die "Bei statischer IP bitte auch CT_GATEWAY setzen (z.B. CT_GATEWAY=192.168.178.1)."
fi

# --- Debian 12 template -----------------------------------------------------
info "Suche Debian-12-Template ..."
pveam update >/dev/null
TEMPLATE="$(pveam available --section system | awk '{print $2}' | grep -E '^debian-12-standard_.*_amd64\.tar\.(zst|gz)$' | sort -V | tail -n1)"
[ -n "$TEMPLATE" ] || die "Kein Debian-12-Template gefunden."
if ! pveam list "$CT_TEMPLATE_STORAGE" | grep -q "$TEMPLATE"; then
  info "Lade $TEMPLATE herunter ..."
  pveam download "$CT_TEMPLATE_STORAGE" "$TEMPLATE" >/dev/null
fi

# --- Container --------------------------------------------------------------
NET="name=eth0,bridge=$CT_BRIDGE,ip=$CT_IP"
[ -n "$CT_GATEWAY" ] && NET="$NET,gw=$CT_GATEWAY"

info "Erstelle LXC $CT_ID ($CT_HOSTNAME, ${CT_MEMORY} MB RAM, ${CT_DISK} GB Disk) ..."
pct create "$CT_ID" "$CT_TEMPLATE_STORAGE:vztmpl/$TEMPLATE" \
  --hostname "$CT_HOSTNAME" \
  --cores "$CT_CORES" \
  --memory "$CT_MEMORY" \
  --swap 512 \
  --rootfs "$CT_STORAGE:$CT_DISK" \
  --net0 "$NET" \
  --unprivileged 1 \
  --features nesting=1 \
  --onboot 1 \
  --description "Kitchen Wall Dashboard – http://<IP>:$KW_PORT/" >/dev/null

pct start "$CT_ID"

info "Warte auf Netzwerk im Container ..."
for i in $(seq 1 60); do
  if pct exec "$CT_ID" -- getent hosts deb.debian.org >/dev/null 2>&1; then
    break
  fi
  [ "$i" -eq 60 ] && die "Container hat kein Netzwerk. Bridge/IP prüfen (CT_BRIDGE, CT_IP)."
  sleep 1
done

# --- Install Kitchen Wall inside the container -------------------------------
info "Installiere Kitchen Wall im Container ..."
pct exec "$CT_ID" -- bash -c "apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq curl ca-certificates >/dev/null"
pct exec "$CT_ID" -- bash -c "curl -fsSL '$REPO_RAW/$KW_BRANCH/deploy/install.sh' | KW_BRANCH='$KW_BRANCH' KW_PORT='$KW_PORT' bash"

IP="$(pct exec "$CT_ID" -- hostname -I | awk '{print $1}')"
echo
info "Fertig! Container $CT_ID läuft und startet automatisch mit Proxmox."
echo "    iPad Dashboard:   http://$IP:$KW_PORT/"
echo "    iPhone Begleiter: http://$IP:$KW_PORT/companion"
echo "    Konsole:          pct enter $CT_ID"
echo "    Update:           pct exec $CT_ID -- bash -c \"curl -fsSL $REPO_RAW/$KW_BRANCH/deploy/install.sh | KW_BRANCH=$KW_BRANCH bash\""
if [ "$CT_IP" = "dhcp" ]; then
  echo
  echo "    Tipp: In der FritzBox für '$CT_HOSTNAME' 'Immer die gleiche IPv4-Adresse zuweisen' aktivieren."
fi
