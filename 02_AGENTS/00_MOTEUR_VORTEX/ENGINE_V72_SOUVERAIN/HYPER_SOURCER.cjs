const { execSync, exec } = require('child_process');
const fs = require('fs');

/**
 * HYPER_SOURCER : Multi-threaded parallel scraper for medical profiles.
 * Respects Lex Veritas: only real data extracted.
 */
async function extractPhone(target) {
    return new Promise((resolve) => {
        const start = Date.now();
        // Using curl -L to follow redirects and -s for silent
        // Extracting phone from itemprop="telephone"
        exec(`curl -s -L "${target.url}"`, { timeout: 5000 }, (error, stdout) => {
            let phone = "NON DÉTECTÉ";
            if (!error && stdout) {
                const match = stdout.match(/itemprop="telephone"\s+content="([^"]+)"/);
                if (match) phone = match[1].replace(/\./g, ' ');
            }
            const duration = Date.now() - start;
            resolve({ ...target, phone, duration });
        });
    });
}

async function runHyperSourcing(targets) {
    console.log(`🌀 [HYPER_ENGINE] Lancement du sourcing parallèle sur ${targets.length} cibles...`);
    const startTime = Date.now();
    
    // Launch all requests in parallel
    const results = await Promise.all(targets.map(t => extractPhone(t)));
    
    const endTime = Date.now();
    const totalDuration = (endTime - startTime) / 1000;
    
    const verified = results.filter(r => r.phone !== "NON DÉTECTÉ");
    
    console.log(`\n✨ [HYPER_ENGINE] Mission terminée en ${totalDuration.toFixed(2)} secondes.`);
    console.log(`📊 Résultats : ${verified.length}/${targets.length} prospects vérifiés.`);
    
    return results;
}

// CLI usage if needed
if (require.main === module) {
    const mockTargets = JSON.parse(process.argv[2] || '[]');
    runHyperSourcing(mockTargets).then(res => {
        fs.writeFileSync('scratch/HYPER_RESULTS.json', JSON.stringify(res, null, 2));
    });
}

module.exports = { runHyperSourcing };
