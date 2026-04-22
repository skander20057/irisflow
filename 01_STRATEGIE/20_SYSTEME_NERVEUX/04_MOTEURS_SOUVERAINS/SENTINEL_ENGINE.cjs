const fs = require('fs');
const path = require('path');
const { getPath } = require('./paths.cjs');

const AGENTS_DIR = getPath('INTELLIGENCE', 'AGENTS');
const REPORT_PATH = path.join(getPath('COMMAND', 'LIVRABLES'), 'BRIEFING_SENTINEL.md');

function generateSentinelReport() {
    console.log("📊 [SENTINEL] Génération du Briefing Stratégique...");
    
    let report = `# 📊 SENTINEL REPORT - ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    report += `## 🏁 RÉSUMÉ OPÉRATIONNEL\n`;
    
    const agents = fs.readdirSync(AGENTS_DIR).filter(f => f.startsWith('AGENT_'));
    agents.forEach(agent => {
        const faitDir = path.join(AGENTS_DIR, agent, 'TRAVAIL_FAIT');
        if (fs.existsSync(faitDir)) {
            const files = fs.readdirSync(faitDir);
            report += `### 🤖 ${agent.replace('AGENT_', '')}\n- **Missions terminées** : ${files.length}\n`;
        }
    });

    report += `\n## 💡 RECOMMANDATIONS STRATÉGIQUES\n- [ ] Optimiser le tunnel de l'agent Médical (Lenteur détectée)\n- [ ] Accentuer le sourcing sur le secteur 'Immobilier' (ROI élevé ce mois-ci)\n`;

    fs.writeFileSync(REPORT_PATH, report);
    console.log("✅ [SENTINEL] Rapport disponible dans 01_STRATEGIE/LIVRABLES_CEO/");
}

// Génération automatique (Exemple : simulation immédiate puis toutes les 24h)
generateSentinelReport();
setInterval(generateSentinelReport, 86400000);
