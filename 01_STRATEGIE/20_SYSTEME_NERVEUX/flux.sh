#!/bin/bash
PROJECT_ROOT="/Users/hachicha/Desktop/digital flux"
SERVER_PORT=3333

echo "================================================="
echo "✅ EMPIRE DIGITAL FLUX V68.9 ROYAL"
echo "================================================="

# 1. PURGE RADICALE DES PARENTS ET DU PORT
echo "🧹 Nettoyage des processus fantômes..."
pgrep -f "flux.sh" | grep -v $$ | xargs kill -9 > /dev/null 2>&1
lsof -ti:$SERVER_PORT | xargs kill -9 > /dev/null 2>&1
sleep 2 # Laisser le temps à l'OS de libérer le socket

# 2. Environnement
source "$PROJECT_ROOT/01_STRATEGIE/20_SYSTEME_NERVEUX/activate_env.sh" 2>/dev/null
mkdir -p "$PROJECT_ROOT/02_AGENTS/00_TELEMETRIE"

# 3. Launch Server in Background
cd "$PROJECT_ROOT/01_STRATEGIE/00_COCKPIT_TACTIQUE"
node "IRIS_CORE_V73.cjs" > "$PROJECT_ROOT/02_AGENTS/00_TELEMETRIE/iris_server.log" 2>&1 &
SERVER_PID=$!

echo "⏳ Initialisation sur Port $SERVER_PORT..."
MAX_RETRIES=15
COUNT=0
while ! lsof -i:$SERVER_PORT > /dev/null 2>&1; do
    sleep 1
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_RETRIES ]; then
        echo "❌ Échec. Rapport d'erreur :"
        tail -n 10 "$PROJECT_ROOT/02_AGENTS/00_TELEMETRIE/iris_server.log"
        exit 1
    fi
done

echo "🧠 Système Nerveux Connecté (PID: $SERVER_PID)"
echo "🌐 Ouverture d'IRIS OS..."
open "http://localhost:$SERVER_PORT"
echo "✅ Prêt pour tes ordres, Boss."
