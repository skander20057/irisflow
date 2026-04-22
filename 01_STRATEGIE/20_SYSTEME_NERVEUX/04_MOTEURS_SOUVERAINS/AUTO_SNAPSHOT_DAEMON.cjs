const fs = require('fs');
const shell = require('child_process');
const path = require('path');
const { getPath, ROOT_DIR } = require('./paths.cjs');

const BACKUP_DIR = path.join(ROOT_DIR, '05_RAPPORTS', 'BACKUPS');
const FILES_TO_SAVE = [
    getPath('BUSINESS', 'CRM'),
    path.join(getPath('COMMAND', 'REGISTRE'), 'SYNAPTIC_MEMORY.json'),
    path.join(getPath('COMMAND', 'CONFIG'), 'PATHS_MASTER.json'),
    path.join(getPath('INTELLIGENCE', 'AGENTS'), 'CONNAISSANCES_AGENTS', 'CERVEAU_GLOBAL.md')
];

function logVault(msg) {
    console.log(`🏛️ [VAULT_DAEMON] ${msg}`);
}

async function createSnapshot() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotDir = path.join(BACKUP_DIR, `SNAPSHOT_${timestamp}`);

    try {
        if (!fs.existsSync(snapshotDir)) fs.mkdirSync(snapshotDir, { recursive: true });

        logVault(`Démarrage du Snapshot éternel : ${timestamp}...`);

        FILES_TO_SAVE.forEach(file => {
            if (file && fs.existsSync(file)) {
                const dest = path.join(snapshotDir, path.basename(file));
                fs.copyFileSync(file, dest);
            }
        });

        logVault(`✅ Snapshot terminé et sécurisé dans : ${snapshotDir}`);
    } catch (e) {
        logVault(`❌ Erreur Snapshot : ${e.message}`);
    }
}

// Lancement toutes les 24h (86400000 ms)
logVault("Agent de Fortification (Vault) opérationnel. Prochain snapshot dans 24h.");
setInterval(createSnapshot, 86400000);

// Premier snapshot immédiat pour la V23.0
createSnapshot();
