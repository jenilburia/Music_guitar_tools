/* =============================================================
   progression.js — Progression builder state and rendering
   v2: + Harmonic function analysis panel (Feature 13)
       + Practice mode integration
   ============================================================= */

var MAX_SLOTS = 8;

// Internal state: array of chord descriptor objects
var _progression = [];

// ---------------------------------------------------------------
// Harmonic function classification by scale degree (0-based)
// Tonic:       I(0), iii(2), vi(5)
// Subdominant: ii(1), IV(3)
// Dominant:    V(4), vii°(6)
// ---------------------------------------------------------------
var HARMONIC_FUNCTION = {
  0: { label: 'Tonic',       cls: 'fn-tonic',       abbr: 'T' },
  1: { label: 'Subdominant', cls: 'fn-subdominant',  abbr: 'SD' },
  2: { label: 'Tonic',       cls: 'fn-tonic',        abbr: 'T' },
  3: { label: 'Subdominant', cls: 'fn-subdominant',  abbr: 'SD' },
  4: { label: 'Dominant',    cls: 'fn-dominant',     abbr: 'D' },
  5: { label: 'Tonic',       cls: 'fn-tonic',        abbr: 'T' },
  6: { label: 'Dominant',    cls: 'fn-dominant',     abbr: 'D' }
};

// Plain-English summary patterns (keyed by function sequence)
function buildFunctionSummary(chords) {
  if (!chords.length) return '';

  var funcs = chords.map(function(c) {
    var deg = c.modeIndex; // 0-based degree in parent key
    if (c.borrowed) return 'B'; // borrowed chord
    var fn = HARMONIC_FUNCTION[deg];
    return fn ? fn.abbr : '?';
  });

  var sequence = funcs.join('-');

  // Common patterns → plain English
  var patterns = {
    'T-D-T':      'Classic tonic–dominant–tonic. Stable, resolved.',
    'T-SD-D':     'Perfect authentic cadence motion. Textbook resolved.',
    'T-SD-D-T':   'Textbook I–IV–V–I. The foundation of Western harmony.',
    'T-D-SD-T':   'Deceptive motion through the subdominant. Interesting and unresolved.',
    'T-T-SD-D':   'Opens on tonic color, moves to subdominant then dominant for tension.',
    'SD-D-T':     'ii–V–I jazz turnaround. Smooth pull to home.',
    'T-SD-T-D':   'Circular progression mixing tonic and color chords.',
    'D-SD-T-D':   'Starts with tension, relaxes through subdominant, then pushes again.',
  };

  if (patterns[sequence]) return patterns[sequence];

  // Generic summary based on function counts
  var counts = { T: 0, SD: 0, D: 0, B: 0 };
  funcs.forEach(function(f) { if (counts[f] !== undefined) counts[f]++; });

  var parts = [];
  if (counts.T > 0) parts.push(counts.T + ' tonic');
  if (counts.SD > 0) parts.push(counts.SD + ' subdominant');
  if (counts.D > 0) parts.push(counts.D + ' dominant');
  if (counts.B > 0) parts.push(counts.B + ' borrowed');

  var last = funcs[funcs.length - 1];
  var feeling = last === 'T' ? 'Resolves home.' : last === 'D' ? 'Ends with tension — wants to continue.' : 'Open-ended feel.';

  return parts.join(', ') + ' chord' + (parts.length > 1 ? 's' : '') + '. ' + feeling;
}

// ---------------------------------------------------------------
// addToProgression(chord)
// Appends a chord descriptor to the progression (max MAX_SLOTS).
// ---------------------------------------------------------------
function addToProgression(chord) {
  if (_progression.length >= MAX_SLOTS) return;
  _progression.push(chord);
  renderProgression();
  updateProgressionHint();
  renderAnalysisPanel();
  if (typeof window.onProgressionChanged === 'function') window.onProgressionChanged();
}

// ---------------------------------------------------------------
// removeFromProgression(index)
// Removes chord at array index.
// ---------------------------------------------------------------
function removeFromProgression(index) {
  _progression.splice(index, 1);
  renderProgression();
  updateProgressionHint();
  renderAnalysisPanel();
  if (typeof window.onProgressionChanged === 'function') window.onProgressionChanged();
}

// ---------------------------------------------------------------
// clearProgression()
// ---------------------------------------------------------------
function clearProgression() {
  _progression = [];
  renderProgression();
  updateProgressionHint();
  renderAnalysisPanel();
  if (typeof window.stopPractice === 'function') window.stopPractice();
  if (typeof window.onProgressionChanged === 'function') window.onProgressionChanged();
}

