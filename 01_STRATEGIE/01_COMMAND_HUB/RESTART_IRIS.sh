#!/bin/bash

# --- IRIS NUCLEAR RESTART (V82.0) ---
# Ce script purge le port 3333 et relance tout le système.

PORT=3333
IRIS_CORE="01_STRATEGIE/00_COCKPIT_TACTIQUE/IRIS_CORE_V73.cjs"
BRIDGE="01_STRATEGIE/01_COMMAND_HUB/bridge.sh"

echo "☢️  [NUCLEAR] Amorçage de la purge système..."

# 1. Libération du Port 3333
echo "🔍 Vérification du port $PORT..."
PIDS=$(lsof -ti:$PORT)
if [ ! -z "$PIDS" ]; then
    for pid in $PIDS; do
        echo "💀 Suppression du processus fantôme $pid..."
        kill -9 $pid 2>/dev/null
    done
    sleep 1
fi

# 2. Vérification des permissions
chmod +x "$BRIDGE"

# 3. Relance du Noyau IRIS
echo "🚀 Redémarrage du Noyau IRIS..."
node "$IRIS_CORE" &

# 4. Attente du démarrage
sleep 2

# 5. Ouverture du Tunnel Mobile
echo "📡 Activation du Pont Mobile (Cloudflare)..."
bash "$BRIDGE"
