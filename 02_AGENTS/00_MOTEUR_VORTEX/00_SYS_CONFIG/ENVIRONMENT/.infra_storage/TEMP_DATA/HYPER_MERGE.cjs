const fs = require('fs');
const path = require('path');

const DB_PATH = './02_AGENTS/NOS_AGENTS_D_ELITE/02_POLE_COMMERCIAL_SALES/AGENT_BUSINESS/06_BIBLIOTHEQUE_KNOWLEDGE/SOVEREIGN_MEDICAL_DB.json';
const NEW_DATA_PATH = './scratch/AOUINA_HYPER_REPORT.json';

try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const newData = JSON.parse(fs.readFileSync(NEW_DATA_PATH, 'utf8'));

    if (!db.DOCTORS) db.DOCTORS = [];

    // Filter out prospects without phones as per user preference (30 verified)
    const verifiedOnly = newData.filter(p => p.phone !== "NON DÉTECTÉ");

    // Merge only if name doesn't exist to avoid duplicates
    let addedCount = 0;
    verifiedOnly.forEach(p => {
        if (!db.DOCTORS.find(existing => existing.name === p.name)) {
            db.DOCTORS.push(p);
            addedCount++;
        }
    });

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`✅ [HYPER-MERGE SUCCESS] ${addedCount} nouveaux prospects vérifiés ajoutés.`);
    console.log(`📊 Total Prospects dans la DB : ${db.DOCTORS.length}`);

} catch (e) {
    console.error(`❌ [MERGE ERROR] ${e.message}`);
}