// ---------------------------------------------------------------
// setProgression(chords)
// Replaces entire progression with an array of chord descriptors.
// Used by the generator to populate from a template.
// ---------------------------------------------------------------
function setProgression(chords) {
  _progression = chords.slice(0, MAX_SLOTS);
  renderProgression();
  updateProgressionHint();
  renderAnalysisPanel();
  if (typeof window.onProgressionChanged === 'function') window.onProgressionChanged();
}

// ---------------------------------------------------------------
// getProgression()
// Returns a copy of the current progression array.
// Used by audio.js to play all chords in sequence.
// ---------------------------------------------------------------
function getProgression() {
  return _progression.slice();
}

// ---------------------------------------------------------------
// getProgressionString()
// Returns human-readable string e.g. "Am - F - C - G"
// ---------------------------------------------------------------
function getProgressionString() {
  return _progression.map(function(c) { return c.chordName; }).join(' - ');
}

// ---------------------------------------------------------------
// renderProgression()
// Renders the progression slot strip into #progression-slots.
// Shows filled slots for chords, empty dashed slots for blanks.
// ---------------------------------------------------------------
function renderProgression() {
  var container = document.getElementById('progression-slots');
  container.innerHTML = '';

  for (var i = 0; i < MAX_SLOTS; i++) {
    var slot = document.createElement('div');

    if (_progression[i]) {
      var chord = _progression[i];
      var slotCls = 'prog-slot prog-slot--filled prog-slot--' + chord.quality;
      if (chord.borrowed) slotCls += ' prog-slot--borrowed';
      slot.className = slotCls;
      slot.dataset.slotIndex = i;

      var removeBtn = document.createElement('button');
      removeBtn.className = 'prog-remove';
      removeBtn.dataset.index = i;
      removeBtn.title = 'Remove';
      removeBtn.innerHTML = '&times;';

      var playBtn = document.createElement('button');
      playBtn.className = 'prog-play';
      playBtn.dataset.voicingKey = chord.voicingKey;
      playBtn.title = 'Play ' + chord.chordName;
      playBtn.innerHTML = '&#9654;';

      var romanEl = document.createElement('span');
      romanEl.className = 'prog-roman';
      romanEl.textContent = chord.roman;

      var nameEl = document.createElement('span');
      nameEl.className = 'prog-name';
      nameEl.textContent = chord.chordName;

      // Countdown bar for practice mode
      var barEl = document.createElement('div');
      barEl.className = 'prog-slot-bar';

      slot.appendChild(removeBtn);
      slot.appendChild(romanEl);
      slot.appendChild(nameEl);
      slot.appendChild(playBtn);
      slot.appendChild(barEl);
    } else {
      slot.className = 'prog-slot prog-slot--empty';
    }

    container.appendChild(slot);
  }

  // Attach remove button handlers
  container.querySelectorAll('.prog-remove').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      removeFromProgression(parseInt(btn.dataset.index, 10));
    });
  });
}

// ---------------------------------------------------------------
// updateProgressionHint()
// Shows/hides the helper hint text.
// ---------------------------------------------------------------
function updateProgressionHint() {
  var hint = document.getElementById('progression-hint');
  if (!hint) return;
  hint.style.display = _progression.length === 0 ? 'block' : 'none';
}

// ---------------------------------------------------------------
// renderAnalysisPanel()
// Renders the harmonic function analysis below the progression.
// Only shows when 2+ chords are in the progression.
// ---------------------------------------------------------------
function renderAnalysisPanel() {
  var panel = document.getElementById('analysis-panel');
  if (!panel) return;

  if (_progression.length < 2) {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  panel.style.display = 'block';

  var chordsHtml = _progression.map(function(chord) {
    var deg = chord.modeIndex;
    var fn  = chord.borrowed ? { label: 'Borrowed', cls: 'fn-borrowed', abbr: 'B' } : (HARMONIC_FUNCTION[deg] || { label: '?', cls: '', abbr: '?' });
    return '<div class="analysis-chord">' +
      '<span class="analysis-chord-name">' + chord.chordName + '</span>' +
      '<span class="analysis-fn ' + fn.cls + '">' + fn.label + '</span>' +
    '</div>';
  }).join('');

  var summary = buildFunctionSummary(_progression);

  panel.innerHTML =
    '<div class="analysis-panel">' +
      '<div class="analysis-chords-row">' + chordsHtml + '</div>' +
      '<p class="analysis-summary">' + summary + '</p>' +
    '</div>';
}
