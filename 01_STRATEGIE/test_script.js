    <script>
        /**
         * 🚨 PROTOCOLE DE SÉCURITÉ IRIS OS — MISSION CRITICAL
         * --------------------------------------------------
         * RÉGLE D'OR : Le Routage (fct navigate) et le Root Layout DOIVENT rester intacts.
         * PRIORITÉ ABSOLUE : L'affichage des modules CRM, Planning et Agents doit être garanti.
         * ISOLATION : Toute erreur locale d'un module doit être confinée par safeRender().
         * VÉRIFICATION : Avant validation, confirmer que le clic menu déclenche le rendu.
         */

        const state = { 
            currentRoute: 'missions', 
            missions: [], 
            crm: [], 
            projets: [], 
            agents: { children: [] },
            appointments: [],
            expandedPoles: {},
            isMenuOpen: false,
            viewDate: new Date(),
            crmFilters: { zone: 'Tous', status: 'Tous' },
            showCRMStats: false,
            calendarMode: 'day',
            telemetry: { status: {}, sync: { business: 'inactive' }, logs: "", lastPulse: 0 },
            isTerminalOpen: false,
            ui_clock: 0
        };
        const renderCache = { missions: null, crm: null, calendrier: null, projets: null, agents: null };

        function showToast(title, message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            const icon = type === 'success' ? '⚡' : '⚠️';
            toast.innerHTML = `
                <div class="toast-icon">${icon}</div>
                <div>
                    <div class="text-[10px] font-black uppercase tracking-widest text-slate-500">${title}</div>
                    <div class="text-sm font-bold text-white">${message}</div>
                </div>
            `;
            container.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('out');
                setTimeout(() => toast.remove(), 500);
            }, 4000);
        }

        async function init() {
            try {
                console.log("🚀 [BOOT] Initialisation Noyau TITAN...");
                showInitialSkeletons();
                
                // BOOT INSTANTANÉ (Navigation prioritaire sur les données)
                navigate('missions'); 
                
                // CHARGEMENT ASYNCHRONE DES FLUX
                syncAll().then(() => {
                    console.log("✅ [BOOT] Flux Synchronisés.");
                });
                
                // --- PWA ACTIVATION (V92.1 Android Shield Fix) ---
                if ('serviceWorker' in navigator) {
                    window.addEventListener('load', () => {
                        const cacheBuster = Date.now();
                        navigator.serviceWorker.register(`./sw.js?v=${cacheBuster}`)
                            .then(reg => console.log('📡 [PWA] Service Worker Certifié'))
                            .catch(err => console.error('⚠️ [PWA] Échec liaison SW :', err));
                    });
                }

                window.addEventListener('beforeinstallprompt', (e) => {
                    e.preventDefault();
                    window.deferredPrompt = e;
                    showToast('PWA Ready', 'IRIS OS est prêt pour l’installation mobile.', 'success');
                });
                
                // --- NEURAL HEARTBEAT ---
                setInterval(syncAll, 20000); 
                setInterval(syncTelemetry, 1500); 
                setInterval(checkHealth, 30000); 
            } catch (e) {
                console.error("❌ [CRITICAL] Échec Boot Noyau :", e);
            }
        }

        async function syncTelemetry() {
            try {
                // BYPASS CACHE TOTAL (V90.0 Signal Vivant)
                const t = Date.now();
                const res = await fetch(`/api/v1/telemetry/sync?t=${t}`, {
                    method: 'GET',
                    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
                    cache: 'no-store'
                });
                if (res.ok) {
                    const data = await res.json();
                    state.telemetry.sync = data;
                    state.telemetry.lastPulse = data.timestamp;
                    state.ui_clock++; // Boucle de vie (V90.0)
                    
                    // MISE À JOUR JOINTE : HEADER + AGENTS + LOGS
                    updateGlobalPulse();
                    renderAgents(true); 
                    if (state.isTerminalOpen) updateLogs(); 
                }
            } catch (e) { console.warn("⚪ [TÉLÉMÉTRIE] Signal Vivant Indisponible."); }
        }

        function updateGlobalPulse() {
            const dot = document.getElementById('neural-pulse-dot');
            const text = document.getElementById('signal-text');
            if (!dot || !text) return;

            // CASCADE EN DUR (V89.0) : Le signal Sync Witness est maître
            const isSyncActive = state.telemetry.sync.business === 'active';
            
            if (isSyncActive) {
                dot.className = "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,1)]";
                text.className = "text-[8px] font-black uppercase text-emerald-400 tracking-widest";
                text.innerText = "ACTIVE LINK";
            } else {
                dot.className = "w-1.5 h-1.5 rounded-full bg-slate-500";
                text.className = "text-[8px] font-black uppercase text-slate-500 tracking-widest transition-colors";
                text.innerText = "Neural Pulse";
            }
        }

        function showInitialSkeletons() {
            const skeletons = `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    ${Array(8).fill('<div class="bento h-64 skeleton"></div>').join('')}
                </div>
            `;
            const agents = document.getElementById('agent-list');
            const missions = document.getElementById('mission-cards');
            const crm = document.getElementById('crm-container');
            
            if(agents) agents.innerHTML = skeletons;
            if(missions) missions.innerHTML = skeletons;
            if(crm) crm.innerHTML = `<div class="p-12 space-y-8">${Array(5).fill('<div class="h-16 skeleton"></div>').join('')}</div>`;
        }

        async function syncAll() {
            const statusIndicator = document.getElementById('sync-engine-status');
            if(statusIndicator) {
                statusIndicator.innerText = "Sync en cours...";
                statusIndicator.classList.add('animate-pulse');
            }

            try {
                const results = await Promise.allSettled([
                    fetch('/api/v1/missions').then(r => r.ok ? r.json() : Promise.reject('Missions Error')),
                    fetch('/api/v1/prospects').then(r => r.ok ? r.json() : Promise.reject('Prospects Error')),
                    fetch('/api/v1/projets').then(r => r.ok ? r.json() : Promise.reject('Projets Error')),
                    fetch('/api/v1/agents').then(r => r.ok ? r.json() : Promise.reject('Agents Error')),
                    fetch('/api/v1/appointments').then(r => r.ok ? r.json() : Promise.reject('Appts Error'))
                ]);

                const errors = results.filter(r => r.status === 'rejected');
                if (errors.length > 0) {
                    console.error("⚠️ Certains flux sont corrompus :", errors);
                    showToast("Flux Perturbé", `${errors.length} modules n'ont pas répondu.`, 'warning');
                }

                if (results[0].status === 'fulfilled') state.missions = results[0].value;
                if (results[1].status === 'fulfilled') state.crm = results[1].value;
                if (results[2].status === 'fulfilled') state.projets = results[2].value;
                if (results[3].status === 'fulfilled') {
                    state.agents = results[3].value;
                    // Forcer l'ouverture du premier pôle si aucun n'est ouvert
                    if (Object.keys(state.expandedPoles).length === 0 && state.agents.children.length > 0) {
                        state.expandedPoles[state.agents.children[0].name] = true;
                    }
                }
                if (results[4].status === 'fulfilled') state.appointments = results[4].value;

                // --- TÉLÉMÉTRIE (SYNC PARALLÈLE AVEC BYPASS CACHE QUANTIQUE) ---
                const v = Date.now();
                const statusRes = await fetch(`/api/v1/telemetry/status?v=${v}`, {
                    method: 'GET',
                    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
                    cache: 'no-store'
                }).catch(() => null);
                if (statusRes && statusRes.ok) state.telemetry.status = await statusRes.json();

                // Reset Cache pour forcer le rendu des nouvelles données
                Object.keys(renderCache).forEach(k => renderCache[k] = false);

                // Rendu global (Bypass cache pour les LEDs)
                // Rendu global Isolé (V94.0 Lockdown)
                safeRender(renderMissions, 'Missions');
                safeRender(renderCRM, 'CRM');
                safeRender(renderCalendrier, 'Planning');
                safeRender(renderProjets, 'Projets');
                safeRender(renderAgents, 'Agents');

                if(statusIndicator) {
                    statusIndicator.innerText = "Synchronisé";
                    statusIndicator.classList.remove('animate-pulse');
                }

            } catch (e) { 
                console.error("❌ Erreur de synchronisation :", e);
                showToast("Échec Sync", "Vérifiez votre connexion au tunnel.", 'error');
            }
        }

        // --- MOTEUR DE RENDU SÉCURISÉ (V94.0 ANTI-CRASH) ---
        function safeRender(renderFunc, moduleName) {
            try {
                renderFunc();
            } catch (e) {
                console.error(`❌ Crash Module [${moduleName}] :`, e);
                const containerId = moduleName.toLowerCase() === 'planning' ? 'calendrier-container' : `${moduleName.toLowerCase()}-container`;
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `
                        <div class="bento flex flex-col items-center justify-center py-20 opacity-60">
                            <div class="text-4xl mb-4">⚠️</div>
                            <div class="text-sm font-black uppercase tracking-widest text-rose-400">Crash : ${moduleName}</div>
                            <div class="text-[10px] text-slate-500 mt-2">Le module est temporairement isolé.</div>
                        </div>
                    `;
                }
            }
        }

        async function checkHealth() {
            const dot = document.getElementById('signal-dot');
            const txt = document.getElementById('signal-text');
            try {
                const res = await fetch('/api/v1/health');
                if (res.ok) {
                    dot.className = "w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]";
                    txt.innerText = "Flux Satellite OK";
                    txt.className = "text-[8px] font-black uppercase text-emerald-400";
                } else { throw new Error(); }
            } catch (e) {
                dot.className = "w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]";
                txt.innerText = "Flux Offline";
                txt.className = "text-[8px] font-black uppercase text-rose-500";
            }
        }

        function toggleSidebar() {
            state.isMenuOpen = !state.isMenuOpen;
            const sidebar = document.getElementById('sidebar-panel');
            const overlay = document.getElementById('menu-overlay');
            if (state.isMenuOpen) {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
            } else {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            }
        }

        function navigate(route) {
            try {
                console.log(`🛰️ [NAVIGATE] Vers : ${route}`);
                state.currentRoute = route;
                
                // 1. MISE À JOUR HEADER (IMMÉDIATE)
                renderHeader(route);
                
                if (state.isMenuOpen) toggleSidebar(); 

                // 2. ACTIVATION VUE (SÉCURISÉE)
                const targetView = document.getElementById(`view-${route}`);
                if (targetView) {
                    document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
                    targetView.classList.add('active');
                }
                
                // 3. SYNCHRONISATION NAVIGATION (DESKTOP)
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                const desktopBtn = document.getElementById(`nav-${route}`);
                if(desktopBtn) desktopBtn.classList.add('active');

                // 4. SYNCHRONISATION NAVIGATION (MOBILE)
                const mobileBtn = document.getElementById(`m-nav-${route}`);
                if(mobileBtn) {
                    document.querySelectorAll('nav.md\\:hidden button span').forEach(s => s.classList.remove('text-cyan-400'));
                    const spanIcon = mobileBtn.querySelector('span:first-child');
                    const spanText = mobileBtn.querySelector('span:last-child');
                    if(spanIcon) spanIcon.classList.add('text-cyan-400');
                    if(spanText) spanText.classList.add('text-cyan-400');
                }
                
                // 5. RENDU DU CONTENU (ISOLÉ)
                renderContent(route);
            } catch (e) {
                console.error("❌ Erreur Critique Navigation :", e);
                showToast("Navigation Error", "Échec de chargement du module.", "error");
            }
        }

        function renderHeader(route) {
            try {
                const titles = { missions: "Missions Control", crm: "CRM ÉLITE V80", calendrier: "Chrono Synapse", projets: "Archives Projets", agents: "Neural Sphere" };
                const status = { missions: "Real-time Task Flow", crm: "Sovereign Prospect Data", calendrier: "Temporal Management Interface", projets: "Livrables Scellés", agents: "Active AI Workers" };
                
                const titleEl = document.getElementById('page-title');
                const statusEl = document.getElementById('page-status');
                if (titleEl) titleEl.innerText = titles[route] || route.toUpperCase();
                if (statusEl) statusEl.innerText = status[route] || "MODULE ACTIF";
                
                const right = document.getElementById('header-right');
                if (!right) return;
                
                right.innerHTML = '';
                if (route === 'crm') {
                    right.innerHTML = `<button onclick="syncCRM()" class="bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-500/40 transition-all flex items-center gap-2">🔄 Sync Prospects</button>`;
                } else if (route === 'calendrier') {
                    right.innerHTML = `<button class="bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 italic">● Real-time Sync Active</button>`;
                } else if (route === 'missions') {
                    right.innerHTML = `<select class="bg-slate-900 border border-white/10 rounded-2xl px-4 py-2 text-xs font-black outline-none"><option>Toutes les missions</option><option>Urgentes</option><option>Terminées</option></select>`;
                }
            } catch (e) {
                console.warn("⚠️ [HEADER] Rendu partiel.");
            }
        }

        async function syncCRM() {
            const btn = document.querySelector('#header-right button');
            const oldHtml = btn.innerHTML;
            btn.innerHTML = `⌛ Syncing...`;
            await fetch('/api/v1/sync', { method: 'POST' });
            await syncAll();
            renderCache.crm = null;
            renderContent('crm');
            btn.innerHTML = oldHtml;
        }

        function renderContent(route) {
            // Lazy Rendering with Cache (V94.0 Isolated)
            if (renderCache[route]) return;
            
            switch(route) {
                case 'missions': safeRender(renderMissions, 'Missions'); break;
                case 'crm': safeRender(renderCRM, 'CRM'); break;
                case 'calendrier': safeRender(renderCalendrier, 'Planning'); break;
                case 'projets': safeRender(renderProjets, 'Projets'); break;
                case 'agents': safeRender(renderAgents, 'Agents'); break;
            }
        }

        function renderMissions() {
            const container = document.getElementById('mission-cards');
            if(!container) return;
            const missions = state.missions || [];
            const html = missions.map(m => `
                <div class="bento border-l-4 ${m.status && m.status.includes('TERMINÉ') ? 'border-l-emerald-500' : 'border-l-cyan-400'}">
                    <div class="flex justify-between items-start mb-6">
                        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${m.id || 'TASK'}</span>
                        <div class="text-[10px] font-black px-3 py-1 bg-white/5 rounded-full text-slate-400">⌛ ${m.elapsed || '0m'}</div>
                    </div>
                    <div class="text-2xl font-black text-white mb-2 leading-tight">${m.task || 'Opération en cours'}</div>
                    <div class="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-8">${m.agent || 'SYSTEM'}</div>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center text-[10px] font-black text-slate-500"><span>Progress</span><span>${m.progress || '0%'}</span></div>
                        <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style="width: ${m.progress || '0%'}"></div>
                        </div>
                    </div>
                </div>
            `).join('');
            container.innerHTML = html || '<div class="text-center py-20 opacity-40">Zéro mission active pour le moment.</div>';
            renderCache.missions = true;
        }

        function setCRMFilter(key, value) {
            state.crmFilters[key] = value;
            renderCache.crm = null;
            renderCRM();
        }

        function changeMonth(offset) {
            state.viewDate.setMonth(state.viewDate.getMonth() + offset);
            renderCache.calendrier = null;
            renderCalendrier();
        }

        function renderCalendrier() {
            if (window.innerWidth < 768) return renderAgenda();
            const container = document.getElementById('calendrier-container');
            const year = state.viewDate.getFullYear();
            const month = state.viewDate.getMonth();
            const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            let html = `
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h3 class="text-3xl font-black text-white">${monthNames[month]} ${year}</h3>
                        <div class="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mt-1">Intelligence Planification</div>
                    </div>
                    <div class="flex gap-4">
                        <button onclick="changeMonth(-1)" class="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-400 transition-all border border-white/5 font-black">◄</button>
                        <button onclick="changeMonth(1)" class="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-400 transition-all border border-white/5 font-black">►</button>
                    </div>
                </div>
                <div class="calendar-grid flex-1">
                    <div class="calendar-header-day">Lun</div><div class="calendar-header-day">Mar</div><div class="calendar-header-day">Mer</div>
                    <div class="calendar-header-day">Jeu</div><div class="calendar-header-day">Ven</div><div class="calendar-header-day">Sam</div>
                    <div class="calendar-header-day">Dim</div>
            `;
            
            // Ajuster starting day (JS start at Sunday=0, we want Monday=1)
            let start = firstDay === 0 ? 6 : firstDay - 1;
            
            for(let i=0; i<start; i++) html += `<div class="calendar-day opacity-20"></div>`;
            
            for(let day=1; day<=daysInMonth; day++) {
                const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const dayEvents = state.appointments.filter(a => a.date === dateStr);
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                
                html += `
                    <div class="calendar-day ${isToday ? 'today' : ''} cursor-pointer hover:border-cyan-500/40 transition-all border border-transparent" onclick="inspectDay('${dateStr}')">
                        <div class="flex justify-between items-start">
                            <div class="text-xs font-black mr-2 ${isToday ? 'text-cyan-400' : 'text-slate-500'}">${day}</div>
                            ${dayEvents.length > 0 ? '<div class="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse"></div>' : ''}
                        </div>
                        <div class="flex flex-col gap-1 mt-2">
                            ${dayEvents.slice(0, 2).map(e => `
                                <div class="event-chip">
                                    <span class="opacity-60">${e.time}</span> ${e.prospect.split(' ').pop()}
                                </div>
                            `).join('')}
                            ${dayEvents.length > 2 ? `<div class="text-[8px] font-black text-slate-500 text-center">+ ${dayEvents.length - 2} autres</div>` : ''}
                        </div>
                    </div>
                `;
            }
            
            html += `</div>`;
            container.innerHTML = html;
            renderCache.calendrier = true;
        }

        function setCalendarMode(mode) {
            state.calendarMode = mode;
            renderCalendrier();
        }

        function renderAgenda() {
            const container = document.getElementById('calendrier-container');
            const currentViewDateStr = state.viewDate.toISOString().split('T')[0];
            
            let html = `
                <div class="calendar-sticky-header">
                    <!-- Mobile Navigation Tabs (V93.0) -->
                    <div class="flex p-1 bg-white/5 rounded-2xl mb-6 mx-4">
                        <button onclick="setCalendarMode('day')" class="flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${state.calendarMode === 'day' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-500'}">Jour</button>
                        <button onclick="setCalendarMode('week')" class="flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${state.calendarMode === 'week' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-500'}">Semaine</button>
                        <button onclick="setCalendarMode('month')" class="flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${state.calendarMode === 'month' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-500'}">Mois</button>
                    </div>

                    <div class="flex justify-between items-center mb-6 px-4">
                        <button onclick="navigateDate(-1)" class="p-3 bg-white/5 rounded-xl border border-white/5 text-cyan-400 font-bold">◄</button>
                        <div class="text-center">
                            <div class="text-sm font-black text-white">${state.calendarMode === 'day' ? currentViewDateStr : 'Vue Multi-Jours'}</div>
                            <div class="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">${state.calendarMode.toUpperCase()} SELECTIONNÉ</div>
                        </div>
                        <button onclick="navigateDate(1)" class="p-3 bg-white/5 rounded-xl border border-white/5 text-cyan-400 font-bold">►</button>
                    </div>
                </div>

                <div class="calendar-scroll-body transition-soft">
            `;

            if (state.calendarMode === 'day') {
                const dayEvents = state.appointments.filter(a => a.date === currentViewDateStr);
                    <div class="space-y-4 px-4 pb-32">
                        ${dayEvents.length > 0 ? dayEvents.map(e => renderEventCard(e)).join('') : `
                            <div class="bento text-center py-20 opacity-40">
                                <div class="text-4xl mb-4">💤</div>
                                <div class="text-[10px] font-black uppercase tracking-widest">Aucune mission pour ce jour</div>
                            </div>
                        `}
                    </div>
                `;
            } else if (state.calendarMode === 'week') {
                const weekEvents = state.appointments.filter(a => {
                    const d = new Date(a.date);
                    const start = new Date(state.viewDate);
                    const end = new Date(state.viewDate); end.setDate(end.getDate() + 7);
                    return d >= start && d < end;
                }).sort((a,b) => new Date(a.date) - new Date(b.date));

                html += `
                    <div class="space-y-6 px-4 pb-32">
                        ${weekEvents.map(e => `
                            <div class="flex gap-4">
                                <div class="w-12 flex-none text-center">
                                    <div class="text-xs font-black text-cyan-400">${e.date.split('-')[2]}</div>
                                    <div class="text-[8px] font-black text-slate-600 uppercase">${new Date(e.date).toLocaleDateString('fr-FR', {weekday: 'short'})}</div>
                                </div>
                                <div class="flex-1">${renderEventCard(e)}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                html += `<div class="p-4"><div class="bento bg-slate-900/60 p-4" id="mobile-month-grid"></div></div>`;
                setTimeout(() => injectMobileMonth(), 10);
            }

            html += `</div>`; // Fermeture calendar-scroll-body (V93.0)
            container.innerHTML = html;
        }

        function renderEventCard(e) {
            const pData = state.crm.find(p => p.name.includes(e.prospect) || e.prospect.includes(p.name));
            return `
                <div class="bento !p-6 border-l-4 border-l-cyan-400 bg-slate-900/60 transition-all active:scale-[0.98]" onclick="inspectDay('${e.date}')">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <div class="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1 underline decoration-cyan-500/30">${e.time}</div>
                            <div class="text-lg font-black text-white italic">"${e.prospect}"</div>
                        </div>
                        <div class="text-[8px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded-md uppercase">${e.status || 'Mission'}</div>
                    </div>
                    ${pData ? `
                        <div class="grid grid-cols-2 gap-3 mt-6">
                            <a href="tel:${pData.tel}" onclick="event.stopPropagation()" class="py-3 bg-emerald-500 text-black text-[9px] font-black uppercase rounded-xl text-center flex items-center justify-center gap-2">📞 Appel</a>
                            <a href="${pData.maps}" target="_blank" onclick="event.stopPropagation()" class="py-3 bg-slate-800 text-cyan-400 text-[9px] font-black uppercase rounded-xl border border-cyan-400/20 text-center flex items-center justify-center gap-2">📍 Maps</a>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        function navigateDate(offset) {
            if (state.calendarMode === 'day') state.viewDate.setDate(state.viewDate.getDate() + offset);
            else if (state.calendarMode === 'week') state.viewDate.setDate(state.viewDate.getDate() + (offset * 7));
            else state.viewDate.setMonth(state.viewDate.getMonth() + offset);
            renderCalendrier();
        }

        function injectMobileMonth() {
            const grid = document.getElementById('mobile-month-grid');
            if(!grid) return;
            const year = state.viewDate.getFullYear();
            const month = state.viewDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            let h = `<div class="grid grid-cols-7 gap-1 text-[8px] font-black text-slate-600 uppercase mb-4 text-center"><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div></div><div class="grid grid-cols-7 gap-2">`;
            const firstDay = new Date(year, month, 1).getDay();
            let start = firstDay === 0 ? 6 : firstDay - 1;
            for(let i=0; i<start; i++) h += `<div></div>`;
            for(let day=1; day<=daysInMonth; day++) {
                const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const hasE = state.appointments.some(a => a.date === dateStr);
                const isSelected = dateStr === state.viewDate.toISOString().split('T')[0];
                h += `
                    <div onclick="state.viewDate = new Date('${dateStr}'); renderCalendrier();" class="aspect-square flex flex-col items-center justify-center rounded-lg border ${isSelected ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/5'}">
                        <span class="text-[10px] font-black ${isSelected ? 'text-white' : 'text-slate-400'}">${day}</span>
                        ${hasE ? '<div class="w-1 h-1 bg-cyan-400 rounded-full mt-1"></div>' : ''}
                    </div>
                `;
            }
            h += `</div>`;
            grid.innerHTML = h;
        }

        function inspectDay(dateStr) {
            const dayEvents = state.appointments.filter(a => a.date === dateStr);
            if(dayEvents.length === 0) return;
            
            document.getElementById('ins-title').innerText = `Planning : ${dateStr}`;
            document.getElementById('ins-content').innerHTML = `
                <div class="space-y-6">
                    ${dayEvents.map(e => `
                        <div class="bento bg-cyan-500/5 border-l-4 border-l-cyan-400">
                            <div class="flex justify-between items-start mb-2">
                                <div class="text-xl font-black text-white">${e.time}</div>
                                <div class="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase rounded-lg">Confirmé</div>
                            </div>
                            <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Prospect</div>
                            <div class="text-md font-black text-white mb-4">${e.prospect}</div>
                            <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Notes de Session</div>
                            <div class="p-3 bg-black/40 rounded-xl text-xs text-slate-300 italic border border-white/5">
                                "${e.note || 'Aucune note scellée.'}"
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            document.getElementById('inspector').classList.remove('translate-x-full');
        }

        async function saveRDV(prospectName) {
            const date = document.getElementById('rdv-date').value;
            const time = document.getElementById('rdv-time').value;
            const note = document.getElementById('rdv-note').value;
            if(!date || !time) return alert("Veuillez remplir Date et Heure");

            const btn = document.getElementById('btn-rdv-save');
            const originalText = btn.innerHTML;
            btn.innerHTML = "💾 Enregistrement...";
            btn.disabled = true;

            // --- MISE À JOUR OPTIMISTE (Live Pulse) ---
            const newAppointment = { date, time, prospect: prospectName, note, status: 'Confirmé' };
            state.appointments.push(newAppointment);
            renderCache.calendrier = null;
            renderCalendrier(); // Mise à jour instantanée du Calendrier
            showToast("Calendrier Sync", `Rendez-vous scellé avec ${prospectName}`, 'success');

            try {
                const res = await fetch('/api/v1/appointments/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date, time, prospect: prospectName, note })
                });
                
                if(res.ok) {
                    btn.innerHTML = "✅ Succès physique";
                    btn.classList.add("bg-emerald-500", "text-black");
                    renderCache.crm = null;
                    await syncAll(); // Synchro d'arrière-plan pour confirmer
                    setTimeout(() => { closeInspector(); navigate('calendrier'); }, 1500);
                } else {
                    const errData = await res.json().catch(() => ({ error: res.statusText }));
                    // Rollback en cas d'erreur
                    state.appointments = state.appointments.filter(a => a !== newAppointment);
                    renderCache.calendrier = null;
                    renderCalendrier();
                    btn.innerHTML = `❌ Erreur ${res.status} : ${errData.error || 'Accès refusé'}`;
                    btn.classList.add("bg-rose-500", "text-white");
                    btn.style.fontSize = '8px'; // Réduction pour faire tenir le texte
                    btn.disabled = false;
                    showToast("Erreur Sync", `${res.status} - Vérifier le backend`, 'error');
                }
            } catch(e) { 
                btn.innerHTML = "❌ Crash Liaison Terminal"; 
                btn.classList.add("bg-rose-500", "text-white");
                btn.disabled = false; 
                showToast("Erreur Système", "Liaison backend interrompue", 'error');
            }
        }
        
        function toggleCRMStats() {
            state.showCRMStats = !state.showCRMStats;
            renderCRM();
        }

        function renderCRM() {
            const container = document.getElementById('crm-container');
            if (!Array.isArray(state.crm)) {
                container.innerHTML = `<div class="p-20 text-center text-rose-400 font-black uppercase tracking-widest animate-pulse">⚠️ Système d'extraction en maintenance... <br/> <span class="text-[10px] opacity-60">Veuillez patienter ou relancer la synchronisation</span></div>`;
                return;
            }
            
            // Calcul des valeurs uniques pour les filtres
            const zones = ['Tous', ...new Set(state.crm.map(p => p.zone))].sort();
            const specialties = ['Tous', ...new Set(state.crm.map(p => p.specialty))].sort();
            const statuses = ['Tous', 'Nouveau Prospect', 'Relance à faire', 'Intéressé', 'Rendez-vous fixé', 'Pas intéressé / Refusé', 'Client signé'];

            // Filtrage dynamique
            const filteredData = (state.crm || []).filter(p => {
                const matchZone = state.crmFilters.zone === 'Tous' || p.zone === state.crmFilters.zone;
                const matchStatus = state.crmFilters.status === 'Tous' || p.funnel.trim() === state.crmFilters.status;
                return matchZone && matchStatus;
            });

            // Stats
            const total = state.crm.length;
            const signed = state.crm.filter(p => p.funnel.includes('signé')).length;
            const opportunities = state.crm.filter(p => p.funnel.includes('Intéressé') || p.funnel.includes('fixé')).length;
            
            const isMobile = window.innerWidth < 768;

            container.innerHTML = `
                ${isMobile ? `
                    <!-- Mobile Stats Toggle -->
                    <div class="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-slate-900/40">
                        <div class="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Module CRM Elite</div>
                        <button onclick="toggleCRMStats()" class="px-4 py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-xl text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                            ${state.showCRMStats ? '<span>📉 Masquer Stats</span>' : '<span>📈 Voir Stats</span>'}
                        </button>
                    </div>
                ` : ''}

                <div class="${isMobile && !state.showCRMStats ? 'hidden' : 'block'}">
                    <div class="flex-none p-4 md:p-8 flex flex-wrap md:flex-nowrap gap-4">
                        <div class="bento py-4 md:py-6 flex-1 text-center bg-cyan-900/10 min-w-[140px]"><div class="text-[9px] md:text-[10px] font-black text-slate-500 uppercase mb-1">Total</div><div class="text-xl md:text-2xl font-black text-white">${total}</div></div>
                        <div class="bento py-4 md:py-6 flex-1 text-center bg-emerald-900/10 min-w-[140px]"><div class="text-[9px] md:text-[10px] font-black text-slate-500 uppercase mb-1">Signés</div><div class="text-xl md:text-2xl font-black text-emerald-400">${signed}</div></div>
                        <div class="bento py-4 md:py-6 flex-1 text-center bg-cyan-900/10 min-w-[140px] hidden md:block"><div class="text-[10px] font-black text-slate-500 uppercase mb-2">Opportunités</div><div class="text-2xl font-black text-cyan-400">${opportunities}</div></div>
                    </div>

                    <!-- Filters Bar -->
                    <div class="px-4 md:px-8 mb-6 flex flex-col md:flex-row gap-4">
                        <div class="flex-1 bento !py-3 md:!py-4 flex items-center gap-4">
                            <div class="text-[9px] font-black text-cyan-400 uppercase tracking-widest">📍 Zone</div>
                            <select onchange="setCRMFilter('zone', this.value)" class="flex-1 bg-transparent border-none text-xs font-black text-white outline-none cursor-pointer">
                                ${zones.map(z => `<option value="${z}" class="bg-slate-900" ${state.crmFilters.zone === z ? 'selected' : ''}>${z}</option>`).join('')}
                            </select>
                        </div>
                        <div class="flex-1 bento !py-3 md:!py-4 flex items-center gap-4">
                            <div class="text-[9px] font-black text-cyan-400 uppercase tracking-widest">📊 Statut</div>
                            <select onchange="setCRMFilter('status', this.value)" class="flex-1 bg-transparent border-none text-xs font-black text-white outline-none cursor-pointer">
                                ${statuses.map(s => `<option value="${s}" class="bg-slate-900" ${state.crmFilters.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto custom-scroll px-4 md:px-8 pb-32 md:pb-8">
                    ${isMobile ? `
                        <div class="space-y-6">
                            ${filteredData.map(p => `
                                <div class="bento !p-8 bg-slate-900/60 border-l-8 border-l-cyan-400 active:scale-[0.98] transition-all shadow-2xl" onclick="inspectCRM('${p.name}')">
                                    <div class="flex justify-between items-start mb-6">
                                        <div class="flex-1">
                                            <div class="text-2xl font-black text-white leading-tight mb-2 uppercase">${p.name}</div>
                                            <div class="flex items-center gap-3">
                                                <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${p.specialty || 'PROSPECT ELITE'}</div>
                                                <div class="w-1 h-1 rounded-full bg-slate-700"></div>
                                                <div class="text-[10px] font-black text-cyan-400 uppercase tracking-widest">📍 ${p.zone}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="flex flex-col gap-4 mt-8">
                                        <!-- BOUTON APPEL DIRECT -->
                                        <a href="tel:${p.tel}" onclick="event.stopPropagation()" class="w-full py-6 bg-emerald-500 text-black text-xs font-black uppercase rounded-[1.5rem] text-center shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:bg-emerald-400 transition-all scale-105 mb-2">
                                            <span class="text-3xl">📞</span> APPELER LE DOCTEUR
                                        </a>
                                        
                                        <!-- BOUTON GPS MAPS -->
                                        ${p.maps ? `
                                            <a href="${p.maps}" target="_blank" onclick="event.stopPropagation()" class="w-full py-5 bg-slate-800 text-cyan-400 text-xs font-black uppercase rounded-[1.5rem] border border-cyan-400/20 text-center flex items-center justify-center gap-3 active:bg-slate-700">
                                                <span class="text-xl">📍</span> ITINÉRAIRE GPS
                                            </a>
                                        ` : ''}

                                        <button class="w-full py-4 bg-white/5 text-slate-400 text-[10px] font-black uppercase rounded-[1.5rem] border border-white/5">Consulter le diagnostic</button>
                                    </div>

                                    <div class="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-[9px] font-black">
                                        <div class="text-slate-500 uppercase tracking-widest">Statut Funnel</div>
                                        <div class="text-white px-3 py-1 bg-white/5 rounded-full">${p.funnel}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <table class="w-full text-left bg-black/20 rounded-2xl overflow-hidden">
                            <thead class="sticky top-0 bg-slate-900/90 backdrop-blur z-10 border-b border-white/5">
                                <tr>
                                    <th class="p-6 text-[10px] font-black text-cyan-400 uppercase tracking-widest">Dossier / Spécialité</th>
                                    <th class="p-6 text-[10px] font-black text-cyan-400 uppercase tracking-widest text-center">Localisation</th>
                                    <th class="p-6 text-[10px] font-black text-cyan-400 uppercase tracking-widest text-right">Statut Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                ${filteredData.map(p => `
                                    <tr class="hover:bg-white/5 transition-colors cursor-pointer group" onclick="inspectCRM('${p.name}')">
                                        <td class="p-6">
                                            <div class="flex items-center gap-4">
                                                <div class="w-10 h-10 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center font-black text-cyan-400 group-hover:border-cyan-500/50 transition-all">${p.name[0]}</div>
                                                <div><div class="text-sm font-black text-white">${p.name}</div><div class="text-[9px] font-black text-slate-500">${p.specialty}</div></div>
                                            </div>
                                        </td>
                                        <td class="p-6 text-center">
                                            <div class="text-[10px] font-black text-slate-300">📍 ${p.zone}</div>
                                        </td>
                                        <td class="p-6 text-right">
                                            <div class="inline-block px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20">${p.funnel}</div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `}
                    ${filteredData.length === 0 ? `<div class="p-20 text-center text-slate-500 font-black uppercase text-xs tracking-widest">Aucun prospect</div>` : ''}
                </div>
            `;
            renderCache.crm = true;
        }


        function inspectCRM(name) {
            const p = state.crm.find(x => x.name === name);
            if(!p) return;
            document.getElementById('ins-title').innerText = p.name;
            document.getElementById('ins-content').innerHTML = `
                <div class="space-y-8">
                    <!-- Section 1: Profil & Statut -->
                    <div class="bento bg-white/5 border-l-4 border-l-cyan-400">
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Expertise & Score</div>
                                <div class="text-xl font-black text-white">${p.specialty} <span class="ml-2 text-cyan-400">${p.score}</span></div>
                            </div>
                            <div class="text-right">
                                <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Source</div>
                                <div class="text-xs font-black text-white px-3 py-1 bg-white/5 rounded-full border border-white/10 italic">${p.source}</div>
                            </div>
                        </div>
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Mise à jour du Statut</div>
                        <div class="flex gap-4 relative">
                            <select id="edit-funnel-${p.name.replace(/\s/g, '')}" onchange="saveCRMStatus('${p.name}', '${p.name.replace(/\s/g, '')}')" class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-white outline-none focus:border-cyan-400 transition-colors cursor-pointer appearance-none shadow-inner">
                                <option value="Nouveau Prospect" ${p.funnel.trim() === 'Nouveau Prospect' ? 'selected' : ''}>Nouveau Prospect</option>
                                <option value="Relance à faire" ${p.funnel.trim() === 'Relance à faire' ? 'selected' : ''}>Relance à faire</option>
                                <option value="Intéressé" ${p.funnel.trim() === 'Intéressé' ? 'selected' : ''}>Intéressé</option>
                                <option value="Rendez-vous fixé" ${p.funnel.trim() === 'Rendez-vous fixé' ? 'selected' : ''}>Rendez-vous fixé</option>
                                <option value="Pas intéressé / Refusé" ${p.funnel.trim() === 'Pas intéressé / Refusé' ? 'selected' : ''}>Pas intéressé / Refusé</option>
                                <option value="Client signé" ${p.funnel.trim() === 'Client signé' ? 'selected' : ''}>Client signé</option>
                            </select>
                            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                        </div>
                    </div>

                    <!-- Section 2: Localisation & Contact -->
                    <div class="grid grid-cols-2 gap-6">
                        <div class="bento bg-slate-900/40">
                             <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">📍 Localisation</div>
                             <div class="text-lg font-black text-white mb-6">${p.zone}</div>
                             <a href="${p.maps}" target="_blank" class="w-full py-3 bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-all text-[10px] font-black uppercase">Ouvrir Google Maps</a>
                        </div>
                        <div class="bento bg-slate-900/40">
                             <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">📞 Contact Direct</div>
                             <div class="text-lg font-black text-white mb-6 font-mono">${p.tel}</div>
                             <button onclick="bookAppointmentUI('${p.name}')" class="w-full py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-all text-[10px] font-black uppercase">🗓️ Fixer Rendez-vous</button>
                        </div>
                    </div>

                    <!-- Section 2.5: Appointment Form (Hidden by default) -->
                    <div id="rdv-form" class="hidden bento bg-emerald-950/20 border border-emerald-500/30 animate-pulse-slow">
                        <div class="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Planification Stratégique</div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <input type="date" id="rdv-date" class="bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none">
                            <input type="time" id="rdv-time" class="bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none">
                        </div>
                        <textarea id="rdv-note" placeholder="Notes de préparation..." class="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none mb-4 h-20 resize-none"></textarea>
                        <button id="btn-rdv-save" onclick="saveRDV('${p.name}')" class="w-full py-4 bg-emerald-500 text-black font-black uppercase text-xs rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">Confirmer la Session</button>
                    </div>

                    <!-- Section 3: Empreinte Digitale -->
                    <div class="bento">
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">🔗 Liens & Réseaux</div>
                        <div class="grid grid-cols-2 gap-4">
                            <a href="${p.med}" target="_blank" class="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                <span class="text-[11px] font-black text-emerald-400">Annuaire Med.tn</span>
                                <span class="opacity-0 group-hover:opacity-100 transition-all transition-all">➜</span>
                            </a>
                            <a href="${p.site === 'ABSENT' ? '#' : p.site}" target="_blank" class="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl flex items-center justify-between group hover:border-cyan-500/30 transition-all ${p.site === 'ABSENT' ? 'opacity-30 cursor-not-allowed' : ''}">
                                <span class="text-[11px] font-black text-cyan-400">Site Web Office</span>
                                <span class="opacity-0 group-hover:opacity-100 transition-all transition-all">➜</span>
                            </a>
                        </div>
                    </div>

                    <!-- Section 4: Historique / Diagnostic -->
                    <div class="bento bg-black/20 border-dashed border-white/10">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></div>
                            <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Journal d'Audit Iris</div>
                        </div>
                        <div class="font-mono text-xs text-slate-400 leading-relaxed italic">
                            "${p.diagnostic || 'Aucun diagnostic additionnel scellé dans le registre.'}"
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('inspector').classList.remove('translate-x-full');
        }

        // saveCRMStatus version unifiée et robuste
        async function saveCRMStatus(name, idKey) {
            const input = document.getElementById(`edit-funnel-${idKey}`);
            if (!input) return;
            const newStatus = input.value;
            input.classList.add("opacity-50", "animate-pulse");

            try {
                const res = await fetch('/api/v1/prospects/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, newStatus })
                });

                if (res.ok) {
                    input.classList.remove("opacity-50", "animate-pulse");
                    input.classList.add("border-emerald-500", "text-emerald-400");
                    await syncAll();
                    renderCRM();
                } else {
                    input.classList.remove("opacity-50", "animate-pulse");
                    input.classList.add("border-rose-500", "text-rose-400");
                }
            } catch (err) {
                input.classList.remove("opacity-50", "animate-pulse");
                input.classList.add("border-rose-500", "text-rose-400");
            }
            setTimeout(() => {
                input.classList.remove("border-emerald-500", "text-emerald-400", "border-rose-500", "text-rose-400");
            }, 2000);
        }

        function renderProjets() {
            const container = document.getElementById('project-gallery');
            container.innerHTML = state.projets.map(p => `
                <div class="bento flex flex-col gap-8 group">
                    <div class="flex justify-between items-start">
                        <div class="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl shadow-cyan-500/20">🚀</div>
                        <div class="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black">${p.status}</div>
                    </div>
                    <div><h4 class="text-3xl font-black text-white mb-2">${p.client}</h4><div class="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">${p.type}</div></div>
                    <div class="pt-8 border-t border-white/5 flex gap-4">
                        <a href="${p.link}" target="_blank" class="flex-1 py-4 bg-white/5 rounded-[2rem] text-[10px] font-black uppercase text-center hover:bg-cyan-500/10 hover:text-cyan-400 transition-all border border-white/5">🌐 Live Link</a>
                    </div>
                </div>
            `).join('');
            renderCache.projets = true;
        }

        function togglePole(poleName) {
            state.expandedPoles[poleName] = !state.expandedPoles[poleName];
            renderAgents();
        }

        function renderAgents(force = false) {
            const container = document.getElementById('agent-list');
            if(!container || !state.agents || !state.agents.children) return;
            
            // Bypass du cache pour les mises à jour télémétriques
            if (renderCache.agents && state.currentRoute !== 'agents' && !force) return;
            const isMobile = window.innerWidth < 768;
            
            const poleDisplayNames = {
                "DIRECTION STRATEGIQUE": "Direction Stratégique",
                "COMMERCIAL SALES": "Commercial & Sales",
                "CREATIF DESIGN": "Créatif & Design",
                "TECH CYBER": "Tech & Cyber",
                "MEDICAL SANTE": "Médical & Santé",
                "FINANCE ROI": "Finance & ROI",
                "JURIDIQUE CONTRATS": "Juridique & Contrat",
                "RD INNOVATION": "Recherche, Développement & Innovation"
            };

            container.className = "w-full h-auto flex flex-col gap-6 md:gap-12 pb-32";
            
            const html = state.agents.children.map(pole => {
                const displayName = poleDisplayNames[pole.name] || pole.name;
                const count = pole.children.length;
                const isExpanded = state.expandedPoles[pole.name] || false;
                
                // --- CASCADE EN DUR (V96.0 SÉCURISÉE) ---
                const syncData = state.telemetry.sync || {};
                const isPoleActive = (pole.name.toUpperCase().includes("COMMERCIAL") && syncData.business === "active") || (pole.children || []).some(a => {
                    const agentKey = a.name ? a.name.replace('AGENT_', '').split('.')[0].toUpperCase() : '';
                    const status = state.telemetry.status || {};
                    return (status[agentKey] === 'active' || status[a.name] === 'active' || status[agentKey.toLowerCase()] === 'active');
                });

                return `
                    <div class="pole-section bento !p-0 border border-white/5 transition-all duration-500 ${isExpanded ? 'bg-slate-900/40 shadow-2xl h-auto' : 'bg-transparent h-fit'} ${isPoleActive ? 'ring-1 ring-emerald-500/30' : ''}">
                        <div class="flex items-center justify-between p-8 md:p-14 cursor-pointer bg-white/[0.03] hover:bg-white/10 transition-all group border-b border-white/5 w-full" onclick="togglePole('${pole.name}')">
                            <div class="flex items-center gap-8">
                                <div class="w-12 h-12 rounded-2xl ${isPoleActive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-cyan-500/10 border-cyan-500/20'} flex items-center justify-center border group-hover:scale-110 transition-all">
                                    <span class="text-xl transition-transform duration-700 ${isExpanded ? 'rotate-90' : ''} ${isPoleActive ? 'text-emerald-400' : 'text-slate-600'}">${isExpanded ? '▼' : '▶'}</span>
                                </div>
                                <div>
                                    <h3 class="text-lg md:text-3xl font-black ${isPoleActive ? 'text-emerald-400' : 'text-white'} tracking-widest uppercase mb-1 transition-all">${displayName}</h3>
                                    <div class="text-[9px] font-black ${isPoleActive ? 'text-emerald-500/60' : 'text-cyan-500/60'} uppercase tracking-[0.4em]">${isExpanded ? 'Secteur Ouvert' : 'Secteur Verrouillé'}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3 md:gap-6">
                                <span class="hidden md:block text-[10px] font-black text-slate-500 uppercase tracking-widest">Capacité Flotte</span>
                                <div class="flex items-center gap-4 bg-white/5 px-4 md:px-6 py-2 rounded-2xl border ${isPoleActive ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'border-white/5'} transition-all">
                                    <span class="text-sm font-black ${isPoleActive ? 'text-emerald-400' : 'text-cyan-400'}">${count}</span>
                                    <div class="w-2.5 h-2.5 rounded-full ${isPoleActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-800'} transition-all"></div>
                                </div>
                            </div>
                        </div>
                        <div class="${isExpanded ? 'p-8 md:p-20 block animate-fadeIn' : 'hidden'} w-full h-auto">
                            <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 w-full">
                                ${pole.children.map(a => {
                                    const agentKey = a.name.replace('AGENT_', '').split('.')[0]; // Nettoyage du nom pour match status.json
                                    // Fallback sur le nom complet si le nettoyage échoue
                                    const status = state.telemetry.status[agentKey] || state.telemetry.status[a.name] || 'idle';
                                    return `
                                        <div class="bento !p-6 md:!p-10 text-center group cursor-pointer border border-white/10 bg-slate-900/80 hover:border-cyan-500/50 hover:bg-cyan-500/10 shadow-2xl transition-all relative" onclick="inspectAgent('${a.name}')">
                                            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div class="w-20 md:w-32 h-20 md:h-32 mx-auto mb-6 md:mb-10 rounded-[3rem] bg-black/60 border border-white/10 p-4 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-700 shadow-inner">
                                                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${a.name}" class="w-full h-full object-contain">
                                            </div>
                                            <div class="text-xs md:text-xl font-black text-white tracking-tighter uppercase mb-4 line-clamp-2 min-h-[50px] flex items-center justify-center font-outfit">${a.name.replace('AGENT_', '').replace(/_/g, ' ')}</div>
                                            <div class="flex items-center justify-center gap-2">
                                                <div class="w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}"></div>
                                                <div class="text-[8px] md:text-[10px] font-black ${status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10' : 'bg-white/5 text-slate-500 border-white/5'} px-4 py-1.5 rounded-full border shadow-lg uppercase tracking-widest">${status.toUpperCase()}</div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = html;
            renderCache.agents = true;
        }

        async function inspectAgent(name) {
            window.openAgentInstruction = inspectAgent;
            const agentKey = name.replace('.md', '');
            const status = state.telemetry.status[agentKey] || 'idle';
            
            document.getElementById('ins-title').innerText = name.replace('AGENT_', '').replace(/_/g, ' ');
            document.getElementById('inspector').classList.remove('translate-x-full');
            
            document.getElementById('ins-content').innerHTML = `
                <div class="space-y-8">
                    <!-- Statut & Live Monitoring Action -->
                    <div class="bento bg-white/5 border-l-4 ${status === 'active' ? 'border-emerald-500' : 'border-slate-500'}">
                        <div class="flex justify-between items-center">
                            <div>
                                <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Opérationnel</div>
                                <div class="text-xl font-black ${status === 'active' ? 'text-emerald-400 animate-pulse' : 'text-slate-400 text-slate-500'}">${status.toUpperCase()}</div>
                            </div>
                            <button onclick="openLiveTerminal('${agentKey}')" class="px-6 py-3 ${status === 'active' ? 'bg-emerald-500 text-black shadow-emerald-500/20' : 'bg-white/5 text-slate-400 border border-white/10'} font-black text-[10px] uppercase rounded-xl hover:scale-105 transition-all shadow-lg">
                                ${status === 'active' ? '👁️ Voir le Live' : '📔 Historique Logs'}
                            </button>
                        </div>
                    </div>

                    <div id="agent-instruction-loading" class="text-center py-10 text-slate-500 text-[10px] font-black uppercase animate-pulse">Liaison nerveuse...</div>
                    <div id="agent-instruction-content" class="md-content text-sm text-slate-300 leading-relaxed font-light"></div>
                </div>
            `;
            try {
                const res = await fetch(`/api/v1/agents/instruction?agent=${name}`);
                const data = await res.json();
                const content = data.content ? data.content : "No instructions found.";
                document.getElementById('ins-content').innerHTML = `
                    <div class="flex flex-col gap-6">
                        <!-- Live Monitoring -->
                        <div class="bento border border-emerald-500/30 bg-emerald-500/5">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <h4 class="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Live Monitoring</h4>
                            </div>
                            <div class="font-mono text-xs text-emerald-400 opacity-80 h-24 overflow-y-auto custom-scroll flex flex-col gap-1">
                                <div>> SYSTEM: Agent ${name} Active</div>
                                <div>> MEMORY: Loaded synaptic parameters...</div>
                                <div>> STATE: Awaiting protocol commands [<span class="animate-pulse">_</span>]</div>
                            </div>
                        </div>
                        
                        <!-- Fiche MD -->
                        <div class="bento flex-1 !p-1 md:!p-8 overflow-hidden bg-black/60 border border-white/5">
                            <h4 class="text-[10px] md:text-[11px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-6 p-4 md:p-0">Instruction.md & Base de Connaissances</h4>
                            <pre class="bg-slate-950/80 p-5 md:p-8 rounded-[2rem] text-[12px] md:text-[14px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap overflow-x-hidden border border-cyan-500/10 shadow-2xl custom-scroll" style="font-family: 'JetBrains Mono', monospace;">${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
                        </div>
                    </div>
                `;
            } catch (e) {
                document.getElementById('ins-content').innerHTML = `<div class="text-rose-500 font-bold p-4">${e.message}</div>`;
            }
        }

        function closeInspector() { document.getElementById('inspector').classList.add('translate-x-full'); }

        function bookAppointmentUI(name) {
            document.getElementById('rdv-form').classList.remove('hidden');
            document.getElementById('rdv-form').scrollIntoView({ behavior: 'smooth' });
        }

        window.onload = init;

        // Background Vortex
        const canvas = document.getElementById('vortex-canvas');
        const ctx = canvas.getContext('2d');
        let nodes = []; canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        for(let i=0; i<40; i++) nodes.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-0.5)*1, vy: (Math.random()-0.5)*1, r: Math.random()*1.5+1 });
        function loop() {
            if (document.visibilityState === 'visible') {
                ctx.clearRect(0,0,canvas.width, canvas.height);
                nodes.forEach(n => {
                    n.x += n.vx; n.y += n.vy; if(n.x<0||n.x>canvas.width) n.vx*=-1; if(n.y<0||n.y>canvas.height) n.vy*=-1;
                    ctx.fillStyle = 'rgba(34,211,238,0.2)'; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2); ctx.fill();
                    nodes.forEach(o => { const d = Math.hypot(n.x-o.x, n.y-o.y); if(d<200) { ctx.strokeStyle = `rgba(34,211,238,${0.08 - d/2500})`; ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(o.x, o.y); ctx.stroke(); } });
                });
            }
            requestAnimationFrame(loop);
        }
        loop();
        function openLiveTerminal(agentName) {
            state.isTerminalOpen = true;
            const modal = document.getElementById('terminal-modal');
            modal.classList.remove('hidden');
            document.getElementById('terminal-agent-name').innerText = agentName;
            updateLogs();
        }

        function closeLiveTerminal() {
            state.isTerminalOpen = false;
            document.getElementById('terminal-modal').classList.add('hidden');
        }

        async function updateLogs() {
            if (!state.isTerminalOpen) return;
            try {
                const res = await fetch(`/api/v1/telemetry/logs?_t=${Date.now()}`, { cache: 'no-store' });
                if (!res.ok) throw new Error("Flux interrompu");
                
                const data = await res.json();
                const container = document.getElementById('terminal-content');
                if (!container) return;

                // Rendu Terminal Immersif (V87.0)
                const formattedLogs = (data.logs || "").split('\n').filter(l => l.trim()).map(line => `
                    <div class="flex gap-4 font-mono text-[11px] py-0.5 border-b border-emerald-500/5">
                        <span class="text-emerald-500/20">$</span>
                        <span class="${line.includes('[SYSTEM]') ? 'text-cyan-400' : line.includes('[ERROR]') ? 'text-rose-400' : 'text-emerald-400/90'} tracking-tight">${line}</span>
                    </div>
                `).join('');
                
                container.innerHTML = formattedLogs || '<div class="opacity-20 text-[10px] uppercase font-black tracking-[0.4em]">Listening for Neural Bridge...</div>';
                
                // AUTO-SCROLL NERVEUX (V88.0 Force Lock)
                requestAnimationFrame(() => {
                    container.scrollTop = container.scrollHeight;
                    // Forçage scroll mobile agressif
                    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
                });
                
                if (state.isTerminalOpen) setTimeout(updateLogs, 1500); 
            } catch (e) {
                console.error("❌ Échec Logs :", e);
                setTimeout(updateLogs, 5000);
            }
        }

        // --- ALLUMAGE DU RÉACTEUR TITAN ---
        window.addEventListener('DOMContentLoaded', init);
    </script>
