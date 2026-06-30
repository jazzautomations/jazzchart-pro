import { Song, ChordSymbol, MeasureMetadata } from './types';

export type { Song, ChordSymbol, MeasureMetadata };

// Canonical chromatic scale (sharps)
const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// Flats version
const CHROMATIC_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// All keys the user can select
export const ALL_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
];

/** Normalize any key name to a 0-11 semitone index */
function keyToSemitone(key: string): number {
  const idx = CHROMATIC_SHARP.indexOf(key);
  if (idx !== -1) return idx;
  const flatIdx = CHROMATIC_FLAT.indexOf(key);
  if (flatIdx !== -1) return flatIdx;
  return 0;
}

/** Convert MIDI-style note (0-11) to display using the same accidental style as the input */
function displayRoot(midi: number, preferFlats: boolean): string {
  return preferFlats ? CHROMATIC_FLAT[midi % 12] : CHROMATIC_SHARP[midi % 12];
}

function transposeRoot(root: string, semitones: number): string {
  const idx = CHROMATIC_SHARP.indexOf(root);
  if (idx === -1) {
    const flatIdx = CHROMATIC_FLAT.indexOf(root);
    if (flatIdx === -1) return root;
    return CHROMATIC_FLAT[(flatIdx + semitones + 12) % 12];
  }
  return CHROMATIC_SHARP[(idx + semitones + 12) % 12];
}

export function transposeChord(chord: ChordSymbol, semitones: number): ChordSymbol {
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;
  const root = match[1];
  const extension = match[2];
  return transposeRoot(root, semitones) + extension;
}

export function transposeMeasures(
  measures: ChordSymbol[][],
  fromKey: string,
  toKey: string
): ChordSymbol[][] {
  const fromSemi = keyToSemitone(fromKey);
  const toSemi = keyToSemitone(toKey);
  const semitones = (toSemi - fromSemi + 12) % 12;
  if (semitones === 0) return measures;

  return measures.map(measure =>
    measure.map(chord => transposeChord(chord, semitones))
  );
}

export function getKeyName(key: string): string {
  const keyNames: Record<string, string> = {
    'C': 'C Major', 'A': 'A Major', 'G': 'G Major', 'D': 'D Major',
    'E': 'E Major', 'F': 'F Major', 'B': 'B Major',
    'Db': 'D♭ Major', 'Eb': 'E♭ Major', 'Gb': 'G♭ Major',
    'Ab': 'A♭ Major', 'Bb': 'B♭ Major',
    'C#': 'C♯ Major', 'F#': 'F♯ Major',
    'Am': 'A Minor', 'Em': 'E Minor', 'Bm': 'B Minor',
    'F#m': 'F♯ Minor', 'C#m': 'C♯ Minor', 'G#m': 'G♯ Minor',
    'Dm': 'D Minor', 'Gm': 'G Minor', 'Cm': 'C Minor',
    'Fm': 'F Minor', 'Bbm': 'B♭ Minor', 'Ebm': 'E♭ Minor'
  };
  return keyNames[key] || key;
}
