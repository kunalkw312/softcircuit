export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key missing in Vercel settings' });
  }

  // Pointing to the "Flash-Lite" model for ultra-fast response
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-lite:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `Act as an expert engineering mentor. Generate exactly 5 innovative project ideas for: "${userInput}". 
            Format: **Project Title**: One short sentence description. 
            Keep it extremely concise to ensure fast generation.` 
          }] 
        }],
        generationConfig: {
          maxOutputTokens: 400,
          temperature: 0.7
        }
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
        return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
        throw new Error("Invalid response from Gemini");
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: 'Failed to reach Gemini API' });
  }
}
