const API_BASE = '/api/v1';
const STREAM_URL = '/api/stream';

const state = {
    activeModule: 'vortex',
    hierarchy: null,
    prospects: []
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initSSE();
    switchModule('vortex');
    
    document.getElementById('system-purge').onclick = triggerPurge;
    document.getElementById('close-inspector').onclick = closeInspector;
});

// --- 🧭 NAVIGATION ---
function initNav() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.onclick = () => switchModule(btn.getAttribute('data-mod'));
    });
}

function switchModule(modId) {
    state.activeModule = modId;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.getAttribute('data-mod') === modId));
    document.querySelectorAll('.module-view').forEach(v => v.classList.remove('active'));
    document.getElementById(`mod-${modId}`).classList.add('active');
    
    if (modId === 'vortex') loadVortex();
    if (modId === 'crm') loadCRM();
    if (modId === 'missions') loadMissions();
}

// --- 📡 LIVE PULSE ---
function initSSE() {
    const stream = new EventSource(STREAM_URL);
    stream.addEventListener('pulse', (e) => appendLog(JSON.parse(e.data)));
    stream.onerror = () => setTimeout(initSSE, 5000);
}

function appendLog(data) {
    const feed = document.getElementById('log-feed');
    if (!feed) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span style="color:var(--accent-emerald)">[${data.category}]</span> ${data.details}`;
    feed.prepend(entry);
    if (feed.childNodes.length > 50) feed.lastChild.remove();
}

// --- 🕸️ VORTEX V72 (DYNAMIC GRAPH) ---
async function loadVortex() {
    const svg = document.getElementById('nexus-svg');
    svg.innerHTML = '<text x="400" y="300" text-anchor="middle" fill="white">SYNAPPING...</text>';
    
    try {
        const res = await fetch(`${API_BASE}/hierarchy`);
        state.hierarchy = await res.json();
        console.log("🕸️ Synapse Data Received:", state.hierarchy);
        if (!state.hierarchy || !state.hierarchy.children) {
            svg.innerHTML = '<text x="400" y="300" text-anchor="middle" fill="#ff5555">ERREUR : HIÉRARCHIE VIDE</text>';
        } else {
            renderVortex(state.hierarchy);
        }
    } catch (e) { 
        console.error("❌ Vortex Load Error:", e);
        svg.innerHTML = '<text x="400" y="300" text-anchor="middle" fill="#ff5555">SOUVERAINETÉ DÉCONNECTÉE</text>';
    }
}

function renderVortex(data) {
    const svg = document.getElementById('nexus-svg');
    svg.innerHTML = ''; // Clear
    
    const centerX = 400;
    const centerY = 300;
    
    // Draw CEO HUB
    drawNode(svg, centerX, centerY, data.name, 'ROOT', '👑');

    if (data.children) {
        const poles = data.children;
        const poleRadius = 150;
        
        poles.forEach((pole, i) => {
            const angle = (i / poles.length) * Math.PI * 2;
            const px = centerX + Math.cos(angle) * poleRadius;
            const py = centerY + Math.sin(angle) * poleRadius;
            
            // Draw Synapse to Hub
            drawLink(svg, centerX, centerY, px, py);
            
            // Draw Pole
            const icon = pole.name.includes('AGENTS') ? '🤖' : (pole.name.includes('STRATEGIE') ? '🧠' : '🏗️');
            drawNode(svg, px, py, pole.name, 'POLE', icon);
            
            if (pole.children) {
                const agents = pole.children;
                const agentRadius = 80;
                
                agents.forEach((agent, j) => {
                    const aAngle = angle - 0.5 + (j / agents.length);
                    const ax = px + Math.cos(aAngle) * agentRadius;
                    const ay = py + Math.sin(aAngle) * agentRadius;
                    
                    drawLink(svg, px, py, ax, ay);
                    drawNode(svg, ax, ay, agent.name, 'AGENT', '⚡');
                });
            }
        });
    }
}

function drawNode(svg, x, y, label, type, icon) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.className = `node ${type.toLowerCase()}-node`;
    g.style.cursor = 'pointer';
    g.onclick = () => alert(`Ouverture de : ${label}`);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', type === 'ROOT' ? 40 : (type === 'POLE' ? 25 : 15));
    circle.setAttribute('fill', 'rgba(10,15,25,0.9)');
    circle.setAttribute('stroke', type === 'ROOT' ? 'var(--accent-gold)' : 'var(--accent-emerald)');
    circle.setAttribute('stroke-width', '2');
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + (type === 'ROOT' ? 55 : 40));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'var(--text-dim)');
    text.setAttribute('font-size', '10');
    text.textContent = label;

    const ico = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ico.setAttribute('x', x);
    ico.setAttribute('y', y + 5);
    ico.setAttribute('text-anchor', 'middle');
    ico.setAttribute('font-size', type === 'ROOT' ? '20' : '15');
    ico.textContent = icon;

    g.appendChild(circle);
    g.appendChild(text);
    g.appendChild(ico);
    svg.appendChild(g);
}

function drawLink(svg, x1, y1, x2, y2) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${x1} ${y1} L ${x2} ${y2}`;
    path.setAttribute('d', d);
    path.setAttribute('stroke', 'rgba(0, 255, 136, 0.2)');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('fill', 'none');
    path.classList.add('kinetic-flux');
    svg.insertBefore(path, svg.firstChild);
}

