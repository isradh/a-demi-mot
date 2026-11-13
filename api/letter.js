// Fonction serveur Vercel : appelle l'API Mistral sans exposer la clé au navigateur.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST uniquement" });
  const prompt = String((req.body && req.body.prompt) || "").slice(0, 3000);
  if (!prompt) return res.status(400).json({ error: "prompt manquant" });
  try {
    const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.MISTRAL_API_KEY,
      },
      body: JSON.stringify({
        model: process.env.MISTRAL_MODEL || "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    const d = await r.json();
    if (!r.ok) return res.status(502).json({ error: "erreur fournisseur" });
    const text = ((d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || "").trim();
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: "erreur serveur" });
  }
};
