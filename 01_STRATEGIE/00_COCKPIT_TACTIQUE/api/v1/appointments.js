export default async function handler(req, res) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(200).json([]);
  }

  try {
    // Les RDV sont filtrés depuis la table prospects (ceux qui ont le statut 'Rendez-vous fixé')
    const response = await fetch(`${SUPABASE_URL}/rest/v1/prospects?funnel=eq.Rendez-vous%20fixé&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const rdv = await response.json();
    
    // Formatage pour le frontend (Planning)
    const formatted = rdv.map(p => ({
        date: new Date().toISOString().split('T')[0], // Par défaut aujourd'hui si pas de date précise en DB
        time: "09:00",
        prospect: p.name,
        note: "RDV Synchronisé",
        status: "Confirmé"
    }));

    return res.status(200).json(formatted);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
