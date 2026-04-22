const fs = require('fs');
const path = require('path');
const hub = require('./REGISTRY_HUB.cjs');
const { getPath } = require('./paths.cjs');
const { learnFromSuccess } = require('./CORE_LOGIC/intelligence/learning_engine.cjs');
const { auditFile, getQualityBadge } = require('./CORE_LOGIC/validation/quality_auditor.cjs');
const { mutateAgentMemory } = require('./EVOLUTION_ENGINE.cjs');
const { mineSynapses } = require('./CORE_LOGIC/intelligence/skill_miner.cjs');

// --- 📍 CENTRALIZED PATHS (Nexus V100) ---
const AGENTS_DIR = getPath('INTELLIGENCE', 'AGENTS');
const RENDU_DIR = getPath('COMMAND', 'LIVRABLES');
const goldmineDir = getPath('INTELLIGENCE', 'GOLDMINE_DIR');
const SKILLS_INDEX_PATH = goldmineDir ? path.join(goldmineDir, 'EXTRACTED', 'skills_index.json') : null;

let agentPathMap = {}; // ID -> Absolute Path

/**
 * Scan récursif pour localiser les bureaux des agents.
 */
function refreshAgentMap() {
    agentPathMap = {};
    const DAILY_ROOT = getPath('DAILY_REPORTS', 'ROOT');
    
    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file.startsWith('AGENT_')) {
                    agentPathMap[file] = fullPath;
                } else if (!file.includes('MINE_D_OR')) {
                    walk(fullPath);
                }
            }
        });
    }
    walk(AGENTS_DIR);
    if (DAILY_ROOT) walk(DAILY_ROOT);
}
refreshAgentMap();

/**
 * Recherche récursive profonde du meilleur Skill dans la Mine d'Or.
 */
function findBestSkill(description) {
    const goldminePath = "/Users/hachicha/Desktop/digital flux/02_AGENTS/NOS_AGENTS_D_ELITE/09_KNOWLEDGE_MINE_D_OR/MINE_D_OR_DE_SKILLS/EXTRACTED/plugins";
    if (!fs.existsSync(goldminePath)) return "SKILL-NOT-FOUND";
    
    try {
        const keywords = description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        let bestMatch = { id: "SKILL-GENERAL-SOP", score: 0, path: "" };

        function walk(dir) {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    walk(fullPath);
                } else if (file.endsWith('.md')) {
                    let score = 0;
                    const content = file.toLowerCase(); // On score le nom du fichier d'abord
                    keywords.forEach(word => { if (content.includes(word)) score += 5; });
                    if (score > bestMatch.score) {
                        bestMatch = { id: file.replace('.md', ''), score: score, path: fullPath };
                    }
                }
            }
        }
        walk(goldminePath);
        return bestMatch.id;
    } catch (e) { return "SKILL-ERROR"; }
}

/**
 * Dispatch une mission à un agent expert.
 */
function dispatchMission(agentKey, taskName, skillId = 'SKILL-AUTO-DETECT') {
    if (skillId === 'SKILL-AUTO-DETECT') skillId = findBestSkill(taskName);
    const agentFolder = agentKey.startsWith('AGENT_') ? agentKey : `AGENT_${agentKey.toUpperCase()}`;
    const agentBase = agentPathMap[agentFolder] || path.join(AGENTS_DIR, agentFolder);
    
    // Support des dossiers V50 (01_BRIEFING_INPUT)
    let targetDir = path.join(agentBase, '01_BRIEFING_INPUT');
    if (!fs.existsSync(targetDir)) targetDir = path.join(agentBase, 'TRAVAIL_A_FAIRE');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const fileName = `AUTO_MISSION_${taskName.replace(/[^\w\s]/gi, '').replace(/\s/g, '_')}_${Date.now()}.md`;
    const fullPath = path.join(targetDir, fileName);

    const content = `# 🎯 MISSION AUTONOME : ${taskName}
- **Agent** : ${agentKey}
- **Skill ID** : ${skillId}
- **Status** : IN_PROGRESS
- **Timestamp** : ${new Date().toLocaleString()}

## 🧠 CONNAISSANCES RÉCURSIVES (SYNAPSES)
${mineSynapses(agentKey).map(s => `> - [${s.topic}] : ${s.lesson}`).join('\n') || "> *Aucune synapse critique détectée.*"}

## 🛠️ PROTOCOLE SKILL UTILISÉ (MINE D'OR)
- **Skill Affecté** : ${skillId}
- **Obligation** : Intégrer les directives du skill \`${skillId}.md\` dans votre exécution.
- **Preuve** : Vous devez citer explicitement ce skill dans votre rendu final.

## 📝 BRIEF AUTO-PILOT (V140)
Exécuter cette tâche selon les protocoles d'excellence. 
> [!IMPORTANT]
> **ÉVALUATION ALPHA** : Votre travail sera noté sur 10. La clarté, le respect du skill mine d'or et le rendu premium sont les critères d'évaluation.

[START]: ${new Date().toISOString()}
`;
    fs.writeFileSync(fullPath, content);
    
    // --- 📡 HUB INTEGRATION V106 ---
    const missionId = taskName; // On utilise l'ID exact transmis par l'Orchestrateur
    hub.updatePulse(agentFolder, { status: "ACTIVE", mission: missionId, skill_id: skillId, current_action: "Exécution Mission" });
    hub.addTrace(missionId, 'PRODUCTION', `Expert ${agentFolder.replace('AGENT_', '')} : Exécution en cours`, agentFolder);
    
    console.log(`🚀 [VORTEX] Dispatch : ${agentFolder} -> ${taskName}`);
}

