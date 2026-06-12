
import { ChordSymbol } from '../types';

interface InstrumentVolumes {
  piano: number;
  bass: number;
  drums: number;
}

/**
 * Voicings refinadas para evitar "notas suspeitas".
 * Foco total em Guide Tones (3, 7) e extensões harmônicas (9, 11, 13).
 */
const JAZZ_VOICINGS: Record<string, number[]> = {
  'maj7': [4, 11, 14, 19], // 3, 7, 9, 5(oitava)
  'maj9': [4, 11, 14, 21], // 3, 7, 9, 13
  '6': [4, 9, 14, 16],
  'maj6': [4, 9, 14, 16],
  'm7': [3, 10, 14, 17], // b3, b7, 9, 11
  'm9': [3, 10, 14, 15], 
  'm6': [3, 9, 10, 14],
  '-7': [3, 10, 14, 17],
  '7': [4, 10, 14, 21], // 3, b7, 9, 13
  '9': [4, 10, 14, 21],
  '13': [10, 16, 21, 26],
  '7alt': [4, 10, 13, 20], // 3, b7, b9, b13 (Evitando tônica e 5 justa)
  '7b9': [4, 10, 13, 21],
  '7#11': [4, 10, 14, 18],
  'm7b5': [3, 6, 10, 17], // b3, b5, b7, 11
  'ø7': [3, 6, 10, 17],
  'dim7': [3, 6, 9, 12],
  'o7': [3, 6, 9, 12],
  'sus4': [5, 10, 14, 17],
  '7sus4': [5, 10, 14, 17]
};

