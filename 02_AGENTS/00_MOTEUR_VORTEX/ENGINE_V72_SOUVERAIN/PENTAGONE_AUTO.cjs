const { runSEOAUDIT } = require('./SEO_SCANNER.cjs');
const { runConscience } = require('./CONSCIENCE_ENGINE.cjs');
// Note: ASSET_FACTORY et SKILL_MINER sont déclenchés par projet, mais on peut les intégrer ici.

async function runPentagone() {
    console.log("🌌 [PENTAGONE] Lancement de l'Orchestration Souveraine...");
    
    // 1. Audit SEO des prospects
    try {
        await runSEOAUDIT();
    } catch (e) {
        console.error("❌ [SEO] Échec de l'audit.");
    }

    // 2. Synthèse de Conscience
    try {
        runConscience();
    } catch (e) {
        console.error("❌ [CONSCIENCE] Échec de l'auto-évaluation.");
    }

    console.log("✨ [PENTAGONE] Mission d'automatisation terminée.");
}

if (require.main === module) {
    runPentagone();
}

module.exports = { runPentagone };
