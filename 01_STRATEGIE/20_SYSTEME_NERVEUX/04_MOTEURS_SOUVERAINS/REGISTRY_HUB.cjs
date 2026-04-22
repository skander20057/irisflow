const { getPath } = require('./paths.cjs');
const fs = require('fs');
const path = require('path');

// --- 🛡️ SANCTUAIRE V108 TYRANT ---
const REGISTRY_DIR = getPath('COMMAND', 'REGISTRE');
const PULSE_PATH = path.join(REGISTRY_DIR, "PULSE_DATA.json");
const TRACES_PATH = path.join(REGISTRY_DIR, "MISSION_TRACES.json");

if (!fs.existsSync(REGISTRY_DIR)) fs.mkdirSync(REGISTRY_DIR, { recursive: true });

function readJsonWithRetry(filePath, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            if (!fs.existsSync(filePath)) return {};
            const content = fs.readFileSync(filePath, 'utf8');
            if (!content || content.trim() === "") return {};
            return JSON.parse(content);
        } catch (e) {
            if (i === retries - 1) return {};
            const start = Date.now(); while (Date.now() - start < 30) {} 
        }
    }
    return {};
}

function writeJsonAtomic(filePath, data) {
    try {
        const tmp = filePath + ".tmp";
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
        fs.renameSync(tmp, filePath);
    } catch (e) {}
}

function getFullContext() {
    return { 
        pulse: readJsonWithRetry(PULSE_PATH), 
        traces: readJsonWithRetry(TRACES_PATH) 
    };
}

function updatePulse(agent, data) {
    try {
        const { pulse } = getFullContext();
        pulse[agent] = { ...data, last_ping: Date.now() };
        writeJsonAtomic(PULSE_PATH, pulse);
    } catch (e) {}
}

function addTrace(missionId, step, status, agent) {
    try {
        const { traces } = getFullContext();
        if (!traces[missionId]) {
            traces[missionId] = {
                metadata: { start: Date.now(), label: missionId },
                history: []
            };
        }
        traces[missionId].history.push({
            time: Date.now(),
            step: step,
            status: status,
            agent: agent
        });
        writeJsonAtomic(TRACES_PATH, traces);
    } catch (e) {}
}

function updateMetadata(missionId, label, archived = false, client = null) {
    try {
        const { traces } = getFullContext();
        if (traces[missionId]) {
            if (label) traces[missionId].metadata.label = label;
            if (archived) traces[missionId].metadata.archived = true;
            if (client) traces[missionId].metadata.client = client;
            writeJsonAtomic(TRACES_PATH, traces);
        }
    } catch (e) {}
}

function purgeRegistry() {
    try {
        writeJsonAtomic(PULSE_PATH, {});
        writeJsonAtomic(TRACES_PATH, {});
        console.log("💎 [HUB V108] Registre TYRAN Purifié. Démarrage de l'Autorité Unique.");
    } catch (e) {}
}

module.exports = { getFullContext, updatePulse, addTrace, updateMetadata, purgeRegistry };
