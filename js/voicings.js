/* =============================================================
   voicings.js — Chord voicing database
   Format: [E, A, D, G, B, e] — standard right-hand string order
     -1 = muted (X)
      0 = open string
     1+ = fret number
   Displayed mirrored (reversed) for left-handed player.
   ============================================================= */

var VOICINGS = {

  // ---- MAJOR CHORDS ----------------------------------------

  // Open position
  'C':  { frets: [-1, 3, 2, 0, 1, 0], baseFret: 1 },
  'G':  { frets: [ 3, 2, 0, 0, 0, 3], baseFret: 1 },
  'D':  { frets: [-1,-1, 0, 2, 3, 2], baseFret: 1 },
  'A':  { frets: [-1, 0, 2, 2, 2, 0], baseFret: 1 },
  'E':  { frets: [ 0, 2, 2, 1, 0, 0], baseFret: 1 },

  // Barre chords
  'F':  { frets: [ 1, 3, 3, 2, 1, 1], baseFret: 1 },   // E-shape barre at 1
  'B':  { frets: [-1, 2, 4, 4, 4, 2], baseFret: 2 },   // A-shape barre at 2
  'F#': { frets: [ 2, 4, 4, 3, 2, 2], baseFret: 2 },   // E-shape barre at 2
  'Gb': { frets: [ 2, 4, 4, 3, 2, 2], baseFret: 2 },   // enharmonic F#
  'Db': { frets: [-1, 4, 6, 6, 6, 4], baseFret: 4 },   // A-shape barre at 4
  'Ab': { frets: [ 4, 6, 6, 5, 4, 4], baseFret: 4 },   // E-shape barre at 4
  'Eb': { frets: [-1, 6, 8, 8, 8, 6], baseFret: 6 },   // A-shape barre at 6
  'Bb': { frets: [-1, 1, 3, 3, 3, 1], baseFret: 1 },   // A-shape barre at 1

  // ---- MINOR CHORDS ----------------------------------------

  // Open position
  'Am': { frets: [-1, 0, 2, 2, 1, 0], baseFret: 1 },
  'Em': { frets: [ 0, 2, 2, 0, 0, 0], baseFret: 1 },
  'Dm': { frets: [-1,-1, 0, 2, 3, 1], baseFret: 1 },

  // Barre chords
  'Fm': { frets: [ 1, 3, 3, 1, 1, 1], baseFret: 1 },   // Em-shape barre at 1
  'Bm': { frets: [-1, 2, 4, 4, 3, 2], baseFret: 2 },   // Am-shape barre at 2
  'F#m':{ frets: [ 2, 4, 4, 2, 2, 2], baseFret: 2 },   // Em-shape barre at 2
  'Gbm':{ frets: [ 2, 4, 4, 2, 2, 2], baseFret: 2 },   // enharmonic F#m
  'C#m':{ frets: [-1, 4, 6, 6, 5, 4], baseFret: 4 },   // Am-shape barre at 4
  'Dbm':{ frets: [-1, 4, 6, 6, 5, 4], baseFret: 4 },   // enharmonic C#m
  'G#m':{ frets: [ 4, 6, 6, 4, 4, 4], baseFret: 4 },   // Em-shape barre at 4
  'Abm':{ frets: [ 4, 6, 6, 4, 4, 4], baseFret: 4 },   // enharmonic G#m
  'D#m':{ frets: [-1, 6, 8, 8, 7, 6], baseFret: 6 },   // Am-shape barre at 6
  'Ebm':{ frets: [-1, 6, 8, 8, 7, 6], baseFret: 6 },   // enharmonic D#m
  'Bbm':{ frets: [-1, 1, 3, 3, 2, 1], baseFret: 1 },   // Am-shape barre at 1
  'Cm': { frets: [-1, 3, 5, 5, 4, 3], baseFret: 3 },   // Am-shape barre at 3
  'Gm': { frets: [ 3, 5, 5, 3, 3, 3], baseFret: 3 },   // Em-shape barre at 3

  // ---- DIMINISHED CHORDS (vii° for each major key) ---------
  // Named as root + 'dim' for lookup from getDiatonicChords()

  'Bdim':  { frets: [-1, 2, 3, 4, 3,-1], baseFret: 1 },  // Key of C → Bdim
  'F#dim': { frets: [ 2, 3, 4, 2,-1,-1], baseFret: 2 },  // Key of G → F#dim
  'C#dim': { frets: [-1, 4, 5, 3, 5,-1], baseFret: 3 },  // Key of D → C#dim
  'G#dim': { frets: [-1, 0, 1, 2, 1,-1], baseFret: 1 },  // Key of A → G#dim
  'D#dim': { frets: [-1, 1, 2, 3, 2,-1], baseFret: 1 },  // Key of E → D#dim
  'A#dim': { frets: [-1, 1, 2, 0, 2,-1], baseFret: 1 },  // Key of B → A#dim
  'Edim':  { frets: [ 0, 1, 2, 0,-1,-1], baseFret: 1 },  // Key of F# → E#dim (Fdim)
  'Cdim':  { frets: [-1, 3, 4, 5, 4,-1], baseFret: 3 },  // Key of Db → Cdim
  'Gdim':  { frets: [-1,-1, 5, 6, 5,-1], baseFret: 5 },  // Key of Ab → Gdim
  'Ddim':  { frets: [-1,-1, 0, 1, 0,-1], baseFret: 1 },  // Key of Eb → Ddim
  'Adim':  { frets: [-1, 0, 1, 2, 1,-1], baseFret: 1 },  // Key of Bb → Adim
  'Fdim':  { frets: [ 1, 2, 3, 1,-1,-1], baseFret: 1 },  // Key of F  → Edim

  // Extra enharmonic aliases for diminished
  'Gbdim': { frets: [ 2, 3, 4, 2,-1,-1], baseFret: 2 },
  'Dbdim': { frets: [-1, 4, 5, 3, 5,-1], baseFret: 3 },
  'Abdim': { frets: [-1, 0, 1, 2, 1,-1], baseFret: 1 },
  'Ebdim': { frets: [-1, 1, 2, 3, 2,-1], baseFret: 1 },
  'Bbdim': { frets: [-1, 1, 2, 0, 2,-1], baseFret: 1 },
};

// ---------------------------------------------------------------
// getVoicing(voicingKey)
// Returns voicing object { frets, baseFret } or a fallback
// voicingKey: e.g. 'Am', 'G', 'Bdim'
// ---------------------------------------------------------------
function getVoicing(voicingKey) {
  if (VOICINGS[voicingKey]) return VOICINGS[voicingKey];

  // Try stripping the degree symbol if present (e.g. 'B°' → 'Bdim')
  var cleaned = voicingKey.replace('°', 'dim');
  if (VOICINGS[cleaned]) return VOICINGS[cleaned];

  // Generic fallback: muted chord (shows X on all strings)
  return { frets: [-1,-1,-1,-1,-1,-1], baseFret: 1 };
}

// ---------------------------------------------------------------
// mirrorForLefty(frets)
// Reverses string order for left-handed display.
// Input:  [E, A, D, G, B, e]  (low to high, righty)
// Output: [e, B, G, D, A, E]  (low E now on right side)
// ---------------------------------------------------------------
function mirrorForLefty(frets) {
  return frets.slice().reverse();
}
