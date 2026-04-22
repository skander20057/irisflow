const { exec } = require('child_process');

/**
 * RAW_SPIDER : High-speed URL discovery for Med.tn
 * Fetches multiple listing pages in parallel using raw HTTP requests.
 * Protocol: Lex Veritas (Zero Browser, Zero Hallucination)
 */

async function fetchListingPage(url) {
    return new Promise((resolve) => {
        // Updated UA for maximum compatibility
        const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
        exec(`curl -s -L -H "User-Agent: ${ua}" "${url}"`, { timeout: 10000 }, (error, stdout) => {
            const urls = [];
            if (!error && stdout) {
                // Robust Regex for profile links
                const regex = /href="([^"]*\/medecin\/[^"]+dr-[^"]+\.html)"/g;
                let match;
                while ((match = regex.exec(stdout)) !== null) {
                    const fullUrl = match[1].startsWith('http') ? match[1] : `https://www.med.tn${match[1]}`;
                    // Extract name from URL slug for Lex Veritas verification
                    const slug = match[1].split('/').pop().replace('.html', '');
                    const nameParts = slug.split('-').slice(0, -1);
                    const name = "Dr " + nameParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    
                    if (!urls.find(u => u.url === fullUrl)) {
                        urls.push({ name, url: fullUrl });
                    }
                }
            }
            resolve(urls);
        });
    });
}

async function discoverTargets(zone, specialty, count = 30) {
    console.log(`🕷️ [RAW_SPIDER] Lancement de la découverte parallèle pour ${zone}...`);
    const startTime = Date.now();
    
    // Pattern Med.tn: zone en minuscules, tirets au lieu d'espaces
    const zoneSlug = zone.toLowerCase().replace(/\s/g, '-');
    const specSlug = specialty.toLowerCase().replace(/\s/g, '-').replace('é', 'e').replace('è', 'e');
    
    // Parallelizing multiple pages to guarantee the count
    const baseListingUrl = `https://www.med.tn/medecin/${specSlug}/tunis/${zoneSlug}`;
    const pages = [
        baseListingUrl,
        `${baseListingUrl}?page=2`,
        `${baseListingUrl}?page=3`
    ];

    const results = await Promise.all(pages.map(p => fetchListingPage(p)));
    
    // Flatten and unique
    const allTargets = [];
    const seen = new Set();
    results.flat().forEach(t => {
        if (!seen.has(t.url)) {
            allTargets.push(t);
            seen.add(t.url);
        }
    });

    const duration = (Date.now() - startTime) / 1000;
    console.log(`✅ [RAW_SPIDER] ${allTargets.length} cibles réelles découvertes en ${duration.toFixed(2)}s.`);
    
    return allTargets.slice(0, count);
}

module.exports = { discoverTargets };

// CLI Test
if (require.main === module) {
    discoverTargets("La Goulette", "Dentiste", 10).then(res => console.log(JSON.stringify(res, null, 2)));
}
