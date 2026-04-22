const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT_DIR = __dirname;
const SRC_DIR = path.join(ROOT_DIR, 'src');

console.log(`🛡️ [CYBER-WATCHDOG] Initialisation de la surveillance globale sur : ${SRC_DIR}`);

function reportFix(details) {
    const data = JSON.stringify({ agent: 'CYBER_DEBUG', message: `🛡️ AUTO-STABILITÉ : ${details}`, type: 'success' });
    const req = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/report-autofix',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }, res => {});
    req.on('error', (e) => console.error(`⚠️ [WATCHDOG] Erreur de reporting: ${e.message}`));
    req.write(data);
    req.end();
}

function checkAndRepair(filePath) {
    // Si c'est un nom de fichier relatif
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(SRC_DIR, filePath);
    
    if (!fullPath.endsWith('.jsx') && !fullPath.endsWith('.js')) return;
    
    try {
        if (!fs.existsSync(fullPath)) return;
        
        let content = fs.readFileSync(fullPath, 'utf8');
        let fixed = false;

        // 1. Detection des '>' de contenu non échappé (Regex Hardenée)
        // On ne remplace que si > est suivi de texte sur la même ligne
        const unescapedBracketRegex = /^(\s*)>([^<\n]+)$/gm;
        if (unescapedBracketRegex.test(content)) {
            console.log(`🔍 [WATCHDOG] Détection '>' dans ${path.basename(fullPath)}. Réparation...`);
            content = content.replace(unescapedBracketRegex, '$1{">"}$2');
            fixed = true;
        }

        if (fixed) {
            fs.writeFileSync(fullPath, content);
            console.log(`✅ [WATCHDOG] ${path.basename(fullPath)} réparé avec succès.`);
            reportFix(`Réparation syntaxique dans ${path.basename(fullPath)}`);
        }
    } catch (e) {
        console.error("❌ [WATCHDOG] Erreur de vérification:", e.message);
    }
}

// Watcher récursif sur le dossier src
let timeouts = {};
fs.watch(SRC_DIR, { recursive: true }, (event, filename) => {
    if (filename && (filename.endsWith('.jsx') || filename.endsWith('.js'))) {
        clearTimeout(timeouts[filename]);
        timeouts[filename] = setTimeout(() => checkAndRepair(filename), 1000);
    }
});

// Check initial de App.jsx
checkAndRepair(path.join(SRC_DIR, 'App.jsx'));
