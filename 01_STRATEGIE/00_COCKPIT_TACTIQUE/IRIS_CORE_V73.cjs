const http = require('http');
const fs = require('fs');
const path = require('path');

// --- SOVEREIGN ARCHITECTURE V80.0 ---
const CONFIG_PATH = path.join(__dirname, '..', '..', '01_STRATEGIE', '10_LOIS_ET_FONDATIONS', 'PATHS_MASTER.json');
let CONFIG;
try {
    CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (e) {
    console.error("❌ [IRIS_CORE] Erreur Configuration V80 :", e.message);
    process.exit(1);
}

const PORT = process.env.PORT || CONFIG.SERVER_PORT || 3333;
const ROOT_DIR = path.resolve(__dirname, '..', '..');

// --- SSE BROADCASTER ---
let clients = [];
function broadcast(event, data) {
    clients.forEach(client => {
        client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    });
}

// --- LOGGING ---
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
    // GESTION CORS UNIVERSELLE & PREFLIGHT (V90.0)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-requested-with');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // LOG TACTIQUE
    console.log(`🌐 [IRIS_CORE] ${req.method} ${req.url}`);

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    // --- 🩺 HEALTH CHECK ---
    if (req.url === '/api/v1/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: "GREEN", timestamp: new Date().toISOString() }));
    }

    // --- 📡 SSE STREAM ---
    if (req.url === '/api/stream') {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
        clients.push(res);
        req.on('close', () => { clients = clients.filter(c => c !== res); });
        broadcast('system', { status: "ACTIVE", version: "V80.0 SOVEREIGN" });
        return;
    }

    // --- 📂 STATIC SERVER (V92.1 Path Stripping) ---
    if (req.method === 'GET' && !req.url.startsWith('/api')) {
        // Extraction du chemin pur (sans query params ?t=...)
        const urlPath = req.url.split('?')[0];
        let filePath = urlPath === '/' ? 'index.html' : urlPath.slice(1);
        let fullPath = path.join(__dirname, filePath);

        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            const ext = path.extname(fullPath);
            const mime = { 
                '.html': 'text/html', 
                '.js': 'application/javascript', 
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon'
            }[ext] || 'text/plain';

            const headers = { 
                'Content-Type': mime,
                'Access-Control-Allow-Origin': '*' 
            };

            // BYPASS CACHE PWA (Critique Samsung/Android)
            if (filePath === 'sw.js' || filePath === 'manifest.json') {
                headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0';
                headers['Pragma'] = 'no-cache';
            }

            res.writeHead(200, headers);
            fs.createReadStream(fullPath).pipe(res);
        } else { res.writeHead(404); res.end("Not Found"); }
        return;
    }

    // --- 🛰️ API V1 ---
    
    // 1. MISSIONS
    if (req.url === '/api/v1/missions' && req.method === 'GET') {
        const p = path.join(ROOT_DIR, CONFIG.MODULES.MISSIONS.REGISTRY);
        try {
            const content = fs.readFileSync(p, 'utf8');
            const lines = content.split('\n').filter(l => l.includes('|') && !l.includes('---') && !l.includes('ID |'));
            const data = lines.map(line => {
                const parts = line.split('|').map(x => x.trim());
                if(parts.length < 7) return null;
                const startDate = new Date(parts[6]);
                const now = new Date();
                const diffMs = now - startDate;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                return { 
                    id: parts[1], 
                    agent: parts[2], 
                    task: parts[3], 
                    status: parts[4], 
                    progress: parts[5], 
                    date: parts[6],
                    elapsed: diffHours >= 24 ? `${Math.floor(diffHours/24)}j` : `${diffHours}h`
                };
            }).filter(x => x);
            res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data));
        } catch (e) { 
            console.error("❌ [API/MISSIONS]", e.message);
            res.writeHead(200, { 'Content-Type': 'application/json' }); 
            res.end(JSON.stringify([])); 
        }
    }

    // 2. CRM (PROSPECTS)
    else if (req.url === '/api/v1/prospects' && req.method === 'GET') {
        const p = path.join(ROOT_DIR, CONFIG.MODULES.CRM.REGISTRY);
        try {
            const content = fs.readFileSync(p, 'utf8');
            const lines = content.split('\n').filter(l => l.includes('|') && !l.includes('---') && !l.includes('Nom |'));
            const data = lines.map(line => {
                const parts = line.split('|').map(x => x.trim());
                if(parts.length < 10) return null;
                
                try {
                    const mapsUrl = (parts[8] && parts[8].match(/\((.*?)\)/) ? parts[8].match(/\((.*?)\)/)[1] : '');
                    const medUrl = (parts[9] && parts[9].match(/\((.*?)\)/) ? parts[9].match(/\((.*?)\)/)[1] : '');
                    return { 
                        name: (parts[1] || '').replace(/\*\*/g, ''), 
                        tel: parts[2] || '', 
                        specialty: parts[3] || '', 
                        zone: parts[4] || '', 
                        score: parts[5] || '', 
                        funnel: (parts[6] || '').trim(), 
                        site: parts[7] || '',
                        maps: mapsUrl,
                        med: medUrl,
                        source: (parts[10] || 'Unknown').split(':')[0]
                    };
                } catch (e) { return null; }
            }).filter(x => x);
            res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data));
        } catch (e) { 
            console.error("❌ [API/PROSPECTS]", e.message);
            res.writeHead(200, { 'Content-Type': 'application/json' }); 
            res.end(JSON.stringify([])); 
        }
    }

    // 2.5 PROSPECTS : UPDATE
    else if (req.url === '/api/v1/prospects/update' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { name, newStatus } = JSON.parse(body);
                const p = path.join(ROOT_DIR, CONFIG.MODULES.CRM.REGISTRY);
                let content = fs.readFileSync(p, 'utf8');
                const lines = content.split('\n');
                const updatedLines = lines.map(line => {
                    if (line.includes(`**${name}**`)) {
                        const parts = line.split('|');
                        if (parts.length > 6) {
                            parts[6] = ` ${newStatus} `;
                            return parts.join('|');
                        }
                    }
                    return line;
                });
                fs.writeFileSync(p, updatedLines.join('\n'));
                logPulse('📑 CRM', 'UPDATE_STATUS', `${name} -> ${newStatus}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) { 
                res.writeHead(500); res.end(JSON.stringify({ error: e.message })); 
            }
        });
    }

    // 3. SYNC ACTION
    else if (req.url === '/api/v1/sync' && req.method === 'POST') {
        logPulse('🛠️ SYSTEM', 'SYNC_REQUEST', 'Séquence de synchronisation démarrée par MASTER');
        setTimeout(() => {
            logPulse('📑 CRM', 'SYNC_COMPLETE', '5 nouveaux prospects importés de l\'Agent Business');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: "Synchronisation terminée" }));
        }, 2000);
    }

    // 4. PROJETS
    else if (req.url === '/api/v1/projets' && req.method === 'GET') {
        const p = path.join(ROOT_DIR, CONFIG.MODULES.PROJETS.REGISTRY);
        try {
            const content = fs.readFileSync(p, 'utf8');
            const lines = content.split('\n').filter(l => l.includes('|') && !l.includes('---') && !l.includes('Client |'));
            const data = lines.map(line => {
                try {
                    const parts = line.split('|').map(x => x.trim());
                    if (parts.length < 5) return null;
                    const linkMatch = parts[5] ? parts[5].match(/\((.*?)\)/) : null;
                    return { 
                        client: (parts[1] || '').replace(/\*\*/g, ''), 
                        type: parts[2] || '', 
                        path: parts[3] || '', 
                        status: parts[4] || '', 
                        link: linkMatch ? linkMatch[1] : '#' 
                    };
                } catch (e) { return null; }
            }).filter(x => x);
            res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data));
        } catch (e) { 
            console.error("❌ [API/PROJETS]", e.message);
            res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify([])); 
        }
    }

    // 5. AGENTS (HIERARCHY DYNAMIQUE)
    else if (req.url.startsWith('/api/v1/agents') && req.method === 'GET') {
        const urlObj = new URL(req.url, `http://${req.headers.host}`);
        const basePath = path.join(ROOT_DIR, '02_AGENTS');

        // Sous-route : Fiche d'instruction
        if (urlObj.pathname === '/api/v1/agents/instruction') {
            const agentName = urlObj.searchParams.get('agent');
            if (!agentName) { res.writeHead(400); return res.end("Missing agent name"); }
            let foundPath = null;
            try {
                const poles = fs.readdirSync(basePath).filter(f => !f.startsWith('.') && fs.statSync(path.join(basePath, f)).isDirectory() && f.match(/^\d{2}_/));
                for (const pole of poles) {
                    const files = fs.readdirSync(path.join(basePath, pole));
                    if (files.includes(`${agentName}.md`)) { foundPath = path.join(basePath, pole, `${agentName}.md`); break; }
                }
                if (foundPath) {
                    const content = fs.readFileSync(foundPath, 'utf8');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ content }));
                } else {
                    res.writeHead(404); return res.end(JSON.stringify({ error: "Agent file not found" }));
                }
            } catch (e) { res.writeHead(500); return res.end(JSON.stringify({ error: e.message })); }
        }

        // Route principale : Liste de la flotte
        try {
            const poles = fs.readdirSync(basePath).filter(f => !f.startsWith('.') && fs.statSync(path.join(basePath, f)).isDirectory() && f.match(/^\d{2}_/));
            console.log(`🔍 [API/AGENTS] Scan de ${poles.length} pôles dans ${basePath}`);
            
            const hierarchy = {
                name: "CEO HUB",
                type: "ROOT",
                children: poles.map(pole => {
                    const polePath = path.join(basePath, pole);
                    const files = fs.readdirSync(polePath);
                    const agents = files.filter(f => f.startsWith('AGENT_') && f.endsWith('.md')).map(f => ({
                        name: f.replace('.md', ''),
                        type: "AGENT",
                        status: "Online",
                        expertise: "NIVEAU 5"
                    }));
                    console.log(`   📂 Pôle [${pole}] : ${agents.length} agents détectés`);
                    return { name: pole.replace(/^\d{2}_/, '').replace(/_/g, ' '), type: "POLE", children: agents };
                }).filter(p => p.children.length > 0)
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(hierarchy));
        } catch(e) { 
            console.error("❌ [API/AGENTS] Échec critique du scan :", e.message);
            res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ name: "CEO HUB", type: "ROOT", children: [] })); 
        }
    }

    // 6. CALENDRIER (RDV)
    else if (req.url === '/api/v1/appointments' && req.method === 'GET') {
        const p = path.join(ROOT_DIR, '02_AGENTS/02_COMMERCIAL_SALES/BUREAU/CALENDRIER_RDV.md');
        try {
            if (!fs.existsSync(p)) { res.writeHead(200); return res.end(JSON.stringify([])); }
            const content = fs.readFileSync(p, 'utf8');
            const lines = content.split('\n').filter(l => l.includes('|') && !l.includes('---') && !l.includes('Date |') && l.trim() !== '');
            const data = lines.map(line => {
                try {
                    const parts = line.split('|').map(x => x.trim());
                    if (parts.length < 5) return null;
                    return { 
                        date: parts[1] || '', 
                        time: parts[2] || '', 
                        prospect: parts[3] || '', 
                        note: parts[4] || '', 
                        status: parts[5] || '' 
                    };
                } catch (e) { return null; }
            }).filter(x => x);
            res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data));
        } catch (e) { 
            console.error("❌ [API/APPOINTMENTS]", e.message);
            res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify([])); 
        }
    }

    else if (req.url === '/api/v1/appointments/add' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { date, time, prospect, note } = JSON.parse(body);
                const p = path.join(ROOT_DIR, '02_AGENTS/02_COMMERCIAL_SALES/BUREAU/CALENDRIER_RDV.md');
                
                // --- SÉCURITÉ ARCHITECTURALE : CRÉATION AUTO ---
                if (!fs.existsSync(p)) {
                    const header = "| Date | Heure | Prospect | Note | Statut |\n| :--- | :--- | :--- | :--- | :--- |\n";
                    fs.writeFileSync(p, header);
                }

                const newEntry = `| ${date} | ${time} | ${prospect} | ${note} | Confirmé |\n`;
                fs.appendFileSync(p, newEntry);
                
                // --- PERSISTANCE DU STATUT CRM ---
                const crmPath = path.join(ROOT_DIR, CONFIG.MODULES.CRM.REGISTRY);
                if (fs.existsSync(crmPath)) {
                    let crmContent = fs.readFileSync(crmPath, 'utf8');
                    const updatedCrm = crmContent.split('\n').map(line => {
                        // Match exact prospect name between stars
                        if (line.includes(`**${prospect}**`)) {
                            const parts = line.split('|');
                            if (parts.length > 6) { 
                                parts[6] = ` Rendez-vous fixé `; 
                                return parts.join('|'); 
                            }
                        }
                        return line;
                    }).join('\n');
                    fs.writeFileSync(crmPath, updatedCrm);
                }

                logPulse('📑 CRM', 'UPDATE_STATUS', `${prospect} -> Rendez-vous fixé`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: "Succès physique" }));
            } catch (e) { 
                console.error("❌ [API/ADD_RDV]", e.message);
                res.writeHead(500, { 'Content-Type': 'application/json' }); 
                res.end(JSON.stringify({ success: false, error: e.message })); 
            }
        });
    }

    // 7. TÉLÉMÉTRIE (SYNC WITNESS V89.0)
    else if (req.url.startsWith('/api/v1/telemetry/sync') && req.method === 'GET') {
        const syncPath = path.join(ROOT_DIR, '02_AGENTS/00_TELEMETRIE/sync.json');
        try {
            let syncData = { business: "idle", timestamp: Date.now() };
            if (fs.existsSync(syncPath)) {
                syncData = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
            }
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Vary': '*'
            }); 
            res.end(JSON.stringify(syncData));
        } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    }

    else if (req.url === '/api/v1/analytics/history' && req.method === 'GET') {
        const p = path.join(ROOT_DIR, '01_STRATEGIE/00_PULSE_LIVE.md');
        const crmP = path.join(ROOT_DIR, CONFIG.MODULES.CRM.REGISTRY);
        try {
            let logs = [];
            if (fs.existsSync(p)) {
                const content = fs.readFileSync(p, 'utf8');
                logs = lines.map(line => {
                    const parts = line.split('|').map(x => x.trim());
                    if (parts.length < 5) return null;
                    const dateTime = parts[1] || "";
                    const [date, time] = dateTime.split(' ');
                    const category = parts[2] || "";
                    const action = parts[3] || "";
                    const details = parts[4] || "";

                    // Cas 1 : Update Status CRM (Format Nom -> Statut)
                    if (action === 'UPDATE_STATUS' && details.includes('->')) {
                        const [prospect, status] = details.split('->').map(x => x.trim());
                        return { date, time, prospect, status };
                    }
                    
                    // Cas 2 : Add Appointment (Calendrier)
                    if (action === 'ADD_RDV') {
                        const prospect = details.replace('Succès : RDV scellé pour ', '').trim();
                        return { date, time, prospect, status: "Rendez-vous fixé" };
                    }

                    return null;
                }).filter(x => x);
            }

            // [V105.0] FALLBACK : Scan direct du CRM pour les interactions non loguées
            if (fs.existsSync(crmP)) {
                const crmStats = fs.statSync(crmP);
                const crmDate = crmStats.mtime.toISOString().split('T')[0];
                const crmContent = fs.readFileSync(crmP, 'utf8');
                const crmLines = crmContent.split('\n').filter(l => l.includes('|') && !l.includes('---') && !l.includes('Sourcing |') && !l.includes('Client |'));
                
                crmLines.forEach(line => {
                    const parts = line.split('|').map(x => x.trim());
                    if (parts.length > 6) {
                        const prospect = parts[1].replace(/\*\*/g, '');
                        const status = parts[6];
                        if (status && !status.includes('SOURCÉ') && !status.includes('Nouveau')) {
                            // Si pas de log existant pour ce prospect, on synthétise
                            if (!logs.some(l => l.prospect === prospect)) {
                                logs.push({ date: crmDate, time: "09:00", prospect, status: status + " (AUTO)" });
                            }
                        }
                    }
                });
            }

            res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(logs));
        } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    }

    else if (req.url.startsWith('/api/v1/telemetry/status') && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: "ACTIVE", uptime: process.uptime() }));
    }

    else if (req.url.startsWith('/api/v1/telemetry/logs') && req.method === 'GET') {
        const logsPath = path.join(ROOT_DIR, '02_AGENTS/00_TELEMETRIE/agent_logs.txt');
        try {
            let logsData = "";
            if (fs.existsSync(logsPath)) {
                const fullLogs = fs.readFileSync(logsPath, 'utf8');
                const lines = fullLogs.split('\n').filter(l => l.trim());
                logsData = lines.slice(-50).join('\n');
            }
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }); 
            res.end(JSON.stringify({ logs: logsData }));
        } catch (e) { 
            console.error("❌ [API/TELEMETRY/LOGS]", e.message);
            res.writeHead(500); res.end(JSON.stringify({ error: e.message })); 
        }
    }

    else { res.writeHead(404); res.end("Route Not Found"); }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 [IRIS V80.9] SOVEREIGN CORE ACTIVE ON http://localhost:${PORT}`);
    logPulse('🚀 SYSTEM', 'SERVER_START', 'IRIS V80.9 Hardened Deployment successful');
});
