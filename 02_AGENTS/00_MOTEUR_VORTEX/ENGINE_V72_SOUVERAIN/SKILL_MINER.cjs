const fs = require('fs');
const path = require('path');

/**
 * 💎 SKILL_MINER : Extracteur de pépites de design
 * Analyse les projets pour capturer les "Skills" UI/UX Elite.
 */

const EXTRACTED_PATH = path.resolve(__dirname, '../../02_AGENTS/NOS_AGENTS_D_ELITE/09_KNOWLEDGE_MINE_D_OR/MINE_D_OR_DE_SKILLS/EXTRACTED/ui-ux-pro-max-skill');

function mineSkillsFromCSS(cssContent, fileName) {
    const skills = [];
    
    // Pattern 1: Glassmorphism
    if (cssContent.includes('backdrop-filter: blur')) {
        const match = cssContent.match(/\.glass[^{]+\{[^}]+\}/);
        if (match) skills.push({ name: 'Glassmorphism Elite', code: match[0], origin: fileName });
    }

    // Pattern 2: Glow Effects
    if (cssContent.includes('box-shadow: 0 0')) {
        const match = cssContent.match(/\.btn-glow[^{]+\{[^}]+\}/);
        if (match) skills.push({ name: 'Emerald Glow', code: match[0], origin: fileName });
    }

    return skills;
}

function saveSkillsToFile(skills) {
    if (!fs.existsSync(EXTRACTED_PATH)) fs.mkdirSync(EXTRACTED_PATH, { recursive: true });
    
    const minerFile = path.join(EXTRACTED_PATH, 'MINED_GEMS.md');
    let content = fs.existsSync(minerFile) ? fs.readFileSync(minerFile, 'utf8') : "# 💎 MINED GEMS : Pepites de Design Extraites\n\n";

    skills.forEach(s => {
        if (!content.includes(s.name)) {
            content += `## ${s.name}\n- **Origine** : ${s.origin}\n\`\`\`css\n${s.code}\n\`\`\`\n\n`;
        }
    });

    fs.writeFileSync(minerFile, content);
    console.log(`💎 [SKILL_MINER] ${skills.length} nouvelles pépites extraites.`);
}

function runSkillMiner(projectPath) {
    const cssPath = path.join(projectPath, 'style.css');
    if (!fs.existsSync(cssPath)) return;

    const content = fs.readFileSync(cssPath, 'utf8');
    const skills = mineSkillsFromCSS(content, path.basename(projectPath));
    
    if (skills.length > 0) {
        saveSkillsToFile(skills);
    }
}

module.exports = { runSkillMiner };
if (require.main === module) {
    // Test on default project root if needed
}
