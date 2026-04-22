const path = require('path');
const fs = require('fs');

// Détection de la racine absolue basée sur la structure du projet (V68 Fractal)
const findProjectRoot = (startDir) => {
    let currentDir = startDir;
    while (currentDir !== path.parse(currentDir).root) {
        if (fs.existsSync(path.join(currentDir, '01_STRATEGIE'))) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    return startDir; // Fallback
};

const ROOT_DIR = findProjectRoot(__dirname);
const CONFIG_PATH = path.join(ROOT_DIR, '01_STRATEGIE', '10_LOIS_ET_FONDATIONS', 'PATHS_MASTER.json');

console.log(`📡 [PATH_MANAGER] Racine détectée : ${ROOT_DIR}`);

let config = {};
try {
    if (fs.existsSync(CONFIG_PATH)) {
        const data = fs.readFileSync(CONFIG_PATH, 'utf8');
        config = JSON.parse(data);
    } else {
        console.error("❌ [PATH_MANAGER] Fichier config introuvable :", CONFIG_PATH);
    }
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
