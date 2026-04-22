const fs = require('fs');
const path = require('path');

/**
 * 🎨 ASSET_FACTORY : Usine Créative IA
 * Génère l'identité visuelle de base pour un nouveau projet.
 */

const SPECIALTIES_CONFIG = {
    'dentiste': { primary: '#10b981', secondary: '#0a192f', keywords: ['teeth', 'clinic', 'modern', 'dentistry'] },
    'implant': { primary: '#10b981', secondary: '#051122', keywords: ['implant', 'surgery', 'prestige', 'high-tech'] },
    'ophtalmo': { primary: '#3b82f6', secondary: '#0a192f', keywords: ['vision', 'eye', 'laser', 'precision'] },
    'cardio': { primary: '#ef4444', secondary: '#0f172a', keywords: ['heart', 'pulse', 'medical', 'lifeline'] },
    'default': { primary: '#6366f1', secondary: '#0f172a', keywords: ['medical', 'prestige', 'service', 'premium'] }
};

function generateIdentity(spec) {
    const s = spec.toLowerCase();
    const config = Object.values(SPECIALTIES_CONFIG).find((val, key) => s.includes(key)) || SPECIALTIES_CONFIG.default;
    
    return {
        palette: {
            primary: config.primary,
            secondary: config.secondary,
            accent: '#ffffff',
            glass: 'rgba(255, 255, 255, 0.05)'
        },
        imagePrompts: [
            `Ultra-premium ${config.keywords.join(' ')} showcase, dark medical luxury, cinematic lighting, 8k resolution`,
            `Close-up of high-tech medical equipment for ${s}, professional studio lighting, emerald and navy accents`,
            `Abstract medical background with ${config.primary} glow particles, minimalist elite design`
        ]
    };
}

function runAssetFactory(projectPath, spec) {
    const identity = generateIdentity(spec);
    const assetPath = path.join(projectPath, 'ASSETS_IDENTITY.json');
    const brandingPath = path.join(projectPath, 'BRANDING.md');

    const brandingContent = `# Identité Visuelle Elite : ${path.basename(projectPath)}

## 🎨 Palette de Couleurs (Protocole Souverain)
- **Primaire** : \`${identity.palette.primary}\` (Glow Actif)
- **Secondaire** : \`${identity.palette.secondary}\` (Fond Profond)
- **Verre** : \`${identity.palette.glass}\` (Backdrop Filter 20px)

## 📸 Ordres de Création IA (Prompts)
${identity.imagePrompts.map((p, i) => `-   **Visual ${i+1}** : ${p}`).join('\n')}

---
*Généré automatiquement par ASSET_FACTORY.cjs*
`;

    if (!fs.existsSync(projectPath)) fs.mkdirSync(projectPath, { recursive: true });
    
    fs.writeFileSync(assetPath, JSON.stringify(identity, null, 2));
    fs.writeFileSync(brandingPath, brandingContent);
    
    console.log(`🎨 [ASSET_FACTORY] Identité générée pour ${path.basename(projectPath)} dans BRANDING.md`);
    return identity;
}

module.exports = { runAssetFactory };
