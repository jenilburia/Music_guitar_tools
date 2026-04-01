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

// Mode character notes (degree indices that differ from major scale)
// Indices are 0-based positions in the parallel mode's own note array
var MODE_CHARACTER = {
  'Ionian':     [],
  'Dorian':     [2, 6],    // b3, b7
  'Phrygian':   [1, 5],    // b2, b6
  'Lydian':     [3],       // #4
  'Mixolydian': [6],       // b7
  'Aeolian':    [2, 5, 6], // b3, b6, b7
  'Locrian':    [1, 4],    // b2, b5
};

// Scale character note degree indices (0-based in scale's own interval array)
var SCALE_CHARACTER = {
  'Minor Pentatonic': [1],
  'Major Pentatonic': [1,4],
  'Blues Scale':      [3],
  'Major Blues':      [2],
  'Harmonic Minor':   [5,6],
  'Melodic Minor':    [5,6],
  'Diminished W-H':   [4,6],
  'Whole Tone':       [3,4],
};

// ---------------------------------------------------------------
// getScaleNotesForScale(key, scaleIndex)
// Returns array of chromatic pitch classes (0–11) for the given
// non-modal scale built on the given key as root.
// ---------------------------------------------------------------
function getScaleNotesForScale(key, scaleIndex) {
  var normalized = normalizeKey(key);
  var rootIdx = CHROMATIC.indexOf(normalized);
  if (rootIdx === -1) return [];
  return SCALE_DATA[scaleIndex].intervals.map(function(iv) {
    return (rootIdx + iv) % 12;
  });
}

