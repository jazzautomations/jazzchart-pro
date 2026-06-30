import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.JAZZCHART_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

function checkAuth(req: VercelRequest, res: VercelResponse): boolean {
  if (!API_KEY) return true;
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return false;
  }
  if (auth.slice(7) !== API_KEY) {
    res.status(403).json({ error: 'Invalid API key' });
    return false;
  }
  return true;
}

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!checkAuth(req, res)) return;

  if (!OPENROUTER_KEY) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });
  }

  const { title } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Title required' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jazzchart-pro.vercel.app',
        'X-Title': 'JazzChart Pro'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: `You are a jazz music expert. Generate accurate chord charts for jazz standards.
Return ONLY valid JSON with this exact structure:
{
  "title": "Song Title",
  "composer": "Composer Name",
  "key": "Key (e.g., Bb, F, C)",
  "tempo": 120,
  "style": "Swing",
  "measures": [["Bb7", "Eb7"], ["Bb7", "Bb7"], ...]
}

For measures, use jazz chord notation. Each measure should have 1-2 chords.
Common patterns: ii-V-I, rhythm changes, blues progressions.
Be accurate to the real jazz standard. If uncertain, use a typical bebop progression.`
          },
          {
            role: 'user',
            content: `Generate the complete chord chart for "${title}". Return ONLY the JSON object, no markdown or explanation.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      return res.status(response.status).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/\n?```/g, '');
      }

      const songData = JSON.parse(cleanContent);

      if (!songData.measures || !Array.isArray(songData.measures)) {
        throw new Error('Invalid response structure');
      }

      return res.status(200).json(songData);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }
  } catch (error) {
    console.error('Generate error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
