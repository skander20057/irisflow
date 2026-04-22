const fs = require('fs');
const path = require('path');
const http = require('http');

const { getPath } = require('./paths.cjs');
const { mineSynapses } = require('../ENGINE_CORE/intelligence/skill_miner.cjs');

const PROSPECTS_DIR = getPath('BUSINESS', 'PROSPECTS');
const CRM_FILE = getPath('BUSINESS', 'CRM');

const TARGET = 100;
const DELAY = 50; 
const BATCH_SIZE = 5; 

// --- 🎤 REPORTING LIVE ---
function reportLive(msg, type = 'info') {
    const data = JSON.stringify({ agent: 'BUSINESS', message: msg, type });
    const req = http.request({
        hostname: 'localhost', port: 6789, path: '/api/report-autofix', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, res => {});
    req.on('error', (e) => console.error(`⚠️ [SIMULATOR] Erreur reporting: ${e.message}`));
    req.write(data);
    req.end();
}

// --- 🧪 CHARGEMENT BASE DE DONNÉES SOUVERAINE (ZÉRO HALLUCINATION) ---
const DB_PATH = getPath('BUSINESS', 'MEDICAL_DB');

function loadRealDoctors() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data).DOCTORS;
    } catch (e) {
        console.error("❌ [VORTEX] Erreur chargement DB Médicale :", e.message);
        return [];
    }
}

// --- 🚀 RUNNER ---
async function run() {
    const rawDoctors = loadRealDoctors();
    
    // 1. Déduplication In-Memory (Standard Lex Veritas)
    const seen = new Set();
    const realDoctors = rawDoctors.filter(d => {
        const duplicate = seen.has(d.name + d.phone);
        seen.add(d.name + d.phone);
        return !duplicate;
    });

    const effectiveTarget = Math.min(TARGET, realDoctors.length);

    console.log(`🚀 [AGENT_BUSINESS] Sourcing RÉEL & SYNC GLOBALE en cours...`);
    reportLive(`🚀 DÉMARRAGE DU SOURCING RÉEL ET SYNC GLOBALE (${effectiveTarget} CIBLES)`, 'info');

    // 2. Nettoyage du Répertoire Prospect (Suppression des Fiches Orphelines)
    if (fs.existsSync(PROSPECTS_DIR)) {
        console.log("🧹 [VORTEX] Nettoyage du répertoire prospect pour éviter les doublons fossiles...");
        const files = fs.readdirSync(PROSPECTS_DIR);
        for (const file of files) {
            fs.unlinkSync(path.join(PROSPECTS_DIR, file));
        }
    } else {
        fs.mkdirSync(PROSPECTS_DIR, { recursive: true });
    }

    // 3. Réinitialisation du CRM (Source de Vérité)
    const header = `# 📑 REGISTRE DES PROSPECTS - DIGITAL FLUX (SOVEREIGN V13.2)\n\n| Nom | Téléphone | Spécialité | Zone | Score | Funnel | Site | Maps | Med.tn | Diagnostic |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    fs.writeFileSync(CRM_FILE, header);

    let batchBuffer = [];

    for (let i = 0; i < effectiveTarget; i++) {
        const p = realDoctors[i];
        const fileName = `${p.name.replace(/\s/g, '_').replace(/\./g, '')}.md`;
        const filePath = path.join(PROSPECTS_DIR, fileName);

        // 4. Production de la fiche prospect individuelle (IRIS OS COMPATIBLE)
        const synapses = mineSynapses('AGENT_BUSINESS');
        const fileContent = `---
name: "${p.name}"
specialty: "${p.spec}"
zone: "${p.zone}"
tel: "${p.phone}"
lead_score: ${parseInt(p.score)}
funnel_stage: "${p.funnel}"
site_status: "${p.site}"
med_tn_url: "https://www.med.tn/recherche?q=${encodeURIComponent(p.name)}"
google_business_url: "https://www.google.com/maps/search/${encodeURIComponent(p.name + " " + p.zone + " Tunis")}"
---

# 📑 PROSPECT : ${p.name}

## 💰 BUSINESS : STRATÉGIE CROISSANCE
- **Diagnostic** : ${p.diag || "Analyse requise."}
- **Opportunité** : Croissance identifiée via sourcing souverain.
- **Statut** : ${p.funnel}

## ✍️ COPYWRITING : ÉLITE HOOKS
- **Angle d'attaque** : Expertise en ${p.spec}.
- **Hook** : "L'excellence médicale mérite une visibilité souveraine au ${p.zone}."

## 🏛️ ARCHITECTURE : VISION DU CABINET
- **Diagnostic visuel** : ${p.site === 'ABSENT' ? 'Absence de présence digitale premium.' : 'Refonte architecturale nécessaire.'}
- **Vision Flux** : Transformation vers un écosystème Elite CRM-OS.

## 🛠️ TECH : AUDIT MÉDIFLUX
- **Infrastructure** : Souveraine
- **Synapses Connectées** :
${synapses.map(s => `> - [${s.topic}] : ${s.lesson}`).join('\n') || "> *N/A*"}

## 📊 MÉTA-DONNÉES
- **Zone Tactique** : ${p.zone}
- **Score de Conversion** : ${p.score}
`;
        fs.writeFileSync(filePath, fileContent);

        // 5. Construction du Registre CRM
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(p.name + " " + p.zone + " Tunis")}`;
        const medUrl = `https://www.med.tn/recherche?q=${encodeURIComponent(p.name)}`;
        const crmLine = `| **${p.name}** | ${p.phone} | ${p.spec} | ${p.zone} | ${p.score} | ${p.funnel} | ${p.site} | [📍 Voir](${mapsUrl}) | [🏥 Med.tn](${medUrl}) | ${p.diag} |`;
        batchBuffer.push(crmLine);

        // 6. Batch Sync (Performance I/O)
        if (batchBuffer.length >= BATCH_SIZE || i === effectiveTarget - 1) {
            fs.appendFileSync(CRM_FILE, batchBuffer.join('\n') + '\n');
            const statusMsg = `🌪️ [VORTEX] Sync Globale : ${i + 1}/${effectiveTarget} enregistrements validés.`;
            console.log(statusMsg);
            reportLive(statusMsg, 'success');
            batchBuffer = [];
        }

        if (DELAY > 0) await new Promise(r => setTimeout(r, DELAY));
    }

    if (TARGET > realDoctors.length) {
        reportLive(`⚠️ DB épuisée. ${realDoctors.length} médecins réels uniques au total.`, 'warning');
    }
    reportLive("✅ SYNC GLOBALE RÉUSSIE. CRM ET FICHES SONT EN PARFAITE ADÉQUATION.", 'success');
}

run();
