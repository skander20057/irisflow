const fs = require('fs');
const path = require('path');
const { getPath } = require('./paths.cjs');
const { mineSkills, getSkillContent } = require('../ENGINE_CORE/intelligence/skill_miner.cjs');


const AGENTS_DIR = getPath('INTELLIGENCE', 'AGENTS');
// Correction du chemin vers le département spécifique (Pôle 02)
const MISSION_FILE = path.join(AGENTS_DIR, '02_POLE_COMMERCIAL_SALES', 'AGENT_BUSINESS', 'TRAVAIL_A_FAIRE', 'MISSION_PROS_45.md');

const LOGS = [
    "🔍 [SCAN] Analyse des fréquences sur Med.tn...",
    "🛰️ [DETECT] Signal identifié : Dr. Ahmed (Ophtalmo, Tunis)",
    "💾 [SAVE] Extraction des métadonnées numériques...",
    "🔍 [SCAN] Pivotement vers le secteur Sousse...",
    "🛰️ [DETECT] Signal identifié : Clinique Les Jasmins",
    "💾 [SAVE] Synchronisation avec le CRM Central...",
    "🔍 [SCAN] Analyse des avis Google (Précision 98%)...",
    "🛰️ [DETECT] Signal identifié : Cabinet dentaire El Manar",
    "💾 [SAVE] Cryptage et transfert vers 00_PILOTAGE..."
];

const PROSPECTS = [
    "| **Clinique El Amen** | Ophtalmologie | +216 71 888 777 | Tunis, Mutuelleville | Web/Med.tn | 4.8/5 | DIGITAL_READY | 450 TND |",
    "| **Dr. Nadia Ben Salah** | Dermatologie | +216 73 444 555 | Sousse, Khezama | Annuaire | 4.5/5 | NEEDS_SEO | 450 TND |",
    "| **Centre Médical Hannibal** | Chirurgie | +216 71 111 222 | Lac 2, Tunis | Google Maps | 4.9/5 | HIGH_POTENTIAL | 450 TND |"
];

console.log("🚀 [SIMULATION] Lancement de l'Agent Business (Mode Fantôme)...");

let logIndex = 0;
let prosIndex = 0;

function simulate() {
    if (!fs.existsSync(MISSION_FILE)) {
        console.error("❌ Fichier de mission introuvable. Simulation arrêtée.");
        return;
    }

    // --- CHECK STATUS ---
    const regPath = path.join(getPath('COMMAND', 'CONFIG'), 'REGISTRE_PILOTAGE.md');

    try {
        const reg = fs.readFileSync(regPath, 'utf8');
        if (reg.includes('EN PAUSE')) {
            console.log("⏸️ [SIM] Mission en pause. En attente...");
            setTimeout(simulate, 5000);
            return;
        }
        if (reg.includes('ARRÊTÉ')) {
            console.log("🛑 [SIM] Mission arrêtée. Script terminé.");
            process.exit(0);
        }
    } catch (e) {
        console.error("⚠️ [SIM] Erreur lecture registre:", e.message);
    }
    // --------------------

    const log = LOGS[logIndex % LOGS.length];
    const pros = PROSPECTS[prosIndex % PROSPECTS.length];

    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const update = `\n> [${timestamp}] ${log}\n${logIndex % 3 === 0 ? pros + '\n' : ''}`;

    fs.appendFileSync(MISSION_FILE, update);
    console.log(`📡 [SIM] Update envoyé : ${log}`);

    logIndex++;
    if (logIndex % 3 === 0) prosIndex++;

    // Intervalle aléatoire entre 3 et 7 secondes
    setTimeout(simulate, 3000 + Math.random() * 4000);
}

// Initialisation du tableau si vide
if (fs.existsSync(MISSION_FILE)) {
    let content = fs.readFileSync(MISSION_FILE, 'utf8');
    if (!content.includes('| Prospect |')) {
        const header = `\n### 📊 DONNÉES EXTRAITES (LIVE)\n| Prospect | Spécialité | Téléphone | Zone | Source | Avis | Statut | Valeur |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
        fs.appendFileSync(MISSION_FILE, header);
    }
}

// Injection de l'expertise de la Mine d'Or (V50 Sovereign Vortex)
const { mineSynapses } = require('../ENGINE_CORE/intelligence/skill_miner.cjs');
const missionContext = "prospecting";
const eliteSkills = mineSkills(missionContext);
const synapses = mineSynapses('AGENT_BUSINESS');

if (eliteSkills.length > 0) {
    const skill = eliteSkills[0];
    
    let expertiseBadge = `\n---\n`;
    expertiseBadge += `> [!IMPORTANT]\n`;
    expertiseBadge += `> **💎 EXPERTISE MINE D'OR ACTIVÉE (V50)**\n`;
    expertiseBadge += `> **SOP :** ${skill.name}\n`;
    expertiseBadge += `> **STRATÉGIE :** ${skill.description}\n`;
    
    if (synapses.length > 0) {
        expertiseBadge += `> \n`;
        expertiseBadge += `> **🧠 CONNAISSANCES RÉCURSIVES (SYNAPSES)**\n`;
        synapses.forEach(s => {
            expertiseBadge += `> - [${s.topic}] : ${s.lesson}\n`;
        });
    }

    expertiseBadge += `> \n`;
    expertiseBadge += `> *Ce module d'intelligence souveraine et auto-évolutive a été injecté.* \n`;
    expertiseBadge += `---\n\n`;

    // On n'injecte le badge qu'une seule fois au début
    if (!fs.existsSync(path.dirname(MISSION_FILE))) fs.mkdirSync(path.dirname(MISSION_FILE), { recursive: true });
    if (!fs.existsSync(MISSION_FILE)) fs.writeFileSync(MISSION_FILE, "# 🎯 MISSION BUSINESS : PROSPECTING\n");

    let content = fs.readFileSync(MISSION_FILE, 'utf8');
    if (!content.includes("EXPERTISE MINE D'OR ACTIVÉE")) {
        const lines = content.split('\n');
        lines.splice(2, 0, expertiseBadge); 
        fs.writeFileSync(MISSION_FILE, lines.join('\n'));
        console.log(`✨ [SIM] Expertise "${skill.name}" et ${synapses.length} synapses injectées.`);
    }
}

simulate();

