#!/bin/bash
# 🏛️ DIGITAL FLUX - CRYSTAL CLEAN ROOT (V51)
# Ce script assure que la racine reste vide de tout bruit technique.

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "🧹 Scan Crystal Clean de la racine..."

# 1. Nettoyage du dossier scratch
# (Obsolète, Zone Transit remplacée par SCRATCH_LAB dans TECH)

# 2. Nettoyage des fichiers résiduels root
rm -f "$PROJECT_ROOT/npm-debug.log" "$PROJECT_ROOT/yarn-error.log" 2>/dev/null
rm -f "$PROJECT_ROOT/.DS_Store" 2>/dev/null

# 3. Vérification des Gateways
if [ ! -f "$PROJECT_ROOT/LEX_ELITE.md" ]; then
    echo "⚠️ Alerte : Bible LEX_ELITE.md manquante !"
fi

echo "✨ Racine Crystal Clean."
