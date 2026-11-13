// Fonction serveur Vercel : appelle l'API Gemini sans exposer la clé au navigateur.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST uniquement" });
  const prompt = String((req.body && req.body.prompt) || "").slice(0, 3000);
  if (!prompt) return res.status(400).json({ error: "prompt manquant" });
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.8 },
        }),
      }
    );
    const d = await r.json();
    if (!r.ok) return res.status(502).json({ error: "erreur fournisseur" });
    const parts = (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || [];
    const text = parts.map(p => p.text || "").join("").trim();
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: "erreur serveur" });
  }
};
