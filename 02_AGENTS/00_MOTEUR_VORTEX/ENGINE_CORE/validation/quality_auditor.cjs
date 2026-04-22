const fs = require('fs');
const path = require('path');

/**
 * Moteur d'Audit de Qualité (V140 Sovereign)
 * Évalue un fichier Markdown sur 10 points.
 */
function auditFile(filePath, expectedSkillId = null) {
    if (!fs.existsSync(filePath)) return { score: 0, feedback: ["Fichier introuvable"] };

    const content = fs.readFileSync(filePath, 'utf8');
    let score = 10;
    let feedback = [];
    let tips = [];

    // 1. Détection de placeholders CRITIQUES
    const placeholders = content.match(/\[[A-Z_]+\]|<[A-Z_]+>|\{[A-Z_]+\}|\[INSERER\]/g);
    if (placeholders) {
        const uniquePlaceholders = [...new Set(placeholders)];
        score -= uniquePlaceholders.length * 1.5;
        feedback.push(`⚠️ Placeholders non remplis : ${uniquePlaceholders.join(', ')}`);
        tips.push("Vérifiez systématiquement les balises de type [NOM] avant livraison.");
    }

    // 2. Fidélité au Skill (V140)
    if (expectedSkillId && expectedSkillId !== "SKILL-GENERAL-SOP") {
        const skillCited = content.toLowerCase().includes(expectedSkillId.toLowerCase());
        if (!skillCited) {
            score -= 2;
            feedback.push(`❌ Non-respect du protocole : Skill ${expectedSkillId} non cité.`);
            tips.push(`L'usage et la citation du skill '${expectedSkillId}' de la Mine d'Or est obligatoire.`);
        }
    }

    // 3. Structure et Rendu Premium
    if (!content.includes('# ')) {
        score -= 2; feedback.push("❌ Titre H1 manquant.");
        tips.push("Chaque livrable doit avoir un titre principal clair (# Titre).");
    }
    if (!content.includes('> [!')) {
        score -= 0.5;
        feedback.push("🟡 Manque de relief visuel (GFM Alerts).");
        tips.push("Utilisez des blocs > [!TIP] ou > [!NOTE] pour rendre le contenu premium.");
    }

    // 4. Densité de l'expertise
    const words = content.split(/\s+/).length;
    if (words < 100) {
        score -= 2;
        feedback.push("📉 Expertise insuffisante (trop court).");
        tips.push("Développez davantage votre argumentation technique.");
    }

    return {
        score: Math.min(10, Math.max(0, parseFloat(score).toFixed(1))),
        feedback: feedback.length > 0 ? feedback : ["✨ Excellence opérationnelle : Aucun défaut majeur détecté."],
        tips: tips.length > 0 ? tips : ["Continuez sur ce standard de haute fidélité."]
    };
}

/**
 * Génère le badge de performance impérial
 */
function getQualityBadge(audit) {
    let color = audit.score >= 8 ? "🟢" : (audit.score >= 5 ? "🟡" : "🔴");
    let content = `\n---\n## ${color} PERFORMANCE ALPHA : ${audit.score}/10\n`;
    content += `### 📝 FEEDBACK\n${audit.feedback.map(f => `- ${f}`).join('\n')}\n`;
    content += `### 🏹 DIRECTIVES D'AMÉLIORATION\n${audit.tips.map(t => `> [!TIP]\n> ${t}`).join('\n')}\n`;
    content += `---\n`;
    return content;
}

if (require.main === module) {
    const target = process.argv[2];
    if (target) {
        const result = auditFile(target);
        console.log(getQualityBadge(result));
    }
}

module.exports = { auditFile, getQualityBadge };
