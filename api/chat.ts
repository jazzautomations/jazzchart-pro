import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.JAZZCHART_API_KEY;
const OPENCODE_KEY = process.env.OPENCODE_ZEN_API_KEY;

function checkAuth(req: VercelRequest, res: VercelResponse): boolean {
  if (!API_KEY) return true; // no auth in dev
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

  const { messages, max_tokens = 4000, temperature = 0.7 } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
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
        messages,
        max_tokens,
        temperature
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenCode Zen error:', error);
      return res.status(response.status).json({ error: 'AI service error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
