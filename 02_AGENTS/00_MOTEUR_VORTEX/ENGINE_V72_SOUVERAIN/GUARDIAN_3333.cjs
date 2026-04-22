const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHECK_INTERVAL = 60000; // 1 minute
const PORT = 3333;
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const LOG_FILE = path.join(ROOT_DIR, '00_SESSION_LOGS', 'guardian.log');
const SERVER_SCRIPT = path.join(ROOT_DIR, '01_STRATEGIE/99_ZONE_OMBRE/COCKPIT_V50/server_v50.cjs');

function log(msg) {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(LOG_FILE, entry);
    console.log(entry.trim());
}

async function checkPort() {
    return new Promise((resolve) => {
        exec(`lsof -i:${PORT} -t`, (error, stdout) => {
            if (error || !stdout) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

async function restartServer() {
    log(`⚠️ [ALERTE] Serveur sur le port ${PORT} introuvable. Tentative de redémarrage...`);
    
    // Nettoyage au cas où le port serait bizarrement bloqué
    exec(`lsof -ti:${PORT} | xargs kill -9`, () => {
        const startCmd = `node "${SERVER_SCRIPT}" > "${path.join(ROOT_DIR, '00_SESSION_LOGS', 'iris_server.log')}" 2>&1 &`;
        exec(startCmd, (err) => {
            if (err) {
                log(`❌ [ERREUR] Échec du redémarrage : ${err.message}`);
            } else {
                log(`✅ [SUCCÈS] Serveur IRIS relancé avec succès.`);
            }
        });
    });
}

async function runGuardian() {
    log(`🛡️ [GUARDIAN_3333] Surveillance active sur le port ${PORT}...`);
    
    setInterval(async () => {
        const isAlive = await checkPort();
        if (!isAlive) {
            await restartServer();
        }
    }, CHECK_INTERVAL);
}

// Lancement
if (!fs.existsSync(path.join(ROOT_DIR, '00_SESSION_LOGS'))) {
    fs.mkdirSync(path.join(ROOT_DIR, '00_SESSION_LOGS'));
}
runGuardian();
