import * as Tone from 'tone';
import { ChordSymbol } from '../types';

interface InstrumentVolumes {
  piano: number;
  bass: number;
  drums: number;
}

// MIDI note numbers for roots
const NOTE_TO_MIDI: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
  'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// Jazz voicings as semitone intervals from root
const JAZZ_VOICINGS: Record<string, number[]> = {
  'maj7': [0, 4, 7, 11],
  'maj9': [0, 4, 7, 11, 14],
  '6': [0, 4, 7, 9],
  'maj6': [0, 4, 7, 9],
  'm7': [0, 3, 7, 10],
  'm9': [0, 3, 7, 10, 14],
  'm6': [0, 3, 7, 9],
  '-7': [0, 3, 7, 10],
  '7': [0, 4, 7, 10],
  '9': [0, 4, 7, 10, 14],
  '13': [0, 4, 7, 10, 14, 21],
  '7alt': [0, 4, 7, 10],
  '7b9': [0, 4, 7, 10, 13],
  '7#11': [0, 4, 7, 10, 18],
  'm7b5': [0, 3, 6, 10],
  'ø7': [0, 3, 6, 10],
  'dim7': [0, 3, 6, 9],
  'o7': [0, 3, 6, 9],
  'sus4': [0, 5, 7, 10],
  '7sus4': [0, 5, 7, 10],
  '7#9': [0, 4, 7, 10, 15],
  '7b13': [0, 4, 7, 10, 20],
  'aug7': [0, 4, 8, 10],
  'maj7#5': [0, 4, 8, 11],
  'm7#11': [0, 3, 7, 10, 18],
};

class AudioEngine {
  private initialized = false;
  private piano: Tone.Sampler | null = null;
  private bass: Tone.Sampler | null = null;
  private drumKick: Tone.MembraneSynth | null = null;
  private drumSnare: Tone.NoiseSynth | null = null;
  private drumHat: Tone.MetalSynth | null = null;
  private drumRide: Tone.MetalSynth | null = null;
  private compressor: Tone.Compressor | null = null;
  private reverb: Tone.Reverb | null = null;

  private isPlaying = false;
  private tempo = 120;
  private currentMeasure = 0;
  private currentBeat = 0;
  private songData: ChordSymbol[][] = [];
  private style: string = 'Swing';
  private onBeat: ((measure: number, beat: number) => void) | null = null;
  private lastBassMidi = 36;
  private repeatCount = 0;
  private maxRepeats = 0;
  private loopStart: number | null = null;
  private loopEnd: number | null = null;

  public volumes: InstrumentVolumes = { piano: 0.5, bass: 0.7, drums: 0.4 };

  private async initAudio() {
    if (this.initialized) return;
    await Tone.start();

    // Master chain
    this.compressor = new Tone.Compressor(-12, 3);
    this.reverb = new Tone.Reverb({ decay: 1.5, wet: 0.15 });
    await this.reverb.generate();
    this.compressor.connect(this.reverb);
    this.reverb.toDestination();

    // Piano — use AMSynth for a more natural electric piano / Rhodes feel
    this.piano = new Tone.Sampler({
      urls: {
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      release: 1,
    });
    this.piano.volume.value = -6;
    this.piano.connect(this.compressor);

    // Bass — upright bass samples
    this.bass = new Tone.Sampler({
      urls: {
        E1: "E1.mp3",
        A1: "A1.mp3",
        D2: "D2.mp3",
        G2: "G2.mp3",
        E2: "E2.mp3",
        A2: "A2.mp3",
        D3: "D3.mp3",
      },
      baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/bass-electric/",
      release: 0.3,
    });
    this.bass.volume.value = -2;
    this.bass.connect(this.compressor);

    // Drums — synthesis for jazz feel
    this.drumKick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
    });
    this.drumKick.volume.value = -8;
    this.drumKick.connect(this.compressor);