const NOTE_TO_OFFSET: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 
  'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private nextNoteTime = 0;
  private timerId: number | null = null;
  private isPlaying = false;
  private tempo = 120;
  private currentMeasure = 0;
  private currentBeat = 0; 
  private songData: ChordSymbol[][] = [];
  private style: string = 'Swing';
  private onBeat: ((measure: number, beat: number) => void) | null = null;
  private masterGain: GainNode | null = null;
  private pinkNoiseBuffer: AudioBuffer | null = null;
  private lastBassMidi: number = 36;

  public volumes: InstrumentVolumes = { piano: 0.5, bass: 0.7, drums: 0.4 };

  private initAudio() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.createPinkNoise();
  }

  private createPinkNoise() {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    this.pinkNoiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.pinkNoiseBuffer.getChannelData(0);
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }
  }

  private playRhodes(freqs: number[], time: number, dur: number, velocity: number = 1) {
    if (!this.ctx || !this.masterGain) return;
    freqs.forEach(f => {
      const carrier = this.ctx!.createOscillator();
      const modulator = this.ctx!.createOscillator();
      const modGain = this.ctx!.createGain();
      const mainGain = this.ctx!.createGain();
      modulator.frequency.value = f * 2.0015; 
      modGain.gain.value = f * 0.28;
      carrier.frequency.value = f;
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(mainGain);
      mainGain.connect(this.masterGain!);
      mainGain.gain.setValueAtTime(0, time);
      mainGain.gain.linearRampToValueAtTime(this.volumes.piano * 0.18 * velocity, time + 0.005);
      mainGain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      modulator.start(time); carrier.start(time);
      modulator.stop(time + dur); carrier.stop(time + dur);
    });
  }

  private playBass(f: number, time: number, dur: number, velocity: number = 1) {
    if (!this.ctx || !this.masterGain) return;
    const g = this.ctx.createGain();
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, time);
    osc.connect(g);
    g.connect(this.masterGain);
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(this.volumes.bass * 0.5 * velocity, time + 0.02);
    g.gain.setTargetAtTime(0, time + 0.1, 0.15);
    osc.start(time);
    osc.stop(time + dur);
  }

  private playDrums(type: 'ride' | 'snare' | 'hihat', time: number, velocity: number = 1) {
    if (!this.ctx || !this.masterGain || !this.pinkNoiseBuffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.pinkNoiseBuffer;
    const g = this.ctx.createGain();
    let decay = 0.3; let vol = 0.1;
    if (type === 'ride') { decay = 0.8; vol = 0.12; }
    if (type === 'hihat') { decay = 0.05; vol = 0.08; }
    if (type === 'snare') { decay = 0.12; vol = 0.15; }
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(this.volumes.drums * velocity * vol, time + 0.002);
    g.gain.exponentialRampToValueAtTime(0.001, time + decay);
    source.connect(g);
    g.connect(this.masterGain);
    source.start(time);
  }

  private parseChord(chordStr: string): { root: number, suffix: string } {
    const match = chordStr.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return { root: 0, suffix: 'maj7' };
    let root = NOTE_TO_OFFSET[match[1]] || 0;
    let suffix = match[2] || 'maj7';
    if (suffix === 'm' || suffix === '-') suffix = 'm7';
    return { root, suffix };
  }

  private getWalkingBassFreq(currentChord: string, nextChord: string, beat: number): number {
    const { root: cRoot, suffix } = this.parseChord(currentChord);
    const { root: nRoot } = this.parseChord(nextChord);
    let midiNote = 36 + cRoot;
    
    if (beat === 0) midiNote = 36 + cRoot; 
    else if (beat === 1) midiNote = 36 + cRoot + (suffix.includes('m') ? 3 : 4);
    else if (beat === 2) midiNote = 36 + cRoot + 7;
    else midiNote = (36 + nRoot) + (Math.random() > 0.5 ? 1 : -1);

    while (Math.abs(midiNote - this.lastBassMidi) > 9) {
      if (midiNote > this.lastBassMidi) midiNote -= 12;
      else midiNote += 12;
    }
    if (midiNote < 28) midiNote += 12;
    if (midiNote > 48) midiNote -= 12;

    this.lastBassMidi = midiNote;
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  private schedule() {
    if (!this.ctx || !this.isPlaying) return;
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      const spb = 60.0 / this.tempo;
      const sixteenth = spb / 4;
      const measure = this.songData[this.currentMeasure];
      const swingFactor = (this.currentBeat % 2 === 1) ? sixteenth * 0.4 : 0;
      const time = this.nextNoteTime + swingFactor;
      
      const beatInMeasure = Math.floor(this.currentBeat / 4);
      const isQuarterNote = (this.currentBeat % 4 === 0);
      const chordIdx = (this.currentBeat >= 8 && measure.length > 1) ? 1 : 0;
      const currentChord = measure[chordIdx];
      
      let nextChord = currentChord;
      if (this.currentBeat >= 12) {
        nextChord = this.songData[(this.currentMeasure + 1) % this.songData.length][0];
      }

      const { root, suffix } = this.parseChord(currentChord);
      const intervals = JAZZ_VOICINGS[suffix] || JAZZ_VOICINGS['maj7'];
      const pianoFreqs = intervals.map(i => {
        let n = root + i + 60;
        if (n > 82) n -= 12; // Registro de piano comping ideal
        return 440 * Math.pow(2, (n - 69) / 12);
      });

      if (this.onBeat) this.onBeat(this.currentMeasure, this.currentBeat);

      if (this.style === 'Swing') {
        if (isQuarterNote) {
          this.playBass(this.getWalkingBassFreq(currentChord, nextChord, beatInMeasure), time, spb * 0.85);
          this.playDrums('ride', time, 0.8);
          if (beatInMeasure === 1 || beatInMeasure === 3) this.playDrums('hihat', time, 0.45);
        }
        if (this.currentBeat % 4 === 3) this.playDrums('ride', time, 0.35);

        // COMPING MAIS NATURAL (VARIAÇÃO ENTRE CHARLESTON E ANTECIPAÇÃO)
        const isCharleston = (this.currentBeat === 0 || this.currentBeat === 6);
        const isOffbeat = (this.currentBeat === 10 || this.currentBeat === 14);
        
        if (isCharleston || (isOffbeat && Math.random() > 0.7)) {
          this.playRhodes(pianoFreqs, time, spb * 0.35, 0.5 + Math.random() * 0.2);
        }
      } else {
        if (isQuarterNote) {
          this.playBass(440 * Math.pow(2, (root+36-69)/12), time, spb * 0.6);
          if (beatInMeasure === 0) this.playRhodes(pianoFreqs, time, spb * 1.5);
        }
      }

      this.nextNoteTime += sixteenth;
      this.currentBeat++;
      if (this.currentBeat >= 16) {
        this.currentBeat = 0;
        this.currentMeasure = (this.currentMeasure + 1) % this.songData.length;
      }
    }
    this.timerId = window.setTimeout(() => this.schedule(), 20);
  }

  public async start(song: ChordSymbol[][], tempo: number, style: string) {
    this.initAudio();
    if (this.ctx!.state === 'suspended') await this.ctx!.resume();
    this.songData = song; this.tempo = tempo; this.style = style;
    this.currentMeasure = 0; this.currentBeat = 0;
    this.nextNoteTime = this.ctx!.currentTime + 0.1;
    this.isPlaying = true;
    this.schedule();
  }

  public stop() { this.isPlaying = false; if (this.timerId) clearTimeout(this.timerId); }
  public updateData(song: ChordSymbol[][]) { this.songData = song; }
  public setTempo(t: number) { this.tempo = t; }
  public setStyle(s: string) { this.style = s; }
  public setVolume(inst: keyof InstrumentVolumes, val: number) { this.volumes[inst] = val; }
  public setOnBeat(cb: (m: number, b: number) => void) { this.onBeat = cb; }
}

export const audioEngine = new AudioEngine();
