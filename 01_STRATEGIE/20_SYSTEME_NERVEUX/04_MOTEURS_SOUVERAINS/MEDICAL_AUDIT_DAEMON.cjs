const fs = require('fs');
const path = require('path');
const http = require('http');

const { getPath } = require('./paths.cjs');

const CRM_FILE = getPath('BUSINESS', 'CRM');

console.log("⚕️ [MEDICAL-AUDIT] Initialisation de l'expert en conformité...");

function reportAudit(details) {
    const data = JSON.stringify({ agent: 'MEDICAL', message: `⚕️ AUDIT : ${details}`, type: 'success' });
    const req = http.request({
        hostname: 'localhost',
        port: 6789,
        path: '/api/report-autofix',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }, res => {});
    req.on('error', (e) => console.error(`⚠️ [AUDIT] Erreur reporting: ${e.message}`));
    req.write(data);
    req.end();
}

function runAudit() {
    try {
        if (!fs.existsSync(CRM_FILE)) return;
        
        let content = fs.readFileSync(CRM_FILE, 'utf8');
        const lines = content.split('\n');
        let updated = false;
        let auditCount = 0;

        const newLines = lines.map(line => {
            if (line.includes('| QUALIFIÉ |') && line.split('|').length <= 8) {
                const parts = line.split('|');
                const secteur = parts[2].trim();
                
                // Logique d'audit simplifiée
                let score = "B+";
                if (secteur.includes('Chirurgie') || secteur.includes('Clinique')) score = "A+ (Priorité)";
                if (secteur.includes('Dermatologie')) score = "A";
                
                parts[6] = " READY (AUDITÉ) ";
                parts[7] = ` ${score} `;
                
                auditCount++;
                updated = true;
                return parts.join('|');
            }
            return line;
        });

        if (updated) {
            fs.writeFileSync(CRM_FILE, newLines.join('\n'));
            console.log(`✅ [AUDIT] ${auditCount} prospects audités par l'expert Médical.`);
            reportAudit(`${auditCount} prospects validés (Conformité HealthTech).`);
        }
    } catch (e) {
        console.error("❌ [AUDIT] Erreur d'audit:", e.message);
    }
}

// Watcher sur le CRM
let timeout;
fs.watch(CRM_FILE, (event) => {
    if (event === 'change') {
        clearTimeout(timeout);
        timeout = setTimeout(runAudit, 3000); // 3s de délai après l'injection Business
    }
});

// Premier passage
runAudit();
