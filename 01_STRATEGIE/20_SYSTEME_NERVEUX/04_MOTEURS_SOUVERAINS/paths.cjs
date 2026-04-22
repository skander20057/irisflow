const path = require('path');
const fs = require('fs');

// Détection de la racine absolue basée sur la structure du projet
const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');
const CONFIG_PATH = path.join(ROOT_DIR, '01_STRATEGIE', '01_NEXUS_SYSTEME', '02_CONFIGURATION', 'PATHS_MASTER.json');

console.log(`📡 [PATH_MANAGER] Racine détectée : ${ROOT_DIR}`);

let config = {};
try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    config = JSON.parse(data);
} catch (e) {
    console.error("❌ [PATH_MANAGER] Erreur de lecture du config master:", e.message);
}

const getPath = (sphere, key) => {
    if (!config.PATHS || !config.PATHS[sphere] || !config.PATHS[sphere][key]) {
        console.warn(`⚠️ [PATH_MANAGER] Chemin non trouvé : ${sphere}.${key}`);
        return null;
    }
    return path.join(ROOT_DIR, config.PATHS[sphere][key]);
};

module.exports = {
    ROOT_DIR,
    getPath,
    PATHS: config.PATHS
};
