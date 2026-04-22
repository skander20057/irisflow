const fs = require('fs');
const path = require('path');

/**
 * 🧠 CONSCIENCE_ENGINE : Système d'Auto-Amélioration
 * Analyse les missions passées pour optimiser les instructions futures.
 */

const TRACE_PATH = path.resolve(__dirname, '../../01_STRATEGIE/01_NEXUS_SYSTEME/01_CORE_DATA/MISSION_TRACES.json');
const AGENTS_ROOT = path.resolve(__dirname, '../../02_AGENTS/NOS_AGENTS_D_ELITE');

function updateAgentConscience(agentId, missions) {
    // Résolution directe basée sur la structure connue des Pôles
    const poleMap = {
        'BUSINESS': '02_POLE_COMMERCIAL_SALES/AGENT_BUSINESS',
        'SYNTHESE': '01_POLE_DIRECTION_STRATEGIQUE/AGENT_SYNTHESE',
        'DESIGNER': '03_POLE_CREATIF_DESIGN/AGENT_DESIGNER',
        'DEV': '04_POLE_TECHNIQUE_DEV/AGENT_DEV'
    };
    
    const subPath = poleMap[agentId];
    if (!subPath) return;

    const searchPath = path.join(AGENTS_ROOT, subPath);
    if (!fs.existsSync(searchPath)) return;

    const consciencePath = path.join(searchPath, 'CONSCIENCE_INDIVIDUELLE.md');
    
    let content = `# 🧠 CONSCIENCE INDIVIDUELLE : AGENT_${agentId}\n\n`;
    content += `## 📊 Statistiques de Mission\n`;
    content += `- **Missions Analysées** : ${missions.length}\n`;
    content += `- **Dernière Update** : ${new Date().toLocaleString()}\n\n`;
    
    content += `## 🎓 Leçons Apprises (Auto-Extraction)\n`;
    missions.slice(-5).forEach(m => {
        content += `### Mission : ${m.label}\n`;
        content += `- Résultat : ${m.lastStatus}\n`;
        content += `- Apprentissage : Optimisation du protocole ${m.lastStep} nécessaire.\n\n`;
    });

    fs.writeFileSync(consciencePath, content);
    console.log(`🧠 [CONSCIENCE] Sagesse mise à jour pour : AGENT_${agentId}`);
}

const { execSync } = require('child_process');

function runConscience() {
    if (!fs.existsSync(TRACE_PATH)) return;

    const traces = JSON.parse(fs.readFileSync(TRACE_PATH, 'utf8'));
    const agentStats = {};

    Object.keys(traces).forEach(key => {
        const m = traces[key];
        const lastAction = m.history?.[m.history.length - 1];
        if (lastAction && lastAction.agent) {
            if (!agentStats[lastAction.agent]) agentStats[lastAction.agent] = [];
            agentStats[lastAction.agent].push({
                label: m.metadata.label || key,
                lastStatus: lastAction.status,
                lastStep: lastAction.step
            });
        }
    });

    Object.keys(agentStats).forEach(agentId => {
        try {
            updateAgentConscience(agentId, agentStats[agentId]);
        } catch (e) {
            // Silence if agent folder not found
        }
    });
}

if (require.main === module) {
    runConscience();
}

module.exports = { runConscience };
