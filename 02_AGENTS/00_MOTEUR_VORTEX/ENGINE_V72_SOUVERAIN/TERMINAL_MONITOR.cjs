const fs = require('fs');
const hub = require('./REGISTRY_HUB.cjs');

function renderMonitor() {
    process.stdout.write('\x1Bc');
    try {
        const { pulse, traces } = hub.getFullContext();
        
        console.log("================================================================================");
        console.log("   🛰️  DIGITAL FLUX : HUB SOUVERAIN COMMAND CENTER v70 - LIVE MONITOR");
        console.log("================================================================================\n");

        console.log("💎 ÉTAT DES AGENTS (HUB SYNC) :");
        Object.keys(pulse).sort().slice(0, 11).forEach(ag => {
            const data = pulse[ag];
            const status = data.status === "ACTIVE" ? "🟢 ACTIF  " : "🔴 STANDBY";
            console.log(` | ${ag.replace('AGENT_', '').padEnd(15, ' ')} | ${status} | ⚡ ${data.mission.substring(0, 30).padEnd(30, ' ')} | ${data.current_action}`);
        });

        console.log("\n--------------------------------------------------------------------------------");
        console.log("🚀 MISSIONS EN COURS (DERNIÈRES ACTIONS) :");
        const ids = Object.keys(traces).slice(-5).reverse();
        ids.forEach(id => {
            const history = traces[id].history;
            if (history && history.length > 0) {
                const last = history[history.length - 1];
                console.log(` | ${id.padEnd(25, ' ')} | ${last.step.padEnd(10, ' ')} | ${last.status.substring(0, 35)}`);
            }
        });

        console.log("\n================================================================================");
        console.log(` 🕒 SYNC : ${new Date().toLocaleTimeString()} | 🛡️  HUB V70 CONNECTÉ`);
        console.log("================================================================================");
    } catch (e) {
        console.log("⚠️  Attente de synchronisation du Hub...");
    }
}

setInterval(renderMonitor, 3000);
renderMonitor();
