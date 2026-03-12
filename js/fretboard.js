/* =============================================================
   fretboard.js — Interactive SVG Fretboard
   Features: scale note display, CAGED positions, mode selection,
             note name / interval toggle, left/right handed.
   Depends on: theory.js (CHROMATIC, MAJOR_INTERVALS, normalizeKey,
               noteNameForKey, MODE_NAMES), AppState
   ============================================================= */

// Standard tuning open string pitches (semitones from C=0)
// String 0 = low E, String 5 = high e
var OPEN_PITCHES = [4, 9, 14, 19, 23, 28]; // E2 A2 D3 G3 B3 E4

// Mode character notes (degree indices that differ from natural major)
var MODE_CHARACTER = {
  'Ionian':     [],
  'Dorian':     [5],
  'Phrygian':   [1],
  'Lydian':     [3],
  'Mixolydian': [6],
  'Aeolian':    [5, 6],
  'Locrian':    [1, 4]
};

// ---------------------------------------------------------------
// getScaleNotes(key, modeIndex)
// Returns array of 7 chromatic pitch classes (0–11) for the
// nth mode of the given major key.
// e.g. getScaleNotes('C', 1) → D Dorian of C major → [2,4,5,7,9,11,0]
// rootPc = scaleNotes[0] (the mode's own root note)
// ---------------------------------------------------------------
function getScaleNotes(key, modeIndex) {
  var normalized = normalizeKey(key);
  var rootIdx = CHROMATIC.indexOf(normalized);
  if (rootIdx === -1) return [];
  // Build major scale pitch classes, then rotate to start at modeIndex
  var majorPCs = MAJOR_INTERVALS.map(function(iv) { return (rootIdx + iv) % 12; });
  return majorPCs.slice(modeIndex).concat(majorPCs.slice(0, modeIndex));
}

// ---------------------------------------------------------------
// getScaleNoteNames(key, modeIndex)
// Returns array of 7 note-name strings for the nth mode of the key.
// ---------------------------------------------------------------
function getScaleNoteNames(key, modeIndex) {
  var scaleNotes = getScaleNotes(key, modeIndex);
  return scaleNotes.map(function(pc) { return noteNameForKey(pc, key); });
}

// ---------------------------------------------------------------
// getCAGEDPositions(key)
// Returns array of 5 position objects: { start, end }
// Anchored to root note on low E string
// ---------------------------------------------------------------
function getCAGEDPositions(key) {
  var normalized = normalizeKey(key);
  var rootPc = CHROMATIC.indexOf(normalized);
  // Find root fret on low E string (open = 4 semitones = E)
  // low E open = pitch class 4; root fret = (rootPc - 4 + 12) % 12
  var rootFretLowE = (rootPc - 4 + 12) % 12;

  // CAGED shapes span:
  // Position 1 (C shape): root on 5th string A, starts ~rootFretLowE-2
  // We'll use a simplified mapping: 5 positions each 4 frets wide
  // starting from positions derived from root on low E or A string
  var positions = [];
  var starts = [
    rootFretLowE,
    (rootFretLowE + 3) % 12,
    (rootFretLowE + 5) % 12,
    (rootFretLowE + 7) % 12,
    (rootFretLowE + 10) % 12
  ];

  for (var p = 0; p < 5; p++) {
    var s = starts[p];
    // Normalize to fit fretboard 0-15; wrap around
    if (s > 12) s = s - 12;
    positions.push({ start: s, end: s + 4, posNum: p + 1 });
  }

  return positions;
}

