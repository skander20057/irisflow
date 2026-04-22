const fs = require('fs');
const path = require('path');

const images = [
    {
        src: "/Users/hachicha/.gemini/antigravity/brain/9e61e833-ba79-486f-9590-443a6122bb63/digital_flux_v50_hierarchy_map_1776387472494.png",
        dest: "01_STRATEGIE/LIVRABLES_CEO/00_ASSETS_VISUELS/HIERARCHIE_V50_3D.png"
    },
    {
        src: "/Users/hachicha/.gemini/antigravity/brain/9e61e833-ba79-486f-9590-443a6122bb63/digital_flux_v50_vortex_logo_concept_1776388309188.png",
        dest: "01_STRATEGIE/LIVRABLES_CEO/00_ASSETS_VISUELS/LOGO_VORTEX_V50.png"
    }
];

images.forEach(img => {
    try {
        if (fs.existsSync(img.src)) {
            fs.copyFileSync(img.src, img.dest);
            console.log(`✅ SUCCESS: Moved ${path.basename(img.src)} to ${img.dest}`);
        } else {
            console.error(`❌ ERROR: Source not found: ${img.src}`);
        }
    } catch (e) {
        console.error(`❌ ERROR: Failed to copy ${path.basename(img.src)}: ${e.message}`);
    }
});
