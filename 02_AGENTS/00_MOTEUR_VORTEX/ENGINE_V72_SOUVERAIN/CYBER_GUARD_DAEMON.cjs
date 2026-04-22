const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { getPath } = require('./paths.cjs');

const AGENTS_DIR = getPath('INTELLIGENCE', 'AGENTS');
const PILOTE_DIR = getPath('TECH', 'PILOTE');
const TAF_CYBER = path.join(AGENTS_DIR, 'AGENT_CYBER_DEBUG', 'TRAVAIL_A_FAIRE');

console.log("🛡️ [CYBER-GUARD-V3] Bouclier de Stabilité Souverain Activé (V20).");

function createBackup(filePath) {
    const backupPath = `${filePath}.bak`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`💾 [CYBER-GUARD] Backup créé : ${path.basename(backupPath)}`);
}

function checkSyntax(filePath) {
    return new Promise((resolve) => {
        if (!filePath.endsWith('.cjs') && !filePath.endsWith('.js')) {
            resolve({ valid: true });
            return;
        }

        exec(`node --check "${filePath}"`, (error, stdout, stderr) => {
            if (error) {
                resolve({ valid: false, error: stderr || stdout });
            } else {
                resolve({ valid: true });
            }
        });
    });
}

async function handleAnomaly(filePath, errorMsg) {
    const fileName = path.basename(filePath);
    console.log(`🚨 [CYBER-GUARD] ANOMALIE DÉTECTÉE dans ${fileName}`);
    
    // 1. Création du Backup si nécessaire
    if (!fs.existsSync(`${filePath}.bak`)) {
        createBackup(filePath);
    }

    // 2. Génération de la mission de réparation pour Cyber-Debug
    const missionFile = `REPAIR_MISSION_AUTO_${fileName}_${Date.now()}.md`;
    const missionPath = path.join(TAF_CYBER, missionFile);

    const brief = `# 🚨 MISSION DE RÉPARATION D'URGENCE
- **Cible** : ${filePath}
- **Type d'Erreur** : SYNTAXE / STRUCTURE
- **Détails** : 
\`\`\`
${errorMsg}
\`\`\`

## 🛠️ DIRECTIVE
Analyser le fichier cible et le backup (.bak). 
Utiliser SKILL-AUTO-FIX-SYNTAX pour restaurer la stabilité.
Marquer comme DONE une fois le check de syntaxe réussi.
`;

    if (!fs.existsSync(TAF_CYBER)) fs.mkdirSync(TAF_CYBER, { recursive: true });
    fs.writeFileSync(missionPath, brief);
    console.log(`🛰️ [CYBER-GUARD] Mission de réparation envoyée à AGENT_CYBER_DEBUG.`);
}

// Surveillance des répertoires critiques
const watchDirs = [PILOTE_DIR, AGENTS_DIR];
watchDirs.forEach(dir => {
    fs.watch(dir, { recursive: true }, async (eventType, filename) => {
        if (!filename || filename.includes('.DS_Store') || filename.includes('.bak') || filename.includes('node_modules')) return;
        
        const fullPath = path.join(dir, filename);
        if (fs.existsSync(fullPath) && (filename.endsWith('.cjs') || filename.endsWith('.js') || filename.endsWith('.jsx'))) {
            if (eventType === 'change') {
                const result = await checkSyntax(fullPath);
                if (!result.valid) {
                    handleAnomaly(fullPath, result.error);
                }
            }
        }
    });
});
