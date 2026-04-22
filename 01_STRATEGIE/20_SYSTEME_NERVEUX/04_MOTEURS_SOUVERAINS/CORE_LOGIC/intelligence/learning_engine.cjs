const fs = require('fs');
const path = require('path');
const { getPath } = require('../../paths.cjs');

const MEMORY_PATH = path.join(getPath('COMMAND', 'REGISTRE'), 'SYNAPTIC_MEMORY.json');
const MAX_SYNAPSES = 50; // Garde-fou pour éviter le gonflement

/**
 * Apprend d'une mission terminée avec succès.
 */
function learnFromSuccess(agentId, topic, context, score) {
    try {
        if (score < 9) return; // Seul le top du top nourrit l'apprentissage auto

        let memory = [];
        if (fs.existsSync(MEMORY_PATH)) {
            memory = JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8'));
        }

        // Création de la nouvelle synapse
        const newSynapse = {
            id: `SYN-AUTO-${Date.now()}`,
            timestamp: new Date().toISOString(),
            scope: "AGENT_" + agentId.replace('AGENT_', '').toUpperCase(),
            agent_id: agentId,
            topic: topic,
            lesson: `Succès validé (Score ${score}/10) : Consolider l'approche basée sur ${context.substring(0, 100)}...`,
            status: "AUTO_GENERATED"
        };

        // Ajout et rotation (Sécurité anti-bloat)
        memory.unshift(newSynapse);
        if (memory.length > MAX_SYNAPSES) memory = memory.slice(0, MAX_SYNAPSES);

        // Écriture atomique (Sécurité anti-corruption)
        const tempPath = MEMORY_PATH + '.tmp';
        fs.writeFileSync(tempPath, JSON.stringify(memory, null, 2));
        fs.renameSync(tempPath, MEMORY_PATH);

        console.log(`🧠 [LEARNING_ENGINE] Nouvelle synapse générée pour ${agentId} (Score: ${score})`);
    } catch (e) {
        console.error("⚠️ [LEARNING_ENGINE_ERR]", e.message);
    }
}

/**
 * Apprend d'un feedback explicite du CEO (via chat/log)
 */
function learnFromCEOFlow(scope, topic, instruction) {
    try {
        let memory = [];
        if (fs.existsSync(MEMORY_PATH)) {
            memory = JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8'));
        }

        const newSynapse = {
            id: `SYN-CEO-${Date.now()}`,
            timestamp: new Date().toISOString(),
            scope: scope.toUpperCase(), // GLOBAL ou AGENT_XX
            agent_id: "CEO_DIRECTIVE",
            topic: topic,
            lesson: instruction,
            status: "APPROVED"
        };

        memory.unshift(newSynapse);
        if (memory.length > MAX_SYNAPSES) memory = memory.slice(0, MAX_SYNAPSES);

        fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2));
        console.log(`👑 [LEARNING_ENGINE] Directive CEO apprise : ${topic}`);
    } catch (e) {
        console.error("⚠️ [LEARNING_ENGINE_CEO_ERR]", e.message);
    }
}

module.exports = { learnFromSuccess, learnFromCEOFlow };
