/* =============================================================
   modes.js — Mode Relationship Panel, Character Notes,
              Pentatonic Bridge
   Depends on: theory.js, fretboard.js (getScaleNotes,
               getScaleNoteNames, rotateIntervals, MODE_CHARACTER)
   ============================================================= */

// Step formula for each mode (W = whole, H = half)
var MODE_STEP_FORMULAS = {
  'Ionian':     ['W','W','H','W','W','W','H'],
  'Dorian':     ['W','H','W','W','W','H','W'],
  'Phrygian':   ['H','W','W','W','H','W','W'],
  'Lydian':     ['W','W','W','H','W','W','H'],
  'Mixolydian': ['W','W','H','W','W','H','W'],
  'Aeolian':    ['W','H','W','W','H','W','W'],
  'Locrian':    ['H','W','W','H','W','W','W']
};

// Interval number labels per mode (showing accidentals vs natural major)
var MODE_INTERVAL_LABELS = {
  'Ionian':     ['1','2','3','4','5','6','7'],
  'Dorian':     ['1','2','♭3','4','5','6','♭7'],
  'Phrygian':   ['1','♭2','♭3','4','5','♭6','♭7'],
  'Lydian':     ['1','2','3','♯4','5','6','7'],
  'Mixolydian': ['1','2','3','4','5','6','♭7'],
  'Aeolian':    ['1','2','♭3','4','5','♭6','♭7'],
  'Locrian':    ['1','♭2','♭3','4','♭5','♭6','♭7']
};

// Pentatonic bridge data per mode
var PENTATONIC_BRIDGE = {
  'Ionian':     {
    pent: 'Major Pentatonic',
    pentDegrees: [0,1,2,4,5],
    extensionDegrees: [3,6],
    extensionLabels: ['4','7']
  },
  'Dorian':     {
    pent: 'Minor Pentatonic',
    pentDegrees: [0,2,3,4,6],
    extensionDegrees: [1,5],
    extensionLabels: ['2','6']
  },
  'Phrygian':   {
    pent: 'Minor Pentatonic',
    pentDegrees: [0,2,3,4,6],
    extensionDegrees: [1,5],
    extensionLabels: ['♭2','♭6']
  },
  'Lydian':     {
    pent: 'Major Pentatonic',
    pentDegrees: [0,1,2,4,5],
    extensionDegrees: [3,6],
    extensionLabels: ['♯4','7']
  },
  'Mixolydian': {
    pent: 'Major Pentatonic',
    pentDegrees: [0,1,2,4,5],
    extensionDegrees: [3,6],
    extensionLabels: ['4','♭7']
  },
  'Aeolian':    {
    pent: 'Minor Pentatonic',
    pentDegrees: [0,2,3,4,6],
    extensionDegrees: [1,5],
    extensionLabels: ['2','♭6']
  },
  'Locrian':    {
    pent: 'Minor Pentatonic',
    pentDegrees: [0,2,3,4,6],
    extensionDegrees: [1,5],
    extensionLabels: ['♭2','♭5']
  }
};

