# 🛡️ MASTER RECOVERY : IRIS SOUVERAIN V81

Ce document est le sceau de ton architecture. Il permet de restaurer l'intégralité du système en cas de sinistre ou de transition vers un nouvel agent assistant.

---

## 🏗️ 1. CARTOGRAPHIE DES MOTEURS (ENGINES)

| Composant | Fichier Source | État | Rôle |
| :--- | :--- | :--- | :--- |
| **Backend Core** | `01_STRATEGIE/00_COCKPIT_TACTIQUE/IRIS_CORE_V73.cjs` | 🟢 ACTIF (Port 3333) | API, Gestion des fichiers MD, Sync CRM. |
| **Frontend UI** | `01_STRATEGIE/00_COCKPIT_TACTIQUE/index.html` | 🟢 V80.7 | Dashboard Tactique, Calendrier Smart, Radar CRM. |
| **Configuration** | `01_STRATEGIE/10_LOIS_ET_FONDATIONS/PATHS_MASTER.json` | 🟢 ACCORDÉ | Boussole des chemins absolus et relatifs. |

### 🚀 Protocole de Relance (Critical)
Si l'interface affiche "Crash Liaison Terminal" ou si les données ne s'écrivent plus :
1.  **Libérer le port** : `kill -9 $(lsof -t -i:3333)`
2.  **Lancer le moteur** : `node "01_STRATEGIE/00_COCKPIT_TACTIQUE/IRIS_CORE_V73.cjs"`

---

## 📊 2. STRUCTURE DES DONNÉES (SCHEMA)

### A. Registre CRM (`CRM_PROSPECTS.md`)
Structure immuable à 10 colonnes :
`| Nom | Téléphone | Spécialité | Zone | Score | Funnel | Site | Maps | Med.tn | Diagnostic |`
*Note : Le nom du prospect DOIT être entouré de doubles étoiles `**Nom**` pour être indexé par le backend.*

### B. Registre Calendrier (`CALENDRIER_RDV.md`)
`| Date | Heure | Prospect | Note | Statut |`
*Format Date : YYYY-MM-DD (Automatisé).*

---

## 🧠 3. LOGIQUE DISCRÈTE (BACKEND SYNC)

L'intelligence du système repose sur trois fonctions scellées dans `V73` :
1.  **Atomic Sync** : Utilisation de `Promise.allSettled` pour charger les modules sans effet domino.
2.  **Optimistic UI** : Injection immédiate des RDV dans l'interface avant confirmation physique.
3.  **Physical Write Link** : Liaison directe entre la validation CRM et l'écriture dans `CALENDRIER_RDV.md`.

---

## 🛸 4. GOUVERNANCE DES PÔLES (8 PÔLES)

L'organisation Iris est désormais segmentée en 8 pôles stratégiques :
1. **Direction Stratégique** | 2. **Commercial & Sales** | 3. **Créatif & Design** | 4. **Tech & Cyber** | 5. **Médical & Santé** | 6. **Finance & ROI** | 7. **Juridique & Contrat** | 8. **R&D & Innovation**.

---
**SCELLEMENT EFFECTUÉ LE : 2026-04-21**  
*Par Antigravity — Architecte de l'Empire Digital Flux*
