export default function handler(req, res) {
  // Mock des 103 prospects pour le déploiement cloud immédiat
  const mockProspects = Array.from({ length: 103 }, (_, i) => ({
    name: `Prospect Alpha ${i + 1}`,
    tel: `+216 55 000 ${String(i).padStart(3, '0')}`,
    specialty: i % 3 === 0 ? "Cardiologie" : (i % 3 === 1 ? "Dentaire" : "Généraliste"),
    zone: i % 2 === 0 ? "Tunis" : "Sousse",
    score: `${70 + (i % 30)}%`,
    funnel: i % 10 === 0 ? "✅ CLIENT" : (i % 5 === 0 ? "🤝 RDV FIXÉ" : "🛡️ SOURCÉ"),
    site: "digital-flux.app"
  }));

  if (req.method === 'GET') {
    return res.status(200).json(mockProspects);
  }

  if (req.method === 'POST') {
    // Dans une version réelle, ici on écrirait dans une DB (Supabase/Atlas)
    return res.status(200).json({ success: true, message: "Sync Live Simulation active" });
  }

  res.status(405).end();
}
