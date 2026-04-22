const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', '..', '02_AGENTS', '00_TELEMETRIE', 'agent_logs.txt');

/**
 * 🛰️ UTIBILITAIRE DE LOGGING IRIS (V97.0)
 * Types supportés : SUCCESS, ERROR, INFO, SYSTEM
 */
function appendLog(type, message) {
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour12: false });
    const tag = `[${type.toUpperCase()}]`;
    const line = `[${timestamp}] ${tag} - ${message}\n`;

    try {
        // Créer le dossier s'il n'existe pas
        const dir = path.dirname(LOG_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.appendFileSync(LOG_FILE, line);
        console.log(`📡 [LOG] ${line.trim()}`);
    } catch (e) {
        console.error("❌ [LOGGER] Échec écriture :", e.message);
    }
}

module.exports = { appendLog };
