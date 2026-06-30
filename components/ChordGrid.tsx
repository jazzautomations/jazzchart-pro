import React, { useEffect, useRef } from 'react';
import { ChordSymbol, MeasureMetadata } from '../types';

interface ChordGridProps {
  measures: ChordSymbol[][];
  metadata: MeasureMetadata[];
  onMeasureClick?: (index: number) => void;
  activeMeasure?: number;
  showAnalysis?: boolean;
  loopStart?: number;
  loopEnd?: number;
}

const getJazzSymbol = (ext: string) => {
  let s = ext;
  s = s.replace(/maj7|M7|maj/g, 'Δ');
  s = s.replace(/m7b5|ø|ø7/g, 'ø7');
  s = s.replace(/m7|min7|-7/g, '-7');
  s = s.replace(/m(?![aj])/g, '-');
  s = s.replace(/dim7|o7/g, '°7');
  s = s.replace(/7alt/g, '7alt');
  s = s.replace(/b/g, '♭').replace(/#/g, '♯');
  return s;
};

const formatChord = (chord: string) => {
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return <span className="text-lg font-bold text-zinc-700">{chord}</span>;
  
  const root = match[1].replace('b', '♭').replace('#', '♯');
  const ext = getJazzSymbol(match[2]);

  return (
    <span className="flex items-baseline">
      <span className="chord-root text-2xl sm:text-3xl text-zinc-800">{root}</span>
      <span className="chord-ext text-sm sm:text-base text-zinc-500 -ml-0.5">{ext}</span>
    </span>
  );
};

export const ChordGrid: React.FC<ChordGridProps> = ({ 
  measures, 
  metadata, 
  onMeasureClick, 
  activeMeasure, 
  showAnalysis = true,
  loopStart,
  loopEnd
}) => {
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
    <div className="sheet-paper overflow-hidden">
      <div className="grid grid-cols-4 sm:grid-cols-8 border-t border-l border-zinc-200">
        {measures.map((chords, idx) => {
          const meta = metadata?.[idx];
          const ann = showAnalysis ? meta?.annotations : undefined;
          const isActive = activeMeasure === idx;
          const inLoop = loopStart !== undefined && loopEnd !== undefined && idx >= loopStart && idx <= loopEnd;

          return (
            <div 
              key={idx}
              ref={(el) => (measureRefs.current[idx] = el)}
              onClick={() => onMeasureClick?.(idx)}
              className={`
                relative py-3 sm:py-4 px-1 border-r border-b border-zinc-200
                flex flex-col items-center justify-center
                transition-colors cursor-pointer min-h-[60px] sm:min-h-[70px]
                ${isActive ? 'bg-blue-50 ring-2 ring-inset ring-blue-500 z-10' : ''}
                ${inLoop && !isActive ? 'bg-zinc-50' : ''}
                ${!isActive ? 'hover:bg-zinc-50' : ''}
              `}
            >
              {/* Section marker */}
              {meta?.section && (
                <div className="absolute top-1 left-1 w-5 h-5 bg-zinc-800 rounded flex items-center justify-center z-10">
                  <span className="text-white text-[10px] font-bold">{meta.section}</span>
                </div>
              )}

              {/* Repeat start */}
              {meta?.repeatStart && (
                <div className="absolute left-0 top-0 bottom-0 w-1 border-l-2 border-zinc-800" />
              )}

              {/* Repeat end */}
              {meta?.repeatEnd && (
                <div className="absolute right-0 top-0 bottom-0 w-1 border-r-2 border-zinc-800" />
              )}

              {/* Analysis label */}
              {ann?.label && (
                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 px-1 py-0.5 bg-zinc-800 rounded text-[8px] font-bold text-white">
                  {ann.label.replace('b', '♭').replace('#', '♯')}
                </div>
              )}

              {/* Chords */}
              <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                {chords.length === 1 ? (
                  formatChord(chords[0])
                ) : (
                  <div className="flex items-center gap-2">
                    {formatChord(chords[0])}
                    <div className="w-px h-8 bg-zinc-300 rotate-12" />
                    {formatChord(chords[1])}
                  </div>
                )}
              </div>

              {/* Scale suggestion */}
              {ann?.scale && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 px-1 py-0.5 bg-blue-100 rounded text-[8px] font-bold text-blue-700">
                  {ann.scale.replace('b', '♭').replace('#', '♯')}
                </div>
              )}

              {/* Measure number */}
              <span className="absolute bottom-0.5 right-1 text-[8px] text-zinc-300 font-mono">
                {idx + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
