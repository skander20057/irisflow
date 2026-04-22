const fs = require('fs');
const path = require('path');
const { getPath } = require('./paths.cjs');
const hub = require('./REGISTRY_HUB.cjs');
const { auditFile } = require('../ENGINE_CORE/validation/quality_auditor.cjs');
const { dispatchMission, findBestSkill } = require('./VORTEX_CORE.cjs');

// --- 💎 PATHS V130 PIPELINE DE CRISTAL (DYNAMIQUE) ---
const { ROOT_DIR } = require('./paths.cjs');
const ROOT = ROOT_DIR;
const CEO_INPUT_DIR = path.join(ROOT, "01_STRATEGIE/00_PILOTAGE_LIVE/02_ENTREE_CEO");
const REVIEW_DIR = getPath('COMMAND', 'CERTIFICATION');
const SHOWCASE_DIR = getPath('COMMAND', 'LIVRABLES');
const RADAR_MD_PATH = getPath('TECH', 'COCKPIT');
const CORE_LEDGER_PATH = path.join(ROOT, "01_STRATEGIE/00_PILOTAGE_LIVE/01_COCKPIT_TACTIQUE/ANTIGRAVITY_CORE.md");
const REGISTRY_DIR = getPath('COMMAND', 'REGISTRE');
const PID_FILE = path.join(REGISTRY_DIR, "ORCHESTRATOR.pid");

// --- 📓 JOURNAL DE CONSCIENCE ALPHA ---
function logStrategicIntent(missionId, agent, skill, intent) {
    const skillUri = `file:///${ROOT.replace(/ /g, '%20')}/02_AGENTS/NOS_AGENTS_D_ELITE/09_KNOWLEDGE_MINE_D_OR/MINE_D_OR_DE_SKILLS/EXTRACTED/plugins/antigravity-awesome-skills/skills/${skill}.md`;
    const entry = `\n### 🛡️ [${new Date().toLocaleString()}] MISSION : ${missionId}\n` +
                  `- **Stratégie** : ${intent}\n` +
                  `- **Expertise Mobilisée** : ${agent}\n` +
                  `- **Skill Miné (Mine d'Or)** : [${skill}](${skillUri})\n` +
                  `---`;
    fs.appendFileSync(CORE_LEDGER_PATH, entry);
}

// --- 🚚 MOTEUR D'AUTO-LIVRAISON CERTIFIÉE ---
function handleAutoDelivery(filename) {
    const filePath = path.join(REVIEW_DIR, filename);
    if (!fs.existsSync(filePath)) return;
    
    // Condition de livraison : Fichier contient '_CERTIFIED' ou est déposé dans Revue
    const isCertified = filename.includes('_CERTIFIED') || filename.includes('_CERTIF');
    if (isCertified) {
        try {
            const targetPath = path.join(SHOWCASE_DIR, filename);
            fs.renameSync(filePath, targetPath);
            console.log(`💎 [SHOWCASE] Livraison Royale effectuée : ${filename}`);
            
            const missionId = filename.split('_')[0];
            hub.addTrace(missionId, 'SHOWCASE', "Exposition dans la Vitrine des Valeurs Scellées", 'SENTINELLE');
            updateRadarMD(true);
        } catch (e) {
            console.error("⚠️ [DELIVERY_ERR]", e.message);
        }
    }
}

fs.watch(REVIEW_DIR, (event, filename) => {
    if (filename && (filename.endsWith('.md') || filename.endsWith('.html') || filename.endsWith('.png'))) {
        setTimeout(() => handleAutoDelivery(filename), 1000);
    }
});


function pruneOldRadars() {
    try {
        const dir = path.dirname(RADAR_MD_PATH);
        const currentFile = path.basename(RADAR_MD_PATH);
        const files = fs.readdirSync(dir);
        files.forEach(f => {
            if (f.startsWith('OMNISCIENCE_RADAR_V') && f !== currentFile && f.endsWith('.md')) {
                fs.unlinkSync(path.join(dir, f));
                console.log('🧹 [JANITOR] Version obsolète supprimée :', f);
            }
        });
    } catch(e) {}
}

