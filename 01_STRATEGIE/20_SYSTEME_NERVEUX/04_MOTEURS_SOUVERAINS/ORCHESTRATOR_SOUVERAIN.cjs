const fs = require('fs');
const path = require('path');
const { getPath } = require('./paths.cjs');
const hub = require('./REGISTRY_HUB.cjs');
const { auditFile } = require('./CORE_LOGIC/validation/quality_auditor.cjs');
const { dispatchMission, findBestSkill } = require('./VORTEX_CORE.cjs');

// --- 💎 PATHS V130 PIPELINE DE CRISTAL ---
const ROOT = "/Users/hachicha/Desktop/digital flux";
const CEO_INPUT_DIR = path.join(ROOT, "01_STRATEGIE/00_PILOTAGE_LIVE/02_ENTREE_CEO");
const REVIEW_DIR = getPath('COMMAND', 'CERTIFICATION');
const SHOWCASE_DIR = getPath('COMMAND', 'LIVRABLES');
const RADAR_MD_PATH = getPath('TECH', 'COCKPIT');
const CORE_LEDGER_PATH = "/Users/hachicha/Desktop/digital flux/01_STRATEGIE/00_PILOTAGE_LIVE/01_COCKPIT_TACTIQUE/ANTIGRAVITY_CORE.md";
const REGISTRY_DIR = getPath('COMMAND', 'REGISTRE');
const PID_FILE = path.join(REGISTRY_DIR, "ORCHESTRATOR.pid");

// --- 📓 JOURNAL DE CONSCIENCE ALPHA ---
function logStrategicIntent(missionId, agent, skill, intent) {
    const entry = `\n### 🛡️ [${new Date().toLocaleString()}] MISSION : ${missionId}\n` +
                  `- **Stratégie** : ${intent}\n` +
                  `- **Expertise Mobilisée** : ${agent}\n` +
                  `- **Skill Miné (Mine d'Or)** : [${skill}](file:///Users/hachicha/Desktop/digital%20flux/02_AGENTS/NOS_AGENTS_D_ELITE/09_KNOWLEDGE_MINE_D_OR/MINE_D_OR_DE_SKILLS/EXTRACTED/plugins/antigravity-awesome-skills/skills/${skill}.md)\n` +
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
            const baseName = filename.replace(/_CERTIFIED|_CERTIF/i, '').replace(/\.md$|\.html$|\.png$/i, '');
            let missionId = baseName;
            const fullCtx = hub.getFullContext().traces;
            const existingIds = Object.keys(fullCtx);
            const bestMatch = existingIds.filter(id => baseName.startsWith(id)).sort((a,b) => b.length - a.length)[0];
            if (bestMatch) missionId = bestMatch;

            // --- BIFURCATION INTERNE VS CLIENT (V144) ---
            const missionMeta = fullCtx[missionId] ? fullCtx[missionId].metadata : {};
            let baseShowcase = SHOWCASE_DIR;
            if (missionMeta.client) {
                baseShowcase = path.join(ROOT, "03_PROJETS/PROJETS", missionMeta.client.toUpperCase());
            }

            let finalShowcaseDir = baseShowcase;
            const up = filename.toUpperCase();
            if (up.match(/LOGO|DESIGN|VISUEL|CHARTE/)) finalShowcaseDir = path.join(baseShowcase, missionMeta.client ? '01_BRANDING' : '01_BRANDING_ET_DESIGN');
            else if (up.match(/SITE|WEB|PAGE/)) finalShowcaseDir = path.join(baseShowcase, missionMeta.client ? '02_SOLUTIONS_WEB' : '04_SITES_WEB_SOUVERAINS');
            else if (up.match(/APP|SOFTWARE|SYSTÈME/)) finalShowcaseDir = path.join(baseShowcase, missionMeta.client ? '03_APPLICATIONS' : '05_APPLICATIONS_INTERNES');
            else if (up.match(/AGENT|PERSONNALISÉ/)) finalShowcaseDir = path.join(baseShowcase, missionMeta.client ? '04_AGENTS_DÉDIÉS' : '06_AGENTS_CUSTOM_LAB');
            else if (up.match(/HIERARCHIE|SYSTEME|COMMANDEMENT|NEXUS|MASTER/)) finalShowcaseDir = path.join(baseShowcase, '02_ARCHITECTURE_NEXUS');
            else if (up.match(/DEVIS|QUOTE|FACTUR/)) finalShowcaseDir = path.join(baseShowcase, '05_ADMIN_ET_FINANCE');
            else if (up.match(/MEDICAL|AUDIT|CERTIF|TEST/)) finalShowcaseDir = path.join(baseShowcase, '03_AUDITS_ET_CERTIFICATIONS');
            
            if (!fs.existsSync(finalShowcaseDir)) fs.mkdirSync(finalShowcaseDir, { recursive: true });
            const targetPath = path.join(finalShowcaseDir, filename);
            fs.renameSync(filePath, targetPath);
            console.log(`💎 [SHOWCASE] Livraison ${missionMeta.client ? 'CLIENT' : 'INTERNE'} effectuée dans ${path.basename(finalShowcaseDir)} : ${filename}`);
            
            hub.addTrace(missionId, 'SHOWCASE', `Exposition dans la Vitrine ${missionMeta.client ? 'Client ('+missionMeta.client+')' : 'Souveraine'}`, 'SENTINELLE');
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
    "03 CREATIF": ["AGENT_ARCHITECT", "AGENT_COPYWRITER", "AGENT_DESIGNER"],
    "04 TECH": ["AGENT_CYBER_DEBUG", "AGENT_DEV"],
    "05 MEDICAL": ["AGENT_MEDICAL"],
    "06 FINANCE": ["AGENT_FINANCE"],
    "07 JURIDIQUE": ["AGENT_JURIDIQUE"],
    "08 RD": ["AGENT_RD"]
};

