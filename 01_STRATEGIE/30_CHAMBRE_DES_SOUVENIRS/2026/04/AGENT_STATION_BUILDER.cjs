/**
 * 🧪 HÉPHAÏSTOS V1.0 - L'USINE À AGENTS SOUVERAINS
 * Digital Flux Multinational Agent Factory
 */

const fs = require('fs');
const path = require('path');

const AGENTS_ROOT = "/Users/hachicha/Desktop/digital flux/02_AGENTS/NOS_AGENTS_D_ELITE";

const BUREAU_FOLDERS = [
    "01_BRIEFING_INPUT",
    "02_STRATEGIE_CONCEPT",
    "03_PRODUCTION_HUB",
    "04_LIVRABLES_SOUVERAINS",
    "05_VALIDATION_LIVRE",
    "06_ASSET_LIBRARY",
    "07_CORE_PROTOCOLS",
    "99_HISTORIQUE"
];

function forgeAgent(poleFolderName, agentName, expertise) {
    const polePath = path.join(AGENTS_ROOT, poleFolderName);
    if (!fs.existsSync(polePath)) {
        console.error(`❌ Pôle non trouvé : ${poleFolderName}`);
        return;
    }

    const agentPath = path.join(polePath, `AGENT_${agentName.toUpperCase()}`);
    if (fs.existsSync(agentPath)) {
        console.log(`⚠️ L'agent ${agentName} existe déjà.`);
        return;
    }

    console.log(`🏭 Forgerie de l'AGENT_${agentName.toUpperCase()} dans ${poleFolderName}...`);

    // 1. Création Physique
    fs.mkdirSync(agentPath, { recursive: true });
    BUREAU_FOLDERS.forEach(folder => {
        fs.mkdirSync(path.join(agentPath, folder));
    });

    // 2. Génération des Instructions de Base
    const instructions = `# 🛡️ INSTRUCTIONS SOUVERAINES : AGENT ${agentName.toUpperCase()}
**Expertise : ${expertise}**

## 🏛️ RÔLE ET MISSION
Vous êtes une extension souveraine de Digital Flux spécialisée en ${expertise}. 
Votre but est de délivrer des actifs de Haute-Fidélité certifiés.

## ⚙️ PROTOCOLES OPÉRATIONNELS
- **Phase 01** : Analyse du brief CEO ou Orchestrateur.
- **Phase 02** : Établissement d'une stratégie conceptuelle dans le dossier 02.
- **Phase 04** : Livraison finale certifiée avec le suffixe _CERTIFIED.md.

---
*Généré par Héphaïstos V1.0 - Digital Flux Multinational Agent Factory*`;

    fs.writeFileSync(path.join(agentPath, 'INSTRUCTIONS.md'), instructions, 'utf8');

    console.log(`✅ AGENT_${agentName.toUpperCase()} déployé avec succès.`);
}

// Interface ligne de commande simple
const [,, pole, name, skill] = process.argv;
if (pole && name && skill) {
    forgeAgent(pole, name, skill);
} else {
    console.log("Usage: node AGENT_STATION_BUILDER.cjs [POLE_FOLDER] [NAME] [EXPERTISE]");
    console.log("Exemple: node AGENT_STATION_BUILDER.cjs 03_POLE_CREATIF_DESIGN SEO EXPERT_VISIBILITE");
}
