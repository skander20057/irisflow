#!/bin/bash
# 🏛️ DIGITAL FLUX - SOURCE D'ENVIRONNEMENT (V50.15)
# Usage: source 01_STRATEGIE/01_COMMAND_HUB/activate_env.sh

# 🌍 Détection du dossier projet (Bash & Zsh compatible)
if [ -n "$BASH_SOURCE" ]; then SCRIPT_PATH="$BASH_SOURCE"; else SCRIPT_PATH="${(%):-%x}"; fi
PROJECT_ROOT="$(cd "$(dirname "$SCRIPT_PATH")/../.." && pwd)"

# 🚀 Injection des chemins (PATH)
export PATH="$HOME/.local/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

# ⚙️ Injection automatique des variables depuis settings.json
if [ -f "$PROJECT_ROOT/settings.json" ]; then
    echo "⚡ Nettoyage et chargement des réglages OpenRouter..."
    unset ANTHROPIC_AUTH_TOKEN  # Évite les conflits d'authentification
    eval $(node -e "
        try {
            const settings = require('$PROJECT_ROOT/settings.json');
            if (settings.env) {
                Object.entries(settings.env).forEach(([k, v]) => {
                    console.log('export ' + k + '=\"' + v + '\"');
                });
            }
        } catch(e) {}
    ")
fi

# 🧠 Aliases pour Agents d'Élite
alias ag='bash "$PROJECT_ROOT/01_STRATEGIE/20_SYSTEME_NERVEUX/flux.sh"'
alias flux='bash "$PROJECT_ROOT/01_STRATEGIE/20_SYSTEME_NERVEUX/flux.sh"'
alias flux_core='source "$PROJECT_ROOT/01_STRATEGIE/20_SYSTEME_NERVEUX/activate_env.sh"'

echo "================================================="
echo "✅ ENVIRONNEMENT DIGITAL FLUX ACTIVÉ"
echo "-------------------------------------------------"
echo "🤖 Commande 'ag' : Prête (Pilotage Antigravity)"
echo "🛰️ Commande 'flux' : Prête (Lancement Empire)"
echo "================================================="
echo "Tapez 'flux' pour lancer l'écosystème complet."