// ---------------------------------------------------------------
// getScaleNotes(key, modeIndex)
// Returns array of 7 chromatic pitch classes (0–11) for the
// parallel mode built on the given key as root.
// e.g. getScaleNotes('C', 1) → C Dorian → [0,2,3,5,7,9,10]
// scaleNotes[0] is always the key root regardless of mode.
// ---------------------------------------------------------------
function getScaleNotes(key, modeIndex) {
  var normalized = normalizeKey(key);
  var rootIdx = CHROMATIC.indexOf(normalized);
  if (rootIdx === -1) return [];
  return MODE_INTERVALS[modeIndex].map(function(iv) { return (rootIdx + iv) % 12; });
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
  if (typeof stopFretboardPractice === 'function') stopFretboardPractice();

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

  var isScaleMode = AppState.scaleMode === 'scales';
  var scaleNotes, rootPc, charPcs, noteNames, intervalLabels;
  if (isScaleMode) {
    var scaleIndex = AppState.currentScale || 0;
    var scaleDef = SCALE_DATA[scaleIndex];
    scaleNotes = getScaleNotesForScale(key, scaleIndex);
    rootPc = scaleNotes[0];
    charPcs = (SCALE_CHARACTER[scaleDef.name] || []).map(function(d) { return scaleNotes[d]; });
    noteNames = getScaleNoteNamesForScale(key, scaleIndex);
    intervalLabels = scaleDef.intervalLabels;
  } else {
    scaleNotes = getScaleNotes(key, modeIndex);
    rootPc = scaleNotes[0];
    var charDegrees = MODE_CHARACTER[MODE_NAMES[modeIndex]] || [];
    charPcs = charDegrees.map(function(deg) { return scaleNotes[deg]; });
    noteNames = getScaleNoteNames(key, modeIndex);
    intervalLabels = getModeIntervalLabels(modeIndex);
  }

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

  var isLefty = AppState.isLefty;
  function fx(x) { return isLefty ? (SVG_W - x) : x; }

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
    x1: fx(NUT_X), y1: MARGIN_TOP,
    x2: fx(NUT_X), y2: MARGIN_TOP + (NUM_STRINGS - 1) * STR_H,
    'class': 'fb-nut'
  }));

  // Draw fret lines
  for (var f = 1; f <= NUM_FRETS; f++) {
    var fretLineX = fx(MARGIN_LEFT + f * FRET_W);
    svg.appendChild(svgEl('line', {
      x1: fretLineX, y1: MARGIN_TOP,
      x2: fretLineX, y2: MARGIN_TOP + (NUM_STRINGS - 1) * STR_H,
      'class': 'fb-fret-line'
    }));

    // Fret number labels
    if ([3, 5, 7, 9, 12, 15].indexOf(f) !== -1) {
      var labelX = fx(MARGIN_LEFT + (f - 0.5) * FRET_W);
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
    var strokeW = 1 + (NUM_STRINGS - 1 - s) * 0.35; // thicker = lower-pitched string (top)
    svg.appendChild(svgEl('line', {
      x1: fx(NUT_X), y1: sy,
      x2: fx(MARGIN_LEFT + NUM_FRETS * FRET_W), y2: sy,
      'class': 'fb-string-line',
      'stroke-width': strokeW
    }));
  }

  // Inlay dots (decorative)
  var inlayFrets = [3, 5, 7, 9, 12];
  inlayFrets.forEach(function(f) {
    var ix = fx(MARGIN_LEFT + (f - 0.5) * FRET_W);
    var iy = MARGIN_TOP + ((NUM_STRINGS - 1) / 2) * STR_H;
    if (f === 12) {
      svg.appendChild(svgEl('circle', { cx: ix, cy: iy - STR_H * 0.8, r: 4, 'class': 'fb-inlay' }));
      svg.appendChild(svgEl('circle', { cx: ix, cy: iy + STR_H * 0.8, r: 4, 'class': 'fb-inlay' }));
    } else {
      svg.appendChild(svgEl('circle', { cx: ix, cy: iy, r: 4, 'class': 'fb-inlay' }));
    }
  });

  // String order for display:
  // Both righty and lefty: top = low E (fat string), bottom = high e (thin string).
  // Horizontal flip is handled separately by fx(). String order always matches
  // the player's view looking down at the fretboard.
  function getPhysicalString(visualRow) {
    return visualRow;
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
        dotX = fx(NUT_X - 14); // open string — place outside nut
      } else {
        dotX = fx(MARGIN_LEFT + (fret - 0.5) * FRET_W);
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
        'class': dotClass,
        'data-prac-s': physStr,
        'data-prac-f': fret
      }));

      // Draw label
      var labelText = showNames ? pcToLabel[notePc] : pcToInterval[notePc];
      if (labelText) {
        var textEl = svgEl('text', {
          x: dotX, y: sy2 + 1,
          'class': 'fb-dot-label',
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'data-prac-s': physStr,
          'data-prac-f': fret
        });
        textEl.textContent = labelText;
        svg.appendChild(textEl);
      }
    }
  }

  // Update active states on mode or scale buttons
  if (!isScaleMode) {
    document.querySelectorAll('.fb-mode-btn').forEach(function(btn, i) {
      btn.classList.toggle('active', i === modeIndex);
    });
  } else {
    var activeSI = AppState.currentScale || 0;
    document.querySelectorAll('.fb-scale-btn').forEach(function(btn) {
      btn.classList.toggle('active', parseInt(btn.dataset.scale, 10) === activeSI);
    });
  }
  // Update type buttons
  document.querySelectorAll('.fb-type-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.type === (AppState.scaleMode || 'modes'));
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

  // Build type switcher buttons
  var typeBtnsHtml =
    '<button class="btn fb-type-btn active" data-type="modes" title="Show modes of the selected key">MODES</button>' +
    '<button class="btn fb-type-btn" data-type="scales" title="Show standalone scale shapes">SCALES</button>';

  // Build mode buttons
  var modeBtnsHtml = MODE_NAMES.map(function(name, i) {
    return '<button class="btn fb-mode-btn" data-mode="' + i + '" title="' + name + ' mode">' + name + '</button>';
  }).join('');

  // Build scale buttons from SCALE_DATA
  var scaleBtnsHtml = SCALE_DATA.map(function(sd, i) {
    return '<button class="btn fb-scale-btn" data-scale="' + i + '" title="' + sd.name + '">' + sd.shortName + '</button>';
  }).join('');

  // Build CAGED position buttons
  var posBtnsHtml = '<button class="btn fb-pos-btn active" data-pos="all" title="Show all positions">All</button>';
  for (var p = 1; p <= 5; p++) {
    posBtnsHtml += '<button class="btn fb-pos-btn" data-pos="' + p + '" title="CAGED Position ' + p + '">Pos ' + p + '</button>';
  }

  section.innerHTML =
    '<div class="panel panel--fretboard">' +
      '<div class="panel-title">Fretboard <span id="fb-key-label"></span></div>' +
      '<div class="fretboard-controls">' +
        '<div class="fretboard-control-group">' +
          typeBtnsHtml +
        '</div>' +
        '<div class="fretboard-control-group" id="fb-mode-row">' +
          modeBtnsHtml +
        '</div>' +
        '<div class="fretboard-control-group" id="fb-scale-row" style="display:none">' +
          scaleBtnsHtml +
        '</div>' +
        '<div class="fretboard-control-group">' +
          '<span class="fretboard-control-label">Position</span>' +
          posBtnsHtml +
        '</div>' +
        '<div class="fretboard-control-group">' +
          '<button class="btn" id="fb-toggle-labels">Show Intervals</button>' +
        '</div>' +
        '<div class="fretboard-control-group">' +
          '<button class="btn" id="fb-practice-btn">&#9654; Play Scale</button>' +
          '<label class="fb-bpm-label">BPM' +
            '<input type="number" id="fb-bpm-input" value="60" min="30" max="200" class="fb-bpm-input">' +
          '</label>' +
          '<span id="fb-practice-info" class="fb-practice-info"></span>' +
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

  section.addEventListener('click', function(e) {
    // Type switcher (MODES / SCALES)
    var typeBtn = e.target.closest('.fb-type-btn');
    if (typeBtn) {
      AppState.scaleMode = typeBtn.dataset.type;
      AppState.currentPosition = 'all';
      localStorage.setItem('scaleMode', AppState.scaleMode);
      var modeRow = document.getElementById('fb-mode-row');
      var scaleRow = document.getElementById('fb-scale-row');
      if (modeRow) modeRow.style.display = AppState.scaleMode === 'modes' ? '' : 'none';
      if (scaleRow) scaleRow.style.display = AppState.scaleMode === 'scales' ? '' : 'none';
      var fbKeyLabel = document.getElementById('fb-key-label');
      if (fbKeyLabel && AppState.currentKey) {
        if (AppState.scaleMode === 'scales') {
          fbKeyLabel.textContent = '— ' + AppState.currentKey + ' ' + SCALE_DATA[AppState.currentScale || 0].name;
        } else {
          fbKeyLabel.textContent = '— ' + AppState.currentKey + ' ' + MODE_NAMES[AppState.currentMode || 0];
        }
      }
      renderFretboard();
      if (AppState.scaleMode === 'scales') {
        if (typeof renderScaleRelPanel === 'function') renderScaleRelPanel();
        if (typeof renderModeRelPanel === 'function') renderModeRelPanel();
      } else {
        if (typeof renderScaleRelPanel === 'function') renderScaleRelPanel();
        if (typeof renderModeRelPanel === 'function') renderModeRelPanel();
      }
      return;
    }

    // Mode buttons
    var modeBtn = e.target.closest('.fb-mode-btn');
    if (modeBtn) {
      AppState.currentMode = parseInt(modeBtn.dataset.mode, 10);
      var fbKeyLabel = document.getElementById('fb-key-label');
      if (fbKeyLabel && AppState.currentKey) {
        fbKeyLabel.textContent = '— ' + AppState.currentKey + ' ' + MODE_NAMES[AppState.currentMode];
      }
      renderFretboard();
      if (typeof renderModeRelPanel === 'function') renderModeRelPanel();
      return;
    }

    // Scale buttons
    var scaleBtn = e.target.closest('.fb-scale-btn');
    if (scaleBtn) {
      AppState.currentScale = parseInt(scaleBtn.dataset.scale, 10);
      localStorage.setItem('currentScale', AppState.currentScale);
      AppState.currentPosition = 'all';
      var fbKeyLabel = document.getElementById('fb-key-label');
      if (fbKeyLabel && AppState.currentKey) {
        fbKeyLabel.textContent = '— ' + AppState.currentKey + ' ' + SCALE_DATA[AppState.currentScale].name;
      }
      renderFretboard();
      if (typeof renderScaleRelPanel === 'function') renderScaleRelPanel();
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

    var practiceBtn = e.target.closest('#fb-practice-btn');
    if (practiceBtn) {
      if (_fbPracticeTimer) {
        stopFretboardPractice();
      } else {
        startFretboardPractice();
      }
      return;
    }
  });

  section.addEventListener('change', function(e) {
    if (e.target.id === 'fb-bpm-input' && _fbPracticeTimer) {
      startFretboardPractice();
    }
  });
}

// ── Fretboard Practice Mode ─────────────────────────────────
var _fbPracticeTimer = null;
var _fbPracticeSeq   = [];
var _fbPracticeIdx   = 0;
var _fbPracticeDir   = 1;  // 1 = ascending, -1 = descending

function getFretboardPracticeSequence() {
  var key = AppState.currentKey;
  if (!key) return [];
  var position   = AppState.currentPosition || 'all';
  var scaleNotes;
  if (AppState.scaleMode === 'scales') {
    scaleNotes = getScaleNotesForScale(key, AppState.currentScale || 0);
  } else {
    scaleNotes = getScaleNotes(key, AppState.currentMode || 0);
  }
  var MIDI_OPEN  = [40, 45, 50, 55, 59, 64];

  var positionRange = null;
  if (position !== 'all' && typeof position === 'number') {
    var positions = getCAGEDPositions(key);
    positionRange = positions[position - 1] || null;
  }

  var notes = [];
  for (var physStr = 0; physStr < 6; physStr++) {
    var openPitch = OPEN_PITCHES[physStr];
    for (var fret = 0; fret <= 15; fret++) {
      var notePc = (openPitch + fret) % 12;
      if (scaleNotes.indexOf(notePc) === -1) continue;
      if (positionRange && (fret < positionRange.start || fret > positionRange.end)) continue;
      var degreeIdx = scaleNotes.indexOf(notePc);
      notes.push({ physStr: physStr, fret: fret, pc: notePc, degree: degreeIdx + 1,
                   midi: MIDI_OPEN[physStr] + fret });
    }
  }
  notes.sort(function(a, b) { return a.midi - b.midi; });

  // Rotate to start from modal root so each mode sounds distinct.
  // scaleNotes[0] is always the modal root (e.g., D for Dorian, E for Phrygian).
  var rootPc = scaleNotes[0];
  var rootNoteIdx = -1;
  for (var i = 0; i < notes.length; i++) {
    if (notes[i].pc === rootPc) { rootNoteIdx = i; break; }
  }
  if (rootNoteIdx > 0) {
    notes = notes.slice(rootNoteIdx).concat(notes.slice(0, rootNoteIdx));
  }

  return notes;
}

function _fbPracticeStep() {
  document.querySelectorAll('[data-prac-s].fb-dot--active').forEach(function(el) {
    el.classList.remove('fb-dot--active');
  });

  var note = _fbPracticeSeq[_fbPracticeIdx];
  if (!note) { stopFretboardPractice(); return; }

  // Highlight circle + label
  var svg = document.getElementById('fretboard-svg');
  if (svg) {
    svg.querySelectorAll('[data-prac-s="' + note.physStr + '"][data-prac-f="' + note.fret + '"]')
      .forEach(function(el) { el.classList.add('fb-dot--active'); });
  }

  if (typeof window.playScaleNote === 'function') {
    window.playScaleNote(note.midi, 0.45);
  }

  // Show degree label
  var ivLabels, noteNamesArr;
  if (AppState.scaleMode === 'scales') {
    var si = AppState.currentScale || 0;
    ivLabels = SCALE_DATA[si].intervalLabels;
    noteNamesArr = getScaleNoteNamesForScale(AppState.currentKey, si);
  } else {
    ivLabels = getModeIntervalLabels(AppState.currentMode || 0);
    noteNamesArr = getScaleNoteNames(AppState.currentKey, AppState.currentMode || 0);
  }
  var degLabel = ivLabels[note.degree - 1] || String(note.degree);
  var noteName  = noteNamesArr[note.degree - 1] || '';
  var info = document.getElementById('fb-practice-info');
  if (info) info.textContent = degLabel + (noteName ? '  \u00b7  ' + noteName : '');

  // Advance and bounce
  _fbPracticeIdx += _fbPracticeDir;
  if (_fbPracticeIdx >= _fbPracticeSeq.length) {
    _fbPracticeDir = -1;
    _fbPracticeIdx = _fbPracticeSeq.length - 2;
  } else if (_fbPracticeIdx < 0) {
    _fbPracticeDir = 1;
    _fbPracticeIdx = 1;
  }
}

function startFretboardPractice() {
  stopFretboardPractice();
  _fbPracticeSeq = getFretboardPracticeSequence();
  if (!_fbPracticeSeq.length) return;
  _fbPracticeIdx = 0;
  _fbPracticeDir = 1;

  var bpmInput = document.getElementById('fb-bpm-input');
  var bpm      = bpmInput ? (parseInt(bpmInput.value, 10) || 60) : 60;
  var interval = Math.round(60000 / bpm);

  _fbPracticeStep();
  _fbPracticeTimer = setInterval(_fbPracticeStep, interval);

  var btn = document.getElementById('fb-practice-btn');
  if (btn) btn.textContent = '\u25a0 Stop';
}

function stopFretboardPractice() {
  if (_fbPracticeTimer) { clearInterval(_fbPracticeTimer); _fbPracticeTimer = null; }
  document.querySelectorAll('[data-prac-s].fb-dot--active').forEach(function(el) {
    el.classList.remove('fb-dot--active');
  });
  var btn  = document.getElementById('fb-practice-btn');
  if (btn)  btn.textContent = '\u25b6 Play Scale';
  var info = document.getElementById('fb-practice-info');
  if (info) info.textContent = '';
}
