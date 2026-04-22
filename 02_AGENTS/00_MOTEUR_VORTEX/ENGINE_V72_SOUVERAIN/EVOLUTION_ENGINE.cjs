const fs = require('fs');
const path = require('path');

/**
 * Moteur d'Évolution (Mutation) V140
 * Injecte l'expérience acquise dans la conscience de l'agent.
 */
function mutateAgentMemory(agentKey, auditResult) {
    const root = path.resolve(__dirname, '..', '..');
    const expertDir = path.join(root, "02_AGENTS/NOS_AGENTS_D_ELITE");
    
    // 1. Recherche dynamique du fichier de conscience
    let consciencePath = null;
    function findConscience(dir) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file === `AGENT_${agentKey.toUpperCase()}`) {
                    const protocolPath = path.join(fullPath, "07_CORE_PROTOCOLS/CONSCIENCE_INDIVIDUELLE.md");
                    if (fs.existsSync(protocolPath)) consciencePath = protocolPath;
                }
                findConscience(fullPath);
            }
        }
    }
    findConscience(expertDir);

    if (!consciencePath) {
        console.log(`⚠️ [MUTATION] Conscience introuvable pour ${agentKey}`);
        return;
    }

    // 2. Préparation de la mémoire d'expérience
    const date = new Date().toLocaleDateString();
    let memoryBlock = `\n\n### 🧠 MÉMOIRE D'EXPÉRIENCE : ${date}\n`;
    memoryBlock += `> [!IMPORTANT]\n`;
    memoryBlock += `> **DERNIÈRE NOTE** : ${auditResult.score}/10\n`;
    memoryBlock += `> **LEÇONS APPRISES** :\n`;
    auditResult.tips.forEach(tip => {
        memoryBlock += `> - ${tip}\n`;
    });
    memoryBlock += `---`;

    // 3. Injection (Append)
    try {
        fs.appendFileSync(consciencePath, memoryBlock);
        console.log(`🧬 [MUTATION] Mémoire injectée pour ${agentKey} -> ${path.basename(consciencePath)}`);
    } catch (e) {
        console.error(`⚠️ [MUTATION_ERR]`, e.message);
    }
}

module.exports = { mutateAgentMemory };
