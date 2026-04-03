export default async function handler(req, res) {
  // Only allow POST requests for security
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; // This stays hidden on Vercel's servers

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API Key missing' });
  }

  const prompt = `Generate a list of 5 innovative engineering project ideas for: "${userInput}". For each, provide a bold title and a short one-sentence description. Use professional language.`;

  try {
    // Calling Gemini 1.5 Flash for better performance
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-lite:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: 'Failed to communicate with Gemini API' });
  }
}
