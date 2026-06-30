import { Song } from '../types';

const API_BASE = '/api';

export async function chatWithHarmony(
  song: Song,
  message: string,
  history: { role: 'user' | 'assistant', content: string }[]
): Promise<{ text: string; annotations?: any[] }> {
  const systemPrompt = `You are a jazz harmony expert assistant. The current chart is "${song.title}" in ${song.key}.
Current chord progression: ${song.measures.slice(0, 8).map((m, i) => `M${i + 1}: ${m.join(' → ')}`).join(', ')}...

Help the user understand jazz harmony. Be concise but educational.
If analyzing progressions, you can suggest fingerings, scales, or substitutions.

When suggesting annotations, format them as:
ANNOTATIONS: [{"measureIndex": 0, "color": "#3b82f622", "label": "ii-V", "scale": "D Dorian"}]

Use colors like: #3b82f622 (blue), #10b98122 (green), #f59e0b22 (yellow), #ef444422 (red)`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.map(h => ({
      role: h.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: h.content
    })),
    { role: 'user' as const, content: message }
  ];

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, max_tokens: 1000, temperature: 0.7 })
    });

    if (!response.ok) {
      throw new Error('Chat API error');
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || 'Sorry, I could not process that.';
    
    // Extract annotations if present
    const annotationsMatch = text.match(/ANNOTATIONS:\s*(\[[\s\S]*?\])/);
    let annotations = undefined;
    if (annotationsMatch) {
      try {
        annotations = JSON.parse(annotationsMatch[1]);
      } catch {
        // Invalid JSON, ignore
      }
    }
    
    // Remove annotations from displayed text
    const cleanText = text.replace(/ANNOTATIONS:\s*\[[\s\S]*?\]/, '').trim();
    
    return { text: cleanText, annotations };
  } catch (error) {
    console.error('Chat error:', error);
    return { text: 'Sorry, there was an error processing your request.' };
  }
}

export async function generateSongFromTitle(title: string): Promise<Partial<Song>> {
  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });

    if (!response.ok) {
      throw new Error('Generate API error');
    }

    const data = await response.json();
    return {
      title: data.title || title,
      composer: data.composer || 'Unknown',
      key: data.key || 'C',
      tempo: data.tempo || 120,
      style: data.style || 'Swing',
      measures: data.measures || []
    };
  } catch (error) {
    console.error('Generate error:', error);
    throw error;
  }
}

export async function generateSongFromImage(base64Data: string, mimeType: string): Promise<Partial<Song>> {
  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Imported from image`,
        image: base64Data,
        mimeType
      })
    });

    if (!response.ok) throw new Error('Image generate API error');

    const data = await response.json();
    return {
      title: data.title || 'Imported Chart',
      composer: data.composer || 'OCR Import',
      key: data.key || 'C',
      tempo: data.tempo || 120,
      style: data.style || 'Swing',
      measures: data.measures || [['Cmaj7'], ['Dm7'], ['G7'], ['Cmaj7']]
    };
  } catch (error) {
    console.error('Image import error:', error);
    return {
      title: 'Imported Chart',
      composer: 'OCR Import',
      key: 'C',
      tempo: 120,
      style: 'Swing',
      measures: [['Cmaj7'], ['Dm7'], ['G7'], ['Cmaj7']]
    };
  }
}
