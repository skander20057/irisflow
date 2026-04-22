const fs = require('fs');
const path = require('path');
const { mutateAgentMemory } = require('./EVOLUTION_ENGINE.cjs');

// --- 🎯 CONFIGURATION RÉSONANCE ---
const CORE_LEDGER_PATH = "/Users/hachicha/Desktop/digital flux/01_STRATEGIE/00_PILOTAGE_LIVE/01_COCKPIT_TACTIQUE/ANTIGRAVITY_CORE.md";

console.log("🌊 [RESONANCE] Moteur de Résonance Nexus V141 Actif.");
console.log(`📡 [RESONANCE] Surveillance : ${path.basename(CORE_LEDGER_PATH)}`);

let lastSize = fs.existsSync(CORE_LEDGER_PATH) ? fs.statSync(CORE_LEDGER_PATH).size : 0;

/**
 * Analyse les nouvelles lignes pour détecter des feedbacks CEO.
 */
function scanForFeedback() {
    try {
        const stats = fs.statSync(CORE_LEDGER_PATH);
        if (stats.size <= lastSize) return;

        const stream = fs.createReadStream(CORE_LEDGER_PATH, { start: lastSize });
        let content = "";
        
        stream.on('data', chunk => content += chunk);
        stream.on('end', () => {
            lastSize = stats.size;
            
            // On cherche le bloc [!CEO_FEEDBACK] avec une approche Regex robuste (V141.4)
            const feedbackMatch = content.match(/\[!CEO_FEEDBACK\]\s*(@AGENT_([A-Z_]+))?\s*:?([\s\S]+?)(---|$)/);
            
            if (feedbackMatch) {
                let targetAgent = feedbackMatch[2] || "SYNTHESE";
                let feedback = feedbackMatch[3].replace(/\\n/g, '\n').trim();

                if (feedback) {
                    console.log(`🧬 [RESONANCE] Vibration détectée pour ${targetAgent} ! Mutation lancée...`);
                    mutateAgentMemory(targetAgent, {
                        score: "CEO_DIRECTIVE",
                        tips: [`DIRECTIVE CEO : ${feedback}`]
                    });
                }
            }
        });
    } catch (e) {
        console.error("⚠️ [RESONANCE_ERR]", e.message);
    }
}

// Watcher temps réel
fs.watch(CORE_LEDGER_PATH, (event) => {
    if (event === 'change') {
        setTimeout(scanForFeedback, 500); // Petit délai pour laisser le fichier s'écrire
    }
});

// Scan initial au cas où
if (fs.existsSync(CORE_LEDGER_PATH)) scanForFeedback();
