import { Song } from '../types';

export const STYLES = ['Swing', 'Bossa Nova', 'Ballad', 'Funk'];

// Accurate jazz standard charts
export const INITIAL_SONGS: Song[] = [
  {
    id: 'autumn-leaves',
    title: 'Autumn Leaves',
    composer: 'Joseph Kosma',
    style: 'Swing',
    key: 'G',
    tempo: 140,
    measures: [
      ['Am7', 'D7'], ['Gmaj7', 'Cmaj7'], ['F#m7b5', 'B7(b9)'], ['Em7', 'Em7'],
      ['Am7', 'D7'], ['Gmaj7', 'Cmaj7'], ['F#m7b5', 'B7(b9)'], ['Em7', 'Em7'],
      ['Bm7', 'E7'], ['Am7', 'D7'], ['Gmaj7', 'Cmaj7'], ['F#m7b5', 'B7(b9)'],
      ['Am7', 'D7'], ['Gmaj7', 'Cmaj7'], ['F#m7b5', 'B7(b9)'], ['Em7', 'Em7'],
      ['Cm7', 'F7'], ['Bbmaj7', 'Ebmaj7'], ['Dm7b5', 'G7(b9)'], ['Cm7', 'Cm7'],
      ['Am7', 'D7'], ['Gmaj7', 'Cmaj7'], ['F#m7b5', 'B7(b9)'], ['Em7', 'Em7'],
      ['Am7', 'D7'], ['Gmaj7', 'Cmaj7'], ['F#m7b5', 'B7(b9)'], ['Em7', 'Em7'],
      ['Am7', 'D7'], ['Gmaj7', 'Cmaj7'], ['F#m7b5', 'B7(b9)'], ['Em7', 'Em7']
    ],
    metadata: Array(32).fill({}),
    version: 1,
    author: 'Jazz Standard'
  },
  {
    id: 'blue-bossa',
    title: 'Blue Bossa',
    composer: 'Kenny Dorham',
    style: 'Bossa Nova',
    key: 'C',
    tempo: 120,
    measures: [
      ['Cm7', 'Cm7'], ['Fm7', 'Fm7'], ['Dm7b5', 'G7(b9)'], ['Cm7', 'Cm7'],
      ['Ebm7', 'Ab7'], ['Dbmaj7', 'Dbmaj7'], ['Dm7b5', 'G7(b9)'], ['Cm7', 'Cm7'],
      ['Fm7', 'Fm7'], ['Bb7', 'Bb7'], ['Ebmaj7', 'Ebmaj7'], ['Dm7b5', 'G7'],
      ['Cm7', 'Cm7'], ['Fm7', 'Fm7'], ['Dm7b5', 'G7(b9)'], ['Cm7', 'Cm7']
    ],
    metadata: Array(16).fill({}),
    version: 1,
    author: 'Jazz Standard'
  },
  {
    id: 'all-blues',
    title: 'All Blues',
    composer: 'Miles Davis',
    style: 'Swing',
    key: 'G',
    tempo: 160,
    measures: [
      ['G7'], ['G7'], ['G7'], ['G7'],
      ['C7'], ['C7'], ['G7'], ['G7'],
      ['D7#9'], ['Eb7#9'], ['G7'], ['G7'],
      ['G7'], ['G7'], ['G7'], ['G7'],
      ['G7'], ['G7'], ['G7'], ['G7'],
      ['C7'], ['C7'], ['G7'], ['G7'],
      ['D7#9'], ['Eb7#9'], ['G7'], ['G7']
    ],
    metadata: Array(28).fill({}),
    version: 1,
    author: 'Jazz Standard'
  },
  {
    id: 'take-five',
    title: 'Take Five',
    composer: 'Paul Desmond',
    style: 'Swing',
    key: 'Ebm',
    tempo: 176,
    measures: [
      ['Ebm7', 'Ebm7'], ['Bbm7', 'Bbm7'], ['Ebm7', 'Ebm7'], ['Bbm7', 'Bbm7'],
      ['Ebm7', 'Ebm7'], ['Bbm7', 'Bbm7'], ['Ebm7', 'Ebm7'], ['Bbm7', 'Bbm7'],
      ['Cbmaj7', 'Cbmaj7'], ['Ab7', 'Ab7'], ['Ebm7', 'Ebm7'], ['Bbm7', 'Bbm7'],
      ['Ebm7', 'Ebm7'], ['Bbm7', 'Bbm7'], ['Ebm7', 'Ebm7'], ['Bbm7', 'Bbm7'],
      ['Ebm7', 'Ebm7'], ['Bbm7', 'Bbm7'], ['Ebm7', 'Ebm7'], ['Bbm7', 'Bbm7']
    ],
    metadata: Array(20).fill({}),
    version: 1,
    author: 'Jazz Standard'
  },
  {
    id: 'tune-up',
    title: 'Tune Up',
    composer: 'Miles Davis',
    style: 'Swing',
    key: 'D',
    tempo: 200,
    measures: [
      ['Em7', 'A7'], ['DMaj7', 'DMaj7'], ['Em7', 'A7'],
      ['DMaj7', 'DMaj7'], ['F#m7', 'B7'], ['EMaj7', 'EMaj7'],
      ['F#m7', 'B7'], ['EMaj7', 'EMaj7'], ['Dm7', 'G7'],
      ['CMaj7', 'CMaj7'], ['Dm7', 'G7'], ['CMaj7', 'CMaj7'],
      ['Em7', 'A7'], ['DMaj7', 'DMaj7'], ['Em7', 'A7'],
      ['DMaj7', 'DMaj7']
    ],
    metadata: Array(16).fill({}),
    version: 1,
    author: 'Jazz Standard'
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    composer: 'Charlie Parker',
    style: 'Swing',
    key: 'F',
    tempo: 220,
    measures: [
      ['Fmaj7', 'Em7b5'], ['A7', 'Dm7'], ['Gm7', 'C7'], ['Fmaj7', 'F7'],
      ['Bbmaj7', 'Bbm7'], ['Eb7', 'Am7b5'], ['D7', 'Gm7'], ['C7', 'Fmaj7'],
      ['Fmaj7', 'Em7b5'], ['A7', 'Dm7'], ['Gm7', 'C7'], ['Fmaj7', 'F7'],
      ['Bbmaj7', 'Eb7'], ['Am7b5', 'D7'], ['Gm7', 'C7'], ['Fmaj7', 'Fmaj7'],
      ['Dm7', 'G7'], ['Cmaj7', 'Cmaj7'], ['Cm7', 'F7'], ['Bbmaj7', 'Bbmaj7'],
      ['Bbm7', 'Eb7'], ['Am7b5', 'D7'], ['Gm7', 'C7'], ['Fmaj7', 'F7'],
      ['Bbmaj7', 'Ebmaj7'], ['Am7b5', 'D7'], ['Gm7', 'C7'], ['Fmaj7', 'Fmaj7'],
      ['Fmaj7', 'Em7b5'], ['A7', 'Dm7'], ['Gm7', 'C7'], ['Fmaj7', 'Fmaj7']
    ],
    metadata: Array(32).fill({}),
    version: 1,
    author: 'Bebop Classic'
  },
  {
    id: 'summet-time',
    title: 'Summertime',
    composer: 'George Gershwin',
    style: 'Swing',
    key: 'Am',
    tempo: 120,
    measures: [
      ['Am7', 'Am7'], ['Am7', 'Am7'], ['Em7', 'Em7'], ['Em7', 'Em7'],
      ['Am7', 'Am7'], ['Am7', 'Am7'], ['E7', 'E7'], ['E7', 'E7'],
      ['Am7', 'Am7'], ['Am7', 'Am7'], ['Em7', 'Em7'], ['Em7', 'Em7'],
      ['B7', 'B7'], ['E7', 'E7'], ['Am7', 'Am7'], ['Am7', 'Am7'],
      ['Dm7', 'Dm7'], ['Am7', 'Am7'], ['Em7', 'Em7'], ['E7', 'E7'],
      ['Am7', 'Am7'], ['Am7', 'Am7'], ['B7', 'B7'], ['E7', 'E7'],
      ['Am7', 'Am7'], ['Am7', 'Am7'], ['Em7', 'Em7'], ['Em7', 'Em7'],
      ['Am7', 'Am7'], ['Am7', 'Am7'], ['Bm7b5', 'E7'], ['Am7', 'Am7']
    ],
    metadata: Array(32).fill({}),
    version: 1,
    author: 'Jazz Standard'
  },
  {
    id: 'all-of-me',
    title: 'All of Me',
    composer: 'Seymour Simons',
    style: 'Swing',
    key: 'C',
    tempo: 130,
    measures: [
      ['Cmaj7', 'Cmaj7'], ['E7', 'E7'], ['A7', 'A7'], ['Am7', 'Am7'],
      ['D7', 'D7'], ['Dm7', 'G7'], ['Cmaj7', 'Cmaj7'], ['Cmaj7', 'Cmaj7'],
      ['E7', 'E7'], ['E7', 'E7'], ['A7', 'A7'], ['Am7', 'Am7'],
      ['D7', 'D7'], ['Dm7', 'G7'], ['Cmaj7', 'Cmaj7'], ['Cmaj7', 'Cmaj7'],
      ['Fmaj7', 'Fmaj7'], ['E7', 'E7'], ['Am7', 'Am7'], ['Am7', 'Am7'],
      ['D7', 'D7'], ['Dm7', 'G7'], ['Cmaj7', 'Cmaj7'], ['Cmaj7', 'Cmaj7'],
      ['Fmaj7', 'Fmaj7'], ['Em7', 'E7'], ['Am7', 'Am7'], ['Am7', 'Am7'],
      ['Fmaj7', 'Fmaj7'], ['Dm7', 'G7'], ['Cmaj7', 'Cmaj7'], ['Cmaj7', 'Cmaj7']
    ],
    metadata: Array(32).fill({}),
    version: 1,
    author: 'Jazz Standard'
  }
];
