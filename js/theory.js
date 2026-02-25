/* =============================================================
   theory.js — Music theory data and computation
   No DOM access. Safe to test in browser console.
   ============================================================= */

// Circle of Fifths order (major keys, clockwise from C at top)
var CIRCLE = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];

// Relative minors aligned with CIRCLE (same index = same key signature)
var REL_MINORS = ['Am','Em','Bm','F#m','C#m','G#m','D#m','Bbm','Fm','Cm','Gm','Dm'];

// Chromatic scales — sharp and flat spellings
var CHROMATIC      = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
var FLAT_CHROMATIC = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

// Keys that should spell their chord roots with flats
var FLAT_KEYS = ['F','Bb','Eb','Ab','Db','Gb'];

// Intervals of the major scale (semitones from root)
var MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// Diatonic chord qualities per scale degree
var QUALITIES = ['maj','min','min','maj','maj','min','dim'];

// Roman numerals per scale degree
var ROMANS = ['I','ii','iii','IV','V','vi','vii°'];

// Mode names per scale degree
var MODE_NAMES = ['Ionian','Dorian','Phrygian','Lydian','Mixolydian','Aeolian','Locrian'];

// Mode colors (used for mode-row left border)
var MODE_COLORS = [
  '#f59e0b',  // Ionian   — amber
  '#3b82f6',  // Dorian   — blue
  '#ef4444',  // Phrygian — red
  '#a78bfa',  // Lydian   — violet
  '#f97316',  // Mixolydian — orange
  '#6b7280',  // Aeolian  — gray
  '#1f2937',  // Locrian  — near-black
];

// Mode emotional descriptions — guitarist-focused language
var MODE_FEEL = {
  'Ionian':     'Bright, happy, resolved. The home base of Western music. Every major key song lives here.',
  'Dorian':     'Minor with a raised 6th. Soulful, funky, sophisticated. Santana, Miles Davis. Use over ii chord.',
  'Phrygian':   'Minor with a ♭2nd. Dark, exotic, Spanish/metal. Heavy and mysterious. Djent and flamenco territory.',
  'Lydian':     'Major with a ♯4th. Dreamy, floating, ethereal. Joe Satriani lives here. Perfect for ambient passages.',
  'Mixolydian': 'Major with a ♭7th. Bluesy rock, dominant energy. Classic rock\'s home. Stairway to Heaven verse.',
  'Aeolian':    'Natural minor. Sad, emotional, introspective. Most expressive for dark moods. Most rock ballads.',
  'Locrian':    'Diminished root. Unstable, dissonant, barely resolved. Use sparingly for maximum tension and drama.'
};

// ---------------------------------------------------------------
// normalizeKey(key) → canonical note name for chromatic lookup
// Converts display-friendly flat names to sharp equivalents
// ---------------------------------------------------------------
function normalizeKey(key) {
  var flatToSharp = {
    'Db': 'C#', 'Eb': 'D#', 'Fb': 'E',
    'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B'
  };
  return flatToSharp[key] !== undefined ? flatToSharp[key] : key;
}

// ---------------------------------------------------------------
// noteNameForKey(chromaticIndex, keyRoot)
// Returns the correct enharmonic spelling for a given key
// ---------------------------------------------------------------
function noteNameForKey(chromaticIndex, keyRoot) {
  var useFlats = FLAT_KEYS.indexOf(keyRoot) !== -1;
  return useFlats ? FLAT_CHROMATIC[chromaticIndex] : CHROMATIC[chromaticIndex];
}

// ---------------------------------------------------------------
// getDiatonicChords(key)
// Returns array of 7 chord descriptor objects for a major key
//
// Each object:
//   { degree, roman, chordName, rootNote, quality, modeIndex,
//     modeName, modeDescription, modeColor, voicingKey }
// ---------------------------------------------------------------
function getDiatonicChords(key) {
  var normalized = normalizeKey(key);
  var rootIndex = CHROMATIC.indexOf(normalized);
  if (rootIndex === -1) return [];

  return MAJOR_INTERVALS.map(function(interval, degree) {
    var noteIndex = (rootIndex + interval) % 12;
    var rootNote  = noteNameForKey(noteIndex, key);
    var quality   = QUALITIES[degree];

    var chordName;
    if (quality === 'min') {
      chordName = rootNote + 'm';
    } else if (quality === 'dim') {
      chordName = rootNote + '°';
    } else {
      chordName = rootNote;
    }

    // Key to look up in VOICINGS — dim uses rootNote + 'dim' key format
    var voicingKey = quality === 'dim' ? rootNote + 'dim' : chordName;

    return {
      degree:          degree + 1,
      roman:           ROMANS[degree],
      chordName:       chordName,
      rootNote:        rootNote,
      quality:         quality,
      modeIndex:       degree,
      modeName:        MODE_NAMES[degree],
      modeDescription: MODE_FEEL[MODE_NAMES[degree]],
      modeColor:       MODE_COLORS[degree],
      voicingKey:      voicingKey
    };
  });
}

// ---------------------------------------------------------------
// getCircleIndexForKey(key)
// Returns 0–11 index of a key in the CIRCLE array
// ---------------------------------------------------------------
function getCircleIndexForKey(key) {
  var idx = CIRCLE.indexOf(key);
  if (idx === -1) {
    // Try matching enharmonic (e.g., F# == Gb)
    var enharmonic = { 'F#': 'Gb', 'Gb': 'F#', 'Db': 'C#', 'C#': 'Db',
                       'Ab': 'G#', 'G#': 'Ab', 'Eb': 'D#', 'D#': 'Eb',
                       'Bb': 'A#', 'A#': 'Bb' };
    if (enharmonic[key]) idx = CIRCLE.indexOf(enharmonic[key]);
  }
  return idx;
}

// ---------------------------------------------------------------
// getNeighborIndices(circleIndex)
// Returns circle indices of: perfect 5th (clockwise),
// perfect 4th (counter-clockwise), and relative minor (same)
// ---------------------------------------------------------------
function getNeighborIndices(circleIndex) {
  return {
    fifth:  (circleIndex + 1) % 12,
    fourth: (circleIndex + 11) % 12
    // relativeMinor is same index on inner ring — handled in circle.js
  };
}
