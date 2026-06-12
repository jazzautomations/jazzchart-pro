import { Song, ChordSymbol, MeasureMetadata } from './types';

export type { Song, ChordSymbol, MeasureMetadata };

// Transpose chord roots
const CHORD_ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const ALL_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
];

function transposeRoot(root: string, semitones: number): string {
  const sharps = CHORD_ROOTS.includes(root);
  const flats = FLAT_ROOTS.includes(root);
  
  let index: number;
  if (sharps) {
    index = CHORD_ROOTS.indexOf(root);
  } else if (flats) {
    index = FLAT_ROOTS.indexOf(root);
  } else {
    return root;
  }
  
  const newIndex = (index + semitones + 12) % 12;
  return sharps ? CHORD_ROOTS[newIndex] : FLAT_ROOTS[newIndex];
}

export function transposeChord(chord: ChordSymbol, semitones: number): ChordSymbol {
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;
  
  const root = match[1];
  const extension = match[2];
  
  const newRoot = transposeRoot(root, semitones);
  return newRoot + extension;
}

export function transposeMeasures(
  measures: ChordSymbol[][],
  fromKey: string,
  toKey: string
): ChordSymbol[][] {
  // Calculate semitone difference
  const fromIndex = CHORD_ROOTS.indexOf(fromKey.replace('b', '#').replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#').replace('Ab', 'G#').replace('Bb', 'A#')) 
    || FLAT_ROOTS.indexOf(fromKey) || 0;
  const toIndex = CHORD_ROOTS.indexOf(toKey.replace('b', '#').replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#').replace('Ab', 'G#').replace('Bb', 'A#')) 
    || FLAT_ROOTS.indexOf(toKey) || 0;
  
  // Handle flats properly
  const fromNorm = fromKey.includes('b') && !FLAT_ROOTS.includes(fromKey) ? 
    FLAT_ROOTS.indexOf(fromKey.replace('b', FLAT_ROOTS[FLAT_ROOTS.findIndex(k => k.includes(fromKey[0])) + 1 > 11 ? 0 : FLAT_ROOTS.findIndex(k => k.includes(fromKey[0])) + 1])) : 
    CHORD_ROOTS.indexOf(fromKey) !== -1 ? CHORD_ROOTS.indexOf(fromKey) : FLAT_ROOTS.indexOf(fromKey);
    
  const toNorm = toKey.includes('b') && !FLAT_ROOTS.includes(toKey) ?
    FLAT_ROOTS.indexOf(toKey) :
    CHORD_ROOTS.indexOf(toKey) !== -1 ? CHORD_ROOTS.indexOf(toKey) : FLAT_ROOTS.indexOf(toKey);
  
  const semitones = (toNorm - fromNorm + 12) % 12;
  
  return measures.map(measure =>
    measure.map(chord => transposeChord(chord, semitones))
  );
}

// Key signature utilities
export function getKeyName(key: string): string {
  const keyNames: Record<string, string> = {
    'C': 'C Major',
    'A': 'A Major',
    'G': 'G Major',
    'D': 'D Major',
    'E': 'E Major',
    'F': 'F Major',
    'B': 'B Major',
    'Db': 'D♭ Major',
    'Eb': 'E♭ Major',
    'Gb': 'G♭ Major',
    'Ab': 'A♭ Major',
    'Bb': 'B♭ Major',
    'C#': 'C♯ Major',
    'F#': 'F♯ Major',
    'Am': 'A Minor',
    'Em': 'E Minor',
    'Bm': 'B Minor',
    'F#m': 'F♯ Minor',
    'C#m': 'C♯ Minor',
    'G#m': 'G♯ Minor',
    'Dm': 'D Minor',
    'Gm': 'G Minor',
    'Cm': 'C Minor',
    'Fm': 'F Minor',
    'Bbm': 'B♭ Minor',
    'Ebm': 'E♭ Minor'
  };
  return keyNames[key] || key;
}
