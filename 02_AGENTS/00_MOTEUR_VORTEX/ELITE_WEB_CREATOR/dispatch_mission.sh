#!/bin/bash

# 🌉 DIGITAL FLUX ELITE BRIDGE (ANTIGRAVITY ↔ CLAUDE CODE)
# Ce script permet à Antigravity de déléguer des missions d'exécution à Claude Code.
# IMPORTANT: Ce script doit être exécuté depuis la RACINE du projet Digital Flux.

CLIENT_NAME=$1
PROJECT_TYPE=$2
STYLE=$3
EXTRA_INSTRUCTIONS=$4

# Détection dynamique de la racine du projet
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CLAUDE_BIN="$PROJECT_ROOT/04_TECH/ENVIRONMENT/scratch/claude-install/node_modules/.bin/claude"
TARGET_DIR="$PROJECT_ROOT/03_PROJETS/01_SITES_WEB/${CLIENT_NAME// /_}"

echo "🌉 Pont de Commande Elite Activé."
echo "📁 Racine Projet : $PROJECT_ROOT"
echo "🎯 Mission : Création de $PROJECT_TYPE pour $CLIENT_NAME."
echo "🎨 Style : $STYLE."

mkdir -p "$TARGET_DIR"

# Lancement de Claude Code en mode mission automatique
cd "$PROJECT_ROOT"
$CLAUDE_BIN "Tu es l'exécuteur technique de Digital Flux. Ta mission est de créer un site pour $CLIENT_NAME ($PROJECT_TYPE) dans le dossier $TARGET_DIR. 
Lois à respecter : 
1. Utilise les Skills UI/UX Pro Max pour un design WOW.
2. Applique le style $STYLE.
3. Données réelles uniquement (Lex Veritas).
Instructions spécifiques : $EXTRA_INSTRUCTIONS"
