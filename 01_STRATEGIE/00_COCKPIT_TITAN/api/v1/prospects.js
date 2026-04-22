export default async function handler(req, res) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: "Variables SUPABASE manquantes" });
  }
  const API_URL = `${SUPABASE_URL}/rest/v1/prospects`;
  try {
    if (req.method === 'GET') {
      const response = await fetch(`${API_URL}?select=*`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });
      const data = await response.json();
      return res.status(200).json(data);
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
