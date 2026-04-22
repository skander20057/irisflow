const http = require('http');
const fs = require('fs');
const path = require('path');

// --- SOVEREIGN PATH MANAGER V72 ---
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

// --- HIERARCHY SCANNER (SYNAPSE ENGINE) ---
function scanHierarchy(dir, depth = 0, maxDepth = 2) {
    if (depth > maxDepth) return null;
    const stats = fs.statSync(dir);
    const name = path.basename(dir);
    
    if (!stats.isDirectory()) return null;

    const items = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
    const children = items.map(item => {
        const itemPath = path.join(dir, item);
        try {
            return scanHierarchy(itemPath, depth + 1, maxDepth);
        } catch (e) { return null; }
    }).filter(x => x);

    return {
        name: depth === 0 ? "CEO HUB" : name,
        type: depth === 1 ? "POLE" : (depth === 2 ? "AGENT" : "ROOT"),
        children: children.length > 0 ? children : undefined
    };
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
        broadcast('system', { status: "ACTIVE", version: "V72.0" });
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
            res.writeHead(404, { 'Content-Type': 'application/json' }); 
            res.end(JSON.stringify({ error: "File Not Found" })); return;
        }
    }

    // --- 🛰️ API V1 ---
    
    // 1. HIERARCHY (VORTEX SYNAPSES)
    if (req.url === '/api/v1/hierarchy' && req.method === 'GET') {
        try {
            const data = scanHierarchy(ROOT_DIR);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    }

    // 2. PROSPECTS
    else if (req.url === '/api/v1/prospects' && req.method === 'GET') {
        const crmPath = getPath('BUSINESS', 'CRM');
        try {
            const content = fs.readFileSync(crmPath, 'utf8');
            const lines = content.split('\n').filter(l => l.includes('|') && !l.includes('---') && !l.includes('Nom |'));
            const prospects = lines.map(line => {
                const p = line.split('|').map(x => x.trim());
                if (p.length < 8) return null;
                return { name: p[1].replace(/\*\*/g, ''), tel: p[2], specialty: p[3], zone: p[4], score: p[5], funnel: p[6], site: p[7] };
            }).filter(x => x);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(prospects));
        } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    }

    // 3. PROSPECTS : UPDATE
    else if (req.url === '/api/v1/prospects/update' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const { name, newStatus } = JSON.parse(body);
            const crmPath = getPath('BUSINESS', 'CRM');
            try {
                let content = fs.readFileSync(crmPath, 'utf8');
                const lines = content.split('\n');
                const updatedLines = lines.map(line => {
                    if (line.includes(`**${name}**`)) {
                        const p = line.split('|');
                        p[6] = ` ${newStatus} `;
                        return p.join('|');
                    }
                    return line;
                });
                fs.writeFileSync(crmPath, updatedLines.join('\n'));
                logPulse('📑 CRM', 'UPDATE_STATUS', `${name} -> ${newStatus}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
        });
    }

    // 4. MISSIONS
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

    else { 
        res.writeHead(404, { 'Content-Type': 'application/json' }); 
        res.end(JSON.stringify({ error: "Route Not Found" })); 
    }
});

server.listen(PORT, () => {
    console.log(`🚀 [IRIS V72] ACTIF SUR PORT ${PORT}`);
    logPulse('🚀 SYSTEM', 'SERVER_START', 'IRIS V72.0 Sovereign Vortex Engine');
});
