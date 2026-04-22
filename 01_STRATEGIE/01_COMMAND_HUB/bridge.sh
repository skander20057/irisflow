#!/bin/bash

# --- IRIS CLOUDFLARE BRIDGE (V80.9) ---
# Ce script lance ton cockpit IRIS sur le web sécurisé sans installation.

PORT=3333
HUB_DIR="01_STRATEGIE/01_COMMAND_HUB"
BIN_PATH="$HUB_DIR/cloudflared"

echo "🌌 [IRIS BRIDGE] Initialisation du pont souverain..."

# 1. Détection de l'architecture Mac
ARCH=$(uname -m)
if [ "$ARCH" == "arm64" ]; then
    URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz"
else
    URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz"
fi

# 2. Téléchargement si manquant
if [ ! -f "$BIN_PATH" ]; then
    echo "📥 Téléchargement de l'outil Cloudflare (Version $ARCH)..."
    curl -L "$URL" -o "$HUB_DIR/cloudflared.tgz"
    tar -xzf "$HUB_DIR/cloudflared.tgz" -C "$HUB_DIR"
    rm "$HUB_DIR/cloudflared.tgz"
    chmod +x "$BIN_PATH"
    echo "✅ Outil prêt."
fi

# 3. Lancement du Tunnel
echo "🚀 Lancement du tunnel vers le port $PORT..."
echo "----------------------------------------------------------------"
echo "👉 PATIENTEZ : Une adresse 'https://...trycloudflare.com' va apparaître."
echo "👉 COPIEZ cette adresse sur votre téléphone."
echo "----------------------------------------------------------------"

"$BIN_PATH" tunnel --url http://localhost:$PORT
