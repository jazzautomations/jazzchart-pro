
import React, { useState, useRef } from 'react';
import { Song } from '../types';
import { Search, Music, Plus, Sparkles, Filter, FileUp, MoreVertical, Star } from 'lucide-react';

interface LibraryProps {
  songs: Song[];
  onSelect: (song: Song) => void;
  onNew: () => void;
  onAISearch: (title: string) => void;
  onAIImageImport: (base64: string, mime: string) => void;
}

const STYLE_BADGES: Record<string, string> = {
  'Swing': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Bossa Nova': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Ballad': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Funk': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
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
    <div className="flex flex-col h-full bg-[#0a0a0c] overflow-hidden">
      <div className="p-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
            <Music className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase">Charts</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Studio Library</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar standards..." 
              className="w-full bg-white/5 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all placeholder:text-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onNew} className="flex items-center justify-center gap-2 bg-white text-black text-[11px] py-3 rounded-xl font-black uppercase hover:bg-slate-200 transition-all active:scale-95">
              <Plus className="w-4 h-4" /> Novo
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white text-[11px] py-3 rounded-xl font-black uppercase hover:bg-white/10 transition-all">
              <FileUp className="w-4 h-4" /> Import
            </button>
          </div>

          <button 
            onClick={() => onAISearch(search)}
            disabled={!search || isSearchingAI}
            className="w-full flex items-center justify-center gap-2 bg-blue-600/10 text-blue-400 border border-blue-400/20 text-[11px] py-3 rounded-xl font-black uppercase hover:bg-blue-600/20 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isSearchingAI ? 'animate-spin' : ''}`} /> 
            AI Generate Chart
          </button>
          
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-3 custom-scrollbar">
        <div className="flex items-center justify-between px-2 mb-4">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Database</span>
          <Filter className="w-3 h-3 text-slate-600" />
        </div>
        
        {filtered.map(song => (
          <button
            key={song.id}
            onClick={() => onSelect(song)}
            className="w-full text-left p-5 rounded-2xl hover:bg-white/[0.03] transition-all group border border-transparent hover:border-white/5 relative"
          >
            <div className="flex justify-between items-start mb-2">
               <p className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate uppercase tracking-tight">{song.title}</p>
               <Star className="w-3.5 h-3.5 text-slate-800 group-hover:text-yellow-500 transition-colors" />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-widest">{song.composer}</p>
              <span className={`text-[9px] px-2 py-0.5 rounded-md border font-black uppercase tracking-widest ${STYLE_BADGES[song.style] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'}`}>
                {song.style}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
