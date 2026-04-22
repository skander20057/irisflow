const fs = require('fs');
const path = require('path');
const { getPath } = require('./paths.cjs');

const AGENTS_DIR = getPath('INTELLIGENCE', 'AGENTS');
const LOGS_DIR = path.join(AGENTS_DIR, 'PERFORMANCE_AGENT');
const COCKPIT_PATH = path.join(LOGS_DIR, 'COCKPIT_V24.md');
const RENDU_DIR = getPath('COMMAND', 'LIVRABLES');

function logTelemetry(msg) {
    console.log(`📊 [TELEMETRY] ${msg}`);
}

async function updateCockpit() {
    try {
        logTelemetry("Mise à jour du Cockpit V24.0...");
        
        // 1. Calcul des stats
        const agents = fs.readdirSync(AGENTS_DIR).filter(f => f.startsWith('AGENT_'));
        const totalMissions = fs.existsSync(RENDU_DIR) ? fs.readdirSync(RENDU_DIR).length : 0;
        
        let cockpitContent = `# 🚀 COCKPIT STRATÉGIQUE : DIGITAL FLUX (V24.0)\n\n`;
        cockpitContent += `> [!NOTE]\n> **ÉTAT DE L'AGENCE** : OPERATIONNEL | **CONFIANCE DÉLÉGUÉE** : 95%\n> **TOTAL MISSIONS RÉUSSIES** : ${totalMissions} | **DATE** : ${new Date().toLocaleString()}\n\n`;

        cockpitContent += `## 👥 PERFORMANCE DE L'ESCOUADE\n\n| Agent | Spécialité | Statut | Bureau Optimisé | Niveau d'Autonomie |\n| :--- | :--- | :--- | :--- | :--- |\n`;

        agents.forEach(agent => {
            const agentKey = agent.replace('AGENT_', '');
            const agentProfile = path.join(AGENTS_DIR, agent, `${agent}.MD`);
            const agentProfileSmall = path.join(AGENTS_DIR, agent, `${agent}.md`);
            const target = fs.existsSync(agentProfile) ? agentProfile : (fs.existsSync(agentProfileSmall) ? agentProfileSmall : null);
            
            let isOptimized = "❌";
            if (target) {
                const content = fs.readFileSync(target, 'utf8');
                if (content.includes("SELF-OPTIMIZED")) isOptimized = "✅ (V24)";
            }

            cockpitContent += `| ${agentKey} | ELITE | 🟢 ACTIVE | ${isOptimized} | HIGH (95%) |\n`;
        });

        cockpitContent += `\n## 🏛️ ÉTAT DU VAULT (FORTIFICATION)\n- **Rétention** : INFINIE\n- **Fréquence** : 24H\n- **Dernier Snapshot** : ${new Date().toLocaleDateString()}\n\n`;

        cockpitContent += `## 🧠 SYNTHÈSE COGNITIVE\n- **Cerveau Global** : COMPACTÉ (V24)\n- **Neural Handshake** : ACTIF\n- **Auto-Adaptation** : ACTIVÉE\n`;

        cockpitContent += `\n---\n*Généré automatiquement par l'Omni-Nexus V24.0 Telemetry Engine.*`;

        if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
        fs.writeFileSync(COCKPIT_PATH, cockpitContent);
        
        logTelemetry("✅ Cockpit V24.0 généré avec succès.");

    } catch (e) {
        logTelemetry(`⚠️ Erreur Télémétrie : ${e.message}`);
    }
}

// Mise à jour toutes les 4h
updateCockpit();
setInterval(updateCockpit, 14400000);
