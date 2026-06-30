import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.JAZZCHART_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

function checkAuth(req: VercelRequest, res: VercelResponse): boolean {
  if (!API_KEY) return true; // no key configured = open (dev mode)
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

  const { messages, max_tokens = 2000, temperature = 0.7 } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
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
        messages,
        max_tokens,
        temperature
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      return res.status(response.status).json({ error: 'AI service error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
