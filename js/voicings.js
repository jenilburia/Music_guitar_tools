/* =============================================================
   voicings.js — Chord voicing database
   Format: [E, A, D, G, B, e] — standard right-hand string order
     -1 = muted (X)
      0 = open string
     1+ = fret number
   fingers: [E, A, D, G, B, e]
     0 = no finger (open/muted), 1-4 = finger number
   Displayed mirrored (reversed) for left-handed player.
   ============================================================= */

var VOICINGS = {

  // ---- MAJOR CHORDS ----------------------------------------

  // Open position
  'C':  { frets: [-1, 3, 2, 0, 1, 0], baseFret: 1, fingers: [0, 3, 2, 0, 1, 0] },
  'G':  { frets: [ 3, 2, 0, 0, 0, 3], baseFret: 1, fingers: [2, 1, 0, 0, 0, 4] },
  'D':  { frets: [-1,-1, 0, 2, 3, 2], baseFret: 1, fingers: [0, 0, 0, 1, 3, 2] },
  'A':  { frets: [-1, 0, 2, 2, 2, 0], baseFret: 1, fingers: [0, 0, 1, 2, 3, 0] },
  'E':  { frets: [ 0, 2, 2, 1, 0, 0], baseFret: 1, fingers: [0, 2, 3, 1, 0, 0] },

  // Barre chords (E-shape)
  'F':  { frets: [ 1, 3, 3, 2, 1, 1], baseFret: 1, fingers: [1, 3, 4, 2, 1, 1] },   // E-shape barre at 1
  'F#': { frets: [ 2, 4, 4, 3, 2, 2], baseFret: 2, fingers: [1, 3, 4, 2, 1, 1] },   // E-shape barre at 2
  'Gb': { frets: [ 2, 4, 4, 3, 2, 2], baseFret: 2, fingers: [1, 3, 4, 2, 1, 1] },   // enharmonic F#
  'Ab': { frets: [ 4, 6, 6, 5, 4, 4], baseFret: 4, fingers: [1, 3, 4, 2, 1, 1] },   // E-shape barre at 4

  // Barre chords (A-shape)
  'B':  { frets: [-1, 2, 4, 4, 4, 2], baseFret: 2, fingers: [0, 1, 3, 4, 2, 1] },   // A-shape barre at 2
  'Db': { frets: [-1, 4, 6, 6, 6, 4], baseFret: 4, fingers: [0, 1, 3, 4, 2, 1] },   // A-shape barre at 4
  'Eb': { frets: [-1, 6, 8, 8, 8, 6], baseFret: 6, fingers: [0, 1, 3, 4, 2, 1] },   // A-shape barre at 6
  'Bb': { frets: [-1, 1, 3, 3, 3, 1], baseFret: 1, fingers: [0, 1, 3, 4, 2, 1] },   // A-shape barre at 1

  // ---- MINOR CHORDS ----------------------------------------

  // Open position
  'Am': { frets: [-1, 0, 2, 2, 1, 0], baseFret: 1, fingers: [0, 0, 2, 3, 1, 0] },
  'Em': { frets: [ 0, 2, 2, 0, 0, 0], baseFret: 1, fingers: [0, 2, 3, 0, 0, 0] },
  'Dm': { frets: [-1,-1, 0, 2, 3, 1], baseFret: 1, fingers: [0, 0, 0, 2, 3, 1] },

  // Barre chords (Em-shape)
  'Fm': { frets: [ 1, 3, 3, 1, 1, 1], baseFret: 1, fingers: [1, 3, 4, 1, 1, 1] },   // Em-shape barre at 1
  'F#m':{ frets: [ 2, 4, 4, 2, 2, 2], baseFret: 2, fingers: [1, 3, 4, 1, 1, 1] },   // Em-shape barre at 2
  'Gbm':{ frets: [ 2, 4, 4, 2, 2, 2], baseFret: 2, fingers: [1, 3, 4, 1, 1, 1] },   // enharmonic F#m
  'G#m':{ frets: [ 4, 6, 6, 4, 4, 4], baseFret: 4, fingers: [1, 3, 4, 1, 1, 1] },   // Em-shape barre at 4
  'Abm':{ frets: [ 4, 6, 6, 4, 4, 4], baseFret: 4, fingers: [1, 3, 4, 1, 1, 1] },   // enharmonic G#m
  'Gm': { frets: [ 3, 5, 5, 3, 3, 3], baseFret: 3, fingers: [1, 3, 4, 1, 1, 1] },   // Em-shape barre at 3

  // Barre chords (Am-shape)
  'Bm': { frets: [-1, 2, 4, 4, 3, 2], baseFret: 2, fingers: [0, 1, 3, 4, 2, 1] },   // Am-shape barre at 2
  'C#m':{ frets: [-1, 4, 6, 6, 5, 4], baseFret: 4, fingers: [0, 1, 3, 4, 2, 1] },   // Am-shape barre at 4
  'Dbm':{ frets: [-1, 4, 6, 6, 5, 4], baseFret: 4, fingers: [0, 1, 3, 4, 2, 1] },   // enharmonic C#m
  'D#m':{ frets: [-1, 6, 8, 8, 7, 6], baseFret: 6, fingers: [0, 1, 3, 4, 2, 1] },   // Am-shape barre at 6
  'Ebm':{ frets: [-1, 6, 8, 8, 7, 6], baseFret: 6, fingers: [0, 1, 3, 4, 2, 1] },   // enharmonic D#m
  'Bbm':{ frets: [-1, 1, 3, 3, 2, 1], baseFret: 1, fingers: [0, 1, 3, 4, 2, 1] },   // Am-shape barre at 1
  'Cm': { frets: [-1, 3, 5, 5, 4, 3], baseFret: 3, fingers: [0, 1, 3, 4, 2, 1] },   // Am-shape barre at 3

  // ---- DIMINISHED CHORDS (vii° for each major key) ---------
  // Named as root + 'dim' for lookup from getDiatonicChords()

  'Bdim':  { frets: [-1, 2, 3, 4, 3,-1], baseFret: 1, fingers: [0, 1, 2, 4, 3, 0] },  // Key of C → Bdim
  'F#dim': { frets: [ 2, 3, 4, 2,-1,-1], baseFret: 2, fingers: [1, 2, 3, 1, 0, 0] },  // Key of G → F#dim
  'C#dim': { frets: [-1, 4, 5, 3, 5,-1], baseFret: 3, fingers: [0, 2, 3, 1, 4, 0] },  // Key of D → C#dim
  'G#dim': { frets: [-1, 0, 1, 2, 1,-1], baseFret: 1, fingers: [0, 0, 1, 3, 2, 0] },  // Key of A → G#dim
  'D#dim': { frets: [-1, 1, 2, 3, 2,-1], baseFret: 1, fingers: [0, 1, 2, 4, 3, 0] },  // Key of E → D#dim
  'A#dim': { frets: [-1, 1, 2, 0, 2,-1], baseFret: 1, fingers: [0, 1, 2, 0, 3, 0] },  // Key of B → A#dim
  'Edim':  { frets: [ 0, 1, 2, 0,-1,-1], baseFret: 1, fingers: [0, 1, 2, 0, 0, 0] },  // Key of F# → E#dim (Fdim)
  'Cdim':  { frets: [-1, 3, 4, 5, 4,-1], baseFret: 3, fingers: [0, 1, 2, 4, 3, 0] },  // Key of Db → Cdim
  'Gdim':  { frets: [-1,-1, 5, 6, 5,-1], baseFret: 5, fingers: [0, 0, 1, 3, 2, 0] },  // Key of Ab → Gdim
  'Ddim':  { frets: [-1,-1, 0, 1, 0,-1], baseFret: 1, fingers: [0, 0, 0, 1, 0, 0] },  // Key of Eb → Ddim
  'Adim':  { frets: [-1, 0, 1, 2, 1,-1], baseFret: 1, fingers: [0, 0, 1, 3, 2, 0] },  // Key of Bb → Adim
  'Fdim':  { frets: [ 1, 2, 3, 1,-1,-1], baseFret: 1, fingers: [1, 2, 3, 1, 0, 0] },  // Key of F  → Edim

  // Extra enharmonic aliases for diminished
  'Gbdim': { frets: [ 2, 3, 4, 2,-1,-1], baseFret: 2, fingers: [1, 2, 3, 1, 0, 0] },
  'Dbdim': { frets: [-1, 4, 5, 3, 5,-1], baseFret: 3, fingers: [0, 2, 3, 1, 4, 0] },
  'Abdim': { frets: [-1, 0, 1, 2, 1,-1], baseFret: 1, fingers: [0, 0, 1, 3, 2, 0] },
  'Ebdim': { frets: [-1, 1, 2, 3, 2,-1], baseFret: 1, fingers: [0, 1, 2, 4, 3, 0] },
  'Bbdim': { frets: [-1, 1, 2, 0, 2,-1], baseFret: 1, fingers: [0, 1, 2, 0, 3, 0] },
};

// ---------------------------------------------------------------
// getVoicing(voicingKey)
// Returns voicing object { frets, baseFret, fingers } or a fallback
// voicingKey: e.g. 'Am', 'G', 'Bdim'
// ---------------------------------------------------------------
function getVoicing(voicingKey) {
  if (VOICINGS[voicingKey]) return VOICINGS[voicingKey];

  // Try stripping the degree symbol if present (e.g. 'B°' → 'Bdim')
  var cleaned = voicingKey.replace('°', 'dim');
  if (VOICINGS[cleaned]) return VOICINGS[cleaned];

  // Generic fallback: muted chord (shows X on all strings)
  return { frets: [-1,-1,-1,-1,-1,-1], baseFret: 1, fingers: null };
}

// ---------------------------------------------------------------
// mirrorForLefty(voicing)
// Reverses string order for left-handed display.
// Input voicing: { frets: [E, A, D, G, B, e], fingers: [...], ... }
// Output: mirrored copy with both arrays reversed
// ---------------------------------------------------------------
function mirrorForLefty(voicing) {
  return {
    frets:   voicing.frets.slice().reverse(),
    fingers: voicing.fingers ? voicing.fingers.slice().reverse() : null
  };
}
