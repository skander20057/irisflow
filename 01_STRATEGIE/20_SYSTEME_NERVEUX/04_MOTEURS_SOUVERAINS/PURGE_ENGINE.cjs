const { getPath } = require('./paths.cjs');
const fs = require('fs');
const path = require('path');

const path = require('path'); const TRACE_PATH = path.join(getPath('COMMAND', 'REGISTRE'), 'MISSION_TRACES.json');

function purge() {
    try {
        if (!fs.existsSync(TRACE_PATH)) return;
        const traces = JSON.parse(fs.readFileSync(TRACE_PATH, 'utf8'));
        let changes = false;

        for (let id in traces) {
            const seen = new Set();
            const originalLength = traces[id].history.length;
            traces[id].history = traces[id].history.filter(log => {
                const key = `${log.step}-${log.agent}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            if (traces[id].history.length !== originalLength) changes = true;
        }

        if (changes) {
            fs.writeFileSync(TRACE_PATH, JSON.stringify(traces, null, 2));
            const now = new Date().toLocaleTimeString();
            console.log(`🧹 [PURGE_ENGINE] ${now} - Registre des traces optimisé.`);
        }
    } catch (e) {
        console.error("⚠️ [PURGE_ERR]", e.message);
    }
}

// Purge toutes les 5 minutes
setInterval(purge, 300000);
purge();
