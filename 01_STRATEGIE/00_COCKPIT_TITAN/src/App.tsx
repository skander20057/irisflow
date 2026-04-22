import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Shield, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Cpu,
  Network,
  Eye,
  Menu,
  ChevronRight,
  Search,
  User,
  Settings,
  X
} from 'lucide-react';
import { cn } from './lib/utils';

// --- TYPES SOUVERAINS ---
interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label: string;
  type: 'core' | 'pole' | 'agent';
}

interface Link {
  source: string;
  target: string;
}

interface Prospect {
  name: string;
  tel: string;
  specialty: string;
  zone: string;
  score: string;
  funnel: string;
}

interface Mission {
  id: string;
  agent: string;
  task: string;
  status: string;
  progress: string;
  date: string;
}

// --- MODULE: VORTEX TITAN ---
const VortexGraph: React.FC<{ hierarchy: any }> = ({ hierarchy }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    if (!hierarchy) return;
    
    // Simplification de la hiérarchie pour le graphe de force
    const initialNodes: Node[] = [];
    const initialLinks: Link[] = [];

    const process = (item: any, parentId: string | null = null, depth = 0) => {
      const id = item.name;
      initialNodes.push({
        id,
        x: 400 + Math.random() * 100,
        y: 300 + Math.random() * 100,
        vx: 0, vy: 0,
        radius: depth === 0 ? 35 : (depth === 1 ? 25 : 15),
        label: id,
        type: depth === 0 ? 'core' : (depth === 1 ? 'pole' : 'agent')
      });
      if (parentId) initialLinks.push({ source: parentId, target: id });
      if (item.children) item.children.forEach((c: any) => process(c, id, depth + 1));
    };

    process(hierarchy);
    setNodes(initialNodes);
    setLinks(initialLinks);
  }, [hierarchy]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Physiques
      nodes.forEach(node => {
        let fx = 0, fy = 0;
        // Centre
        fx += (canvas.width / 2 - node.x) * 0.005;
        fy += (canvas.height / 2 - node.y) * 0.005;
        // Répulsion
        nodes.forEach(other => {
          if (other.id !== node.id) {
            const dx = node.x - other.x, dy = node.y - other.y;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            const force = (node.radius + other.radius) * 15 / (dist * dist);
            fx += (dx / dist) * force; fy += (dy / dist) * force;
          }
        });
        // Liens
        links.forEach(l => {
          const target = nodes.find(n => n.id === l.target);
          const source = nodes.find(n => n.id === l.source);
          if (l.source === node.id && target) {
            fx += (target.x - node.x) * 0.02; fy += (target.y - node.y) * 0.02;
          }
          if (l.target === node.id && source) {
            fx += (source.x - node.x) * 0.02; fy += (source.y - node.y) * 0.02;
          }
        });

        node.vx = (node.vx + fx) * 0.8;
        node.vy = (node.vy + fy) * 0.8;
        node.x += node.vx; node.y += node.vy;
      });

      // Dessin liens
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
      ctx.lineWidth = 1;
      links.forEach(l => {
        const s = nodes.find(n => n.id === l.source), t = nodes.find(n => n.id === l.target);
        if (s && t) {
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y); ctx.stroke();
        }
      });

      // Dessin nœuds
      nodes.forEach(node => {
        ctx.shadowBlur = 15;
        ctx.shadowColor = node.type === 'core' ? '#00ff88' : (node.type === 'pole' ? '#3366ff' : '#94a3b8');
        ctx.fillStyle = node.type === 'core' ? '#00ff88' : (node.type === 'pole' ? '#3366ff' : '#1e293b');
        ctx.beginPath(); ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = '10px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.radius + 15);
      });
    };

    const thread = setInterval(animate, 1000/60);
    return () => clearInterval(thread);
  }, [nodes, links]);

  return <canvas ref={canvasRef} width={800} height={600} className="w-full h-full" />;
};

