const fs = require('fs');
const path = require('path');

// --- 📍 PATHS ---
const ROOT_DIR = "/Users/hachicha/Desktop/digital flux";
const AGENTS_DIR = path.join(ROOT_DIR, "02_AGENTS/NOS_AGENTS_D_ELITE");
const PULSE_PATH = path.join(ROOT_DIR, "01_STRATEGIE/REGISTRE/PULSE_DATA.json");
const ATLAS_PATH = path.join(ROOT_DIR, "01_STRATEGIE/MASTER_SYNTHESE_EMPIRE.md");

console.log("🌪️ [SYNC_ATLAS] Début de la synchronisation impériale...");

function getAgentCensus() {
    const agents = [];
    
    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file.startsWith('AGENT_')) {
                    // Extraction de l'identité
                    let mission = "Mission non définie.";
                    const protoDir = path.join(fullPath, '07_CORE_PROTOCOLS');
                    if (fs.existsSync(protoDir)) {
                        const protos = fs.readdirSync(protoDir).filter(f => f.endsWith('.md'));
                        if (protos.length > 0) {
                            const content = fs.readFileSync(path.join(protoDir, protos[0]), 'utf8');
                            const match = content.match(/## 🎭 IDENTITÉ STRATÉGIQUE\n([\s\S]*?)\n---/);
                            if (match) mission = match[1].trim();
                        }
                    }
                    
                    agents.push({
                        name: file,
                        pole: path.basename(path.dirname(fullPath)),
                        path: fullPath,
                        mission: mission
                    });
                } else if (!file.includes('MINE_D_OR')) {
                    walk(fullPath);
                }
            }
        });
    }
    
    walk(AGENTS_DIR);
    return agents;
}

function getHealthStatus(agentName) {
    try {
        if (fs.existsSync(PULSE_PATH)) {
            const pulse = JSON.parse(fs.readFileSync(PULSE_PATH, 'utf8'));
            const data = pulse[agentName] || pulse[`AGENT_${agentName}`];
            if (data) {
                const diff = (Date.now() - data.last_action) / 1000;
                if (diff < 300) return "🟢 ACTIF";
                if (data.status.includes('AUDIT')) return "🛡️ EN AUDIT";
            }
        }
    } catch (e) {}
    return "🔴 STANDBY";
}

function generateAtlas() {
    const agents = getAgentCensus();
    const now = new Date().toLocaleString();
    
    let content = `# 📜 LE GRAND ATLAS DE L'EMPIRE : Digital Flux (V50.12)\n\n`;
    content += `> [!IMPORTANT]\n> **SOURCE DE VÉRITÉ SOUVERAINE** : Ce document est synchronisé en temps réel avec la structure physique des agents.\n\n`;
    
    content += `## 🏛️ 1. LA PYRAMIDE DE COMMANDEMENT\n\n`;
    content += `\`\`\`mermaid\ngraph TD\n    CEO["👑 CEO (Skander)"] --> COO["🧠 COO (Antigravity)"]\n`;
    
    const poles = [...new Set(agents.map(a => a.pole))].sort();
    poles.forEach(p => {
        content += `    COO --> ${p.replace(/[^\w]/g, '_')}["🏢 ${p}"]\n`;
        agents.filter(a => a.pole === p).forEach(a => {
            content += `    ${p.replace(/[^\w]/g, '_')} --> ${a.name}["👤 ${a.name}"]\n`;
        });
    });
    content += `\`\`\`\n\n`;

    content += `## 🤝 2. FLUX OPÉRATIONNEL : "QUI PASSE QUOI À QUI"\n\n`;
    content += `| Source | Destination | Flux de Production | Type de Livrable |\n`;
    content += `| :--- | :--- | :--- | :--- |\n`;
    content += `| CEO (Input) | Antigravity (COO) | Ingestion Stratégique | Brief Alpha |\n`;
    content += `| Antigravity | Tous Agents | Dispatching V50 / Vortex | Ordre de Mission |\n`;
    content += `| Agent (Production) | Antigravity | Audit de Qualité Certifié | Livrable Alpha |\n`;
    content += `| Antigravity | CEO (Livrables) | Livraison Souveraine | Produit Final |\n\n`;

    content += `## 👥 3. ANNUAIRE DES AGENTS D'ÉLITE (CENSUS)\n\n`;
    content += `| Agent | Pôle | Mission Stratégique | Statut |\n`;
    content += `| :--- | :--- | :--- | :--- |\n`;
    
    agents.forEach(a => {
        const health = getHealthStatus(a.name);
        content += `| **${a.name}** | ${a.pole} | ${a.mission.substring(0, 100)}... | ${health} |\n`;
    });

    content += `\n\n## 🌪️ 4. LOGIQUE DE ROUTAGE VORTEX\n\n`;
    content += `1. **Ingestion** : Les fichiers arrivent dans \`01_STRATEGIE/ENTREE_CEO\`.\n`;
    content += `2. **Analyse Intent** : Antigravity identifie le besoin (Web, Design, Business, etc.).\n`;
    content += `3. **Dispatch** : Les agents reçoivent une \`AUTO_MISSION\` avec injection de Skills.\n`;
    content += `4. **Collaboration** : Les tags \`#COLLAB\` permettent des échanges entre agents.\n`;
    content += `5. **Certification** : Seul le score >= 8.0/10 permet la sortie du système.\n\n`;

    content += `---\n*Dernière synchronisation impériale : ${now}*\n*Souveraineté, Précision, Excellence. Digital Flux V50.12*`;

    fs.writeFileSync(ATLAS_PATH, content);
    console.log(`✅ [SYNC_ATLAS] Le Grand Atlas a été régénéré avec ${agents.length} agents.`);
}

generateAtlas();
if (process.argv.includes('--watch')) {
    console.log("👀 Mode surveillance activé...");
    setInterval(generateAtlas, 30000); // Mise à jour toutes les 30s
}
