
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Library } from './components/Library';
import { ChordGrid } from './components/ChordGrid';
import { LandingPage } from './components/LandingPage';
import { HarmonyChat } from './components/HarmonyChat';
import { Song, MeasureMetadata } from './types';
import { INITIAL_SONGS, STYLES } from './constants';
import { audioEngine } from './services/audioEngine';
import { generateSongFromTitle, generateSongFromImage } from './services/geminiService';
import { transposeMeasures, ALL_KEYS } from './services/transposition';
import { 
  Play, Square, SlidersHorizontal, PanelLeft, PanelRight,
  Clock, Hash, Wand2, Loader2, MessageSquareText, Activity,
  Maximize2, ChevronLeft, ChevronRight, Eye, EyeOff, Lock, X as XIcon
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('jazzchart_v11_songs');
    return saved ? JSON.parse(saved) : INITIAL_SONGS;
  });
  
  const [currentSong, setCurrentSong] = useState<Song>(songs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMeasure, setActiveMeasure] = useState<number>(-1);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  
  // UI States
  const [libOpen, setLibOpen] = useState(window.innerWidth > 1024);
  const [chatOpen, setChatOpen] = useState(false);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [volumes, setVolumes] = useState({ piano: 0.5, bass: 0.7, drums: 0.4 });

  useEffect(() => {
    localStorage.setItem('jazzchart_v11_songs', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    audioEngine.setOnBeat((m, b) => {
      setActiveMeasure(m);
      setCurrentBeat(b);
    });
  }, []);

  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
      setActiveMeasure(-1);
      setCurrentBeat(0);
    } else {
      await audioEngine.start(currentSong.measures, currentSong.tempo, currentSong.style);
      setIsPlaying(true);
    }
  }, [isPlaying, currentSong]);

  const updateCurrentSong = (updates: Partial<Song>) => {
    const updated = { ...currentSong, ...updates };
    setCurrentSong(updated as Song);
    setSongs(prev => prev.map(s => s.id === updated.id ? (updated as Song) : s));
    if (updated.measures) audioEngine.updateData(updated.measures as string[][]);
    if (updates.tempo) audioEngine.setTempo(updates.tempo);
    if (updates.style) audioEngine.setStyle(updates.style);
  };

  const handleApplyAnnotations = (annotations: any[]) => {
    const newMetadata = [...currentSong.metadata];
    annotations.forEach(ann => {
      const idx = ann.measureIndex;
      if (idx >= 0 && idx < newMetadata.length) {
        newMetadata[idx] = {
          ...newMetadata[idx],
          annotations: {
            color: ann.color,
            label: ann.label,
            scale: ann.scale
          }
        };
      }
    });
    updateCurrentSong({ metadata: newMetadata });
    setShowAnalysis(true);
  };

  const hasCurrentAnalysis = useMemo(() => {
    return currentSong.metadata.some(m => m.annotations && (m.annotations.label || m.annotations.scale || m.annotations.color));
  }, [currentSong]);

  if (view === 'landing') return <LandingPage onStart={() => setView('app')} />;

  return (
    <div className="flex h-screen bg-[#050507] text-slate-100 overflow-hidden select-none touch-none">
      {/* Sidebar Library */}
      <div className={`sidebar-transition h-full border-r border-white/5 bg-[#0a0a0c] z-50 absolute lg:relative ${libOpen ? 'w-full sm:w-80 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden'}`}>
        <Library 
          songs={songs} 
          onSelect={(s) => { 
            audioEngine.stop(); 
            setIsPlaying(false); 
            setCurrentSong(s); 
            setActiveMeasure(-1);
            if (window.innerWidth < 1024) setLibOpen(false);
          }} 
          onNew={() => {
             const ns: Song = { id: Date.now().toString(), title: 'Novo Chart', composer: 'User', style: 'Swing', key: 'C', tempo: 120, measures: Array(32).fill(['Cmaj7']), metadata: Array(32).fill({}), version: 1, author: 'User' };
             setSongs([ns, ...songs]); setCurrentSong(ns);
          }}
          onAISearch={async (t) => {
            setIsLoading(true);
            try {
              const data = await generateSongFromTitle(t);
              if (data.measures) {
                 const ns: Song = { id: Date.now().toString(), title: data.title || t, composer: data.composer || 'AI', style: 'Swing', key: data.key || 'C', tempo: data.tempo || 120, measures: data.measures as string[][], metadata: Array(data.measures.length).fill({}), version: 1, author: 'AI' };
                 setSongs([ns, ...songs]); setCurrentSong(ns);
              }
            } catch(e) {}
            setIsLoading(false);
          }}
          onAIImageImport={async (b, m) => {
            setIsLoading(true);
            try {
              const data = await generateSongFromImage(b, m);
              if (data.measures) {
                const ns: Song = { id: Date.now().toString(), title: data.title || 'AI Imported', composer: data.composer || 'AI OCR', style: 'Swing', key: data.key || 'C', tempo: data.tempo || 120, measures: data.measures as string[][], metadata: Array(data.measures.length).fill({}), version: 1, author: 'AI Vision' };
                setSongs([ns, ...songs]); setCurrentSong(ns);
              }
            } catch(e) {}
            setIsLoading(false);
          }}
        />
        <button onClick={() => setLibOpen(false)} className="lg:hidden absolute top-4 right-4 p-2 bg-white/5 rounded-full">
           <XIcon className="w-5 h-5" />
        </button>
      </div>

      <main className="flex-1 flex flex-col relative bg-[#050507] min-w-0">
        {/* Top Control Bar */}
        <header className="h-20 glass-panel px-4 sm:px-6 flex items-center justify-between z-40 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 sm:gap-5">
            <button onClick={() => setLibOpen(!libOpen)} className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 transition-colors">
              <PanelLeft className={`w-5 h-5 ${libOpen ? 'text-blue-500' : ''}`} />
            </button>
            
            <div className="hidden sm:block h-8 w-[1px] bg-white/10" />

            <button 
              onClick={handlePlay}
              className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl transition-all duration-300 ${isPlaying ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:scale-95'}`}
            >
              {isPlaying ? <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />}
            </button>
            
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3].map(b => (
                <div 
                  key={b} 
                  className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-150 ${Math.floor(currentBeat / 4) === b && isPlaying ? 'bg-blue-500 scale-150 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-white/10'}`} 
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             <button 
                onClick={() => hasCurrentAnalysis && setShowAnalysis(!showAnalysis)}
                disabled={!hasCurrentAnalysis}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all ${
                  !hasCurrentAnalysis 
                    ? 'opacity-30 cursor-not-allowed border-white/5 bg-white/5 text-slate-600' 
                    : showAnalysis 
                      ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                }`}
             >
                {!hasCurrentAnalysis ? <Lock className="w-4 h-4" /> : showAnalysis ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Análise</span>
             </button>

             <div className="flex items-center gap-1 sm:gap-2 bg-white/5 px-2 py-2 rounded-xl border border-white/5">
                <Hash className="w-3.5 h-3.5 text-blue-500 hidden xs:block" />
                <select 
                  value={currentSong.key}
                  onChange={(e) => {
                    const transposed = transposeMeasures(currentSong.measures, currentSong.key, e.target.value);
                    updateCurrentSong({ key: e.target.value, measures: transposed });
                  }}
                  className="bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-300 outline-none cursor-pointer"
                >
                  {ALL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
             </div>

             <button 
                onClick={() => setChatOpen(!chatOpen)}
                className={`p-2.5 rounded-xl transition-all ${chatOpen ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
             >
                <MessageSquareText className="w-5 h-5" />
             </button>

             <button 
               onClick={() => setMixerOpen(!mixerOpen)} 
               className={`p-2.5 rounded-xl transition-all ${mixerOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
             >
                <SlidersHorizontal className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 flex relative overflow-hidden touch-auto">
          {/* Main Chart Area */}
          <div className="flex-1 overflow-y-auto pt-8 sm:pt-12 pb-24 px-4 sm:px-8 scroll-smooth scrollbar-hide touch-pan-y">
            <div className="max-w-[900px] mx-auto transition-all duration-500">
               <div className="flex flex-col items-center mb-10 sm:mb-16 space-y-2">
                  <div className="bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-blue-500/20">
                    Live Performance Mode
                  </div>
                  <h1 className="text-4xl sm:text-7xl font-black text-white uppercase tracking-tighter text-center leading-none">{currentSong.title}</h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-widest text-center">{currentSong.composer} — Studio Edition v11</p>
               </div>

               <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <ChordGrid 
                    measures={currentSong.measures} 
                    metadata={currentSong.metadata}
                    activeMeasure={activeMeasure}
                    showAnalysis={showAnalysis && hasCurrentAnalysis}
                    onMeasureClick={(idx) => {
                      const input = prompt(`Editar Compasso ${idx + 1}:`, currentSong.measures[idx].join(' '));
                      if (input !== null) {
                        const newMeasures = [...currentSong.measures];
                        newMeasures[idx] = input.split(/\s+/).filter(c => c.length > 0);
                        updateCurrentSong({ measures: newMeasures });
                      }
                    }}
                  />
               </div>
            </div>
          </div>

          {/* Mixer Panel */}
          {mixerOpen && (
            <div className="absolute top-4 right-4 bottom-4 w-72 glass-panel rounded-2xl p-8 z-50 animate-in slide-in-from-right duration-300 shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Studio Mix</h3>
                <button onClick={() => setMixerOpen(false)} className="p-1.5 hover:bg-white/5 rounded-lg"><XIcon className="w-4 h-4" /></button>
              </div>
              <div className="space-y-12">
                  {(['piano', 'bass', 'drums'] as const).map(inst => (
                    <div key={inst} className="space-y-5">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        <span>{inst}</span>
                        <span className="text-blue-500 font-mono text-xs">{Math.round(volumes[inst] * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={volumes[inst]}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setVolumes(prev => ({ ...prev, [inst]: v }));
                          audioEngine.setVolume(inst, v);
                        }}
                        className="w-full"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Chat Panel */}
          <div className={`sidebar-transition border-l border-white/5 bg-[#0a0a0c] z-50 absolute lg:relative right-0 h-full ${chatOpen ? 'w-full sm:w-[400px] translate-x-0' : 'w-0 opacity-0 translate-x-full overflow-hidden'}`}>
             <HarmonyChat 
               song={currentSong} 
               onClose={() => setChatOpen(false)} 
               onApplyAnnotations={handleApplyAnnotations}
             />
          </div>
        </div>

        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center space-y-6">
            <div className="relative">
               <div className="absolute -inset-8 bg-blue-500/20 blur-3xl animate-pulse rounded-full" />
               <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative" />
            </div>
            <div className="text-center space-y-2 relative px-6">
               <p className="text-lg font-black uppercase tracking-widest text-white">Gemini AI Studio</p>
               <p className="text-xs text-blue-400 font-bold uppercase tracking-[0.4em] animate-pulse">Sintonizando harmonia...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
