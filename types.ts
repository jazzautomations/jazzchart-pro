export type ChordSymbol = string;

export interface MeasureAnnotation {
  color?: string;
  label?: string;
  scale?: string;
}

export interface MeasureMetadata {
  section?: string;
  repeatStart?: boolean;
  repeatEnd?: boolean;
  annotations?: MeasureAnnotation;
}

export interface Song {
  id: string;
  title: string;
  composer: string;
  style: string;
  key: string;
  tempo: number;
  measures: ChordSymbol[][];
  metadata: MeasureMetadata[];
  version: number;
  author: string;
}

export interface AIAnalysis {
  suggestions: string[];
  chordSubstitutions: Record<string, string[]>;
  scaleSuggestions: Record<string, string>;
}
