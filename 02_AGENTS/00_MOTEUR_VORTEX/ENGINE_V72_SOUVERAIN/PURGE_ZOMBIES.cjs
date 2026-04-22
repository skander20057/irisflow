const { execSync } = require('child_process');

console.log("🔥 [EXORCISME] Lancement de la purge des fantômes...");

try {
    // Liste des PIDs identifiés comme zombies
    const zombies = [19340, 19348, 21883, 22131, 22454, 22734, 22833, 18230, 18273, 19006, 19045];
    
    zombies.forEach(pid => {
        try {
            process.kill(pid, 'SIGKILL');
            console.log(`✅ [KILL] PID ${pid} exterminé.`);
        } catch(e) {
            console.log(`⚠️ [ECHEC] PID ${pid} résiste (${e.message})`);
        }
    });

} catch(e) {
    console.error("❌ [ERREUR_PURGE]", e.message);
}

console.log("⌛ [FIN_EXORCISME] Passage à la Phase 2 : Le Bouclier de Plomb.");
process.exit(0);
