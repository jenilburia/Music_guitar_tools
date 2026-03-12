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

// ---------------------------------------------------------------
// getModeStepFormula(modeIndex)
// Returns string like "W W H W W W H" for a given mode index
// ---------------------------------------------------------------
function getModeStepFormula(modeIndex) {
  // Ionian step pattern: W W H W W W H (semitones: 2 2 1 2 2 2 1)
  var ionianSteps = [2, 2, 1, 2, 2, 2, 1];
  var steps = [];
  for (var i = 0; i < 7; i++) {
    var rotated = ionianSteps[(i + modeIndex) % 7];
    steps.push(rotated === 2 ? 'W' : 'H');
  }
  return steps;
}

// ---------------------------------------------------------------
// getModeIntervalLabels(modeIndex)
// Returns array of interval label strings with accidentals
// e.g. ['1','2','♭3','4','5','6','♭7'] for Dorian
// ---------------------------------------------------------------
function getModeIntervalLabels(modeIndex) {
  // Build by comparing mode scale intervals to major scale intervals
  var modeScaleIntervals = rotateIntervalsForMode(MAJOR_INTERVALS, modeIndex);
  var majorIntervals = MAJOR_INTERVALS;
  var degreeNames = ['1','2','3','4','5','6','7'];

  return modeScaleIntervals.map(function(iv, i) {
    var diff = iv - majorIntervals[i];
    if (diff === 0)  return degreeNames[i];
    if (diff === 1)  return '♯' + degreeNames[i];
    if (diff === -1) return '♭' + degreeNames[i];
    if (diff === 11) return '♭' + degreeNames[i]; // e.g. b2 wrapping
    if (diff === -11) return '♯' + degreeNames[i];
    return degreeNames[i];
  });
}

// ---------------------------------------------------------------
// rotateIntervalsForMode(intervals, modeIndex)
// Returns the interval set of the given mode relative to its own root.
// e.g. modeIndex=1 (Dorian) → [0,2,3,5,7,9,10]
// ---------------------------------------------------------------
function rotateIntervalsForMode(intervals, modeIndex) {
  var offset = intervals[modeIndex];
  var result = [];
  for (var i = 0; i < intervals.length; i++) {
    result.push((intervals[(i + modeIndex) % intervals.length] - offset + 12) % 12);
  }
  return result;
}

// ---------------------------------------------------------------
// getModeNoteNames(key, modeIndex)
// Returns the 7 note names of the mode starting from the
// nth degree of the given major key
// ---------------------------------------------------------------
function getModeNoteNames(key, modeIndex) {
  var normalized = normalizeKey(key);
  var rootIdx = CHROMATIC.indexOf(normalized);
  if (rootIdx === -1) return [];
  var modeIntervals = rotateIntervalsForMode(MAJOR_INTERVALS, modeIndex);
  return modeIntervals.map(function(iv) {
    var pitchClass = (rootIdx + iv) % 12;
    return noteNameForKey(pitchClass, key);
  });
}

// ---------------------------------------------------------------
// getParallelMinorChords(key)
// Returns 7 chord objects for the natural minor (Aeolian) scale
// built on the same root as the given major key.
// Chord quality follows natural minor pattern:
//   min, dim, maj, min, min, maj, maj
// ---------------------------------------------------------------
function getParallelMinorChords(key) {
  var normalized = normalizeKey(key);
  var rootIndex = CHROMATIC.indexOf(normalized);
  if (rootIndex === -1) return [];

  var MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10]; // natural minor
  var MINOR_QUALITIES = ['min','dim','maj','min','min','maj','maj'];
  var MINOR_ROMANS    = ['i','ii°','III','iv','v','VI','VII'];

  return MINOR_INTERVALS.map(function(interval, degree) {
    var noteIndex = (rootIndex + interval) % 12;
    var rootNote  = noteNameForKey(noteIndex, key);
    var quality   = MINOR_QUALITIES[degree];

    var chordName;
    if (quality === 'min') {
      chordName = rootNote + 'm';
    } else if (quality === 'dim') {
      chordName = rootNote + '°';
    } else {
      chordName = rootNote;
    }

    var voicingKey = quality === 'dim' ? rootNote + 'dim' : chordName;

    return {
      degree:    degree + 1,
      roman:     MINOR_ROMANS[degree],
      chordName: chordName,
      rootNote:  rootNote,
      quality:   quality,
      modeIndex: degree,
      modeName:  'Parallel Minor',
      modeDescription: 'Borrowed from the parallel natural minor scale.',
      modeColor: '#6b7280',
      voicingKey: voicingKey,
      borrowed:  true
    };
  });
}
