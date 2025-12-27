export default async function handler(req, res) {
    const { data, prompt } = req.query;

    const getGeminiResponse = async () => {
        const contextPrompt = data + ". Voici ma question : " + prompt;

        try {
            const result = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDJ49GNALALd_oV8nzAQcXL3gZ3_JnBFRs`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: "user",
                                parts: [{ text: contextPrompt }],
                            },
                        ],
                    }),
                }
            );

            const gemini = await result.json();
            console.log("Gemini raw response:", gemini);

            if (gemini.candidates && gemini.candidates[0]?.content?.parts?.[0]?.text) {
                return gemini.candidates[0].content.parts[0].text;
            } else {
                return "Je vous prie de m'excuser, mais je rencontre des difficultés pour traiter votre demande actuellement. Veuillez réessayer ou nous contacter directement à l'adresse lam.bahae7@gmail.com";
            }
        } catch (err) {
            console.error("Error:", err);
            return "Je rencontre des difficultés techniques. Veuillez nous contacter à l'adresse lam.bahae7@gmail.com pour une assistance immédiate.";
        }
    };

    const aiResponse = await getGeminiResponse();

    return res.status(200).json({ success: true, response: aiResponse });
}