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

  // Hide when scale mode is active
  if (AppState.scaleMode === 'scales') {
    panel.style.display = 'none';
    return;
  }

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

// ---------------------------------------------------------------
// LEARNING_PATH — recommended scale/mode study order
// ---------------------------------------------------------------
var LEARNING_PATH = [
  { step:1,  name:'Minor Pentatonic',  type:'scale',
    why:'The most-used scale in rock and blues. Five notes, zero stress. This is the motherlode.',
    tip:'Learn position 1 on the low E string first. Use hammer-ons and pull-offs freely.',
    connectsTo:'Blues Scale' },
  { step:2,  name:'Blues Scale',       type:'scale',
    why:"Add one note — the ♭5 — to Minor Pentatonic. That single note unlocks every blues lick you've ever heard.",
    tip:'Reach for the ♭5 when you want maximum tension. Resolve back to the 5 or root.',
    connectsTo:'Aeolian' },
  { step:3,  name:'Aeolian',           type:'mode',
    why:'Natural minor. Two more notes than Minor Pentatonic. The most expressive mode for dark, emotional music.',
    tip:'Add the 2 and ♭6 to your Pentatonic fingering and you have Aeolian. You already know most of the shape.',
    connectsTo:'Dorian' },
  { step:4,  name:'Dorian',            type:'mode',
    why:"Aeolian with a raised 6th — that one change makes it sound soulful instead of sad. Santana and Miles Davis live here.",
    tip:'Think Aeolian but sharpen the 6th by one fret. Use over ii chords and minor funk grooves.',
    connectsTo:'Major Pentatonic' },
  { step:5,  name:'Major Pentatonic',  type:'scale',
    why:'The bright twin of Minor Pentatonic. Country, pop, clean rock. Five notes, no wrong notes.',
    tip:'It shares the same shape as Minor Pentatonic — just start 3 frets lower than the minor root.',
    connectsTo:'Ionian' },
  { step:6,  name:'Ionian',            type:'mode',
    why:'The major scale itself. The most-analysed scale in Western music. Everything else is built from this.',
    tip:'Add 2 more notes to Major Pentatonic: the 4th and the 7th. You already know the rest.',
    connectsTo:'Mixolydian' },
  { step:7,  name:'Mixolydian',        type:'mode',
    why:"Ionian with a ♭7 — sounds like bluesy rock instead of pure major. Classic rock's home scale.",
    tip:'Play Ionian and flatten the 7th by one fret. Instant rock-blues tonality.',
    connectsTo:'Harmonic Minor' },
  { step:8,  name:'Harmonic Minor',    type:'scale',
    why:'Natural minor with a raised 7th. Exotic, flamenco, metal, neoclassical. That augmented 2nd is the whole sound.',
    tip:'You know Aeolian. Just sharpen the 7th one fret. Suddenly it sounds Spanish.',
    connectsTo:'Melodic Minor' },
  { step:9,  name:'Melodic Minor',     type:'scale',
    why:'Natural minor with raised 6th AND 7th. Smoother than Harmonic Minor. Jazz fusion favourite.',
    tip:'Aeolian + sharpen both 6 and 7. Combines minor feel with major brightness in the upper range.',
    connectsTo:'Phrygian' },
  { step:10, name:'Phrygian',          type:'mode',
    why:'Minor with a ♭2 — dark, exotic, Spanish/metal. That flattened 2nd is everything.',
    tip:'Play Aeolian and flatten the 2nd one fret. Use over bVII chords and metal riffs.',
    connectsTo:'Diminished W-H' },
  { step:11, name:'Diminished W-H',    type:'scale',
    why:'8-note symmetrical scale. Repeats every minor 3rd — learn one shape, transpose +3 to get the next position.',
    tip:'Use over diminished and dominant 7♭9 chords. Bebop and neoclassical territory.',
    connectsTo:'Whole Tone' },
  { step:12, name:'Whole Tone',        type:'scale',
    why:'All whole steps, only 6 notes. Dreamy and unresolved — every note has equal tension. Debussy and altered jazz.',
    tip:'All intervals equal so any note can be the root. Use over augmented and dominant ♯5 chords.',
    connectsTo:null },
];

// ---------------------------------------------------------------
// initScaleRelPanel()
// Builds the initial HTML shell for the Scale Reference Panel.
// ---------------------------------------------------------------
function initScaleRelPanel() {
  var section = document.getElementById('scale-rel-section');
  if (!section) return;

  section.innerHTML =
    '<div class="panel panel--mode-rel">' +
      '<div class="panel-title">Scale Reference Panel</div>' +
      '<div class="mode-rel-panel" id="scale-rel-cards">' +
        '<p class="placeholder">Select a key to explore scales.</p>' +
      '</div>' +
    '</div>';
}

