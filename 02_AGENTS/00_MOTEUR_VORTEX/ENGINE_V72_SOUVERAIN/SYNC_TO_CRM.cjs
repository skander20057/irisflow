const fs = require('fs');
const path = require('path');

/**
 * 🔄 SYNC_TO_CRM : Convertit les rapports Turbo en entrées CRM
 * Protocol: Lex Veritas / Zero-Hallucination
 * Input: TURBO_REPORTS.json → Output: Append to CRM_PROSPECTS.md
 */

const ROOT = path.resolve(__dirname, '..', '..');
const REPORTS_PATH = path.join(__dirname, 'REPORTS', 'TURBO_REPORTS.json');
const CRM_PATH = path.join(ROOT, '02_AGENTS/NOS_AGENTS_D_ELITE/02_POLE_COMMERCIAL_SALES/02_CRM_SOUVERAIN/CRM_PROSPECTS.md');

/**
 * Scoring intelligent basé sur des critères réels.
 */
function calculateScore(prospect) {
    let score = 70; // Base

    // +15 si téléphone vérifié
    if (prospect.phone && prospect.phone !== "NON DÉTECTÉ") score += 15;

    // +10 si pas de site web (opportunité de création)
    if (prospect.site === "ABSENT") score += 10;

    // +5 si zone premium (Lac 1, Lac 2, Marsa, Gammarth)
    const premiumZones = ['lac', 'marsa', 'gammarth', 'ennasr', 'menzah'];
    if (premiumZones.some(z => prospect.zone.toLowerCase().includes(z))) score += 5;

    // +5 si spécialité haute valeur
    const highValueSpecs = ['chirurg', 'implant', 'esthéti', 'ophtalm', 'cardiolog'];
    if (highValueSpecs.some(s => prospect.spec.toLowerCase().includes(s))) score += 5;

    // Cap à 99
    return Math.min(score, 99);
}

function getScoreEmoji(score) {
    if (score >= 95) return '🚀';
    if (score >= 90) return '💎';
    if (score >= 85) return '🔥';
    return '📈';
}

function syncToCRM() {
    if (!fs.existsSync(REPORTS_PATH)) {
        console.log("⚠️ [SYNC] Aucun rapport Turbo trouvé.");
        return;
    }

    const rawData = fs.readFileSync(REPORTS_PATH, 'utf8');
    const prospects = JSON.parse(rawData);

    if (!Array.isArray(prospects) || prospects.length === 0) {
        console.log("⚠️ [SYNC] Le rapport Turbo est vide.");
        return;
    }

    // Lire le CRM existant pour éviter les doublons
    let existingCRM = '';
    if (fs.existsSync(CRM_PATH)) {
        existingCRM = fs.readFileSync(CRM_PATH, 'utf8');
    }

    let newEntries = 0;
    let crmAppend = '';

    for (const p of prospects) {
        // Vérification anti-doublon par nom
        if (existingCRM.includes(p.name)) {
            console.log(`⏭️ [SKIP] ${p.name} déjà dans le CRM.`);
            continue;
        }

        const score = calculateScore(p);
        const emoji = getScoreEmoji(score);
        const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(p.name + ' ' + p.zone + ' Tunis')}`;
        const medtnUrl = `https://www.med.tn/recherche?q=${encodeURIComponent(p.name)}`;

        crmAppend += `| **${p.name}** | ${p.phone} | ${p.spec} | ${p.zone} | ${score} ${emoji} | ${p.funnel} | ${p.site} | [📍 Voir](${googleMapsUrl}) | [🏥 Med.tn](${medtnUrl}) | ${p.diag} |\n`;
        newEntries++;
    }

    if (newEntries > 0) {
        fs.appendFileSync(CRM_PATH, crmAppend);
        console.log(`\n✅ [SYNC] ${newEntries} nouveaux prospects injectés dans le CRM.`);
    } else {
        console.log("ℹ️ [SYNC] Tous les prospects sont déjà dans le CRM.");
    }
}

module.exports = { syncToCRM, calculateScore };

if (require.main === module) {
    syncToCRM();
}
