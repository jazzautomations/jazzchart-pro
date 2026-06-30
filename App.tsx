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
  Play, Square, Loader2, X as XIcon,
  BookOpen, SlidersHorizontal, MessageSquare,
  ChevronUp, ChevronDown, Music
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
  
  // Bottom sheet states
  const [libOpen, setLibOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [volumes, setVolumes] = useState({ piano: 0.5, bass: 0.7, drums: 0.4 });

  // Loop state
  const [loopStart, setLoopStart] = useState<number | undefined>(undefined);
  const [loopEnd, setLoopEnd] = useState<number | undefined>(undefined);
  const [loopMode, setLoopMode] = useState(false);

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

  const handleMeasureClick = (idx: number) => {
    if (loopMode) {
      if (loopStart === undefined) {
        setLoopStart(idx);
        setLoopEnd(undefined);
      } else if (loopEnd === undefined) {
        if (idx >= loopStart) {
          setLoopEnd(idx);
        } else {
          setLoopStart(idx);
          setLoopEnd(undefined);
        }
      } else {
        setLoopStart(idx);
        setLoopEnd(undefined);
      }
    }
  };

  const clearLoop = () => {
    setLoopStart(undefined);
    setLoopEnd(undefined);
    setLoopMode(false);
  };

  const hasCurrentAnalysis = useMemo(() => {
    return currentSong.metadata.some(m => m.annotations && (m.annotations.label || m.annotations.scale || m.annotations.color));
  }, [currentSong]);

  if (view === 'landing') return <LandingPage onStart={() => setView('app')} />;

  return (
    <div className="flex flex-col h-dvh bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-3 shrink-0">
        <button 
          onClick={() => setLibOpen(true)}
          className="p-2 -ml-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <BookOpen className="w-5 h-5 text-zinc-400" />
        </button>
        
        <div className="flex-1 text-center px-4">
          <h1 className="text-sm font-bold text-white truncate">{currentSong.title}</h1>
          <p className="text-[10px] text-zinc-500 truncate">{currentSong.composer}</p>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => hasCurrentAnalysis && setShowAnalysis(!showAnalysis)}
            disabled={!hasCurrentAnalysis}
            className={`p-2 rounded-lg transition-colors ${
              !hasCurrentAnalysis 
                ? 'opacity-30' 
                : showAnalysis 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-zinc-500 hover:bg-zinc-800'
            }`}
          >
            <span className="text-[10px] font-bold">ANÁLISE</span>
          </button>
          
          <button 
            onClick={() => setMixerOpen(true)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto px-2 pt-3 pb-2">
          <ChordGrid 
            measures={currentSong.measures}
            metadata={currentSong.metadata}
            activeMeasure={activeMeasure}
            showAnalysis={showAnalysis && hasCurrentAnalysis}
            onMeasureClick={handleMeasureClick}
            loopStart={loopStart}
            loopEnd={loopEnd}
          />
        </div>

        {/* Bottom toolbar */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 flex items-center justify-between px-3">
          {/* Play/Stop */}
          <button 
            onClick={handlePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isPlaying 
                ? 'bg-red-500 text-white' 
                : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
            }`}
          >
            {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {/* Tempo */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => updateCurrentSong({ tempo: Math.max(40, currentSong.tempo - 5) })}
              className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="text-center min-w-[50px]">
              <div className="text-lg font-bold text-white leading-none">{currentSong.tempo}</div>
              <div className="text-[8px] text-zinc-500 font-bold">BPM</div>
            </div>
            <button 
              onClick={() => updateCurrentSong({ tempo: Math.min(300, currentSong.tempo + 5) })}
              className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Transpose */}
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1">
            <button 
              onClick={() => {
                const idx = ALL_KEYS.indexOf(currentSong.key);
                if (idx > 0) {
                  const newKey = ALL_KEYS[idx - 1];
                  const transposed = transposeMeasures(currentSong.measures, currentSong.key, newKey);
                  updateCurrentSong({ key: newKey, measures: transposed });
                }
              }}
              className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white min-w-[24px] text-center">{currentSong.key}</span>
            <button 
              onClick={() => {
                const idx = ALL_KEYS.indexOf(currentSong.key);
                if (idx < ALL_KEYS.length - 1) {
                  const newKey = ALL_KEYS[idx + 1];
                  const transposed = transposeMeasures(currentSong.measures, currentSong.key, newKey);
                  updateCurrentSong({ key: newKey, measures: transposed });
                }
              }}
              className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Loop */}
          <button 
            onClick={() => loopMode ? clearLoop() : setLoopMode(true)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              loopMode ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {loopMode && loopStart !== undefined && loopEnd !== undefined 
              ? `${loopStart + 1}-${loopEnd + 1}`
              : 'LOOP'
            }
          </button>

          {/* Chat */}
          <button 
            onClick={() => setChatOpen(true)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <div className="text-center">
            <p className="text-sm font-bold text-white">Gerando com IA</p>
            <p className="text-xs text-zinc-500">Analisando harmonia...</p>
          </div>
        </div>
      )}

      {/* Bottom sheet: Library */}
      {libOpen && (
        <div className="absolute inset-0 z-40" onClick={() => setLibOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div 
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-zinc-900 rounded-t-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-blue-500" />
                <h2 className="text-sm font-bold text-white">Biblioteca</h2>
              </div>
              <button onClick={() => setLibOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <XIcon className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
              <Library 
                songs={songs}
                onSelect={(s) => {
                  audioEngine.stop();
                  setIsPlaying(false);
                  setCurrentSong(s);
                  setActiveMeasure(-1);
                  setLibOpen(false);
                }}
                onNew={() => {
                  const ns: Song = { 
                    id: Date.now().toString(), 
                    title: 'Novo Chart', 
                    composer: 'User', 
                    style: 'Swing', 
                    key: 'C', 
                    tempo: 120, 
                    measures: Array(32).fill(['Cmaj7']), 
                    metadata: Array(32).fill({}), 
                    version: 1, 
                    author: 'User' 
                  };
                  setSongs([ns, ...songs]); 
                  setCurrentSong(ns);
                  setLibOpen(false);
                }}
                onAISearch={async (t) => {
                  setIsLoading(true);
                  try {
                    const data = await generateSongFromTitle(t);
                    if (data.measures) {
                      const ns: Song = { 
                        id: Date.now().toString(), 
                        title: data.title || t, 
                        composer: data.composer || 'AI', 
                        style: 'Swing', 
                        key: data.key || 'C', 
                        tempo: data.tempo || 120, 
                        measures: data.measures as string[][], 
                        metadata: Array(data.measures.length).fill({}), 
                        version: 1, 
                        author: 'AI' 
                      };
                      setSongs([ns, ...songs]); 
                      setCurrentSong(ns);
                    }
                  } catch(e) {}
                  setIsLoading(false);
                }}
                onAIImageImport={async (b, m) => {
                  setIsLoading(true);
                  try {
                    const data = await generateSongFromImage(b, m);
                    if (data.measures) {
                      const ns: Song = { 
                        id: Date.now().toString(), 
                        title: data.title || 'Importado', 
                        composer: data.composer || 'OCR', 
                        style: 'Swing', 
                        key: data.key || 'C', 
                        tempo: data.tempo || 120, 
                        measures: data.measures as string[][], 
                        metadata: Array(data.measures.length).fill({}), 
                        version: 1, 
                        author: 'OCR' 
                      };
                      setSongs([ns, ...songs]); 
                      setCurrentSong(ns);
                    }
                  } catch(e) {}
                  setIsLoading(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom sheet: Mixer */}
      {mixerOpen && (
        <div className="absolute inset-0 z-40" onClick={() => setMixerOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div 
            className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-white">Mix</h3>
              <button onClick={() => setMixerOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <XIcon className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <div className="space-y-6">
              {(['piano', 'bass', 'drums'] as const).map(inst => (
                <div key={inst} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 capitalize">{inst}</span>
                    <span className="text-blue-500 font-mono">{Math.round(volumes[inst] * 100)}%</span>
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
        </div>
      )}

      {/* Bottom sheet: Chat */}
      {chatOpen && (
        <div className="absolute inset-0 z-40" onClick={() => setChatOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div 
            className="absolute bottom-0 left-0 right-0 h-[70vh] bg-zinc-900 rounded-t-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <HarmonyChat 
              song={currentSong} 
              onClose={() => setChatOpen(false)}
              onApplyAnnotations={handleApplyAnnotations}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
