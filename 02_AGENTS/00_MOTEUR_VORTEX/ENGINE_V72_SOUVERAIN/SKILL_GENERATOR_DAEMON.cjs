const fs = require('fs');
const path = require('path');

const { getPath } = require('./paths.cjs');

const AGENTS_DIR = getPath('INTELLIGENCE', 'AGENTS');
const MINE_D_OR = path.join(getPath('INTELLIGENCE', 'GOLDMINE'), 'EXTRACTED', 'skills');

console.log("🧠 [SKILL_GEN_DAEMON] Système de Génération Autonome de Connaissances Activé.");

async function findMissingSkill(agentName, fileName, content) {
    if (content.includes("SKILL-") || content.includes("Skill ID")) return;

    console.log(`💡 [SKILL_GEN] Détection de lacune cognitive pour ${agentName} (Fichier: ${fileName})`);
    
    // Extraction du thème de la tâche
    const taskTheme = fileName.replace(/AUTO_MISSION_|ORDRE_DE_MISSION_|\d+|.md/g, '').replace(/_/g, ' ').trim();
    const skillId = `SKILL-AUTO-${taskTheme.toUpperCase().replace(/\s/g, '-')}-${Math.floor(Math.random() * 1000)}`;
    const skillPath = path.join(MINE_D_OR, `${skillId}.md`);

    if (fs.existsSync(skillPath)) return;

    const skillContent = `# 💎 SKILL ÉLITE : ${taskTheme}
- **ID** : ${skillId}
- **Auteur** : AGENT_ARCHITECT (AUTO-GEN)
- **Version** : 1.0
- **Timestamp** : ${new Date().toLocaleString()}

## 🎯 PROTOCOLE D'EXÉCUTION
1. Analyser les pré-requis de la tâche : ${taskTheme}.
2. Utiliser les outils systémiques de l'agence (Vortex, Sentinel).
3. Garantir une sortie au format Markdown structuré.
4. Valider le résultat par auto-audit avant de marquer comme DONE.

## 📝 NOTES TACTIQUES
Ce skill a été généré dynamiquement pour combler une lacune détectée lors de l'exécution d'une mission.
`;

    if (!fs.existsSync(path.dirname(skillPath))) fs.mkdirSync(path.dirname(skillPath), { recursive: true });

    fs.writeFileSync(skillPath, skillContent);
    console.log(`✅ [SKILL_GEN] Nouveau Skill Forge : ${skillId} pour ${taskTheme}`);

    // Injection du Skill ID dans le fichier original
    try {
        let updatedContent = content.replace("- **Skill ID** : SKILL-AUTO-DETECT", `- **Skill ID** : ${skillId} (AUTO-GEN)`);
        if (updatedContent === content) {
            updatedContent = content.replace("## 📜 BRIEF", `- **Skill ID** : ${skillId} (AUTO-GEN)\n\n## 📜 BRIEF`);
        }
        
        const fullPath = path.join(AGENTS_DIR, agentName, 'TRAVAIL_A_FAIRE', fileName);
        if (fs.existsSync(fullPath)) {
            fs.writeFileSync(fullPath, updatedContent);
            console.log(`💉 [SKILL_GEN] Skill ID injecté dans la mission de ${agentName}`);
        }
    } catch (e) {
        console.error("❌ [SKILL_GEN_ERROR]", e.message);
    }
}

// Surveillance des dossiers de travail
fs.watch(AGENTS_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename || filename.includes('.DS_Store') || filename.includes('MINE_D_OR')) return;
    
    if (filename.endsWith('.md')) {
        const fullPath = path.join(AGENTS_DIR, filename);
        if (filename.includes('TRAVAIL_A_FAIRE')) {
            setTimeout(() => {
                if (fs.existsSync(fullPath)) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const parts = filename.split(path.sep);
                    findMissingSkill(parts[0], path.basename(filename), content);
                }
            }, 1000);
        }
    }
});
