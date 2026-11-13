// Fonction serveur Vercel : appelle l'API Gemini sans exposer la clé au navigateur.
// Astuce : ouvrir /api/letter dans le navigateur lance un test de diagnostic.
async function appelGemini(prompt, maxTokens) {
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY || "",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.8 },
      }),
    }
  );
  const d = await r.json().catch(() => ({}));
  const parts = (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || [];
  return {
    model,
    ok: r.ok,
    status: r.status,
    text: parts.map(p => p.text || "").join("").trim(),
    erreur: d.error && d.error.message,
  };
}

module.exports = async (req, res) => {
  if (req.method === "GET") {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        diagnostic: "CLE ABSENTE",
        aide: "La variable GEMINI_API_KEY n'est pas vue par le site. Vérifiez son nom, puis redéployez.",
      });
    }
    const t = await appelGemini("Réponds juste : bonjour", 1500).catch(e => ({ erreur: String(e) }));
    return res.status(200).json({ diagnostic: t.ok ? "OK" : "ERREUR", ...t });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "POST uniquement" });
  const prompt = String((req.body && req.body.prompt) || "").slice(0, 3000);
  if (!prompt) return res.status(400).json({ error: "prompt manquant" });
  try {
    const t = await appelGemini(prompt, 1500);
    if (!t.ok || !t.text) return res.status(502).json({ error: t.erreur || "réponse vide" });
    return res.status(200).json({ text: t.text });
  } catch (e) {
    return res.status(500).json({ error: "erreur serveur" });
  }
};
