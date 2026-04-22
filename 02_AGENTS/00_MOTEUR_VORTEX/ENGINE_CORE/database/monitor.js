const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { getPath } = require('../../PILOTE_V14/paths.cjs');
require('dotenv').config({ path: path.resolve(__dirname, '../administration_systeme/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const AGENTS_DIR = getPath('INTELLIGENCE', 'AGENTS');

console.log('🛡️ SENTINELLE TACTIQUE v3.0 - SYNC ABSOLUE ACTIVE');

// --- CŒUR DE LA MACHINE À ÉTATS ---
fs.watch(AGENTS_DIR, { recursive: true }, async (eventType, filename) => {
    if (!filename || filename.includes('.DS_Store')) return;

    const parts = filename.split(path.sep);
    const agentId = parts[0];
    const subFolder = parts[1]; // TRAVAIL_A_FAIRE, TRAVAIL_FAIT, etc.

    let status = 'INCONNU';
    if (subFolder === 'TRAVAIL_A_FAIRE') status = 'A_FAIRE';
    if (subFolder === 'TRAVAIL_FAIT') status = 'TERMINE';
    if (eventType === 'change') status = 'EN_COURS';

    try {
        // 1. Mise à jour de l'Audit Log
        await supabase.from('audit_logs').insert({
            agent_id: agentId,
            action_type: status,
            file_path: filename,
            details: { event: eventType, time: new Date().toISOString() }
        });

        // 2. Mise à jour du Statut Global (Si la table existe)
        console.log(`📡 [AUTO-SYNC] ${agentId} : ${status} -> ${filename}`);
    } catch (e) {
        console.error("❌ Erreur Sync:", e.message);
    }
});

console.log(`👀 Surveillance chirurgicale sur : ${AGENTS_DIR}`);
