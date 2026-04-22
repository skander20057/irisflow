const fs = require('fs');
const path = require('path');

// --- CONFIGURATION DES CHEMINS ---
// On utilise le chemin relatif par défaut, mais le script peut être appelé avec des arguments
const BASE_MINE_PATH = path.resolve(__dirname, '../../../02_AGENTS/NOS_AGENTS_D_ELITE/09_KNOWLEDGE_MINE_D_OR/MINE_D_OR_DE_SKILLS/EXTRACTED');
const CATALOG_PATH = path.join(BASE_MINE_PATH, 'data/catalog.json');
const INDEX_PATH = path.join(BASE_MINE_PATH, 'data/skills_index.json');

/**
 * Moteur de Recherche de Compétence (Skill Miner)
 * @param {string} query - Le terme de recherche (ex: "copywriting", "design", "security")
 * @returns {Array} - Liste des SOPs trouvées
 */
function mineSkills(query) {
    let skills = [];
    
    // Priorité au catalog.json s'il existe (contient tags et triggers)
    if (fs.existsSync(CATALOG_PATH)) {
        const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
        const q = query.toLowerCase();
        
        skills = catalog.skills.filter(skill => 
            skill.name.toLowerCase().includes(q) || 
            (skill.description && skill.description.toLowerCase().includes(q)) ||
            (skill.tags && skill.tags.some(t => t.toLowerCase().includes(q))) ||
            (skill.triggers && skill.triggers.some(t => t.toLowerCase().includes(q)))
        );
    } else if (fs.existsSync(INDEX_PATH)) {
        // Fallback sur skills_index.json
        const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
        const q = query.toLowerCase();
        skills = index.filter(skill => 
            skill.name.toLowerCase().includes(q) || 
            (skill.description && skill.description.toLowerCase().includes(q))
        );
    } else {
        console.error("❌ Erreur : Bases de données de la Mine d'Or introuvables.");
        return [];
    }

    // Transformation pour correspondre au format attendu (path relatif)
    return skills.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        path: s.path.replace('/SKILL.md', '').replace('skills/', 'skills/') // Normalisation
    })).slice(0, 3);
}

/**
 * Mine les leçons apprises (Synapses)
 * @param {string} agentId - L'ID de l'agent demandeur
 * @returns {Array} - Liste des leçons pertinentes
 */
function mineSynapses(agentId) {
    const MEMORY_PATH = path.join(__dirname, '../../../01_STRATEGIE/REGISTRE/SYNAPTIC_MEMORY.json');
    if (!fs.existsSync(MEMORY_PATH)) return [];

    try {
        const memory = JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8'));
        const agentScope = "AGENT_" + agentId.replace('AGENT_', '').toUpperCase();
        
        // Filtre les synapses GLOBALES et celles spécifiques à l'AGENT
        return memory.filter(s => s.scope === 'GLOBAL' || s.scope === agentScope).slice(0, 3);
    } catch (e) {
        console.error("⚠️ [SKILL_MINER] Erreur lecture synapses:", e.message);
        return [];
    }
}

/**
 * Extrait le contenu Markdown d'une skill
 */
function getSkillContent(skillPath) {
    const fullPath = path.join(BASE_MINE_PATH, skillPath, 'README.md');
    if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf8');
    }
    return null;
}

// --- MODE CLI ---
if (require.main === module) {
    const query = process.argv[2] || "ai";
    console.log(`🔍 Mining skills for: "${query}"...`);
    const skills = mineSkills(query);
    
    if (skills.length === 0) {
        console.log("📭 Aucune pépite trouvée dans la mine.");
    } else {
        skills.forEach(s => {
            console.log(`\n💎 PÉPITE TROUVÉE : ${s.name}`);
            console.log(`📝 Description : ${s.description}`);
            const content = getSkillContent(s.path);
            if (content) {
                console.log(`✅ SOP chargée (${content.length} chars)`);
            }
        });
    }
}

module.exports = { mineSkills, getSkillContent, mineSynapses };
