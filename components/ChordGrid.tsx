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
  s = s.replace(/m7|min7|-7/g, '−7');
  s = s.replace(/m(?![aj])/g, '−');
  s = s.replace(/dim7|o7/g, '°7');
  s = s.replace(/7alt/g, '7alt');
  s = s.replace(/b/g, '♭').replace(/#/g, '♯');
  return s;
};

const formatChord = (chord: string) => {
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return <span className="font-bold text-zinc-800">{chord}</span>;

  const root = match[1].replace('b', '♭').replace('#', '♯');
  const ext = getJazzSymbol(match[2]);

  return (
    <span className="flex items-baseline leading-none">
      <span className="chord-root text-[1.6rem] sm:text-[2rem] text-zinc-900">{root}</span>
      {ext && <span className="chord-ext text-xs sm:text-sm text-zinc-500 ml-px">{ext}</span>}
    </span>
  );
};

const formatChordSmall = (chord: string) => {
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return <span className="font-bold text-zinc-800 text-sm">{chord}</span>;

  const root = match[1].replace('b', '♭').replace('#', '♯');
  const ext = getJazzSymbol(match[2]);

  return (
    <span className="flex items-baseline leading-none">
      <span className="chord-root text-lg sm:text-xl text-zinc-900">{root}</span>
      {ext && <span className="chord-ext text-[10px] sm:text-xs text-zinc-500 ml-px">{ext}</span>}
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

  // Group measures into rows of 4
  const rows: { chords: ChordSymbol[]; meta: MeasureMetadata | undefined; idx: number }[][] = [];
  for (let i = 0; i < measures.length; i += 4) {
    rows.push(
      measures.slice(i, i + 4).map((chords, j) => ({
        chords,
        meta: metadata?.[i + j],
        idx: i + j,
      }))
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex border-b border-zinc-200 last:border-b-0">
          {row.map(({ chords, meta, idx }) => {
            const ann = showAnalysis ? meta?.annotations : undefined;
            const isActive = activeMeasure === idx;
            const inLoop = loopStart !== undefined && loopEnd !== undefined && idx >= loopStart && idx <= loopEnd;

            return (
              <div
                key={idx}
                ref={(el) => (measureRefs.current[idx] = el)}
                onClick={() => onMeasureClick?.(idx)}
                className={`
                  relative flex-1 flex flex-col items-center justify-center
                  py-4 sm:py-5 px-1 min-h-[72px] sm:min-h-[80px]
                  border-r border-zinc-200 last:border-r-0
                  transition-colors cursor-pointer select-none
                  ${isActive ? 'bg-blue-50 ring-2 ring-inset ring-blue-500 z-10' : ''}
                  ${inLoop && !isActive ? 'bg-yellow-50/60' : ''}
                  ${!isActive ? 'active:bg-zinc-100' : ''}
                `}
              >
                {/* Section marker */}
                {meta?.section && (
                  <div className="absolute top-1 left-1 w-5 h-5 bg-zinc-800 rounded flex items-center justify-center z-10">
                    <span className="text-white text-[9px] font-bold">{meta.section}</span>
                  </div>
                )}

                {/* Repeat marks */}
                {meta?.repeatStart && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-zinc-800" />
                )}
                {meta?.repeatEnd && (
                  <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-zinc-800" />
                )}

                {/* Analysis label */}
                {ann?.label && (
                  <div className="absolute top-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-zinc-800 rounded text-[8px] font-bold text-white whitespace-nowrap">
                    {ann.label.replace('b', '♭').replace('#', '♯')}
                  </div>
                )}

                {/* Chord display */}
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {chords.length === 1 ? (
                    formatChord(chords[0])
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {formatChordSmall(chords[0])}
                      <div className="w-px h-6 bg-zinc-300 rotate-12 shrink-0" />
                      {formatChordSmall(chords[1])}
                    </div>
                  )}
                </div>

                {/* Scale suggestion */}
                {ann?.scale && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 px-1 py-0.5 bg-blue-100 rounded text-[7px] font-bold text-blue-700 whitespace-nowrap">
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
      ))}
    </div>
  );
};
