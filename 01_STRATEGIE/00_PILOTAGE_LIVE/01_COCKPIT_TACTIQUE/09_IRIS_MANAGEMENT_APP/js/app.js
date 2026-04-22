/**
 * 🏛️ IRIS OS - SANCTUM ARKHITEKT V162
 * Cerveau Opérationnel Pro - DIGITAL INTELLIGENCE EDITION
 */

const API_BASE = '/api';
let nexus, scene, camera, renderer, particles;

const state = {
    activeView: 'dashboard',
    skills: [],
    radar: [],
    showcase: [],
    prospects: [],
    appointments: [],
    stats: { total: 0, avgScore: 0 },
    sortMode: 'priority',
    currentZone: 'all'
};

// --- 🛰️ NAVIGATION ENGINE ---
function switchView(viewId) {
    document.querySelectorAll('.content-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) targetView.style.display = 'block';
    
    const activeNav = Array.from(document.querySelectorAll('.nav-item')).find(i => i.getAttribute('onclick')?.includes(viewId));
    if (activeNav) activeNav.classList.add('active');
    
    state.activeView = viewId;
    if (viewId === 'skills' && state.skills.length === 0) fetchSkills();
    if (viewId === 'prospects') {
        fetchProspects();
        fetchCRMStats();
    }
    if (viewId === 'gallery') fetchGallery();
    if (viewId === 'calendar') fetchAppointments();
}

// --- 🖼️ GALLERY ENGINE ---
async function fetchGallery() {
    try {
        const res = await fetch(`${API_BASE}/v1/showcase`);
        const data = await res.json();
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;
        grid.innerHTML = data.map(item => `
            <div class="glass-card" style="padding:15px; border-color: rgba(0,255,65,0.1);">
                <div style="font-size:0.8rem; color:var(--accent-emerald); font-weight:800; margin-bottom:10px;">${item.name.replace('.md', '')}</div>
                <div style="font-size:0.6rem; opacity:0.6; line-height:1.4;">Asset souverain certifié le ${new Date(item.time).toLocaleDateString()}</div>
                <button class="action-btn" style="width:100%; margin-top:15px; font-size:0.6rem; padding:8px;" onclick="addLog('Ouverture de ${item.name}...')">CONSULTER</button>
            </div>
        `).join('');
    } catch(e) {
        addLog("[ERROR] Impossible de charger la galerie.");
    }
}

// --- 📊 CRM STATS ENGINE ---
async function fetchCRMStats() {
    try {
        const res = await fetch(`${API_BASE}/v1/crm/stats`);
        const data = await res.json();
        const fields = ['total', 'live', 'followup', 'appointments', 'wip', 'clients', 'avg'];
        fields.forEach(f => {
            const el = document.getElementById(`stat-${f}`);
            if (el) el.innerText = data[f] || (f === 'avg' ? data.avgScore : 0);
        });
    } catch (e) {}
}

// --- 📋 EMPIRE CRM ENGINE ---
async function fetchProspects() {
    try {
        const res = await fetch(`${API_BASE}/v1/prospects`);
        state.prospects = await res.json();
        renderProspects();
    } catch (e) {
        console.error("CRM Error:", e);
    }
}

function filterProspects(zone) {
    state.currentZone = zone;
    document.querySelectorAll('.filter-bar button[onclick^="filterProspects"]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(`'${zone}'`));
    });
    renderProspects();
}

function changeSortMode(mode) {
    state.sortMode = mode;
    document.querySelectorAll('.filter-bar button[onclick^="changeSortMode"]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(`'${mode}'`));
    });
    renderProspects();
}

const statusPriority = {
    "👑 CLIENT ÉLITE": 0,
    "🚀 EN RÉALISATION": 1,
    "🤝 RDV FIXÉ": 2,
    "⏳ À RELANCER": 3,
    "🛡️ SOURCÉ": 4,
    "❌ PAS INTÉRESSÉ": 5
};

