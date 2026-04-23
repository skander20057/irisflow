const http = require('http');
const fs = require('fs');
const path = require('path');

// --- SOVEREIGN PATH MANAGER V70 ---
const pathsPath = path.join(__dirname, '..', '..', '02_AGENTS', '00_MOTEUR_VORTEX', 'ENGINE_V72_SOUVERAIN', 'paths.cjs');
let getPath;
try {
    const paths = require(pathsPath);
    getPath = paths.getPath;
} catch (e) {
    console.error("❌ [IRIS_CORE] Erreur Path Manager :", e.message);
    process.exit(1);
}

const PORT = 3333;
const ROOT_DIR = path.join(__dirname, '..', '..');

// --- SSE BROADCASTER (PULSE) ---
let clients = [];
function broadcast(event, data) {
    clients.forEach(client => {
        client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    });
}

const PULSE_PATH = path.join(ROOT_DIR, '01_STRATEGIE', '00_PULSE_LIVE.md');
function logPulse(category, event, details, status = '✅ OK') {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newEntry = `| ${timestamp} | ${category} | ${event} | ${details} | ${status} |\n`;
    try {
        fs.appendFileSync(PULSE_PATH, newEntry);
        broadcast('pulse', { timestamp, category, event, details, status });
    } catch (e) {}
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    // --- 📡 SSE STREAM ---
    if (req.url === '/api/stream') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        clients.push(res);
        req.on('close', () => { clients = clients.filter(c => c !== res); });
        broadcast('system', { status: "ACTIVE", version: "V70.1" });
        return;
    }

    // --- 📂 STATIC SERVER ---
    if (req.method === 'GET' && !req.url.startsWith('/api')) {
        let filePath = req.url === '/' ? 'index.html' : req.url.slice(1);
        let fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            const ext = path.extname(fullPath);
            const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' }[ext] || 'text/plain';
            res.writeHead(200, { 'Content-Type': mime });
            fs.createReadStream(fullPath).pipe(res);
            return;
        } else {
            res.writeHead(404); res.end("Not Found"); return;
        }
    }

    // --- 🛰️ API V1 ---
    
    // 1. PROSPECTS (CRM)
    if (req.url === '/api/v1/prospects' && req.method === 'GET') {
        const crmPath = getPath('BUSINESS', 'CRM');
        try {
            const content = fs.readFileSync(crmPath, 'utf8');
            const lines = content.split('\n').filter(l => l.includes('|') && !l.includes('---') && !l.includes('Nom |'));
            const prospects = lines.map(line => {
                const p = line.split('|').map(x => x.trim());
                if (p.length < 8) return null;
                return {
                    name: p[1].replace(/\*\*/g, ''),
                    tel: p[2],
                    specialty: p[3],
                    zone: p[4],
                    score: p[5],
                    funnel: p[6],
                    site: p[7]
                };
            }).filter(x => x);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(prospects));
        } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    }

    // 2. MISSIONS (NEW)
    else if (req.url === '/api/v1/missions' && req.method === 'GET') {
        const missionsPath = path.join(ROOT_DIR, '01_STRATEGIE', '00_CONTRÔLE_DES_MISSIONS.md');
        try {
            const content = fs.readFileSync(missionsPath, 'utf8');
            const lines = content.split('\n').filter(l => l.includes('|') && !l.includes('---') && !l.includes('ID |'));
            const missions = lines.map(line => {
                const p = line.split('|').map(x => x.trim());
                if (p.length < 6) return null;
                return { id: p[1], agent: p[2], task: p[3], status: p[4], progress: p[5], date: p[6] };
            }).filter(x => x);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(missions));
        } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    }

    // 3. EXPLORER
    else if (req.url.startsWith('/api/v1/explorer') && req.method === 'GET') {
        const folder = new URL(req.url, `http://${req.headers.host}`).searchParams.get('folder') || '';
        const targetDir = path.join(ROOT_DIR, folder);
        try {
            const items = fs.readdirSync(targetDir).map(name => {
                const stat = fs.statSync(path.join(targetDir, name));
                return { name, isDir: stat.isDirectory() };
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(items));
        } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    }

    else { 
        res.writeHead(404, { 'Content-Type': 'application/json' }); 
        res.end(JSON.stringify({ error: "Route Not Found" })); 
    }
});

server.listen(PORT, () => {
    console.log(`🚀 [IRIS V70] ACTIF SUR PORT ${PORT}`);
    logPulse('🚀 SYSTEM', 'SERVER_START', 'IRIS V70.1 Sovereign Deploy');
});