const INTENT_MATRIX = {
    "SYNTHESE": { pole: "01 DIRECTION", kw: /synthèse|audit global|nexus|résumé/i, agent: "AGENT_SYNTHESE", skill: "executive-summary", task: "Cadrage Stratégique" },
    "BUSINESS": { pole: "02 COMMERCIAL", kw: /stratégie|business|marché|revenu|commercial|rentabilité|audit|campagne|médicament|devis|quote|tarif/i, agent: "AGENT_BUSINESS", skill: "ad-creative", task: "Développement Affaires" },
    "DESIGNER": { pole: "03 CREATIF", kw: /design|logo|ui|visuel|charte|créatif/i, agent: "AGENT_DESIGNER", skill: "3d-web-experience", task: "Création Visuelle" },
    "COPYWRITER": { pole: "03 CREATIF", kw: /texte|article|copy|blog|contenu/i, agent: "AGENT_COPYWRITER", skill: "advanced-evaluation", task: "Contenu Premium" },
    "ARCHITECT": { pole: "03 CREATIF", kw: /architecture|structure|nexus/i, agent: "AGENT_ARCHITECT", skill: "acceptance-orchestrator", task: "Architecture Nexus" },
    "DEV": { pole: "04 TECH", kw: /code|dev|app|site|fonctionnalité|technique|frontend|backend/i, agent: "AGENT_DEV", skill: "agent-tool-builder", task: "Ingénierie Tech" },
    "CYBER_DEBUG": { pole: "04 TECH", kw: /cyber|debug|sécurité|audit code/i, agent: "AGENT_CYBER_DEBUG", skill: "007", task: "Cyber Audit" },
    "MEDICAL": { pole: "05 MEDICAL", kw: /santé|médical|bio|regulatory|médicament|scan/i, agent: "AGENT_MEDICAL", skill: "Analyse Médicale", task: "Contrôle Médical" },
    "FINANCE": { pole: "06 FINANCE", kw: /finance|roi|budget|rentabilité|chiffre|audit/i, agent: "AGENT_FINANCE", skill: "Audit Financier", task: "Audit de ROI" },
    "JURIDIQUE": { pole: "07 JURIDIQUE", kw: /droit|juridique|contrat|légal/i, agent: "AGENT_JURIDIQUE", skill: "Analyse Légale", task: "Audit Légal" },
    "RD": { pole: "08 RD", kw: /innovation|recherche|rd|tendances|agent personnalisé|vortex/i, agent: "AGENT_RD", skill: "Veille R&D", task: "Innovation Lab" }
};

function formatDuration(ms) {
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    return `${min}m ${sec % 60}s`;
}

function archiveExpiredMissions(mission) {
    try {
        const archivePath = "/Users/hachicha/Desktop/digital flux/01_STRATEGIE/02_RETOUR_D_EXPÉRIENCE/02_BIBLIOTHEQUE_HISTORIQUE_ALPHA/ARCHIVES_RADAR_24H.md";
        const dateStr = new Date().toLocaleDateString();
        const endTime = new Date(mission.end).toLocaleTimeString();
        const duration = formatDuration(mission.end - mission.start);
        const entry = `| ${dateStr} | ${endTime} | **${mission.id}** | ${duration} | SCELLÉ |\n`;
        fs.appendFileSync(archivePath, entry);
    } catch(e) {}
}

