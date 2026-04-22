const { turboScrape } = require('../04_TECH/ENGINE_V72_SOUVERAIN/AGENT_BUSINESS_TURBO_ENGINE.cjs');
const fs = require('fs');

const targets = [
  {"name": "Dr Souha NASRI", "url": "https://www.med.tn/medecin/dentiste/tunis/dr-souha-nasri-29697.html"},
  {"name": "Dr Kais MASMOUDI", "url": "https://www.med.tn/medecin/orthodontiste/tunis/dr-kais-masmoudi-29185.html"},
  {"name": "Dr Yosr EL MABROUK", "url": "https://www.med.tn/medecin/rhumatologue/tunis/dr-yosr-el-mabrok-228226.html"},
  {"name": "Dr Fatma HOUISSA", "url": "https://www.med.tn/medecin/gastro-enterologue/tunis/dr-fatma-houissa-29007.html"},
  {"name": "Mme Ameni ESSALAH", "url": "https://www.med.tn/medecin/kinesitherapeute/tunis/mme-ameni-essalah-205282.html"},
  {"name": "Dr Zied LAJILI", "url": "https://www.med.tn/medecin/ophtalmologiste/tunis/dr-zied-lajili-223206.html"},
  {"name": "Dr Mohamed anis HAMMAMI", "url": "https://www.med.tn/medecin/ophtalmologiste/tunis/dr-mohamed-anis-hammami-188561.html"},
  {"name": "Dr Leila BOUHAMED KARRAY", "url": "https://www.med.tn/medecin/medecin-esthetique/tunis/dr-leila-bouhamed-karray-29192.html"},
  {"name": "Mme Haciba OUERFELLI", "url": "https://www.med.tn/medecin/kinesitherapeute/tunis/mme-haciba-ouerfelli-227520.html"},
  {"name": "Dr Dorra FAKHFAKH", "url": "https://www.med.tn/medecin/laboratoire-danalyses-de-biologie-medicale/tunis/dr-dorra-fakhfakh-23930.html"},
  {"name": "Dr Yassine MESSAOUDI", "url": "https://www.med.tn/medecin/dentiste/tunis/dr-yassine-messaoudi-228575.html"},
  {"name": "Dr Hassen DAKHLAOUI", "url": "https://www.med.tn/medecin/orthodontiste/tunis/dr-hassen-dakhlaoui-209956.html"},
  {"name": "Dr Sameh BEN HLIMA REBAI", "url": "https://www.med.tn/medecin/gastro-enterologue/tunis/dr-sameh-ben-hlima-rebai-28910.html"},
  {"name": "Dr Dalila BOUSLIMI", "url": "https://www.med.tn/medecin/dermatologue/tunis/dr-dalila-bouslimi-29351.html"},
  {"name": "Dr Ahmed amine LAHMAR", "url": "https://www.med.tn/medecin/chirurgien-orthopediste-traumatologue/tunis/dr-ahmed-amine-lahmar-225151.html"},
  {"name": "Dr Karima EL AYECH GAALOUL", "url": "https://www.med.tn/medecin/dentiste/tunis/dr-karima-el-ayech-gaaloul-13827.html"},
  {"name": "Dr Rezaiek CHEIKH", "url": "https://www.med.tn/medecin/pneumologue/tunis/dr-rezaiek-cheikh-14434.html"},
  {"name": "Pr Selma LONGO", "url": "https://www.med.tn/medecin/pediatre/tunis/pr-selma-longo-31015.html"},
  {"name": "Dr Wafa TRIKI BOUGUERRA", "url": "https://www.med.tn/medecin/ophtalmologiste/tunis/dr-wafa-triki-bouguerra-30999.html"},
  {"name": "Mme Rim LACHIHEB BARBOUCH", "url": "https://www.med.tn/medecin/kinesitherapeute/tunis/mme-rim-lachiheb-barbouch-227519.html"},
  {"name": "Dr Rayan ARFAOUI", "url": "https://www.med.tn/medecin/dentiste/tunis/dr-rayan-arfaoui-227361.html"},
  {"name": "Dr Nadia EZZINE SEBAI", "url": "https://www.med.tn/medecin/endocrinologue-diabetologue/tunis/dr-nadia-ezzine-sebai-29210.html"},
  {"name": "Dr Selim BOUZGUENDA", "url": "https://www.med.tn/medecin/gynecologue-obstetricien/tunis/dr-selim-bouzguenda-28987.html"},
  {"name": "Dr Fatma MASMOUDI", "url": "https://www.med.tn/medecin/pediatre/tunis/dr-fatma-masmoudi-29388.html"},
  {"name": "Dr Kamel KHARDANI", "url": "https://www.med.tn/medecin/oto-rhino-laryngologiste-orl/tunis/dr-kamel-khardani-29008.html"},
  {"name": "Dr Meriem BEN MANSOUR", "url": "https://www.med.tn/medecin/gynecologue-obstetricien/tunis/dr-metier-ben-mansour-223155.html"},
  {"name": "Dr Amel BEN ROMDHANE", "url": "https://www.med.tn/medecin/generaliste/tunis/dr-amel-ben-romdhane-29267.html"},
  {"name": "Dr Hela BEN SALEM", "url": "https://www.med.tn/medecin/endocrinologue-diabetologue/tunis/dr-hela-ben-salem-29001.html"},
  {"name": "Dr Ines BEN ABDALLAH", "url": "https://www.med.tn/medecin/gynecologue-obstetricien/tunis/dr-ines-ben-abdallah-29023.html"}
];

async function execute() {
    const results = await turboScrape("Aouina", "Médecin", 30, targets);
    fs.writeFileSync('scratch/AOUINA_HYPER_REPORT.json', JSON.stringify(results, null, 2));
    console.log(`🎉 Mission Aouina Terminée. ${results.length} résultats générés.`);
}

execute();
