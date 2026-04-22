export default async function handler(req, res) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  // Sécurité : Si les clés ne sont pas là, on prévient l'utilisateur au lieu de mettre des fakes
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ 
      error: "Variables d'environnement SUPABASE manquantes sur Vercel.",
      help: "Ajoutez SUPABASE_URL et SUPABASE_ANON_KEY dans vos paramètres Vercel."
    });
  }

  const API_URL = `${SUPABASE_URL}/rest/v1/prospects`;

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${API_URL}?select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { name, newStatus } = req.body;
      const response = await fetch(`${API_URL}?name=eq.${encodeURIComponent(name)}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ funnel: newStatus })
      });
      const data = await response.json();
      return res.status(200).json(data);
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  res.status(405).end();
}
