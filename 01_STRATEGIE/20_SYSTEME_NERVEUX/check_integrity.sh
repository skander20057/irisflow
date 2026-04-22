#!/bin/bash
# 🏛️ SENTINEL FRACTAL CHECKER (V68)
# Ce script vérifie la pureté absolue de l'Imperium V68.

ROOT="/Users/hachicha/Desktop/digital flux"
echo "🕵️ Scan d'intégrité V68 en cours..."

# 1. Check Racine (Seulement 01, 02, 03 autorisés)
STRAY_FILES=$(ls -1 "$ROOT" | grep -vE "^01_STRATEGIE$|^02_AGENTS$|^03_PROJETS$")
if [ ! -z "$STRAY_FILES" ]; then
    echo "🔴 ALERTE : La racine n'est pas pure ! Détecté : \n$STRAY_FILES"
fi

# 2. Check Piliers Stratégie
FRAGMENTS=("00_COCKPIT_TACTIQUE" "10_LOIS_ET_FONDATIONS" "20_SYSTEME_NERVEUX" "30_CHAMBRE_DES_SOUVENIRS")
for frag in "${FRAGMENTS[@]}"; do
    if [ ! -d "$ROOT/01_STRATEGIE/$frag" ]; then
        echo "🔴 ERREUR : Fragment Stratégique manquant -> $frag"
    fi
done

# 3. Check Piliers Projets
PIPELINE=("01_CHANTIER_LIVE" "02_LIVRABLES_SCELLES" "03_RESSOURCES_COMMUNES")
for step in "${PIPELINE[@]}"; do
    if [ ! -d "$ROOT/03_PROJETS/$step" ]; then
        echo "🔴 ERREUR : Pipeline Projet manquant -> $step"
    fi
done

echo "✅ Scan terminé."
