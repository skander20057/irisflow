# 🕹️ HUB DE COMMANDEMENT D'AUTOMATION

Ce document est le centre de pilotage des outils techniques de l'agence Digital Flux. Il fait le pont entre le **Pôle 01 (Direction)** et le **Pôle 04 (Tech)**.

---

## 🧭 Répertoire des Pouvoirs Actifs

### 📡 1. Prospection & Sourcing (Sales)
-   **Moteur** : `02_AGENTS/04_MOTEURS_AGENTS/ENGINE_V72_SOUVERAIN/HYPER_SOURCER.cjs`
-   **Rôle** : Extraction massive de leads médicaux réels.
-   **Manuel** : Les agents doivent utiliser ce moteur pour remplir le CRM sans hallucination.

### 🔍 2. Diagnostic & Audit SEO (Intelligence)
-   **Moteur** : `02_AGENTS/04_MOTEURS_AGENTS/ENGINE_V72_SOUVERAIN/SEO_SCANNER.cjs`
-   **Rôle** : Audit automatique des faiblesses web des prospects.
-   **Action** : Injecte le diagnostic directement dans la colonne 11 du CRM.

### 🎨 3. Usine d'Assets IA (Création)
-   **Moteur** : `02_AGENTS/04_MOTEURS_AGENTS/ENGINE_V72_SOUVERAIN/ASSET_FACTORY.cjs`
-   **Rôle** : Génération d'identité visuelle (Palettes, Images Hero).
-   **Action** : Création automatique du dossier `projects/NOM_PROJET`.

### 🛡️ 4. Surveillance & Stabilité (Sentinelle)
-   **Moteur** : `02_AGENTS/04_MOTEURS_AGENTS/ENGINE_V72_SOUVERAIN/GUARDIAN_3333.cjs`
-   **Rôle** : Maintien du Port 3333 opérationnel 24h/24.
-   **Auto-Heal** : Redémarre le serveur en cas de crash.

---

## ⚡ Commandes Rapides pour les Agents (CLI)

> [!TIP]
> **Orchestration Globale** : Pour lancer un cycle complet d'Audit + Apprentissage :
> `node 02_AGENTS/04_MOTEURS_AGENTS/ENGINE_V72_SOUVERAIN/PENTAGONE_AUTO.cjs`

---
*Ce document est la source de vérité pour le pilotage technique. Respectez la Lex Elite.*