// ---------------------------------------------------------------
// renderFretboard()
// Main render function. Called when key/mode/position changes.
// ---------------------------------------------------------------
function renderFretboard() {
  var section = document.getElementById('fretboard-section');
  if (!section) return;

  var key = AppState.currentKey;
  if (!key) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  var modeIndex = AppState.currentMode || 0;
  var position  = AppState.currentPosition || 'all';
  var showNames = AppState.showNoteNames !== false;

  var scaleNotes = getScaleNotes(key, modeIndex);
  var rootPc     = scaleNotes[0];

  // Character notes for this mode (as pitch classes)
  var charDegrees = MODE_CHARACTER[MODE_NAMES[modeIndex]] || [];
  var charPcs = charDegrees.map(function(deg) { return scaleNotes[deg]; });

  // Note names for display
  var noteNames = getScaleNoteNames(key, modeIndex);
  var intervalLabels = ['1', '2', '3', '4', '5', '6', '7'];
  // Build map from pitch class to display label
  var pcToLabel = {};
  var pcToInterval = {};
  scaleNotes.forEach(function(pc, i) {
    pcToLabel[pc] = noteNames[i];
    pcToInterval[pc] = intervalLabels[i];
  });

  // Position filter
  var positionRange = null;
  if (position !== 'all' && typeof position === 'number') {
    var positions = getCAGEDPositions(key);
    positionRange = positions[position - 1] || null;
  }

  // SVG dimensions
  var NUM_FRETS   = 15;
  var NUM_STRINGS = 6;
  var SVG_W       = 920;
  var SVG_H       = 160;
  var MARGIN_LEFT = 40;
  var MARGIN_TOP  = 20;
  var FRET_W      = (SVG_W - MARGIN_LEFT - 20) / NUM_FRETS;
  var STR_H       = (SVG_H - MARGIN_TOP - 20) / (NUM_STRINGS - 1);
  var DOT_R       = 9;
  var NUT_X       = MARGIN_LEFT;

  var svg = document.getElementById('fretboard-svg');
  if (!svg) return;

  // Clear SVG
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  function svgEl(tag, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs).forEach(function(k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  // Draw nut
  svg.appendChild(svgEl('line', {
    x1: NUT_X, y1: MARGIN_TOP,
    x2: NUT_X, y2: MARGIN_TOP + (NUM_STRINGS - 1) * STR_H,
    'class': 'fb-nut'
  }));

  // Draw fret lines
  for (var f = 1; f <= NUM_FRETS; f++) {
    var fx = MARGIN_LEFT + f * FRET_W;
    svg.appendChild(svgEl('line', {
      x1: fx, y1: MARGIN_TOP,
      x2: fx, y2: MARGIN_TOP + (NUM_STRINGS - 1) * STR_H,
      'class': 'fb-fret-line'
    }));

    // Fret number labels
    if ([3, 5, 7, 9, 12, 15].indexOf(f) !== -1) {
      var labelX = MARGIN_LEFT + (f - 0.5) * FRET_W;
      var lbl = svgEl('text', {
        x: labelX,
        y: MARGIN_TOP + (NUM_STRINGS - 1) * STR_H + 16,
        'class': 'fb-fret-label',
        'text-anchor': 'middle'
      });
      lbl.textContent = f;
      svg.appendChild(lbl);
    }
  }

  // Draw string lines
  // If lefty: string 0 (low E) is on RIGHT (index 5 visual position)
  //           string 5 (high e) is on LEFT (index 0 visual position)
  // If righty: string 0 (low E) on TOP of visual (index 0)
  // Standard guitar diagrams: top string = low E (thickest)
  for (var s = 0; s < NUM_STRINGS; s++) {
    var sy = MARGIN_TOP + s * STR_H;
    var strokeW = 1 + (NUM_STRINGS - 1 - s) * 0.35; // thicker = lower string
    if (AppState.isLefty) {
      strokeW = 1 + s * 0.35; // reversed for lefty
    }
    svg.appendChild(svgEl('line', {
      x1: NUT_X, y1: sy,
      x2: MARGIN_LEFT + NUM_FRETS * FRET_W, y2: sy,
      'class': 'fb-string-line',
      'stroke-width': strokeW
    }));
  }

  // Inlay dots (decorative)
  var inlayFrets = [3, 5, 7, 9, 12];
  inlayFrets.forEach(function(f) {
    var ix = MARGIN_LEFT + (f - 0.5) * FRET_W;
    var iy = MARGIN_TOP + ((NUM_STRINGS - 1) / 2) * STR_H;
    if (f === 12) {
      svg.appendChild(svgEl('circle', { cx: ix, cy: iy - STR_H * 0.8, r: 4, 'class': 'fb-inlay' }));
      svg.appendChild(svgEl('circle', { cx: ix, cy: iy + STR_H * 0.8, r: 4, 'class': 'fb-inlay' }));
    } else {
      svg.appendChild(svgEl('circle', { cx: ix, cy: iy, r: 4, 'class': 'fb-inlay' }));
    }
  });

  // String order for display:
  // For standard (righty): strings array index 0 = top row = low E (pitch string 0)
  // For lefty: strings array index 0 = top row = high e (pitch string 5)
  function getPhysicalString(visualRow) {
    // visualRow 0 = top of fretboard
    if (AppState.isLefty) {
      return NUM_STRINGS - 1 - visualRow; // lefty: top = high e
    } else {
      return visualRow; // righty: top = low E
    }
  }

  // Draw scale dots
  for (var row = 0; row < NUM_STRINGS; row++) {
    var physStr = getPhysicalString(row);
    var openPitch = OPEN_PITCHES[physStr];
    var sy2 = MARGIN_TOP + row * STR_H;

    for (var fret = 0; fret <= NUM_FRETS; fret++) {
      var notePc = (openPitch + fret) % 12;

      if (scaleNotes.indexOf(notePc) === -1) continue;

      // Check position filter
      if (positionRange) {
        if (fret < positionRange.start || fret > positionRange.end) continue;
      }

      var dotX;
      if (fret === 0) {
        dotX = NUT_X - 14; // open string — place left of nut
      } else {
        dotX = MARGIN_LEFT + (fret - 0.5) * FRET_W;
      }

      // Determine dot class
      var dotClass;
      if (notePc === rootPc) {
        dotClass = 'fb-dot fb-dot-root';
      } else if (charPcs.indexOf(notePc) !== -1) {
        dotClass = 'fb-dot fb-dot-character';
      } else {
        dotClass = 'fb-dot fb-dot-scale';
      }

      // Draw dot circle
      svg.appendChild(svgEl('circle', {
        cx: dotX, cy: sy2, r: DOT_R,
        'class': dotClass
      }));

      // Draw label
      var labelText = showNames ? pcToLabel[notePc] : pcToInterval[notePc];
      if (labelText) {
        var textEl = svgEl('text', {
          x: dotX, y: sy2 + 1,
          'class': 'fb-dot-label',
          'text-anchor': 'middle',
          'dominant-baseline': 'central'
        });
        textEl.textContent = labelText;
        svg.appendChild(textEl);
      }
    }
  }

  // Update active states on mode buttons
  document.querySelectorAll('.fb-mode-btn').forEach(function(btn, i) {
    btn.classList.toggle('active', i === modeIndex);
  });

  // Update CAGED position buttons
  document.querySelectorAll('.fb-pos-btn').forEach(function(btn) {
    var val = btn.dataset.pos;
    var current = AppState.currentPosition || 'all';
    btn.classList.toggle('active', String(val) === String(current));
  });

  // Update note/interval toggle label
  var toggleBtn = document.getElementById('fb-toggle-labels');
  if (toggleBtn) {
    toggleBtn.textContent = showNames ? 'Show Intervals' : 'Show Notes';
  }
}

// ---------------------------------------------------------------
// initFretboard()
// Creates the fretboard section HTML, wires up controls.
// ---------------------------------------------------------------
function initFretboard() {
  var section = document.getElementById('fretboard-section');
  if (!section) return;

  // Build mode buttons
  var modeBtnsHtml = MODE_NAMES.map(function(name, i) {
    return '<button class="btn fb-mode-btn" data-mode="' + i + '">' + name + '</button>';
  }).join('');

  // Build CAGED position buttons
  var posBtnsHtml = '<button class="btn fb-pos-btn active" data-pos="all">All</button>';
  for (var p = 1; p <= 5; p++) {
    posBtnsHtml += '<button class="btn fb-pos-btn" data-pos="' + p + '">Pos ' + p + '</button>';
  }

  section.innerHTML =
    '<div class="panel panel--fretboard">' +
      '<div class="panel-title">Fretboard <span id="fb-key-label"></span></div>' +
      '<div class="fretboard-controls">' +
        '<div class="fretboard-control-group">' +
          '<span class="fretboard-control-label">Mode</span>' +
          modeBtnsHtml +
        '</div>' +
        '<div class="fretboard-control-group">' +
          '<span class="fretboard-control-label">Position</span>' +
          posBtnsHtml +
        '</div>' +
        '<div class="fretboard-control-group">' +
          '<button class="btn" id="fb-toggle-labels">Show Intervals</button>' +
        '</div>' +
      '</div>' +
      '<div class="fretboard-wrap">' +
        '<svg id="fretboard-svg" viewBox="0 0 920 160" width="100%" preserveAspectRatio="xMidYMid meet"' +
             ' aria-label="Interactive guitar fretboard showing scale notes"></svg>' +
      '</div>' +
      '<div class="fretboard-legend">' +
        '<span class="fb-legend-item fb-legend-root">Root</span>' +
        '<span class="fb-legend-item fb-legend-char">Character Note</span>' +
        '<span class="fb-legend-item fb-legend-scale">Scale Tone</span>' +
      '</div>' +
    '</div>';

  // Mode buttons
  section.addEventListener('click', function(e) {
    var modeBtn = e.target.closest('.fb-mode-btn');
    if (modeBtn) {
      AppState.currentMode = parseInt(modeBtn.dataset.mode, 10);
      renderFretboard();
      // Also update mode relationship panel if visible
      if (typeof renderModeRelPanel === 'function') renderModeRelPanel();
      return;
    }

    var posBtn = e.target.closest('.fb-pos-btn');
    if (posBtn) {
      var val = posBtn.dataset.pos;
      AppState.currentPosition = val === 'all' ? 'all' : parseInt(val, 10);
      renderFretboard();
      return;
    }

    var toggleBtn = e.target.closest('#fb-toggle-labels');
    if (toggleBtn) {
      AppState.showNoteNames = !AppState.showNoteNames;
      renderFretboard();
      return;
    }
  });
}