const MY_PID = process.pid;
if (!fs.existsSync(REGISTRY_DIR)) fs.mkdirSync(REGISTRY_DIR, { recursive: true });
fs.writeFileSync(PID_FILE, MY_PID.toString());
console.log(`🌪️ [OMNISCIENCE] V118 PURE SANCTUARY Core Active (PID: ${MY_PID})`);

let LAST_TACTICAL_SNAPSHOT = ""; 
let LAST_FILE_WRITE_TIME = 0;   
let isWriting = false; 
const STALE_THRESHOLD = 60000; 

function checkZombies() {
    try {
        const currentPid = fs.readFileSync(PID_FILE, 'utf8');
        if (currentPid !== MY_PID.toString()) process.exit(0);
    } catch(e) {}
}

const POLES_MAP = {
    "01 DIRECTION": ["AGENT_SYNTHESE"],
    "02 COMMERCIAL": ["AGENT_BUSINESS"],
    "03 CREATIF": ["AGENT_ARCHITECT", "AGENT_COPYWRITER", "AGENT_DESIGNER", "AGENT_SEO"],
    "04 TECH": ["AGENT_CYBER_DEBUG", "AGENT_DEV"],
    "05 MEDICAL": ["AGENT_MEDICAL"],
    "06 FINANCE": ["AGENT_FINANCE"],
    "07 JURIDIQUE": ["AGENT_JURIDIQUE"],
    "08 RD": ["AGENT_RD"]
};

const INTENT_MATRIX = {
    "SYNTHESE": { pole: "01 DIRECTION", kw: /synthèse|audit global|nexus|résumé/i, agent: "AGENT_SYNTHESE", skill: "executive-summary", task: "Cadrage Stratégique" },
    "BUSINESS": { pole: "02 COMMERCIAL", kw: /stratégie|business|marché|revenu|commercial|rentabilité|audit|campagne|médicament/i, agent: "AGENT_BUSINESS", skill: "ad-creative", task: "Développement Affaires" },
    "DESIGNER": { pole: "03 CREATIF", kw: /design|logo|ui|visuel|charte|créatif/i, agent: "AGENT_DESIGNER", skill: "3d-web-experience", task: "Création Visuelle" },
    "COPYWRITER": { pole: "03 CREATIF", kw: /texte|article|copy|blog|contenu/i, agent: "AGENT_COPYWRITER", skill: "advanced-evaluation", task: "Contenu Premium" },
    "ARCHITECT": { pole: "03 CREATIF", kw: /architecture|structure|nexus/i, agent: "AGENT_ARCHITECT", skill: "acceptance-orchestrator", task: "Architecture Nexus" },
    "DEV": { pole: "04 TECH", kw: /code|dev|app|site|fonctionnalité|technique/i, agent: "AGENT_DEV", skill: "agent-tool-builder", task: "Ingénierie Tech" },
    "CYBER_DEBUG": { pole: "04 TECH", kw: /cyber|debug|sécurité|audit code/i, agent: "AGENT_CYBER_DEBUG", skill: "007", task: "Cyber Audit" },
    "MEDICAL": { pole: "05 MEDICAL", kw: /santé|médical|bio|regulatory|médicament|scan/i, agent: "AGENT_MEDICAL", skill: "Analyse Médicale", task: "Contrôle Médical" },
    "FINANCE": { pole: "06 FINANCE", kw: /finance|roi|budget|rentabilité|chiffre|audit/i, agent: "AGENT_FINANCE", skill: "Audit Financier", task: "Audit de ROI" },
    "JURIDIQUE": { pole: "07 JURIDIQUE", kw: /droit|juridique|contrat|légal/i, agent: "AGENT_JURIDIQUE", skill: "Analyse Légale", task: "Audit Légal" },
    "RD": { pole: "08 RD", kw: /innovation|recherche|rd|tendances/i, agent: "AGENT_RD", skill: "Veille R&D", task: "Innovation Lab" },
    "SEO": { pole: "03 CREATIF", kw: /seo|référencement|google|ranking|mots[- ]?clés|backlink/i, agent: "AGENT_SEO", skill: "seo-optimization", task: "Optimisation SEO" }
};

function formatDuration(ms) {
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    return `${min}m ${sec % 60}s`;
}

