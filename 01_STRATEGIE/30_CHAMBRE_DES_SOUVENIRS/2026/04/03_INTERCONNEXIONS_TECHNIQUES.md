# 🔗 INTERCONNEXIONS TECHNIQUES & SYNCHRONISATION
> **OBJET** : Architecture de Données & Tuyauterie API
> **STATUT** : LIVE / CONNECTED

## 🛠️ RÉSEAU DE SYNCHRONISATION
```mermaid
graph LR
    subgraph "Silo Agent (.md)"
        A1["UUID: BUS-GROWTH-100"]
        A2["UUID: DEV-ENGINE-100"]
    end

    subgraph "Moteur Suprême (Node.js)"
        SVR["Server.cjs (Parser)"]
        CONFIG["CONFIG_ALGO (Price Engine)"]
    end

    subgraph "Source de Vérité (Storage)"
        DB["CRM_PROSPECTS.md"]
        REG["REGISTRE_PILOTAGE.md"]
    end

    subgraph "Interface Cockpit (React)"
        DASH["Dashboard Front-End"]
        KPI["KPI Real-Time Cards"]
    end

    %% Tuyauterie
    A1 -- "Livre [DATA_SYNC]" --> SVR
    A2 -- "Livre [DATA_SYNC]" --> SVR
    SVR -- "Lit Prix" --> CONFIG
    SVR -- "Injecte Leads" --> DB
    SVR -- "Log Activité" --> REG
    DB -- "API /api/crm" --> DASH
    REG -- "API /api/registre" --> DASH
    DASH -- "Rendu Visuel" --> KPI
```

## 📋 MATRICE DE CONNEXION AGENTS
| ID Agent | UUID | Source Data | Cible Database | Sync Dashboard |
| :--- | :--- | :--- | :--- | :--- |
| **BUSINESS** | `BUS-100` | Google/Med.tn | `CRM_PROSPECTS.md` | ✅ API/CRM |
| **DEV** | `DEV-100` | Codebase | `server.cjs` | ✅ LIVE_LOGS |
| **MEDICAL** | `MED-100` | NotebookLM | `REGISTRE.md` | ✅ COMPLIANCE |

## 🛡️ SÉCURITÉ DES ÉCHANGES
1. **Intégrité v3.0** : Toute chaîne de caractères mal formées est rejetée par le `safeRead()`.
2. **Auto-Correction** : Si `product_price` est manquant, le système utilise la valeur par défaut du `CONFIG_ALGO`.
3. **SSE (Social Side Effects)** : Notifications "Live" vers le Dashboard via le flux `notifyUpdate()`.
