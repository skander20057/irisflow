const fs = require('fs');
const path = require('path');

/**
 * UTITLITAIRE D'ÉCRITURE ATOMIQUE (V22.0)
 * Empêche les collisions de données entre plusieurs agents.
 */
const locks = new Map();

async function atomicWrite(filePath, content) {
    // Attendre que le verrou soit libéré si nécessaire
    while (locks.get(filePath)) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    try {
        locks.set(filePath, true);
        
        // On écrit d'abord dans un fichier temporaire
        const tempPath = `${filePath}.tmp`;
        fs.writeFileSync(tempPath, content, 'utf8');
        
        // On renomme le fichier temporaire (Opération atomique dans la plupart des OS)
        fs.renameSync(tempPath, filePath);
        
        return true;
    } catch (e) {
        console.error(`❌ [ATOMIC_WRITE_ERROR] ${filePath}:`, e.message);
        throw e;
    } finally {
        locks.set(filePath, false);
    }
}

module.exports = { atomicWrite };
