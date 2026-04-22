const fs = require('fs');
const path = require('path');
const { getPath, ROOT_DIR } = require('./paths.cjs');

console.log('🛡️  [SENTINELLE] Audit de Santé du Cerveau Alpha...');

const pillars = [
    '01_STRATEGIE/00_PILOTAGE_LIVE',
    '01_STRATEGIE/01_NEXUS_SYSTEME',
    '01_STRATEGIE/02_RETOUR_D_EXPERIENCE',
    '01_STRATEGIE/99_ZONE_OMBRE'
];

let errors = 0;
pillars.forEach(p => {
    if (fs.existsSync(path.join(ROOT_DIR, p))) {
        console.log('✅ Pilier Détecté :', p);
    } else {
        console.error('❌ PILIER MANQUANT :', p);
        errors++;
    }
});

const criticalFiles = [
    getPath('TECH', 'COCKPIT'),
    path.join(getPath('COMMAND', 'CONFIG'), 'PATHS_MASTER.json'),
    path.join(getPath('COMMAND', 'REGISTRE'), 'MISSION_TRACES.json')
];

criticalFiles.forEach(f => {
    if (fs.existsSync(f)) {
        console.log('✅ Fichier Critique OK :', path.basename(f));
    } else {
        console.error('❌ FICHIER CRITIQUE ABSENT :', f);
        errors++;
    }
});

console.log(errors === 0 ? '🏆 [CERTIFICATION] CERVEAU ALPHA 100% OPÉRATIONNEL.' : '⚠️ [ALERTE] DÉFAILLANCES DÉTECTÉES.');