function renderProspects() {
    const grid = document.getElementById('prospect-grid');
    if (!grid) return;

    let filtered = state.currentZone === 'all' 
        ? [...state.prospects] 
        : state.prospects.filter(p => p.zone.toLowerCase().includes(state.currentZone.toLowerCase()));

    // --- 🛰️ APPLIED SORTING ---
    if (state.sortMode === 'priority') {
        filtered.sort((a, b) => {
            const pA = statusPriority[a.funnel] !== undefined ? statusPriority[a.funnel] : 99;
            const pB = statusPriority[b.funnel] !== undefined ? statusPriority[b.funnel] : 99;
            if (pA !== pB) return pA - pB;
            return b.score - a.score;
        });
    } else if (state.sortMode === 'score') {
        filtered.sort((a, b) => b.score - a.score);
    } else if (state.sortMode === 'zone') {
        filtered.sort((a, b) => a.zone.localeCompare(b.zone));
    }

    grid.innerHTML = filtered.map((p, index) => {
        const isHighScore = p.score >= 95;
        const isDismissed = p.funnel.includes('PAS INTÉRESSÉ');
        
        let statusClass = 'status-sourced';
        if (p.funnel.includes('RELANCER')) statusClass = 'status-followup';
        if (p.funnel.includes('RDV')) statusClass = 'status-appt';
        if (p.funnel.includes('RÉALISATION')) statusClass = 'status-wip';
        if (p.funnel.includes('CLIENT')) statusClass = 'status-client';
        if (isDismissed) statusClass = 'status-dismissed';

        const delay = index * 0.05;
        const siteIcon = (p.site || p.site_status) === 'ABSENT' ? 'fa-globe-africa' : 'fa-globe';
        const siteColor = (p.site || p.site_status) === 'ABSENT' ? '#ff4444' : '#ffbb33';

        return `
            <div class="prospect-card ${isHighScore ? 'high-score' : ''} ${statusClass}" 
                 style="animation: fadeIn 0.5s ease backwards ${delay}s"
                 onclick="openProspectDetail('${p.name}')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div>
                        <div class="prospect-name"><i class="fas fa-user-tie" style="margin-right:8px; font-size:0.8rem; opacity:0.6;"></i>${p.name}</div>
                        <div class="prospect-specialty"><i class="fas fa-briefcase-medical" style="margin-right:8px; font-size:0.7rem;"></i>${p.specialty}</div>
                        <div style="font-size: 0.75rem; color: #fff; opacity:0.6; margin-top:5px;"><i class="fas fa-phone-alt" style="margin-right:8px; font-size:0.6rem;"></i>${p.phone || p.tel || "N/A"}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="prospect-score-badge">${p.scoreStr || p.score}</div>
                    </div>
                </div>

                <div class="prospect-score-bar-container">
                    <div class="prospect-score-bar-fill" style="width: ${p.score}%"></div>
                </div>

                <div class="glass-card" style="padding: 12px; font-size: 0.75rem; margin-bottom: 15px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,255,65,0.05);">
                    <div style="color: var(--accent-emerald); font-weight: 700; margin-bottom: 5px; font-size: 0.6rem; letter-spacing: 2px;">RAPPORT D'ANALYSE CONSULAIRE</div>
                    <div style="opacity: 0.8; line-height:1.4;">${p.diagnostic || "Analyse en attente."}</div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 0.7rem; color: var(--text-dim);">
                        <i class="fas fa-map-marker-alt" style="color: var(--accent-emerald)"></i>
                        <span>${p.zone}</span>
                    </div>
                    <div style="font-size: 0.6rem; font-weight: 800; border: 1px solid rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px; opacity: 0.8;">${p.funnel.replace('🛡️ ', '')}</div>
                </div>
            </div>
        `;
    }).join('') || '<div style="grid-column: 1/-1; text-align: center; opacity: 0.5; padding: 50px;">Aucun prospect validé détecté.</div>';
}

