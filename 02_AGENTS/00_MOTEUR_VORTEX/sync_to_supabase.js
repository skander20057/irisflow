const fs = require('fs');
const path = require('path');

// CONFIGURATION
const SUPABASE_URL = "https://iuwvnqsnvospclbmznkv.supabase.co";
const SUPABASE_KEY = "sb_publishable_r7A39pSjyRW6PpvtlFnI0w_C59-1rxK";

const FILES = [
    { 
        path: '02_AGENTS/02_COMMERCIAL_SALES/BUREAU/CRM_PROSPECTS.md', 
        table: 'prospects', 
        header: 'Nom |',
        map: (parts) => ({
            name: parts[1].replace(/\*\*/g, ''),
            tel: parts[2],
            specialty: parts[3],
            zone: parts[4],
            score: parts[5],
            funnel: parts[6],
            site: parts[7] || ''
        })
    },
    { 
        path: '01_STRATEGIE/00_CONTRÔLE_DES_MISSIONS.md', 
        table: 'missions', 
        header: 'Mission |',
        map: (parts) => ({
            title: parts[1].replace(/\*\*/g, ''),
            status: parts[2],
            priority: parts[3],
            deadline: parts[4]
        })
    },
    { 
        path: '03_PROJETS/REGISTRE_MASTER_PROJETS.md', 
        table: 'projets', 
        header: 'Client |',
        map: (parts) => ({
            client: parts[1].replace(/\*\*/g, ''),
            type: parts[2],
            status: parts[4],
            link: ''
        })
    }
];

async function syncAll() {
    console.log("🌐 [IRIS AUTO-SYNC] Début de la synchronisation cloud...");

    for (const config of FILES) {
        const fullPath = path.join(__dirname, '../../', config.path);
        if (!fs.existsSync(fullPath)) continue;

        console.log(`📡 Extraction : ${config.table}...`);
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').filter(l => l.includes('|') && !l.includes('---') && !l.includes(config.header));
        
        const data = lines.map(line => {
            const parts = line.split('|').map(x => x.trim());
            if (parts.length < 5) return null;
            return config.map(parts);
        }).filter(x => x);

        // Envoi vers Supabase via FETCH (Native in Node 18+)
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${config.table}`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log(`✅ ${config.table} : ${data.length} entrées synchronisées.`);
            } else {
                console.error(`❌ Erreur ${config.table} : ${response.statusText}`);
            }
        } catch (e) {
            console.error(`❌ Échec réseau pour ${config.table} :`, e.message);
        }
    }
}

syncAll();
