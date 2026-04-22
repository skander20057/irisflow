const fs = require('fs');
const path = require('path');

// CONFIGURATION (Vérifiez ces valeurs avec votre .env)
const SUPABASE_URL = "https://iuwvnqsnvospclbmznkv.supabase.co";
const SUPABASE_KEY = "sb_publishable_r7A39pSjyRW6PpvtlFnI0w_C59-1rxK";
const CRM_PATH = path.join(__dirname, '../../02_AGENTS/02_COMMERCIAL_SALES/BUREAU/CRM_PROSPECTS.md');

async function sync() {
    console.log("🚀 [IRIS SYNC] Démarrage de la synchronisation souveraine...");
    
    // 1. Extraction des Prospects
    if (!fs.existsSync(CRM_PATH)) {
        console.error("❌ CRM introuvable."); return;
    }
    const crmContent = fs.readFileSync(CRM_PATH, 'utf8');
    const prospectLines = crmContent.split('\n').filter(l => l.includes('|') && !l.includes('---') && !l.includes('Nom |'));
    const prospects = prospectLines.map(line => {
        const parts = line.split('|').map(x => x.trim());
        if (parts.length < 7) return null;
        return {
            name: parts[1].replace(/\*\*/g, ''),
            tel: parts[2],
            specialty: parts[3],
            zone: parts[4],
            score: parts[5],
            funnel: parts[6],
            site: parts[7] || ''
        };
    }).filter(x => x);

    // 2. Extraction des Agents
    const agentPoles = ["01_DIRECTION_STRATEGIQUE", "02_COMMERCIAL_SALES", "03_CREATIF_DESIGN", "04_TECH_CYBER", "05_MEDICAL_SANTE", "06_FINANCE_ROI", "07_JURIDIQUE_CONTRATS", "08_RD_INNOVATION", "10_MONITORING_SENTINEL"];
    const agents = [];
    agentPoles.forEach(pole => {
        const polePath = path.join(__dirname, '../../02_AGENTS', pole);
        if (fs.existsSync(polePath)) {
            const files = fs.readdirSync(polePath).filter(f => f.startsWith('AGENT_') && f.endsWith('.md'));
            files.forEach(f => {
                agents.push({
                    name: f.replace('.md', ''),
                    pole: pole.replace(/^\d{2}_/, '').replace(/_/g, ' '),
                    status: "Online",
                    expertise: "NIVEAU 5"
                });
            });
        }
    });

    console.log(`📊 Données prêtes : ${prospects.length} prospects et ${agents.length} agents.`);
    console.log("---------------------------------------------------------");
    console.log("⚠️  COUPLEZ CES COMMANDES DANS VOTRE TERMINAL POUR UPLOADER :");
    console.log("---------------------------------------------------------");

    // Génération de commandes CURL pour l'utilisateur (car le sandbox n'a pas accès au web)
    const prospectsJson = JSON.stringify(prospects).replace(/'/g, "'\\''");
    const agentsJson = JSON.stringify(agents).replace(/'/g, "'\\''");

    console.log("\n1️⃣  UPLOAD DES PROSPECTS :");
    console.log(`curl -X POST "${SUPABASE_URL}/rest/v1/prospects" \\
-H "apikey: ${SUPABASE_KEY}" \\
-H "Authorization: Bearer ${SUPABASE_KEY}" \\
-H "Content-Type: application/json" \\
-H "Prefer: resolution=merge-duplicates" \\
-d '${prospectsJson}'`);

    console.log("\n2️⃣  UPLOAD DES AGENTS :");
    console.log(`curl -X POST "${SUPABASE_URL}/rest/v1/agents" \\
-H "apikey: ${SUPABASE_KEY}" \\
-H "Authorization: Bearer ${SUPABASE_KEY}" \\
-H "Content-Type: application/json" \\
-H "Prefer: resolution=merge-duplicates" \\
-d '${agentsJson}'`);

    console.log("\n---------------------------------------------------------");
    console.log("✅ Une fois ces commandes lancées, votre Vercel sera 100% REEL.");
}

sync();