// --- 🎭 MODAL DETAIL SYSTEM ---
function openProspectDetail(name) {
    const p = state.prospects.find(prospect => prospect.name === name);
    if (!p) return;

    const modal = document.getElementById('modal-container');
    const body = document.getElementById('modal-body');
    
    const md2html = (text) => text ? text.replace(/- \*\*(.+?)\*\* : (.+)/g, '<div style="margin-bottom:8px;"><strong style="color:var(--accent-emerald)">$1 :</strong> $2</div>').replace(/\n/g, '<br>') : "Analyse en attente...";

    // Smart Site Block Logic
    const currentSiteStatus = p.site || p.site_status || 'ABSENT';
    const siteIcon = currentSiteStatus === 'ABSENT' ? 'fa-globe-africa' : 'fa-globe';
    const siteColor = currentSiteStatus === 'ABSENT' ? '#ff4444' : '#00FF41';
    
    const siteHtml = `
        <div style="display: flex; align-items: center; gap: 15px; background: rgba(0,255,65,0.03); padding: 15px; border-radius: 12px; border: 1px solid rgba(0,255,65,0.1);">
            <i class="fas ${siteIcon}" style="color: ${siteColor}; font-size: 1.2rem;"></i>
            <div>
                <div style="font-size: 0.75rem; font-weight: 800; color: white;">SITE : ${currentSiteStatus}</div>
                <div style="font-size: 0.55rem; opacity: 0.5; text-transform: uppercase; letter-spacing:1px;">SCAN_TECH_V50_ACTIF</div>
            </div>
        </div>
    `;

    const nameEscaped = name.replace(/'/g, "\\'");

    body.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; height: 100%; position: relative;">
            <!-- --- 🚀 IMMERSIVE HEADER --- -->
            <div style="padding: 30px 50px; background: linear-gradient(180deg, rgba(0,255,65,0.08) 0%, transparent 100%); border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;">
                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <div style="font-size: 0.65rem; color: var(--accent-emerald); letter-spacing: 5px; font-weight:900; margin-bottom: 10px; display:flex; align-items:center; gap:10px;">
                            <span style="display:inline-block; width:8px; height:8px; background:var(--accent-emerald); border-radius:50%; box-shadow: 0 0 10px var(--accent-emerald);"></span>
                            CIBLE STRATÉGIQUE RÉALISABLE V50
                        </div>
                        <h1 style="font-family:'Outfit'; font-size: 3rem; font-weight:900; margin: 0; color: white; letter-spacing:-2px; line-height:0.9;">${p.name}</h1>
                        <div style="display: flex; gap: 20px; margin-top: 20px; align-items:center;">
                            <span style="background:rgba(0,255,65,0.1); color:var(--accent-emerald); border:1px solid rgba(0,255,65,0.3); padding: 8px 20px; border-radius: 50px; font-size:0.75rem; font-weight:900;">${p.specialty.toUpperCase()}</span>
                            <span style="font-size: 0.85rem; color: var(--text-dim); display:flex; align-items:center; gap:8px;"><i class="fas fa-map-marker-alt" style="color:var(--accent-emerald)"></i> ${p.zone}</span>
                        </div>
                    </div>
                    
                    <div style="text-align: right;">
                        <div style="font-size: 0.6rem; letter-spacing:3px; opacity:0.6; margin-bottom:8px;">FLUX DE PERFORMANCE</div>
                        <div class="prospect-score-badge" style="font-size: 1.5rem; padding: 10px 30px; border-radius:12px; background:rgba(0,0,0,0.5);">
                            <span style="font-size:0.8rem; opacity:0.5; margin-right:5px;">Σ</span>${p.score}
                        </div>
                    </div>
                </div>
            </div>

            <!-- --- Bento Grid Principal (Scrollable) --- -->
            <div class="bento-container" style="flex: 1; overflow-y: auto;">
                
                <!-- Colonne de Gauche : Analyse -->
                <div class="bento-card" style="grid-row: span 2;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                        <div class="modal-nav">
                            <button class="filter-btn active" onclick="switchModalTab(this, 'tab-business')"><i class="fas fa-chess-king"></i> STRATÉGIE</button>
                            <button class="filter-btn" onclick="switchModalTab(this, 'tab-copy')"><i class="fas fa-pen-fancy"></i> DISCOURS</button>
                            <button class="filter-btn" onclick="switchModalTab(this, 'tab-arch')"><i class="fas fa-monument"></i> VISION</button>
                            <button class="filter-btn" onclick="switchModalTab(this, 'tab-tech')"><i class="fas fa-microchip"></i> TECH</button>
                        </div>
                        
                        <div style="position:relative;">
                            <select onchange="updateProspectStatus('${nameEscaped}', this.value)" style="background: rgba(0,255,65,0.05); border: 1px solid rgba(0,255,65,0.2); color: var(--accent-emerald); padding: 10px 20px; border-radius: 10px; font-size: 0.7rem; font-weight: 800; cursor: pointer;">
                                <option value="🛡️ SOURCÉ" ${p.funnel.includes('SOURCÉ') ? 'selected' : ''}>🛡️ SOURCÉ</option>
                                <option value="⏳ À RELANCER" ${p.funnel.includes('À RELANCER') ? 'selected' : ''}>⏳ À RELANCER</option>
                                <option value="🤝 RDV FIXÉ" ${p.funnel.includes('RDV FIXÉ') ? 'selected' : ''}>🤝 RDV FIXÉ</option>
                                <option value="🚀 EN RÉALISATION" ${p.funnel.includes('EN RÉALISATION') ? 'selected' : ''}>🚀 EN RÉALISATION</option>
                                <option value="❌ PAS INTÉRESSÉ" ${p.funnel.includes('PAS INTÉRESSÉ') ? 'selected' : ''}>❌ PAS INTÉRESSÉ</option>
                                <option value="👑 CLIENT ÉLITE" ${p.funnel.includes('CLIENT ÉLITE') ? 'selected' : ''}>👑 CLIENT ÉLITE</option>
                            </select>
                        </div>
                    </div>

                    <div id="modal-tab-content">
                        <div id="tab-business" class="modal-tab-pane" style="display:block;">
                            <div style="color:var(--accent-emerald); font-weight:900; font-size:0.6rem; letter-spacing:3px; margin-bottom:20px;">RAPPORT CROISSANCE V50</div>
                            ${md2html(p.business)}
                        </div>
                        <div id="tab-copy" class="modal-tab-pane" style="display:none;">
                            <div style="color:var(--accent-emerald); font-weight:900; font-size:0.6rem; letter-spacing:3px; margin-bottom:20px;">PSYCHOLOGIE PERSUASIVE</div>
                            ${md2html(p.copywriting)}
                        </div>
                        <div id="tab-arch" class="modal-tab-pane" style="display:none;">
                            <div style="color:var(--accent-emerald); font-weight:900; font-size:0.6rem; letter-spacing:3px; margin-bottom:20px;">ARCHITECTURE DU CABINET</div>
                            ${md2html(p.architecture)}
                        </div>
                        <div id="tab-tech" class="modal-tab-pane" style="display:none;">
                            <div style="color:var(--accent-emerald); font-weight:900; font-size:0.6rem; letter-spacing:3px; margin-bottom:20px;">SYSTÈME MÉDIFLUX</div>
                            ${md2html(p.tech_audit)}
                        </div>
                    </div>
                </div>

                <!-- Colonne de Droite (Fixée) -->
                <div class="bento-card" style="flex: 1;">
                    <div style="color:var(--accent-emerald); font-weight:900; font-size:0.6rem; letter-spacing:3px; margin-bottom:15px;">ACCÈS RAPIDE</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 20px;">
                        <a href="tel:${p.phone || p.tel}" class="action-btn" style="height:50px; display:flex; align-items:center; justify-content:center;"><i class="fas fa-phone-alt"></i></a>
                        <a href="${p.mapsUrl}" target="_blank" class="action-btn" style="height:50px; display:flex; align-items:center; justify-content:center;"><i class="fas fa-map-marked-alt"></i></a>
                        <a href="${p.med_tn_url}" target="_blank" class="action-btn" style="height:50px; display:flex; align-items:center; justify-content:center;"><i class="fas fa-stethoscope"></i></a>
                    </div>
                    ${siteHtml}
                </div>

                <div class="bento-card" style="flex: 2;">
                    <div style="color:var(--accent-emerald); font-weight:900; font-size:0.6rem; letter-spacing:3px; margin-bottom:15px;">CHRONOS : PLANIFICATION</div>
                    <div style="flex: 1;">
                        ${p.appointment_status === "⏳ PLANNÉ" ? `
                            <div style="background:rgba(0,255,65,0.05); border:1px solid var(--accent-emerald); border-radius:12px; padding:15px; text-align:center; margin-bottom:15px;">
                                <div style="font-size:0.5rem; letter-spacing:2px; opacity:0.6; margin-bottom:5px;">RDV IDENTIFIÉ</div>
                                <div style="font-family:'Outfit'; font-weight:900; color:white; font-size:0.85rem;">${p.appointment_date || "Date non définie"}</div>
                            </div>
                            <button class="action-btn" style="width:100%; height:50px; background: var(--accent-emerald); color:black; font-weight:900;" onclick="openReportModal('${nameEscaped}')">COMPTE RENDU</button>
                            <button class="action-btn" style="width:100%; margin-top:8px; height:50px; background:rgba(255,255,255,0.05);" onclick="this.parentElement.innerHTML = generateResetPicker('${nameEscaped}')">REPORTÉ</button>
                        ` : `
                        <div class="chronos-label">Choisir le créneau optimal</div>
                        <div class="chronos-container" id="chronos-days" style="grid-template-columns: repeat(4, 1fr); gap:6px;">
                            ${generateChronosDays()}
                        </div>
                        <div class="chronos-container" id="chronos-times" style="grid-template-columns: repeat(4, 1fr); gap:6px; margin-top:10px;">
                            ${generateChronosTimes()}
                        </div>
                        <div style="margin-top:20px; text-align:center; opacity:0.5; font-size:0.6rem; letter-spacing:1px;">
                            <i class="fas fa-info-circle"></i> VALIDATION REQUISE VIA LA BARRE D'HONNEUR
                        </div>
                    `}
                </div>
            </div>
        </div>

        <!-- --- 🛡️ BARRE D'HONNEUR (ANCHORED ACTION FOOTER) --- -->
        <div class="modal-footer">
            <div style="display: flex; gap: 15px;">
                ${p.appointment_status !== "⏳ PLANNÉ" ? `
                    <button class="action-btn btn-confirm-rdv" style="min-width:200px; background: var(--accent-emerald); color:black; font-weight:900;" onclick="scheduleApptV2('${nameEscaped}')">
                        <i class="fas fa-calendar-check"></i> CONFIRMER LE RDV
                    </button>
                ` : `
                    <button class="action-btn" style="min-width:200px; opacity:0.5; cursor:not-allowed;" disabled>
                        <i class="fas fa-check-circle"></i> RDV DÉJÀ PLANNÉ
                    </button>
                `}
            </div>
            
            <div style="display: flex; gap: 15px;">
                <button class="btn-premium-gold" style="margin:0; width:auto; padding: 15px 30px; font-size:0.75rem;" onclick="convertToClient('${nameEscaped}')">
                    <i class="fas fa-crown"></i> CLIENT ÉLITE
                </button>
                
                <button class="btn-validate" style="margin:0; width:auto;" onclick="validateAndClose('${nameEscaped}')">
                    <i class="fas fa-save"></i> SAUVEGARDER
                </button>
            </div>
        </div>
    </div>
    `;

    modal.style.display = 'flex';
}

function switchModalTab(btn, tabId) {
    document.querySelectorAll('.modal-tab-pane').forEach(p => p.style.display = 'none');
    document.querySelectorAll('#modal-container .filter-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    btn.classList.add('active');
}

function closeModal() {
    document.getElementById('modal-container').style.display = 'none';
}

// --- 💎 3D TACTICAL NEXUS (Three.js) ---
function initNexus3D() {
    const container = document.getElementById('nexus-container');
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(20, 40, 0x00FF41, 0x003311);
    gridHelper.position.y = -2;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);

    // Floating Data Sphere (High Density)
    const geometry = new THREE.IcosahedronGeometry(2, 3);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00FF41, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.1 
    });
    
    particles = new THREE.Mesh(geometry, material);
    scene.add(particles);

    const pointsGeom = new THREE.IcosahedronGeometry(2.05, 4);
    const pointsMat = new THREE.PointsMaterial({ color: 0x00FF41, size: 0.02, transparent: true, opacity: 0.5 });
    const points = new THREE.Points(pointsGeom, pointsMat);
    particles.add(points);

    camera.position.z = 6;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;
        
        particles.rotation.y += 0.001;
        particles.rotation.z += 0.0005;
        
        // Pulsing Grid
        gridHelper.material.opacity = 0.1 + Math.sin(time) * 0.05;
        
        renderer.render(scene, camera);
    }
    animate();
    
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

async function updateProspectStatus(name, newStatus) {
    // Stage locally for visual feedback
    const prospect = state.prospects.find(p => p.name === name);
    if (prospect) {
        prospect.funnel = newStatus;
        renderProspects();
    }
}

async function validateAndClose(name) {
    const prospect = state.prospects.find(p => p.name === name);
    if (!prospect) return closeModal();

    const statusValue = document.querySelector('select[onchange^="updateProspectStatus"]')?.value || prospect.funnel;

    try {
        addLog(`[SYNC] Tentative de verrouillage pour ${name}...`);
        await fetch(`${API_BASE}/v1/crm/patch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, updates: { funnel_stage: statusValue } })
        });
        
        prospect.funnel = statusValue;
        addLog(`[SOUVERAIN_UPDATE] Statut de ${name} validé : ${statusValue}`);
        
        await fetchCRMStats();
        closeModal();
    } catch(e) {
        addLog(`[ERROR_SYNC] Échec critique du verrouillage pour ${name}`);
        closeModal();
    }
}