function updateRadarMD(forceUpdate = false) {
    if (isWriting) return;
    isWriting = true;
    checkZombies();
    try {
        const { traces } = hub.getFullContext();
        const ids = Object.keys(traces).sort((a,b) => traces[b].metadata.start - traces[a].metadata.start);
        const now = Date.now();
        const poleStatus = {}; 
        const finishedMissions = [];
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
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

            if (latest.step === 'LIVRAISON' || latest.step === 'CERTIFICATION' || latest.step === 'SHOWCASE' || isStale) {
                const age = now - latest.time;
                if (!isStale && age <= TWENTY_FOUR_HOURS) {
                    finishedMissions.push({ id: label, end: latest.time, start: startT, age: age });
                } else if (!traces[id].metadata.archived) {
                    archiveExpiredMissions({ id: label, end: latest.time, start: startT });
                    hub.updateMetadata(id, label, true);
                }
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
            isWriting = false;
            return;
        }

        LAST_TACTICAL_SNAPSHOT = tacticalSnapshot;
        LAST_FILE_WRITE_TIME = now;

        let content = `# 🦅 OMNISCIENCE : Radar PURE V118 SOUVERAIN\n\n`;
        content += `> [!NOTE]\n`;
        content += `> **📡 ETAT : ORDRE IMPÉRIAL (V118)**\n`;
        content += `> **PERSISTANCE 24H ACTIVE** | **SYNC : LIVE**\n\n`;
        
        content += `## 🏛️ I. ÉTAT DES PÔLES (CŒUR DES OPÉRATIONS)\n`;
        content += `| Pôle | Statut Global | Mission Active | Expert | Tâche Live | Début | Durée |\n`;
        content += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
        Object.keys(POLES_MAP).sort().forEach(pole => {
            const p = poleStatus[pole];
            content += `| ${pole} | **${p.state}** | ${p.mission} | ${p.expert} | ${p.task} | ${p.start} | ${p.duration} |\n`;
        });

        content += `\n## 🕒 II. MISSIONS RÉCENTES TERMINÉES (Dernières 24h)\n`;
        content += `| Heure Fin | Nom de la Mission | Durée | ⏳ Archive dans |\n`;
        content += `| :--- | :--- | :--- | :--- |\n`;
        finishedMissions.sort((a,b) => b.end - a.end).forEach(m => {
            const timeLeft = Math.max(0, (TWENTY_FOUR_HOURS - m.age) / (60 * 60 * 1000));
            content += `| ${new Date(m.end).toLocaleTimeString()} | **${m.id}** | ${formatDuration(m.end - m.start)} | ${timeLeft.toFixed(1)}h |\n`;
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
        logs.sort((a,b) => b.time - a.time).slice(0, 10).forEach(l => {
            content += `| ${new Date(l.time).toLocaleTimeString()} | **${l.mission.substring(0, 25)}** | ${l.agent} | ${l.status} |\n`;
        });

        content += `\n---\n\n## 🗺️ IV. SCHÉMA DU FLUX SOUVERAIN (A → Z)\n`;
        content += "```mermaid\ngraph LR\n    A[02_CEO] -->|Dépôt| B(ORCHESTRATEUR)\n    B -->|Ingestion| C{WORKFLOW}\n    C -->|Prod| D[02_PRODUCTION]\n    D -->|Audit| E[03_REVUE]\n    E -->|Scellé| F[02_RETOUR_SHOWCASE]\n```\n";
        content += `\n---\n*Digital Flux Omniscience V118 SOUVERAIN (Crystal Sanctuary Edition)*\n`;
        
        const tmp = RADAR_MD_PATH + ".tmp";
        fs.writeFileSync(tmp, content, 'utf8');
        fs.renameSync(tmp, RADAR_MD_PATH);
        
    } catch(e) {}
    finally { isWriting = false; }
}

function processCEOEntry(filename) {
    const filePath = path.join(CEO_INPUT_DIR, filename);
    if (!fs.existsSync(filePath)) return;
    const missionId = filename.replace('.md', '');
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/^#\s+(.*)/m);
    const missionTitle = match ? match[1].trim() : missionId;

    const clientMatch = content.match(/CLIENT:\s*(.*)/i);
    const clientName = clientMatch ? clientMatch[1].trim() : null;

    hub.addTrace(missionId, 'INGESTION', `Ordre CEO : ${missionTitle}${clientName ? ' [CLIENT: '+clientName+']' : ''}`, 'COO');
    hub.updateMetadata(missionId, missionTitle, false, clientName);
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
    } catch(e) {}
    pruneOldRadars(); updateRadarMD(true);
}

fs.watch(CEO_INPUT_DIR, (event, filename) => {
    if (filename && filename.endsWith('.md')) setTimeout(() => processCEOEntry(filename), 500);
});

setInterval(() => { checkZombies(); updateRadarMD(); }, 500);
updateRadarMD(true);