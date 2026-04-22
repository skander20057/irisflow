const { addTrace } = require('./REGISTRY_HUB.cjs');

/**
 * Logue un point de passage pour une mission spécifique via le Hub Souverain.
 */
function logTrace(missionId, step, status, agent = "SOUVERAIN") {
    addTrace(missionId, step, status, agent);
}

/**
 * Cleanup différé (géré par le Hub dans le futur si besoin)
 */
function cleanupTraces() {
    // La logique de nettoyage sera centralisée dans le Hub V70.5
}

module.exports = { logTrace, cleanupTraces };