// --- 🗓️ CHRONOS ENGINE V16.2 (ZERO-KEYBOARD) ---
let selectedChronosDate = null;
let selectedChronosTime = null;

function generateChronosDays() {
    const days = [];
    const now = new Date();
    // Start from tomorrow
    for(let i=1; i<=8; i++) {
        const d = new Date();
        d.setDate(now.getDate() + i);
        const dayNum = d.getDate();
        const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
        const val = d.toISOString().split('T')[0];
        days.push(`
            <div class="chronos-item" onclick="selectChronosDay(this, '${val}')">
                <div style="font-size:0.5rem; opacity:0.6;">${dayLabel}</div>
                <div style="font-size:1.1rem; font-family:'Outfit';">${dayNum}</div>
            </div>`);
    }
    return days.join('');
}

function generateChronosTimes() {
    const slots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
    return slots.map(s => `<div class="chronos-item" onclick="selectChronosTime(this, '${s}')" style="padding:15px 5px;">${s}</div>`).join('');
}

function selectChronosDay(el, date) {
    document.querySelectorAll('#chronos-days .chronos-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    selectedChronosDate = date;
}

function selectChronosTime(el, time) {
    document.querySelectorAll('#chronos-times .chronos-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    selectedChronosTime = time;
}

async function scheduleApptV2(name) {
    if(!selectedChronosDate || !selectedChronosTime) {
        addLog(`[WARNING] Sélection temporelle incomplète pour ${name}.`);
        return alert("Veuillez choisir un Jour et une Heure.");
    }

    try {
        const res = await fetch(`${API_BASE}/v1/crm/appointments/v2`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, date: selectedChronosDate, time: selectedChronosTime })
        });

        if(res.ok) {
            addLog(`[RDV_SUCCESS] Chronos Sync : ${name} attendu le ${selectedChronosDate} à ${selectedChronosTime}.`);
            await fetchCRMStats();
            await fetchProspects();
            closeModal();
        }
    } catch(e) {
        addLog(`[ERROR] Échec de la synchronisation Chronos pour ${name}.`);
    }
}