/**
 * Route les tâches en mode direct-live.
 */
async function routeTask(agentName, fileName, content) {
    if (content.includes("# STATUS: DONE") || content.includes("# STATUT: FINI") || content.includes("TERMINEE")) {
        const agentKey = agentName.toUpperCase().replace('AGENT_', '');
        const sourcePath = path.join(agentPathMap[agentName] || "", 'TRAVAIL_A_FAIRE', fileName);
        await finalizeMission(agentKey, fileName, content, sourcePath);
        
        // --- 📡 HUB INTEGRATION V100 (Instant Standby) ---
        hub.updatePulse(agentName, { status: "🔴 STANDBY", mission: "---", current_action: "Veille Stratégique" });
    }
}

/**
 * Finalise et certifie une mission.
 */
async function finalizeMission(agentKey, fileName, content, sourcePath) {
    const missionId = fileName.replace('.md', '').split('_').slice(2, -1).join('_') || fileName;
    hub.addTrace(missionId, 'LIVRAISON', `Audit Qualité en cours pour ${agentKey}`, agentKey);

    try {
        const { pulse } = hub.getFullContext();
        const agentPulse = pulse[`AGENT_${agentKey.toUpperCase()}`] || {};
        const skillId = agentPulse.skill_id || "SKILL-GENERAL-SOP";

        const audit = auditFile(sourcePath, skillId);
        hub.addTrace(missionId, 'CERTIFICATION', `Mission validée. Score: ${audit.score}/10`, agentKey);
        
        // --- 🧬 MUTATION DE LA MÉMOIRE AGENT (V140) ---
        mutateAgentMemory(agentKey, audit);

        // --- 📓 LOG FINAL DANS LE LEDGER ---
        const ledgerEntry = `\n> [!NOTE]\n> **RÉSULTAT MISSION** : ${missionId}\n` +
                            `> - **Score** : ${audit.score}/10\n` +
                            `> - **Améliorations proposées** : ${audit.tips.join(' | ')}\n` +
                            `---`;
        fs.appendFileSync("/Users/hachicha/Desktop/digital flux/01_STRATEGIE/00_PILOTAGE_LIVE/01_COCKPIT_TACTIQUE/ANTIGRAVITY_CORE.md", ledgerEntry);

        // Livraison vers le portail COO
        const rendudDir = path.join(RENDU_DIR, "00_ATTENTE_CERTIFICATION_COO");
        if (!fs.existsSync(rendudDir)) fs.mkdirSync(rendudDir, { recursive: true });
        
        const badge = getQualityBadge(audit);
        const finalContent = content + badge + `\n\n✅ **LIVRABLE CERTIFIÉ PAR : ${agentKey}**\n⚡ *Digital Flux Nexus V140 Souverain*\n📅 *Le : ${new Date().toLocaleString()}*`;
        fs.writeFileSync(path.join(rendudDir, `${Date.now()}_${fileName}`), finalContent);
        
        if (fs.existsSync(sourcePath)) fs.unlinkSync(sourcePath);
    } catch (e) {
        console.error("⚠️ [VORTEX_FIN_ERR]", e.message);
    }
}

// --- 🕵️ DAEMON MODE ---
if (require.main === module) {
    console.log("🌪️ [VORTEX_CORE V100] Fusion Hub Souveraine Activée.");
    
    fs.watch(AGENTS_DIR, { recursive: true }, (event, filename) => {
        if (!filename || filename.includes('.DS_Store')) return;
        if (filename.endsWith('.md')) {
            setTimeout(() => {
                const fullPath = path.join(AGENTS_DIR, filename);
                if (fs.existsSync(fullPath)) {
                    const parts = filename.split(path.sep);
                    const agentFolder = parts.find(p => p.startsWith('AGENT_'));
                    if (agentFolder) routeTask(agentFolder, path.basename(filename), fs.readFileSync(fullPath, 'utf8'));
                }
            }, 500);
        }
    });
}

module.exports = { dispatchMission, findBestSkill };