function updateRadarMD(forceUpdate = false) {
    if (isWriting) return;
    isWriting = true;
    checkZombies();
    try {
        const { pulse, traces } = hub.getFullContext();
        const ids = Object.keys(traces).sort((a,b) => traces[b].metadata.start - traces[a].metadata.start);
        const now = Date.now();
        const poleStatus = {}; 
        const finishedMissions = [];
        let tacticalSnapshot = ""; 

        Object.keys(POLES_MAP).forEach(p => poleStatus[p] = { state: "🔴 EN VEILLE", mission: " --- ", expert: " --- ", task: "Prêt", start: "---", duration: "---" });

        ids.forEach(id => {
            if (!traces[id] || !traces[id].history) return;
            const h = traces[id].history;
            if (h.length === 0) return;
            const latest = h[h.length - 1];
            const startT = traces[id].metadata.start;
            const label = traces[id].metadata.label || id;
            const isStale = (now - latest.time) > STALE_THRESHOLD;

            if (latest.step === 'LIVRAISON' || latest.step === 'CERTIFICATION' || isStale) {
                if (!isStale) finishedMissions.push({ id: label, end: latest.time, start: startT });
            } else {
                tacticalSnapshot += `|${id}:${latest.step}:${latest.status}`;
                h.forEach(entry => {
                    const agName = entry.agent;
                    const agKey = agName.startsWith('AGENT_') ? agName : `AGENT_${agName}`;
                    for (const [pName, agents] of Object.entries(POLES_MAP)) {
                        if (agents.includes(agKey)) {
                            if (poleStatus[pName].state === "🔴 EN VEILLE" || poleStatus[pName].mission === " --- ") {
                                poleStatus[pName] = {
                                    state: "🟢 EN ACTIVITÉ",
                                    mission: `**${label.substring(0, 35)}**`,
                                    expert: agKey.replace('AGENT_', ''),
                                    task: entry.status,
                                    start: new Date(startT).toLocaleTimeString(),
                                    duration: formatDuration(now - startT)
                                };
                            }
                        }
                    }
                });
            }
        });

        const isTacticalChange = tacticalSnapshot !== LAST_TACTICAL_SNAPSHOT;
        const timeSinceLastWrite = now - LAST_FILE_WRITE_TIME;

        if (!forceUpdate && !isTacticalChange && timeSinceLastWrite < 30000) {
            return;
        }

        LAST_TACTICAL_SNAPSHOT = tacticalSnapshot;
        LAST_FILE_WRITE_TIME = now;

        let content = `# 🦅 OMNISCIENCE : Radar PURE V118 SOUVERAIN\n\n`;
        content += `> [!NOTE]\n`;
        content += `> **📡 ETAT : ORDRE IMPÉRIAL (V118)**\n`;
        content += `> **HIÉRARCHIE PAR PILIERS (V118)** | **SYNC : LIVE**\n\n`;
        
        content += `## 🏛️ I. ÉTAT DES PÔLES (CŒUR DES OPÉRATIONS)\n`;
        content += `| Pôle | Statut Global | Mission Active | Expert | Tâche Live | Début | Durée |\n`;
        content += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
        Object.keys(POLES_MAP).sort().forEach(pole => {
            const p = poleStatus[pole];
            content += `| ${pole} | **${p.state}** | ${p.mission} | ${p.expert} | ${p.task} | ${p.start} | ${p.duration} |\n`;
        });

        content += `\n## 🕒 II. MISSIONS RÉCENTES TERMINÉES\n`;
        content += `| Heure Fin | Nom de la Mission | Durée |\n`;
        content += `| :--- | :--- | :--- |\n`;
        finishedMissions.sort((a,b) => b.end - a.end).slice(0, 5).forEach(m => {
            content += `| ${new Date(m.end).toLocaleTimeString()} | **${m.id}** | ${formatDuration(m.end - m.start)} |\n`;
        });

        content += `\n## 📋 III. JOURNAL TACTIQUE V118\n`;
        content += `| Heure | Mission | Expertise | Action Certifiée |\n`;
        content += `| :--- | :--- | :--- | :--- |\n`;
        let logs = [];
        ids.forEach(id => { 
            if (traces[id] && traces[id].history) {
                traces[id].history.forEach(h => logs.push({...h, mission: traces[id].metadata.label || id})); 
            }
        });
        logs.sort((a,b) => b.time - a.time).slice(0, 8).forEach(l => {
            content += `| ${new Date(l.time).toLocaleTimeString()} | **${l.mission.substring(0, 25)}** | ${l.agent} | ${l.status} |\n`;
        });

        content += `\n---\n\n## 🗺️ IV. SCHÉMA DU FLUX SOUVERAIN (A → Z)\n`;
        content += `*Parcours d'une mission de sa genèse à sa valeur scellée.*\n\n`;
        content += "```mermaid\ngraph LR\n    A[02_CEO] -->|Dépôt| B(ORCHESTRATEUR)\n    B -->|Ingestion| C{WORKFLOW}\n    C -->|Prod| D[02_PRODUCTION]\n    D -->|Audit| E[03_REVUE]\n    E -->|Scellé| F[02_RETOUR_SHOWCASE]\n```\n\n";
        content += `1. **DÉPÔT** : Dossier \`02_ENTREE_CEO\`.\n`;
        content += `2. **PRODUCTION** : Dossiers de Pôles et Production Live.\n`;
        content += `3. **LIVRAISON** : Vitrine des \`VALEURS ET LIVRABLES SCELLÉS\`.\n\n`;

        content += `## 🧠 V. PROTOCOLE DE PENSÉE AGENT (V130)\n`;
        content += `*Transparence totale sur la méthodologie de travail.*\n\n`;
        content += `- **PROT_TRACE** : Chaque expert logge son raisonnement dans \`METHODOLOGIE.md\`.\n`;
        content += `- **PROT_VORTEX** : Travail isolé par dossier de mission.\n`;
        content += `- **PROT_SENTINELLE** : Audit qualité obligatoire avant transfert en vitrine.\n\n`;

        content += `\n---\n*Digital Flux Omniscience V118 SOUVERAIN (Crystal Sanctuary Edition)*\n`;
        
        const tmp = RADAR_MD_PATH + ".tmp";
        fs.writeFileSync(tmp, content, 'utf8');
        fs.renameSync(tmp, RADAR_MD_PATH);
        
    } catch(e) { console.error("⚠️ [OMNISCIENCE_V118_ERR]", e.message); }
    finally { isWriting = false; }
}

