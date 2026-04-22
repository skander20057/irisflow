#!/bin/bash
# 🚀 IRIS SOVEREIGN LAUNCHER (V400)
echo "🌐 [IRIS] Démarrage du Cockpit Tactique..."

# Kill previous instances to avoid EADDRINUSE
lsof -ti :3333 | xargs kill -9 2>/dev/null

# Find the latest IRIS_CORE version
LATEST_CORE=$(ls -v "/Users/hachicha/Desktop/digital flux/01_STRATEGIE/00_COCKPIT_TACTIQUE"/IRIS_CORE_V*.cjs | tail -n 1)

if [ -z "$LATEST_CORE" ]; then
    echo "❌ Erreur : Aucun noyau IRIS_CORE trouvé."
    exit 1
fi

echo "🧬 Noyau détecté : $(basename "$LATEST_CORE")"
node "$LATEST_CORE"
