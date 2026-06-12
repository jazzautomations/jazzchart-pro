
import React, { useEffect, useRef } from 'react';
import { ChordSymbol, MeasureMetadata } from '../types';

interface ChordGridProps {
  measures: ChordSymbol[][];
  metadata: MeasureMetadata[];
  onMeasureClick?: (index: number) => void;
  activeMeasure?: number;
  showAnalysis?: boolean;
}

const getJazzSymbol = (ext: string) => {
  let s = ext;
  // Substituições de qualidade Jazz
  s = s.replace(/maj7|M7|maj/g, 'Δ');
  s = s.replace(/m7b5|ø|ø7/g, 'ø7');
  s = s.replace(/m7|min7|-7/g, '-7');
  s = s.replace(/m/g, '-');
  s = s.replace(/dim7|o7/g, '°7');
  s = s.replace(/o7/g, '°7');
  s = s.replace(/7alt/g, '7alt');
  
  // Substituição de acidentes para glifos musicais reais
  s = s.replace(/b/g, '♭').replace(/#/g, '♯');
  
  return s;
};

const formatChord = (chord: string, size: 'large' | 'small' = 'large') => {
  // Regex para capturar nota fundamental e acidente opcional
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;
  
  // Formata a tônica com símbolos bonitos
  const root = match[1].replace('b', '♭').replace('#', '♯');
  const ext = getJazzSymbol(match[2]);

  const rootClass = size === 'large' ? 'text-6xl md:text-7xl' : 'text-4xl md:text-5xl';
  const extClass = size === 'large' ? 'text-3xl md:text-4xl' : 'text-2xl';
  const offsetClass = size === 'large' ? '-top-6' : '-top-4';

  return (
    <span className="flex items-baseline gap-1">
      <span className={`chord-root ${rootClass} text-[#1a1a1e] tracking-tighter`}>{root}</span>
      <span className={`chord-ext ${extClass} text-[#3a3a3e] relative ${offsetClass} font-bold`}>{ext}</span>
    </span>
  );
};

export const ChordGrid: React.FC<ChordGridProps> = ({ measures, metadata, onMeasureClick, activeMeasure, showAnalysis = true }) => {
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (activeMeasure !== undefined && activeMeasure !== -1 && measureRefs.current[activeMeasure]) {
      measureRefs.current[activeMeasure]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeMeasure]);

  return (
    <div className="sheet-paper border border-slate-200 overflow-hidden min-h-[1000px] py-12 px-8">
      <div className="grid grid-cols-4 border-t-[1.5px] border-l-[1.5px] border-[#2a2a2e]/20">
        {measures.map((chords, idx) => {
          const meta = metadata?.[idx];
          const ann = showAnalysis ? meta?.annotations : undefined;
          const isActive = activeMeasure === idx;

          return (
            <div 
              key={idx}
              ref={(el) => (measureRefs.current[idx] = el)}
              onClick={() => onMeasureClick?.(idx)}
              style={{ 
                backgroundColor: ann?.color || (isActive ? '#f0f7ff' : 'transparent'),
                boxShadow: isActive ? 'inset 0 0 0 2px #3b82f6' : 'none'
              }}
              className={`
                relative h-44 border-r-[1.5px] border-b-[1.5px] border-[#2a2a2e]/20 transition-all cursor-pointer
                flex flex-col items-center justify-center group
                ${isActive ? 'z-20' : 'hover:bg-slate-50/80'}
              `}
            >
              {/* Harmonic Label (Top) */}
              {ann?.label && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#1a1a1e] rounded text-[9px] font-black uppercase text-white tracking-widest shadow-sm">
                  {ann.label.replace('b', '♭').replace('#', '♯')}
                </div>
              )}

              {/* Section Marker */}
              {meta?.section && (
                <div className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 bg-[#1a1a1e] rounded-md shadow-md z-10">
                   <span className="text-white font-black text-lg">{meta.section}</span>
                </div>
              )}

              {/* Repeats */}
              {meta?.repeatStart && (
                <div className="absolute left-0 top-0 bottom-0 w-3 border-l-[4px] border-[#1a1a1e] flex flex-col justify-center items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-[#1a1a1e] rounded-full" />
                   <div className="w-1.5 h-1.5 bg-[#1a1a1e] rounded-full" />
                </div>
              )}
              {meta?.repeatEnd && (
                <div className="absolute right-0 top-0 bottom-0 w-3 border-r-[4px] border-[#1a1a1e] flex flex-col justify-center items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-[#1a1a1e] rounded-full" />
                   <div className="w-1.5 h-1.5 bg-[#1a1a1e] rounded-full" />
                </div>
              )}

              {/* Chord Icons / Display */}
              <div className={`transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {chords.length === 1 ? (
                  formatChord(chords[0], 'large')
                ) : (
                  <div className="flex items-center gap-6">
                    {formatChord(chords[0], 'small')}
                    <div className="w-[1.5px] h-14 bg-[#1a1a1e]/30 rotate-[25deg]" />
                    {formatChord(chords[1], 'small')}
                  </div>
                )}
              </div>

              {/* Scale Suggestion (Bottom) */}
              {ann?.scale && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                   <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                     {ann.scale.replace('b', '♭').replace('#', '♯')}
                   </span>
                </div>
              )}

              {/* Compasso Num */}
              <span className="absolute top-2 right-3 text-[10px] font-mono font-black text-[#1a1a1e]/10 group-hover:text-[#1a1a1e]/30 transition-colors">
                #{idx + 1}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Footer metadata */}
      <div className="mt-12 pt-8 border-t border-[#1a1a1e]/10 flex justify-between items-center opacity-50">
         <span className="text-[10px] font-black uppercase tracking-[0.5em]">JazzChart Pro v11.2 • Digital Lead Sheet</span>
         <span className="text-[10px] font-black uppercase tracking-[0.5em]">System ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
      </div>
    </div>
  );
};
