export default async function handler(req, res) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(200).json({ name: "CEO HUB", type: "ROOT", children: [] });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/agents?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const agents = await response.json();
    
    // Reconstruction de la hiérarchie pour le frontend
    const poles = {};
    agents.forEach(a => {
      if (!poles[a.pole]) poles[a.pole] = [];
      poles[a.pole].push({
        name: a.name,
        type: "AGENT",
        status: a.status || "Online",
        expertise: a.expertise || "NIVEAU 5"
      });
    });

    const hierarchy = {
      name: "CEO HUB",
      type: "ROOT",
      children: Object.keys(poles).map(p => ({
        name: p,
        type: "POLE",
        children: poles[p]
      }))
    };

    return res.status(200).json(hierarchy);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
