const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 🛡️ SENTINELLE SEO : Auditeur Haute-Précision
 * Analyse les sites web des prospects pour détecter des opportunités de vente.
 */

async function auditSite(url) {
    if (!url || url === 'ABSENT' || !url.startsWith('http')) {
        return "❌ SITE ABSENT : Opportunité de création totale.";
    }

    return new Promise((resolve) => {
        exec(`curl -s -L -m 10 "${url}"`, (error, stdout) => {
            if (error || !stdout) {
                resolve("⚠️ SITE INACCESSIBLE : Serveur lent ou obsolète.");
                return;
            }

            const title = stdout.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || "Sans Titre";
            const description = stdout.match(/meta name="description" content="([^"]+)"/i)?.[1]?.trim() || "Sans Description";
            const h1 = stdout.match(/<h1>([^<]+)<\/h1>/i)?.[1]?.trim();
            const responsive = stdout.includes('viewport') ? "✅ Responsive" : "❌ NON-RESPONSIVE";

            let diag = `Titre: ${title.slice(0, 30)}... | ${responsive}`;
            if (description === "Sans Description") diag += " | ❌ Manque SEO (Meta Description)";
            if (!h1) diag += " | ❌ Structure H1 manquante";

            resolve(`🔍 AUDIT : ${diag}`);
        });
    });
}

// Logic pour mettre à jour le CRM
async function runSEOAUDIT() {
    const CRM_PATH = path.resolve(__dirname, '../../02_AGENTS/NOS_AGENTS_D_ELITE/02_POLE_COMMERCIAL_SALES/02_CRM_SOUVERAIN/CRM_PROSPECTS.md');
    
    if (!fs.existsSync(CRM_PATH)) return;

    let content = fs.readFileSync(CRM_PATH, 'utf8');
    const lines = content.split('\n');
    let updated = false;

    console.log("🛡️ [SENTINELLE] Audit SEO en cours sur les prospects...");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('|') && !line.includes('Nom') && !line.includes('---')) {
            const cols = line.split('|').map(c => c.trim());
            const siteUrl = cols[7]?.match(/\((http[^)]+)\)/)?.[1] || "ABSENT";
            
            // On audite seulement si le diagnostic est vide ou par défaut
            if (cols[10] === "" || cols[10] === "En attente" || cols[10] === "...") {
                const diag = await auditSite(siteUrl);
                cols[10] = diag;
                lines[i] = cols.join(' | ').trim();
                updated = true;
                console.log(`✅ Audit complété pour : ${cols[1]}`);
            }
        }
    }

    if (updated) {
        fs.writeFileSync(CRM_PATH, lines.join('\n'));
        console.log("✨ [SENTINELLE] CRM mis à jour avec les diagnostics SEO.");
    }
}

if (require.main === module) {
    runSEOAUDIT();
}

module.exports = { auditSite, runSEOAUDIT };