// --- 📑 CRM V71.1 (PREV LOGIC KEPT) ---
async function loadCRM() {
    const res = await fetch(`${API_BASE}/prospects`);
    const data = await res.json();
    renderCRMStats(data);
    renderCRMTable(data);
}

function renderCRMStats(data) {
    const stats = {
        total: data.length,
        sourced: data.filter(p => p.funnel.includes('SOURCÉ')).length,
        rdv: data.filter(p => p.funnel.includes('RDV')).length,
        clients: data.filter(p => p.funnel.includes('CLIENT')).length,
        refused: data.filter(p => p.funnel.includes('PAS INTÉRESSÉ')).length
    };
    document.getElementById('crm-stats').innerHTML = `
        <div class="stat-card"><h4>Total</h4><span class="val">${stats.total}</span></div>
        <div class="stat-card"><h4>RDV</h4><span class="val" style="color:var(--accent-gold)">${stats.rdv}</span></div>
        <div class="stat-card"><h4>Clients</h4><span class="val" style="color:var(--accent-royal)">${stats.clients}</span></div>
    `;
}

function renderCRMTable(data) {
    const tbody = document.getElementById('crm-body');
    tbody.innerHTML = data.map(p => `
        <tr onclick="inspectProspect('${p.name}')">
            <td style="font-weight:800; color:white">${p.name}</td>
            <td>${p.tel}</td>
            <td>${p.specialty}</td>
            <td style="color:var(--accent-gold)">${p.score}</td>
            <td onclick="event.stopPropagation()">
                <select class="status-select" onchange="updateStatus('${p.name}', this.value)">
                    <option ${p.funnel.includes('SOURCÉ')?'selected':''}>🛡️ SOURCÉ</option>
                    <option ${p.funnel.includes('RDV')?'selected':''}>🤝 RDV FIXÉ</option>
                    <option ${p.funnel.includes('CLIENT')?'selected':''}>✅ CLIENT</option>
                </select>
            </td>
        </tr>
    `).join('');
}

window.updateStatus = async (name, newStatus) => {
    await fetch(`${API_BASE}/prospects/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, newStatus })
    });
    loadCRM();
};

window.inspectProspect = async (name) => {
    document.querySelector('.imperial-inspector').classList.add('active');
    const res = await fetch(`${API_BASE}/prospects/fiche?name=${encodeURIComponent(name)}`);
    document.getElementById('inspect-content').innerText = await res.text();
};

function closeInspector() { document.querySelector('.imperial-inspector').classList.remove('active'); }

async function loadMissions() {
    const res = await fetch(`${API_BASE}/missions`);
    const data = await res.json();
    document.getElementById('mission-list').innerHTML = data.map(m => `
        <div class="m-card">
            <h3>${m.task}</h3>
            <div class="progress-bar"><div class="fill" style="width:${m.progress}"></div></div>
        </div>
    `).join('');
}

async function triggerPurge() {
    if (confirm("🚨 PURGE ?")) {
        await fetch(`${API_BASE}/system/purge`, { method: 'POST' });
        window.location.reload();
    }
}
