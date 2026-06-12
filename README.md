# JazzChart Pro v11.2

**Elite Jazz Practice Station** — Backing tracks inteligentes, análise harmônica com IA, e editor de leadsheets.

## Quick Start

```bash
npm install
npm run dev
```

## Deploy na Vercel

1. Fork este repositório
2. Conecte na Vercel (import do GitHub)
3. Adicione a environment variable: `OPENROUTER_API_KEY`
4. Deploy!

## Features

- ✅ **Audio Engine 100% Client-Side** (Web Audio API)
  - Walking bass inteligente
  - Comping de piano Rhodes FM
  - Drubs brush stick com pink noise
  - Controle de mix (piano/bass/drums)

- ✅ **Transposição em tempo real** (todos os 12 tons)

- ✅ **Biblioteca de Standards** (All The Things You Are, Autumn Leaves, Blue Bossa, etc)

- ✅ **IA Harmony Assistant** (via OpenRouter - modelos gratuitos)
  - Análise de progressões ii-V-I
  - Sugestões de escalas
  - Rearmonizações

- ✅ **Editor de Charts** (clique em qualquer compasso para editar)

## Stack

- React 19 + TypeScript
- Vite 6
- Web Audio API (sintetizador FM + pink noise)
- OpenRouter API (LLM gratuito)
- Tailwind CSS (CDN)

## Environment Variables

```env
OPENROUTER_API_KEY=sk-or-v1-...
```

Get your free key at [openrouter.ai](https://openrouter.ai)

## License

MIT
