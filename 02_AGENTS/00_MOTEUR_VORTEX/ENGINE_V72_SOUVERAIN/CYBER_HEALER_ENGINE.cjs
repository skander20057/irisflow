const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { getPath } = require('./paths.cjs');

const REGISTRY_PATH = path.join(getPath('COMMAND', 'REGISTRE'), 'PROBLEMS_REGISTRY.json');
const SRC_DIR = path.join(__dirname, 'src');

console.log("🛡️ [HEALER-ENGINE] Initialisation du système d'auto-réparation V5.1...");

function logFix(issue, resolution) {
    try {
        const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
        registry.history.push({
            date: new Date().toISOString(),
            issue,
            resolution,
            status: 'FIXED'
        });
        registry.issues = registry.issues.filter(i => i.id !== issue.id);
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
        console.log(`✅ [HEALER] Réparation consignée : ${resolution}`);
    } catch (e) {
        console.error("❌ [HEALER] Erreur de mise à jour du registre:", e.message);
    }
}

function solveJsxTagMismatch(filePath, line, expected) {
    try {
        const content = fs.readFileSync(filePath, 'utf8').split('\n');
        const originalLine = content[line - 1];
        
        // Tentative de remplacement intelligent de la balise fermante
        const fixedLine = originalLine.replace(/<\/([a-zA-Z0-9.-]+)>/, `</${expected}>`);
        
        if (fixedLine !== originalLine) {
            content[line - 1] = fixedLine;
            fs.writeFileSync(filePath, content.join('\n'));
            return true;
        }
    } catch (e) {
        console.error("❌ [HEALER] Echec de la réparation JSX:", e.message);
    }
    return false;
}

function processRegistry() {
    try {
        const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
        if (!registry.auto_fix_enabled || registry.issues.length === 0) return;

        for (const issue of registry.issues) {
            console.log(`🔍 [HEALER] Analyse du problème : ${issue.message}`);
            
            // 1. Détection Mismatch de Balise JSX (OXC Style)
            if (issue.message.includes("Expected corresponding JSX closing tag")) {
                const match = issue.message.match(/for '([^']+)'/);
                const tag = match ? match[1] : null;
                const line = issue.line;
                const file = path.join(__dirname, issue.file.replace(/^\//, '')); // Nettoyage du path
                
                if (tag && line && fs.existsSync(file)) {
                    console.log(`🩹 [HEALER] Tentative de fixation de la balise </${tag}> à la ligne ${line}...`);
                    const success = solveJsxTagMismatch(file, line, tag);
                    if (success) {
                        logFix(issue, `Rétablissement de la balise </${tag}> à la ligne ${line} de ${path.basename(file)}`);
                    }
                }
            }

            // 2. [V25] Détection Erreur de Syntaxe Node/Server
            if (issue.message.includes("Unexpected token") || issue.message.includes("is not defined")) {
                console.log(`🛡️ [HEALER_SEC] Alerte syntaxe critique sur ${issue.file}. Transmission à l'Agent Cyber-Debug pour Auto-Fix.`);
                try {
                    const vortex = require('./VORTEX_CORE.cjs');
                    vortex.dispatchMission("CYBER_DEBUG", `Réparation d'urgence sur ${issue.file}`, "SKILL-AUTO-FIX-SYNTAX");
                } catch (e) {
                    console.error("⚠️ [HEALER_DELEGATION_ERR]", e.message);
                }
            }
        }
    } catch (e) {
        // Silencieux si le fichier n'est pas prêt
    }
}

// Watcher sur le registre
fs.watchFile(REGISTRY_PATH, { interval: 1000 }, (curr, prev) => {
    processRegistry();
});

console.log("🚀 [HEALER-ENGINE] En attente de signaux d'erreurs...");
processRegistry();
