import React from 'react';
import { Music, Play, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-dvh bg-zinc-950 text-white flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mb-6">
          <Music className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-4xl font-black tracking-tight mb-2">
          JazzChart<span className="text-blue-500">Pro</span>
        </h1>
        
        <p className="text-zinc-500 text-sm mb-8 max-w-xs">
          Sua biblioteca de cifras com backing tracks inteligentes
        </p>
        
        <button 
          onClick={onStart}
          className="w-full max-w-xs py-4 bg-blue-500 rounded-2xl font-bold text-white flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors active:scale-95"
        >
          <Play className="w-5 h-5 fill-current" />
          Começar
        </button>
      </div>

      {/* Features */}
      <div className="px-6 pb-12 space-y-4">
        {[
          { title: 'Backing Tracks', desc: 'Walking bass, comping e bateria em tempo real' },
          { title: 'IA Generativa', desc: 'Gere cifras por nome ou importe fotos' },
          { title: 'Transposição', desc: 'Mude de tom instantaneamente' }
        ].map((f, i) => (
          <div key={i} className="flex items-start gap-4 p-4 bg-zinc-900 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
              <ChevronRight className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{f.title}</h3>
              <p className="text-xs text-zinc-500">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
