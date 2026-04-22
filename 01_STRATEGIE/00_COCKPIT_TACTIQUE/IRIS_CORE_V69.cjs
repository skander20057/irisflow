const http = require('http');
const fs = require('fs');
const path = require('path');

// Chargement du Path Manager (V68 Fractal)
const pathsPath = path.join(__dirname, '..', '..', '02_AGENTS', '00_MOTEUR_VORTEX', 'ENGINE_V72_SOUVERAIN', 'paths.cjs');
let getPath;
try {
    const paths = require(pathsPath);
    getPath = paths.getPath;
    console.log("✅ [OMEGA_SERVER] Architecture Hub localisée aux coordonnées V72");
} catch (e) {
    console.error("❌ [OMEGA_SERVER] Erreur critique Path Manager :", e.message);
    process.exit(1);
}

const PORT = 3333; // RETOUR AU PORT STANDARD
const PILLARS = {
    'COMMAND': path.join(__dirname, '..', '..', '01_STRATEGIE'),
    'POLES': path.join(__dirname, '..', '..', '02_AGENTS'),
    'BUSINESS': path.join(__dirname, '..', '..', '03_PROJETS'),
    'TECH': path.join(__dirname, '..', '..', '02_AGENTS', '00_MOTEUR_VORTEX')
};

const PULSE_PATH = path.join(PILLARS.COMMAND, '00_PULSE_LIVE.md');

function logPulse(category, event, details, status = '✅ OK') {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newEntry = `| ${timestamp} | ${category} | ${event} | ${details} | ${status} |\n`;
    try {
        if (fs.existsSync(PULSE_PATH)) {
            fs.appendFileSync(PULSE_PATH, newEntry);
        }
    } catch (e) {
        console.error("❌ [PULSE] Erreur d'écriture :", e.message);
    }
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    if (req.method === 'GET' && !req.url.startsWith('/api')) {
        let filePath = req.url === '/' ? 'index.html' : req.url.slice(1);
        let fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            const ext = path.extname(fullPath);
            const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }[ext] || 'text/plain';
            res.writeHead(200, { 'Content-Type': mime });
            fs.createReadStream(fullPath).pipe(res);
            return;
        } else {
            res.writeHead(404); res.end("Not Found"); return;
        }
    }

    if (req.url === '/api/v1/prospects' && req.method === 'GET') {
        const crmPath = getPath('BUSINESS', 'CRM');
        const prospectsDir = getPath('BUSINESS', 'PROSPECTS');
        if (!fs.existsSync(crmPath)) { res.writeHead(404); res.end(JSON.stringify({ error: "CRM not found" })); return; }

        try {
            const content = fs.readFileSync(crmPath, 'utf8');
            const lines = content.split('\n').filter(l => l.includes('|') && !l.includes('---') && !l.includes('Nom |'));
            
            logPulse('🛰️ API', 'GET_PROSPECTS', `Synchronisation de ${lines.length} fiches`);

            const prospects = lines.map(line => {
                const rawParts = line.split('|').map(p => p.trim());
                if (rawParts.length < 7) return null;

                const name = rawParts[1].replace(/\*\*/g, '').trim();
                const phone = rawParts[2].trim();
                const specialty = rawParts[3].trim();
                const zone = rawParts[4].trim();
                const scoreStr = rawParts[5].trim();
                const score = parseInt(scoreStr.replace(/[^\d]/g, '')) || 0;
                const funnel = rawParts[6].trim();
                const site = (rawParts[7] || "ABSENT").trim();
                
                const mapsMatch = line.match(/\[📍 Voir\]\(([^)]+)\)/);
                const medMatch = line.match(/\[🏥 Med.tn\]\(([^)]+)\)/);
                
                const cleanFileName = name.replace(/\s+/g, '_').replace(/\./g, '') + '.md';
                const filePath = path.join(prospectsDir, cleanFileName);
                let extra = { tel: phone, med_tn_url: medMatch ? medMatch[1] : "#", google_business_url: mapsMatch ? mapsMatch[1] : "#" };
                
                if (fs.existsSync(filePath)) {
                    const fiche = fs.readFileSync(filePath, 'utf8');
                    extra.lead_score = (fiche.match(/lead_score:\s*(\d+)/) || [])[1] || score;
                }

                return { name, specialty, zone, score, scoreStr, funnel, ...extra, site_status: site };
            }).filter(p => p !== null);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(prospects));
        } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
        }
    }
    
    else if (req.url === '/api/v1/crm/stats' && req.method === 'GET') {
        const crmPath = getPath('BUSINESS', 'CRM');
        if (!fs.existsSync(crmPath)) { res.writeHead(404); res.end(JSON.stringify({ error: "CRM not found" })); return; }
        try {
            const content = fs.readFileSync(crmPath, 'utf8');
            const lines = content.split('\n').filter(l => l.includes('|') && !l.includes('---') && !l.includes('Nom |'));
            
            logPulse('📊 STATS', 'GET_STATS', `Audit tactique — ${lines.length} prospects`);

            const stats = { total: lines.length, live: 0, appointments: 0, clients: 0 };
            lines.forEach(line => {
                const rawParts = line.split('|').map(p => p.trim());
                if (rawParts.length < 7) return;
                const funnel = rawParts[6].trim();
                if (funnel.includes('SOURCÉ')) stats.live++;
                if (funnel.includes('RDV')) stats.appointments++;
                if (funnel.includes('CLIENT')) stats.clients++;
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(stats));
        } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    }

    else { res.writeHead(404); res.end("Not Found"); }
});

process.on('uncaughtException', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} occupé. Échec du démarrage.`);
        process.exit(1);
    }
});

server.listen(PORT, () => {
    console.log(`🚀 [IRIS OS] DÉPLOYÉ SUR PORT ${PORT}`);
    logPulse('🚀 SYSTEM', 'SERVER_START', `Protocole V69.1 activé sur Port ${PORT}`);
});