// --- MAIN APP: IRIS OS TITAN ---
// --- COMPOSANT LOGIN SOUVERAIN ---
const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === 'IRIS2026') { // Code d'accès par défaut, à changer via ENV
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center z-[1000]">
      <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 to-transparent pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 rounded-3xl border border-slate-800 w-[350px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center glow-emerald mx-auto mb-6">
          <Shield className="text-emerald-500" size={32} />
        </div>
        <h2 className="text-xl font-black mb-2 uppercase tracking-widest">IRIS <span className="text-emerald-500">TITAN</span></h2>
        <p className="text-xs text-slate-500 mb-8 font-bold uppercase tracking-tight">Accès Sécurisé Souverain</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="password" 
            placeholder="CODE D'ACCÈS" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={cn(
              "bg-slate-900 border rounded-xl px-4 py-3 text-center font-bold tracking-[0.5em] outline-none transition-all",
              error ? "border-red-500 animate-shake" : "border-slate-800 focus:border-emerald-500/50"
            )}
          />
          <button type="submit" className="bg-emerald-500 text-[#020617] font-black py-3 rounded-xl hover:bg-emerald-400 transition-all uppercase tracking-widest text-sm">
            Authentifier
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- MAIN APP: IRIS OS TITAN ---
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('iris_auth') === 'true');
  const [activeTab, setActiveTab] = useState('vortex');
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [prospects, setProspects] = useState<Prospect[]>(() => {
    const cached = localStorage.getItem('iris_prospects');
    return cached ? JSON.parse(cached) : [];
  });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Enregistrement du Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then(() => {
        console.log("🛠️ IRIS PWA : Service Worker Actif");
      });
    }

    if (isAuthenticated) {
      fetchData();
      const sse = new EventSource('/api/stream');
      sse.addEventListener('pulse', (e) => setLogs(prev => [JSON.parse(e.data), ...prev].slice(0, 20)));
      return () => sse.close();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [h, p, m] = await Promise.all([
        fetch('/api/v1/hierarchy').then(r => r.json()).catch(() => null),
        fetch('/api/v1/prospects').then(r => r.json()).catch(() => prospects),
        fetch('/api/v1/missions').then(r => r.json()).catch(() => [])
      ]);
      if (h) setHierarchy(h);
      if (p) {
        setProspects(p);
        localStorage.setItem('iris_prospects', JSON.stringify(p));
      }
      setMissions(m);
    } catch (e) { console.error("Sync Error", e); }
  };

  const updateStatus = async (name: string, newStatus: string) => {
    // Update local state for immediate feedback
    const updatedProspects = prospects.map(p => p.name === name ? { ...p, funnel: newStatus } : p);
    setProspects(updatedProspects);
    localStorage.setItem('iris_prospects', JSON.stringify(updatedProspects));

    try {
      await fetch('/api/v1/prospects/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, newStatus })
      });
      fetchData();
    } catch (e) { 
      console.warn("Offline: Changement sauvegardé localement.");
      // Optionnel: Stocker les modifications en attente pour synchro future
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('iris_auth', 'true');
  };

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-['Outfit'] overflow-hidden relative">
      {/* SIDEBAR TACTIQUE (Mobile Responsive) */}
      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 w-64 border-r border-slate-800/50 glass flex flex-col p-4 gap-8 z-[100] transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center glow-emerald">
              <Network className="text-emerald-500" />
            </div>
            <h1 className="text-xl font-black tracking-tighter">IRIS <span className="text-emerald-500">TITAN</span></h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500"><X /></button>
        </div>

        <nav className="flex flex-col gap-2 w-full">
          {[
            { id: 'vortex', icon: Network, label: 'VORTEX' },
            { id: 'crm', icon: Target, label: 'CRM ELITE' },
            { id: 'missions', icon: Activity, label: 'MISSIONS' },
            { id: 'agents', icon: Cpu, label: 'AGENTS' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
                activeTab === item.id ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-slate-800/50 text-slate-400"
              )}
            >
              <item.icon size={20} />
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto w-full px-2">
            <button className="flex items-center gap-4 text-slate-500 hover:text-red-400 transition-colors">
                <Shield size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">PURGE SYSTÈME</span>
            </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* TOP BAR */}
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-4 lg:px-8 glass shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-300 bg-slate-800/50 rounded-xl"><Menu /></button>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Operational Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold tracking-tight hidden sm:inline">SOUVERAINETÉ ACTIVE — V400</span>
                <span className="text-sm font-bold tracking-tight sm:hidden text-emerald-500">LIVE</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input className="bg-slate-900/50 border border-slate-700/50 rounded-full pl-10 pr-4 py-2 text-xs w-48 lg:w-64 focus:border-emerald-500/50 outline-none transition-all" placeholder="Rechercher..." />
            </div>
            <button className="w-10 h-10 rounded-full border border-slate-700/50 flex items-center justify-center hover:bg-slate-800 transition-colors"><User size={20} /></button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto lg:overflow-hidden p-4 lg:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'vortex' && (
              <motion.div key="vortex" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="h-full flex items-center justify-center relative min-h-[400px]">
                <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent pointer-events-none" />
                <VortexGraph hierarchy={hierarchy} />
              </motion.div>
            )}

            {activeTab === 'crm' && (
              <motion.div key="crm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                  {[
                    { label: 'PROSPECTS', value: prospects.length, color: 'emerald' },
                    { label: 'RDV', value: prospects.filter(p => p.funnel.includes('RDV')).length, color: 'gold' },
                    { label: 'CLIENTS', value: prospects.filter(p => p.funnel.includes('CLIENT')).length, color: 'royal' },
                    { label: 'FLUX', value: 'LIVE', color: 'emerald' }
                  ].map((kpi, i) => (
                    <div key={i} className="glass p-4 lg:p-6 rounded-2xl border-l-4 border-emerald-500">
                      <h4 className="text-[10px] text-slate-500 font-black tracking-widest uppercase mb-1">{kpi.label}</h4>
                      <p className="text-xl lg:text-2xl font-black">{kpi.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col min-h-[500px]">
                  <div className="flex-1 overflow-x-auto lg:overflow-y-auto custom-scroll">
                    <table className="w-full text-left min-w-[600px]">
                      <thead className="sticky top-0 bg-[#0a0f19] z-10 border-b border-slate-800">
                        <tr>
                          <th className="p-4 text-[10px] font-black tracking-widest text-emerald-500 uppercase">PROSPECT</th>
                          <th className="p-4 text-[10px] font-black tracking-widest text-emerald-500 uppercase">ZONE / SPÉCIALITÉ</th>
                          <th className="p-4 text-[10px] font-black tracking-widest text-emerald-500 uppercase">SCORE</th>
                          <th className="p-4 text-[10px] font-black tracking-widest text-emerald-500 uppercase">STATUT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prospects.map((p, i) => (
                          <tr key={i} onClick={() => setSelectedProspect(p.name)} className="border-b border-slate-800/10 hover:bg-slate-800/30 transition-colors cursor-pointer group">
                            <td className="p-4"><span className="font-bold text-slate-100">{p.name}</span></td>
                            <td className="p-4 text-xs text-slate-400">{p.zone} — {p.specialty}</td>
                            <td className="p-4"><div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-md w-fit">{p.score}</div></td>
                            <td className="p-4" onClick={e => e.stopPropagation()}>
                              <select 
                                value={p.funnel} 
                                onChange={e => updateStatus(p.name, e.target.value)}
                                className="bg-transparent border-none text-xs font-bold focus:outline-none text-slate-300 cursor-pointer"
                              >
                                <option value="🛡️ SOURCÉ">🛡️ SOURCÉ</option>
                                <option value="🤝 RDV FIXÉ">🤝 RDV FIXÉ</option>
                                <option value="✅ CLIENT">✅ CLIENT</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'missions' && (
              <motion.div key="missions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col gap-6">
                 {missions.map((m, i) => (
                   <div key={i} className="glass p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black">{m.agent[0]}</div>
                        <div>
                          <h3 className="font-bold">{m.task}</h3>
                          <p className="text-xs text-slate-500">Agent: {m.agent} — {m.date}</p>
                        </div>
                      </div>
                      <div className="w-full sm:w-64">
                         <div className="flex justify-between mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                           <span>Progress</span>
                           <span>{m.progress}</span>
                         </div>
                         <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 glow-emerald transition-all duration-1000" style={{ width: m.progress }} />
                         </div>
                      </div>
                   </div>
                 ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* LOGS LIVE TERMINAL (Hidden on small mobile) */}
        <footer className="h-24 glass border-t border-slate-800/50 p-4 overflow-y-auto font-mono text-[10px] hidden sm:block">
           {logs.map((l, i) => (
             <div key={i} className="flex gap-2">
               <span className="text-emerald-500">[{l.category}]</span>
               <span className="text-slate-500">{l.details}</span>
             </div>
           ))}
        </footer>
      </main>

      {/* INSPECTEUR IMPÉRIAL 2.0 (Mobile Adaptive) */}
      <AnimatePresence>
        {selectedProspect && (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 w-full sm:w-[500px] h-full bg-[#0a0f19] border-l border-slate-800 glass z-[200] p-6 lg:p-8 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl lg:text-2xl font-black">{selectedProspect}</h2>
              <button onClick={() => setSelectedProspect(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"><X size={24} /></button>
            </div>
            <div className="flex flex-col gap-6">
              <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4">Profil Tactique</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="text-slate-500 uppercase tracking-tight">Potentiel Flux</div>
                  <div className="text-emerald-500 font-bold tracking-widest">ALPHA-9</div>
                  <div className="text-slate-500 uppercase tracking-tight">Secteur</div>
                  <div className="font-bold">FRANCE / IDF</div>
                </div>
              </div>
              <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 flex-1 overflow-y-auto min-h-[300px]">
                 <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4">Historique Synaptique</h4>
                 <p className="text-sm text-slate-400 leading-relaxed italic">
                    "Données chargées depuis le cache souverain. Les archives sont prêtes pour consultation hors-ligne."
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