function processCEOEntry(filename) {
    const filePath = path.join(CEO_INPUT_DIR, filename);
    if (!fs.existsSync(filePath)) return;
    const missionId = filename.replace('.md', '');
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/^#\s+(.*)/m);
    const missionTitle = match ? match[1].trim() : missionId;

    hub.addTrace(missionId, 'INGESTION', `Ordre CEO : ${missionTitle}`, 'COO');
    hub.updateMetadata(missionId, missionTitle);
    hub.addTrace(missionId, 'STRATEGIC_OVERSIGHT', "Pôle 01 : Cadrage Stratégique", 'AGENT_SYNTHESE');

    const low = content.toLowerCase();
    Object.keys(INTENT_MATRIX).forEach(role => {
        if (low.match(INTENT_MATRIX[role].kw)) {
            const im = INTENT_MATRIX[role];
            if (im.agent !== 'AGENT_SYNTHESE') {
                const skillId = findBestSkill(im.task);
                dispatchMission(im.agent, missionId, skillId);
                hub.addTrace(missionId, 'PRODUCTION', `${im.agent.replace('AGENT_', '')} : ${im.task}`, im.agent);
                logStrategicIntent(missionId, im.agent, skillId, im.task);
            }
        }
    });

    try {
        const now = new Date();
        const monthDir = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const category = filename.startsWith('MISSION_') ? '01_MISSIONS_OFFICIELLES' : '02_TESTS_ET_CERTIFS';
        const targetDir = path.join(CEO_INPUT_DIR, 'ARCHIVES', monthDir, category);
        
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        fs.renameSync(filePath, path.join(targetDir, filename));
        console.log(`📦 [ARCHIVISTE V125] Ordre classé : ${monthDir}/${category}/${filename}`);
    } catch(e) { console.error("⚠️ [ARCHIVISTE_ERR]", e.message); }
    pruneOldRadars(); updateRadarMD(true);
}

fs.watch(CEO_INPUT_DIR, (event, filename) => {
    if (filename && filename.endsWith('.md')) setTimeout(() => processCEOEntry(filename), 500);
});

setInterval(() => { checkZombies(); updateRadarMD(); }, 200);
updateRadarMD(true);