    this.drumSnare = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
    });
    this.drumSnare.volume.value = -10;
    this.drumSnare.connect(this.compressor);

    this.drumHat = new Tone.MetalSynth({
      frequency: 400,
      envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    });
    this.drumHat.volume.value = -14;
    this.drumHat.connect(this.compressor);

    this.drumRide = new Tone.MetalSynth({
      frequency: 300,
      envelope: { attack: 0.001, decay: 0.8, release: 0.3 },
      harmonicity: 5.5,
      modulationIndex: 20,
      resonance: 6000,
      octaves: 1,
    });
    this.drumRide.volume.value = -10;
    this.drumRide.connect(this.compressor);

    this.initialized = true;
  }

  private parseChord(chordStr: string): { root: number; suffix: string } {
    const match = chordStr.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return { root: 0, suffix: 'maj7' };
    let root = NOTE_TO_MIDI[match[1]] || 0;
    let suffix = match[2] || 'maj7';
    if (suffix === 'm' || suffix === '-') suffix = 'm7';
    return { root, suffix };
  }

  private getVoicingFreqs(root: number, suffix: string, octave: number = 4): number[] {
    const intervals = JAZZ_VOICINGS[suffix] || JAZZ_VOICINGS['maj7'];
    const baseMidi = root + octave * 12;
    return intervals.map(i => {
      let midi = baseMidi + i;
      if (midi > 84) midi -= 12;
      if (midi < 48) midi += 12;
      return Tone.Frequency(midi, "midi").toFrequency();
    });
  }

  private getWalkingBassFreq(currentChord: string, nextChord: string, beat: number): number {
    const { root: cRoot, suffix } = this.parseChord(currentChord);
    const { root: nRoot } = this.parseChord(nextChord);

    let midiNote = 36 + cRoot;

    if (beat === 0) {
      midiNote = 36 + cRoot; // root on beat 1
    } else if (beat === 1) {
      // 3rd or 5th depending on quality
      midiNote = 36 + cRoot + (suffix.includes('m') ? 3 : 4);
    } else if (beat === 2) {
      midiNote = 36 + cRoot + 7; // 5th
    } else {
      // approach note — chromatic or diatonic leading to next root
      const targetMidi = 36 + nRoot;
      const approach = Math.random() > 0.5 ? targetMidi - 1 : targetMidi + 1;
      midiNote = approach;
    }

    // Voice leading: keep close to last note
    while (Math.abs(midiNote - this.lastBassMidi) > 7) {
      if (midiNote > this.lastBassMidi) midiNote -= 12;
      else midiNote += 12;
    }
    if (midiNote < 28) midiNote += 12;
    if (midiNote > 52) midiNote -= 12;

    this.lastBassMidi = midiNote;
    return Tone.Frequency(midiNote, "midi").toFrequency();
  }

  private schedule() {
    if (!this.isPlaying || !this.piano || !this.bass || !this.drumKick || !this.drumSnare || !this.drumHat || !this.drumRide) return;

    const spb = 60.0 / this.tempo; // seconds per beat
    const sixteenth = spb / 4;
    const measure = this.songData[this.currentMeasure];
    const beatInMeasure = Math.floor(this.currentBeat / 4);
    const isQuarterNote = (this.currentBeat % 4 === 0);
    const chordIdx = (this.currentBeat >= 8 && measure.length > 1) ? 1 : 0;
    const currentChord = measure[chordIdx];

    let nextChord = currentChord;
    if (this.currentBeat >= 12) {
      const nextMeasure = (this.currentMeasure + 1) % this.songData.length;
      nextChord = this.songData[nextMeasure][0];
    }

    const now = Tone.now();
    // Swing feel — delay the "and" beats
    const swingDelay = (this.currentBeat % 2 === 1) ? sixteenth * 0.35 : 0;
    const time = now + swingDelay;

    const { root, suffix } = this.parseChord(currentChord);
    const voicingFreqs = this.getVoicingFreqs(root, suffix);

    // Fire beat callback
    if (this.onBeat) this.onBeat(this.currentMeasure, this.currentBeat);

    if (this.style === 'Swing') {
      // BASS — walking bass on quarter notes
      if (isQuarterNote) {
        const bassFreq = this.getWalkingBassFreq(currentChord, nextChord, beatInMeasure);
        this.bass.triggerAttackRelease(
          Tone.Frequency(bassFreq, "frequency").toNote(),
          spb * 0.8,
          time,
          this.volumes.bass
        );
      }

      // DRUMS — ride cymbal pattern (ding-ding-da-ding)
      if (this.currentBeat % 4 === 0 || this.currentBeat % 4 === 3) {
        this.drumRide.triggerAttackRelease(spb * 0.5, time, this.volumes.drums * 0.7);
      }
      // Hi-hat on 2 and 4
      if (beatInMeasure === 1 || beatInMeasure === 3) {
        if (this.currentBeat % 4 === 0) {
          this.drumHat.triggerAttackRelease("16n", time, this.volumes.drums * 0.5);
        }
      }
      // Subtle snare ghost on upbeats
      if (this.currentBeat % 4 === 2 && Math.random() > 0.6) {
        this.drumSnare.triggerAttackRelease("32n", time, this.volumes.drums * 0.2);
      }

      // PIANO — comping with Charleston rhythm + variations
      const isCharleston = (this.currentBeat === 0 || this.currentBeat === 6);
      const isOffbeat = (this.currentBeat === 10 || this.currentBeat === 14);
      if (isCharleston || (isOffbeat && Math.random() > 0.65)) {
        voicingFreqs.forEach(freq => {
          this.piano!.triggerAttackRelease(
            Tone.Frequency(freq, "frequency").toNote(),
            spb * 0.3,
            time,
            this.volumes.piano * 0.5
          );
        });
      }
    } else {
      // Bossa / Ballad / Funk — simpler patterns
      if (isQuarterNote) {
        const bassFreq = 440 * Math.pow(2, (root + 36 - 69) / 12);
        this.bass.triggerAttackRelease(
          Tone.Frequency(bassFreq, "frequency").toNote(),
          spb * 0.5,
          time,
          this.volumes.bass
        );
        if (beatInMeasure === 0 || beatInMeasure === 2) {
          this.drumKick.triggerAttackRelease("8n", time, this.volumes.drums * 0.6);
        }
      }
      if (beatInMeasure === 0 && this.currentBeat % 4 === 0) {
        voicingFreqs.forEach(freq => {
          this.piano!.triggerAttackRelease(
            Tone.Frequency(freq, "frequency").toNote(),
            spb * 1.5,
            time,
            this.volumes.piano * 0.4
          );
        });
      }
    }

    // Schedule next tick
    const nextTick = (this.currentBeat + 1) * sixteenth + now;
    const measureDuration = 16 * sixteenth;
    const tickDelay = measureDuration - (this.currentBeat * sixteenth) - sixteenth + swingDelay;

    this.currentBeat++;
    if (this.currentBeat >= 16) {
      this.currentBeat = 0;
      this.currentMeasure = (this.currentMeasure + 1) % this.songData.length;

      // Handle looping
      if (this.loopStart !== null && this.loopEnd !== null) {
        if (this.currentMeasure > this.loopEnd) {
          this.currentMeasure = this.loopStart;
        }
      }
    }

    setTimeout(() => this.schedule(), (sixteenth) * 1000);
  }

  public async start(song: ChordSymbol[][], tempo: number, style: string) {
    await this.initAudio();
    await Tone.start();
    await Tone.Transport.start();

    this.songData = song;
    this.tempo = tempo;
    this.style = style;
    this.currentMeasure = 0;
    this.currentBeat = 0;
    this.isPlaying = true;

    this.schedule();
  }

  public stop() {
    this.isPlaying = false;
    this.currentMeasure = 0;
    this.currentBeat = 0;
  }

  public updateData(song: ChordSymbol[][]) {
    this.songData = song;
  }

  public setTempo(t: number) {
    this.tempo = t;
  }

  public setStyle(s: string) {
    this.style = s;
  }

  public setVolume(inst: keyof InstrumentVolumes, val: number) {
    this.volumes[inst] = val;
  }

  public setOnBeat(cb: (m: number, b: number) => void) {
    this.onBeat = cb;
  }

  public setLoop(start: number | null, end: number | null) {
    this.loopStart = start;
    this.loopEnd = end;
  }

  public dispose() {
    this.stop();
    this.piano?.dispose();
    this.bass?.dispose();
    this.drumKick?.dispose();
    this.drumSnare?.dispose();
    this.drumHat?.dispose();
    this.drumRide?.dispose();
    this.compressor?.dispose();
    this.reverb?.dispose();
  }
}

export const audioEngine = new AudioEngine();
