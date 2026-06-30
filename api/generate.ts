import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.JAZZCHART_API_KEY;
const OPENCODE_KEY = process.env.OPENCODE_ZEN_API_KEY;

function checkAuth(req: VercelRequest, res: VercelResponse): boolean {
  if (!API_KEY) return true;
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ') || auth.slice(7) !== API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!checkAuth(req, res)) return;

  if (!OPENCODE_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { title } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Title required' });
  }

  try {
    const response = await fetch('https://opencode.ai/zen/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENCODE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash-free',
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
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenCode Zen error:', error);
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
