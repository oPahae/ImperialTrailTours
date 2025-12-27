export default async function handler(req, res) {
  const { prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: "Il faut fournir un prompt dans la query." });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}` // ta clé OpenRouter
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // modèle open-source disponible
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();

    // la réponse du modèle est généralement dans data.choices[0].message.content
    const aiResponse = data.choices?.[0]?.message?.content || "Pas de réponse.";

    res.status(200).json({ response: aiResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur ou problème API" });
  }
}