// ---------------------------------------------------------------
// renderScaleRelPanel()
// Renders scale cards for all 8 SCALE_DATA entries.
// Mirrors renderModeRelPanel() in structure.
// ---------------------------------------------------------------
function renderScaleRelPanel() {
  var panel = document.getElementById('scale-rel-section');
  if (!panel) return;

  if (AppState.scaleMode !== 'scales') {
    panel.style.display = 'none';
    return;
  }

  var rootKey = AppState.fretboardRootNote || AppState.currentKey;
  if (!rootKey) {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = 'block';

  var currentScale = AppState.currentScale || 0;
  var container = document.getElementById('scale-rel-cards');
  if (!container) return;
  container.innerHTML = '';

  SCALE_DATA.forEach(function(scaleDef, scaleIndex) {
    var noteNames = getScaleNoteNamesForScale(rootKey, scaleIndex);
    var isActive  = (scaleIndex === currentScale);

    // Interval row
    var intervalHtml = scaleDef.intervalLabels.map(function(iv, i) {
      var isChar = scaleDef.characterDegrees.indexOf(i) !== -1;
      return isChar
        ? '<span class="char-interval-badge">' + iv + '</span>'
        : '<span class="mode-rel-interval">' + iv + '</span>';
    }).join(' ');

    // Note name row
    var noteHtml = noteNames.map(function(n, i) {
      var isChar = scaleDef.characterDegrees.indexOf(i) !== -1;
      return isChar
        ? '<span class="char-note-badge" title="Character note">&#10022; ' + n + '</span>'
        : '<span class="mode-rel-note">' + n + '</span>';
    }).join(' ');

    // Category badge
    var catBadge =
      '<span class="scale-cat-badge scale-cat-' + scaleDef.category + '">' +
        scaleDef.category +
      '</span>';

    // Mode connections footer
    var modeConnHtml = '';
    if (scaleDef.modeConnections && scaleDef.modeConnections.length) {
      modeConnHtml =
        '<div class="scale-mode-link">Related modes: ' +
          scaleDef.modeConnections.join(', ') +
        '</div>';
    }

    // Bridge tip (built-from hint)
    var bridgeHtml = '';
    if (scaleDef.addNotesTo) {
      bridgeHtml =
        '<div class="pent-bridge">' +
          '<span class="pent-bridge-label">Extends ' + scaleDef.addNotesTo + '</span>' +
          ' — adds ' + (scaleDef.intervalLabels.length - (
            scaleDef.addNotesTo === 'Minor Pentatonic' || scaleDef.addNotesTo === 'Major Pentatonic'
              ? 5 : 7
          )) + ' extra note(s)' +
        '</div>';
    }

    var card = document.createElement('div');
    card.className = 'mode-rel-card' + (isActive ? ' active' : '');
    card.dataset.scaleIndex = scaleIndex;

    card.innerHTML =
      '<div class="mode-rel-header">' +
        '<span class="mode-rel-name">' + scaleDef.name + '</span>' +
        catBadge +
      '</div>' +
      '<div class="mode-rel-formula">' +
        '<div class="mode-rel-intervals">' + intervalHtml + '</div>' +
        '<div class="mode-rel-notes">' + noteHtml + '</div>' +
      '</div>' +
      '<p class="mode-rel-feel">' + scaleDef.feel + '</p>' +
      modeConnHtml +
      bridgeHtml;

    container.appendChild(card);
  });

  // Wire card clicks
  container.querySelectorAll('.mode-rel-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var si = parseInt(card.dataset.scaleIndex, 10);
      AppState.currentScale = si;
      AppState.currentPosition = 'all';
      // Sync fretboard key label
      var fbKeyLabel = document.getElementById('fb-key-label');
      if (fbKeyLabel && AppState.currentKey) {
        fbKeyLabel.textContent = '— ' + AppState.currentKey + ' ' + SCALE_DATA[si].name;
      }
      renderFretboard();
      renderScaleRelPanel();
    });
  });
}

// ---------------------------------------------------------------
// initLearningPath()
// Builds collapsible Learning Path panel in #learning-path-section.
// ---------------------------------------------------------------
function initLearningPath() {
  var section = document.getElementById('learning-path-section');
  if (!section) return;

  section.innerHTML =
    '<div class="panel panel--learning-path">' +
      '<div class="lp-header" id="lp-toggle-btn" role="button" tabindex="0" aria-expanded="false">' +
        '<span class="panel-title" style="margin-bottom:0">Learning Path</span>' +
        '<span class="lp-toggle-icon">&#9654;</span>' +
      '</div>' +
      '<div class="lp-content-wrap" id="lp-content" style="display:none">' +
        '<p class="lp-description">Recommended order for working through modes and scales progressively. Each step builds on the previous.</p>' +
        '<div class="lp-steps" id="lp-steps"></div>' +
      '</div>' +
    '</div>';

  var toggleBtn = document.getElementById('lp-toggle-btn');
  if (!toggleBtn) return;

  function doToggle() {
    AppState.learningPathOpen = !AppState.learningPathOpen;
    renderLearningPath();
  }
  toggleBtn.addEventListener('click', doToggle);
  toggleBtn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doToggle(); }
  });
}

// ---------------------------------------------------------------
// renderLearningPath()
// Renders the 12-step timeline inside #lp-steps.
// ---------------------------------------------------------------
function renderLearningPath() {
  var content    = document.getElementById('lp-content');
  var toggleBtn  = document.getElementById('lp-toggle-btn');
  var icon       = toggleBtn ? toggleBtn.querySelector('.lp-toggle-icon') : null;

  if (!content) return;

  if (!AppState.learningPathOpen) {
    content.style.display = 'none';
    if (icon)      icon.innerHTML = '&#9654;';
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    return;
  }

  content.style.display = 'block';
  if (icon)      icon.innerHTML = '&#9660;';
  if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');

  var stepsEl = document.getElementById('lp-steps');
  if (!stepsEl || stepsEl.children.length > 0) return; // already rendered

  LEARNING_PATH.forEach(function(step) {
    var stepEl = document.createElement('div');
    stepEl.className = 'lp-step';

    stepEl.innerHTML =
      '<div class="lp-badge lp-badge-' + step.type + '">' + step.step + '</div>' +
      '<div class="lp-step-content">' +
        '<div class="lp-step-header">' +
          '<span class="lp-name">' + step.name + '</span>' +
          '<span class="lp-type-badge lp-type-' + step.type + '">' + step.type + '</span>' +
        '</div>' +
        '<p class="lp-why">' + step.why + '</p>' +
        '<p class="lp-tip"><em>Tip: ' + step.tip + '</em></p>' +
      '</div>';

    stepsEl.appendChild(stepEl);
  });
}