// --- 📝 REPORTING SYSTEM V16.2 ---
function openReportModal(name) {
    const overlay = document.createElement('div');
    overlay.className = 'report-overlay';
    overlay.id = 'report-overlay-' + Date.now();
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="report-modal">
            <div style="color:var(--accent-emerald); font-weight:900; font-size:0.65rem; letter-spacing:4px; margin-bottom:15px; display:flex; align-items:center; gap:10px;">
                <span style="display:inline-block; width:8px; height:8px; background:var(--accent-emerald); border-radius:50%; box-shadow:0 0 10px var(--accent-emerald);"></span>
                AUDIT POST-RDV : PROTOCOLE D'ARCHIVAGE
            </div>
            <h2 style="margin:0; font-family:'Outfit'; font-size:1.8rem;">RAPPORT DE SÉANCE : ${name}</h2>
            <textarea id="reporting-text" class="report-textarea" placeholder="Saisissez les points critiques identifiés, les besoins tech et les prochaines étapes..."></textarea>
            <div style="display:flex; gap:15px; margin-top:30px;">
                <button class="action-btn" style="flex:1; background:var(--accent-emerald); color:black; font-weight:900; border:none;" onclick="submitReport('${name}')">ARCHIVER DANS LE CLOUD SOUVERAIN</button>
                <button class="action-btn" style="flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);" onclick="this.closest('.report-overlay').remove()">REPORTÉ / ANNULÉ</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

async function submitReport(name) {
    const text = document.getElementById('reporting-text').value;
    if(!text) return alert("Veuillez saisir un compte rendu.");

    try {
        const res = await fetch(`${API_BASE}/v1/crm/appointments/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, report: text })
        });
        if(res.ok) {
            addLog(`[ARCHIVE] Rapport synchronisé pour ${name}.`);
            document.querySelectorAll('.report-overlay').forEach(o => o.remove());
            await fetchProspects();
            closeModal();
        }
    } catch(e) {
        addLog(`[ERROR] Échec de l'archivage du rapport pour ${name}.`);
    }
}

function generateResetPicker(name) {
    return `
        <div style="color:var(--accent-emerald); font-weight:900; font-size:0.65rem; letter-spacing:3px; margin-bottom:20px;">CHRONOS : REDÉFINITION TEMPORELLE</div>
        <div class="chronos-label">Choisir le Nouveau Jour</div>
        <div class="chronos-container" id="chronos-days">
            ${generateChronosDays()}
        </div>
        <div class="chronos-label" style="margin-top:20px;">Choisir la Nouvelle Heure</div>
        <div class="chronos-container" id="chronos-times">
            ${generateChronosTimes()}
        </div>
        <button class="action-btn" style="width:100%; margin-top:25px; background: var(--accent-emerald); color:black; font-weight:900; height:60px;" onclick="scheduleApptV2('${name}')">
            <i class="fas fa-calendar-check"></i> CONFIRMER LE REPORT
        </button>
    `;
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for(let i=1; i<=31; i++) {
        const dayAppts = state.appointments.filter(a => new Date(a.date).getDate() === i);
        grid.innerHTML += `
            <div class="calendar-day" style="background:rgba(255,255,255,0.02); min-height:100px; padding:10px; border:1px solid rgba(0,255,65,0.05); border-radius:10px;">
                <div style="font-size:0.7rem; color:var(--text-dim); margin-bottom:10px;">${i}</div>
                ${dayAppts.map(a => `<div style="background:var(--accent-emerald); color:black; font-size:0.6rem; font-weight:800; padding:4px 8px; border-radius:4px; margin-bottom:4px;">${a.name}</div>`).join('')}
            </div>
        `;
    }
}

// --- 💰 CONVERSION SYSTEM ---
async function convertToClient(name) {
    const service = prompt("Service de transformation ? (Pack Vitrine / Echo-Système / Médiflux Core)", "Echo-Système");
    const price = prompt("Montant de l'investissement initial (€) ?", "3500");
    if (!service || !price) return;
    
    try {
        const res = await fetch(`${API_BASE}/v1/crm/convert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, service, price })
        });
        const data = await res.json();
        addLog(`[INTÉGRATION] SUCCESS : ${name} a été intégré à l'exploitation Flux avec succès.`);
        fetchProspects();
        closeModal();
    } catch(e) {}
}

// --- 🎮 TYCOON ENGINE V170 (SOUVERAIN) ---
function initTycoon() {
    addLog("🎮 INITIALISATION DU MOTEUR TYCOON V170...");
    updateTycoonUI(); // Start stats telemetry
    initNexus3D(); // Active the 3D Core
}

// --- 🛰️ TELEMETRY ---
function initTelemetry() {
    const evSource = new EventSource(`${API_BASE}/stream`);
    
    evSource.addEventListener('system', (e) => {
        const data = JSON.parse(e.data);
        if (data.state && data.state.radar) renderRadar(data.state.radar);
        if (data.state && data.state.logs) {
            data.state.logs.forEach(log => addLog(log.msg, log.pole));
        }
    });

    evSource.addEventListener('radar_update', (e) => {
        const data = JSON.parse(e.data);
        if (data.active) renderRadar(data.active);
    });

    evSource.addEventListener('agent_log', (e) => {
        const data = JSON.parse(e.data);
        addLog(data.msg, data.pole, data.rule);
    });

    evSource.addEventListener('empire_update', (e) => {
        const data = JSON.parse(e.data);
        addLog(`[FILE] ${data.type.toUpperCase()}: ${data.path}`, 'SYS');
    });

    evSource.addEventListener('stats_update', (e) => {
        const stats = JSON.parse(e.data);
        animateValue('tycoon-cash', stats.currency.cash, '€');
        animateValue('tycoon-cash-v2', stats.currency.cash, '€');
        
        const lvlText = `LVL ${stats.levels.empire_level}`;
        if (document.getElementById('tycoon-level')) document.getElementById('tycoon-level').innerText = lvlText;
        
        const xpPercent = (stats.levels.empire_xp / stats.levels.next_level_xp) * 100;
        if (document.getElementById('tycoon-xp-bar')) document.getElementById('tycoon-xp-bar').style.width = `${xpPercent}%`;
        if (document.getElementById('tycoon-xp-bar-v2')) document.getElementById('tycoon-xp-bar-v2').style.width = `${xpPercent}%`;
    });
}

function addLog(msg, pole = 'SYS', detail = '') {
    const time = new Date().toLocaleTimeString();
    const logMsg = `[${time}] [PÔLE ${pole}] ${msg}`;
    
    // Main Log View
    const logEl = document.getElementById('system-logs');
    if (logEl) {
        const div = document.createElement('div');
        div.innerText = logMsg;
        logEl.prepend(div);
        if (logEl.children.length > 100) logEl.lastChild.remove();
    }

    // Bloomberg Compact Logs
    const compactLogEl = document.getElementById('compact-logs');
    if (compactLogEl) {
        const div = document.createElement('div');
        div.style.borderBottom = '1px solid rgba(0,255,65,0.05)';
        div.style.padding = '2px 0';
        div.innerHTML = `<span class="c-emerald">${time}</span> ${msg}`;
        compactLogEl.prepend(div);
        if (compactLogEl.children.length > 6) compactLogEl.lastChild.remove();
    }
}

function renderRadar(activePoles) {
    const rows = document.getElementById('radar-rows');
    const rowsV2 = document.getElementById('radar-rows-v2');
    
    const html = activePoles.map(p => `
        <tr style="border-bottom: 1px solid rgba(0,255,65,0.05);">
            <td style="color:var(--accent-emerald); font-weight:800; padding: 4px;">PÔLE ${p.id}</td>
            <td style="font-family:'Outfit'; font-weight:700; padding: 4px;">${p.expert}</td>
            <td style="padding: 4px; opacity:0.8;">${p.task}</td>
            <td style="padding: 4px;"><span style="border:1px solid var(--accent-emerald); color:var(--accent-emerald); font-size:0.5rem; padding:2px 5px;">SYNC</span></td>
        </tr>
    `).join('');

    if (rows) rows.innerHTML = html;
    if (rowsV2) rowsV2.innerHTML = html;
}

function updateTycoonUI() {
    // Écouteur SSE étendu pour le mode Tycoon
    const evSource = new EventSource(`${API_BASE}/stream`);
    
    evSource.addEventListener('stats_update', (e) => {
        const stats = JSON.parse(e.data);
        animateValue('tycoon-cash', stats.currency.cash, '€');
        animateValue('tycoon-cash-v2', stats.currency.cash, '€');
        
        const lvlText = `LVL ${stats.levels.empire_level}`;
        if (document.getElementById('tycoon-level')) document.getElementById('tycoon-level').innerText = lvlText;
        
        const xpPercent = (stats.levels.empire_xp / stats.levels.next_level_xp) * 100;
        if (document.getElementById('tycoon-xp-bar')) document.getElementById('tycoon-xp-bar').style.width = `${xpPercent}%`;
        if (document.getElementById('tycoon-xp-bar-v2')) document.getElementById('tycoon-xp-bar-v2').style.width = `${xpPercent}%`;
        
        // Update DG Bureau Health
        const healthBar = document.getElementById('system-health-bar');
        if (healthBar) healthBar.style.width = `${stats.agents.Antigravity.health}%`;
    });

    evSource.addEventListener('level_up', (e) => {
        const data = JSON.parse(e.data);
        showVictoryOverlay(`EMPIRE LEVEL UP : NIVEAU ${data.level}`, "L'influence de Digital Flux s'étend...");
    });
}

// --- ⌨️ COMMAND SYSTEM ---
async function sendCommand(cmd) {
    if (!cmd) return;
    try {
        addLog(`[COMMAND] > ${cmd}`, 'CEO');
        await fetch(`${API_BASE}/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: cmd })
        });
    } catch(e) {
        addLog(`[ERROR] Échec de la commande : ${cmd}`);
    }
}

// Event Listeners for Command Inputs
document.addEventListener('DOMContentLoaded', () => {
    const inputs = ['command-input', 'command-input-v2'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendCommand(el.value);
                    el.value = '';
                }
            });
        }
    });
});

function showVictoryOverlay(title, subtitle) {
    const overlay = document.createElement('div');
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,255,65,0.1); backdrop-filter: blur(20px);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        z-index: 9999; animation: fadeIn 0.5s ease;
    `;
    overlay.innerHTML = `
        <i class="fas fa-crown" style="font-size: 5rem; color: var(--accent-emerald); filter: drop-shadow(0 0 20px var(--accent-emerald));"></i>
        <h1 style="font-family:'Outfit'; font-size:4rem; color:white; margin:20px 0;">${title}</h1>
        <p style="font-size:1.2rem; color:var(--accent-emerald); letter-spacing:5px;">${subtitle}</p>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
    }, 3000);
}

window.onload = () => {
    try { initTelemetry(); } catch(e) { console.error("Telemetry failure", e); }
    try { initTycoon(); } catch(e) { console.error("Tycoon failure", e); }
    fetchShowcase();
    fetchCRMStats();
    fetchProspects();
    addLog("IRIS OS V170 SOUVERAIN ÉTABLI. Tous les protocoles sont opérationnels.");
    
    // --- 🚨 CONNECTIVITY SENTINEL ---
    if (window.location.protocol === 'file:') {
        alert("⚠️ ATTENTION : Vous ouvrez l'application directement depuis votre dossier (file://).\n\nPour accéder au CRM et aux menus, vous DEVEZ utiliser l'URL du serveur :\n👉 http://localhost:3333\n\n(Le serveur IRIS OS doit être actif)");
        addLog("[CRITICAL] Mode lecture seule détecté. L'API est désactivée en protocole file://.");
    }
};
