import React, { useState, useRef } from 'react';
import { Song } from '../types';
import { Search, Music, Plus, Sparkles, FileUp } from 'lucide-react';

interface LibraryProps {
  songs: Song[];
  onSelect: (song: Song) => void;
  onNew: () => void;
  onAISearch: (title: string) => void;
  onAIImageImport: (base64: string, mime: string) => void;
}

const STYLE_BADGES: Record<string, string> = {
  'Swing': 'bg-blue-500/10 text-blue-400',
  'Bossa Nova': 'bg-emerald-500/10 text-emerald-400',
  'Ballad': 'bg-purple-500/10 text-purple-400',
  'Funk': 'bg-orange-500/10 text-orange-400',
};

export const Library: React.FC<LibraryProps> = ({ songs, onSelect, onNew, onAISearch, onAIImageImport }) => {
  const [search, setSearch] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = songs.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSearchingAI(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      await onAIImageImport(base64, file.type);
      setIsSearchingAI(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar standards..." 
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button onClick={onNew} className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-xs py-2.5 rounded-xl font-bold hover:bg-zinc-200 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> Novo
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 text-white text-xs py-2.5 rounded-xl font-bold hover:bg-zinc-700 transition-all">
            <FileUp className="w-4 h-4" /> Import
          </button>
        </div>

        <button 
          onClick={() => onAISearch(search)}
          disabled={!search || isSearchingAI}
          className="w-full flex items-center justify-center gap-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs py-2.5 rounded-xl font-bold hover:bg-purple-500/20 transition-all disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isSearchingAI ? 'animate-spin' : ''}`} /> 
          Gerar com IA
        </button>
        
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
      </div>

      {/* Song List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        {filtered.map(song => (
          <button
            key={song.id}
            onClick={() => onSelect(song)}
            className="w-full text-left p-3 rounded-xl hover:bg-zinc-800/80 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-bold text-white truncate text-sm">{song.title}</p>
                <p className="text-xs text-zinc-500 truncate">{song.composer}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 ${STYLE_BADGES[song.style] || 'bg-zinc-800 text-zinc-400'}`}>
                {song.style}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
