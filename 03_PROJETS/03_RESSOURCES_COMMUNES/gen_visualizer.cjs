const fs = require('fs');
const path = require('path');

const brainDir = "/Users/hachicha/.gemini/antigravity/brain/76698249-fe81-4156-97d9-4d077fda809b";
const outputHtml = "/Users/hachicha/Desktop/digital flux/02_INTELLIGENCE/NOS_AGENTS_D_ELITE/AGENT_DESIGNER/04_GALERIE_PNG_TOTALE/VISUALISEUR_SOUVERAIN.html";

const files = fs.readdirSync(brainDir).filter(f => f.endsWith('.png')).slice(0, 5);

let html = `<!DOCTYPE html><html><head><title>Visualiseur Souverain</title><style>body { background: #0b0e14; color: white; font-family: sans-serif; padding: 20px; } .card { background: #171c29; padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #333; } img { max-width: 100%; border-radius: 5px; }</style></head><body><h1>🎨 GALERIE SOUVERAINE (BASE64)</h1>`;

files.forEach(f => {
    try {
        const filePath = path.join(brainDir, f);
        const base64 = fs.readFileSync(filePath).toString('base64');
        html += `<div class="card"><h3>${f}</h3><img src="data:image/png;base64,${base64}"></div>`;
    } catch (e) {}
});

html += `</body></html>`;
fs.writeFileSync(outputHtml, html);
console.log("✅ Visualiseur Souverain généré avec succès.");