// ---------------------------------------------------------------
// renderModeRelPanel()
// Renders the 7-mode relationship panel below the fretboard.
// Uses AppState.fretboardRootNote (or currentKey if null),
// and highlights the currently selected mode (AppState.currentMode).
// ---------------------------------------------------------------
function renderModeRelPanel() {
  var panel = document.getElementById('mode-rel-section');
  if (!panel) return;

  var rootKey = AppState.fretboardRootNote || AppState.currentKey;
  if (!rootKey) {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = 'block';

  var currentMode = AppState.currentMode || 0;
  var rootSelector = document.getElementById('mode-rel-root-select');
  if (rootSelector) rootSelector.value = rootKey;

  var container = document.getElementById('mode-rel-cards');
  if (!container) return;
  container.innerHTML = '';

  MODE_NAMES.forEach(function(modeName, modeIndex) {
    var noteNames  = getModeNoteNames(rootKey, modeIndex);
    var intervals  = MODE_INTERVAL_LABELS[modeName] || [];
    var steps      = MODE_STEP_FORMULAS[modeName] || [];
    var charDegrees = MODE_CHARACTER[modeName] || [];
    var bridge     = PENTATONIC_BRIDGE[modeName] || {};
    var modeColor  = MODE_COLORS[modeIndex];
    var isActive   = (modeIndex === currentMode);

    // Build note display with character note badges
    var noteHtml = noteNames.map(function(n, i) {
      var isChar = charDegrees.indexOf(i) !== -1;
      if (isChar) {
        return '<span class="char-note-badge" title="Character note">✦ ' + n + '</span>';
      }
      return '<span class="mode-rel-note">' + n + '</span>';
    }).join(' ');

    // Build interval display with accidentals colored
    var intervalHtml = intervals.map(function(iv, i) {
      var isChar = charDegrees.indexOf(i) !== -1;
      if (isChar) {
        return '<span class="char-interval-badge">' + iv + '</span>';
      }
      return '<span class="mode-rel-interval">' + iv + '</span>';
    }).join(' ');

    // Step formula
    var stepsHtml = steps.map(function(s) {
      return '<span class="mode-step">' + s + '</span>';
    }).join(' ');

    // Pentatonic bridge section
    var pentHtml = '';
    if (bridge.pent) {
      var extLabels = bridge.extensionLabels || [];
      pentHtml =
        '<div class="pent-bridge">' +
          '<span class="pent-bridge-label">You know ' + bridge.pent + '</span>' +
          ' — add <strong>' + extLabels.join(' + ') + '</strong> to play ' + modeName +
        '</div>';
    }

    var card = document.createElement('div');
    card.className = 'mode-rel-card' + (isActive ? ' active' : '');
    card.style.borderLeftColor = modeColor;
    card.dataset.modeIndex = modeIndex;

    card.innerHTML =
      '<div class="mode-rel-header">' +
        '<span class="mode-rel-name" style="color:' + modeColor + '">' + modeName + '</span>' +
        '<span class="mode-rel-root">' + (noteNames[0] || '') + '</span>' +
      '</div>' +
      '<div class="mode-rel-formula">' +
        '<div class="mode-rel-steps">' + stepsHtml + '</div>' +
        '<div class="mode-rel-intervals">' + intervalHtml + '</div>' +
        '<div class="mode-rel-notes">' + noteHtml + '</div>' +
      '</div>' +
      '<p class="mode-rel-feel">' + (MODE_FEEL[modeName] || '') + '</p>' +
      pentHtml;

    container.appendChild(card);
  });

  // Wire up card clicks
  container.querySelectorAll('.mode-rel-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var mi = parseInt(card.dataset.modeIndex, 10);
      AppState.currentMode = mi;
      // Reset position to all when changing mode
      AppState.currentPosition = 'all';
      renderFretboard();
      renderModeRelPanel();
    });
  });
}

// ---------------------------------------------------------------
// initModeRelPanel()
// Builds the initial HTML structure for the mode relationship panel.
// ---------------------------------------------------------------
function initModeRelPanel() {
  var section = document.getElementById('mode-rel-section');
  if (!section) return;

  // Build root note options — chromatic + flat spellings
  var allKeys = ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
  var rootOptions = allKeys.map(function(k) {
    return '<option value="' + k + '">' + k + '</option>';
  }).join('');

  section.innerHTML =
    '<div class="panel panel--mode-rel">' +
      '<div class="mode-rel-header-row">' +
        '<h2 class="panel-title">Mode Relationship Panel</h2>' +
        '<div class="mode-rel-root-row">' +
          '<label for="mode-rel-root-select" class="mode-rel-root-label">Root:</label>' +
          '<select id="mode-rel-root-select" class="mode-rel-root-select">' +
            rootOptions +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="mode-rel-panel" id="mode-rel-cards">' +
        '<p class="placeholder">Select a key to explore mode relationships.</p>' +
      '</div>' +
    '</div>';

  // Root selector change
  var select = document.getElementById('mode-rel-root-select');
  if (select) {
    select.addEventListener('change', function() {
      AppState.fretboardRootNote = select.value;
      renderModeRelPanel();
      renderFretboard();
    });
  }
}
