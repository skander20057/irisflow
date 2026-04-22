#!/bin/bash
# 🏛️ EMPIRE PURIFIER (V68)
# Routine de maintien de la pureté "Crystal Clean"

PROJECT_ROOT="/Users/hachicha/Desktop/digital flux"

echo "🧹 Début de la purification hebdomadaire..."

# Suppression des résidus Git et Caches
find "$PROJECT_ROOT/02_AGENTS" -name ".git" -type d -exec rm -rf {} +
rm -rf "$PROJECT_ROOT/02_AGENTS/00_MOTEUR_VORTEX/00_SYS_CONFIG/ENVIRONMENT/.infra_storage/npm-cache"

# Suppression des fichiers temporaires (DS_Store, Logs vieux de + de 7 jours)
find "$PROJECT_ROOT" -name ".DS_Store" -delete
find "$PROJECT_ROOT/02_AGENTS/00_TELEMETRIE" -name "*.log" -mtime +7 -delete

# Purge des médias dans la Mine d'Or
find "$PROJECT_ROOT/02_AGENTS/09_KNOWLEDGE_MINE_D_OR" -type f \( -name "*.jpeg" -o -name "*.jpg" -o -name "*.png" -o -name "*.gif" -o -name "*.mp3" -o -name "*.mp4" \) -delete

echo "✅ Empire Purifié. État : Crystal Clean."
