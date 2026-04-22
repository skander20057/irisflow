const { turboScrape } = require('../04_TECH/ENGINE_V72_SOUVERAIN/AGENT_BUSINESS_TURBO_ENGINE.cjs');
const fs = require('fs');

async function testMegaTurbo() {
    const zone = "La Goulette";
    const specialty = "Dentiste";
    const count = 30;

    console.log(`🚀 [TEST] Lancement de la mission Mega-Turbo sur ${zone}...`);
    const results = await turboScrape(zone, specialty, count);

    if (results.length > 0) {
        fs.writeFileSync('scratch/GAMMARTH_RESULTS.json', JSON.stringify(results, null, 2));
        const verified = results.filter(p => p.phone !== "NON DÉTECTÉ").length;
        console.log(`\n✅ TEST RÉUSSI : ${results.length} cibles trouvées, ${verified} numéros réels vérifiés.`);
    } else {
        console.log("❌ TEST ÉCHOUÉ : Aucun résultat.");
    }
}

testMegaTurbo();
