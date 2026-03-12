/* =============================================================
   chords.js — Diatonic chord panel and mode list rendering
   Reads from AppState.currentChords (set by app.js).
   v2: + Borrowed chord toggle (Feature 14)
       + Interval formula display in mode rows (Feature 9)
       + In the Wild song references per mode (Feature 11)
   ============================================================= */

// ---------------------------------------------------------------
// IN THE WILD song references per mode
// ---------------------------------------------------------------
var IN_THE_WILD = {
  'Ionian': [
    'Hotel California (Eagles) — verse/chorus harmony',
    'Here Comes the Sun (Beatles) — full song',
    "Sweet Child O' Mine (G&R) — main riff/verse",
    'Brown Eyed Girl (Van Morrison) — throughout'
  ],
  'Dorian': [
    'Oye Como Va (Santana) — entire melody',
    'Smoke on the Water (Deep Purple) — main riff section',
    'Moondance (Van Morrison) — verse groove',
    'Another Brick in the Wall (Pink Floyd) — guitar solo'
  ],
  'Phrygian': [
    'Wherever I May Roam intro (Metallica) — opening riff',
    'Eruption setup (Van Halen) — intro tension',
    "White Zombie — Thunderkiss '65 main riff",
    'Flamenco rhythm patterns — the Spanish ♭2 sound'
  ],
  'Lydian': [
    'Flying in a Blue Dream (Satriani) — lead throughout',
    'The Simpsons Theme (Elfman) — that dreamy bounce',
    'Bron-Y-Aur Stomp (Zeppelin) — verse texture',
    'Misty Mountain Hop (Zeppelin) — main riff vibe'
  ],
  'Mixolydian': [
    'Norwegian Wood (Beatles) — verse melody',
    'Sweet Home Chicago — lead phrasing',
    'Old Time Rock and Roll (Seger) — main groove',
    'Sympathy for the Devil (Stones) — the ♭7 swagger'
  ],
  'Aeolian': [
    'Stairway to Heaven (Zeppelin) — arpeggiated intro',
    'Comfortably Numb (Pink Floyd) — solo tone',
    'Nothing Else Matters (Metallica) — clean intro',
    'Tears in Heaven (Clapton) — emotional minor center'
  ],
  'Locrian': [
    'YYZ intro (Rush) — rhythmic tension passage',
    'The Devil\'s Trill (violin, Tartini) — diminished drama',
    'Used briefly in film scores for maximum dread',
    'Primus — rare but they go there for dissonance'
  ]
};

// ---------------------------------------------------------------
// renderChordGrid(chords, keyName)
// Renders 7 chord cards (+ optional borrowed row) into #chord-grid.
// Each card: Roman numeral, chord name, mode name, Diagram button.
// Clicking a card triggers addToProgression (progression.js).
// ---------------------------------------------------------------
function renderChordGrid(chords, keyName) {
  var grid     = document.getElementById('chord-grid');
  var keyLabel = document.getElementById('key-label');

  keyLabel.textContent = '— ' + keyName + ' Major';
  grid.innerHTML = '';

  chords.forEach(function(chord, idx) {
    var card = document.createElement('div');
    card.className = 'chord-card chord-card--' + chord.quality;
    card.dataset.chordIndex = idx;
    card.title = chord.modeName + ': ' + chord.modeDescription;

    card.innerHTML =
      '<span class="chord-roman">' + chord.roman + '</span>' +
      '<span class="chord-name">' + chord.chordName + '</span>' +
      '<span class="chord-mode-name">' + chord.modeName + '</span>' +
      '<button class="btn-diagram" data-voicing-key="' + chord.voicingKey + '" ' +
              'data-chord-name="' + chord.chordName + '" ' +
              'data-mode-name="' + chord.modeName + '" ' +
              'data-quality="' + chord.quality + '">' +
        'Diagram' +
      '</button>' +
      '<button class="btn-play-chord" data-voicing-key="' + chord.voicingKey + '" ' +
              'title="Play ' + chord.chordName + '">' +
        '&#9654; Play' +
      '</button>';

    grid.appendChild(card);
  });

  // Render borrowed chords row if toggled on
  if (AppState.borrowedChordsVisible && AppState.currentKey) {
    renderBorrowedRow(grid);
  }
}

// ---------------------------------------------------------------
// renderBorrowedRow(grid)
// Appends a row of borrowed (parallel minor) chord cards.
// ---------------------------------------------------------------
function renderBorrowedRow(grid) {
  var borrowedChords = getParallelMinorChords(AppState.currentKey);
  if (!borrowedChords.length) return;

  var divider = document.createElement('div');
  divider.className = 'borrowed-row-label';
  divider.textContent = 'Borrowed (Parallel Minor)';
  grid.appendChild(divider);

  borrowedChords.forEach(function(chord, idx) {
    var card = document.createElement('div');
    card.className = 'chord-card chord-card--' + chord.quality + ' chord-card--borrowed';
    card.dataset.borrowedIndex = idx;
    card.title = 'Borrowed chord — ' + chord.chordName + ' (' + chord.roman + ')';

    card.innerHTML =
      '<span class="chord-roman">' + chord.roman + '</span>' +
      '<span class="chord-name">' + chord.chordName + '</span>' +
      '<span class="chord-mode-name">Borrowed</span>' +
      '<button class="btn-diagram" data-voicing-key="' + chord.voicingKey + '" ' +
              'data-chord-name="' + chord.chordName + '" ' +
              'data-mode-name="Borrowed" ' +
              'data-quality="' + chord.quality + '">' +
        'Diagram' +
      '</button>' +
      '<button class="btn-play-chord" data-voicing-key="' + chord.voicingKey + '" ' +
              'title="Play ' + chord.chordName + '">' +
        '&#9654; Play' +
      '</button>';

    grid.appendChild(card);
  });
}

// ---------------------------------------------------------------
// renderModeList(chords)
// Renders 7 mode rows into #mode-list.
// Each row shows: step formula, interval numbers, note names,
//   mode description, "In the Wild" expandable section.
// ---------------------------------------------------------------
function renderModeList(chords) {
  var list = document.getElementById('mode-list');
  list.innerHTML = '';

  chords.forEach(function(chord) {
    var mi     = chord.modeIndex;
    var steps  = getModeStepFormula(mi);
    var ivLabels = getModeIntervalLabels(mi);
    var noteNames = getModeNoteNames(chord.rootNote, mi);
    var wildRefs = IN_THE_WILD[chord.modeName] || [];

    // Step formula HTML
    var stepsHtml = steps.map(function(s) {
      return '<span class="mode-formula-step mode-formula-step--' + s + '">' + s + '</span>';
    }).join('');

    // Interval labels HTML
    var ivHtml = ivLabels.map(function(iv) {
      var isAlt = iv.indexOf('♭') !== -1 || iv.indexOf('♯') !== -1;
      return '<span class="mode-formula-iv' + (isAlt ? ' mode-formula-iv--alt' : '') + '">' + iv + '</span>';
    }).join('');

    // Note names HTML
    var notesHtml = noteNames.map(function(n) {
      return '<span class="mode-formula-note">' + n + '</span>';
    }).join('');

    // In the Wild HTML
    var wildItemsHtml = wildRefs.map(function(ref) {
      return '<li class="wild-item">' + ref + '</li>';
    }).join('');
    var wildSectionId = 'wild-' + chord.modeName.toLowerCase();

    var row = document.createElement('div');
    row.className = 'mode-row mode-row--clickable';
    row.style.setProperty('--mode-color', chord.modeColor);
    row.dataset.modeName = chord.modeName;
    row.title = 'Click to generate a ' + chord.modeName + ' progression';

    row.innerHTML =
      '<div class="mode-meta">' +
        '<span class="mode-chord-name">' + chord.chordName + '</span>' +
        '<span class="mode-roman">' + chord.roman + '</span>' +
      '</div>' +
      '<div class="mode-info">' +
        '<span class="mode-name">' + chord.modeName + '</span>' +
        '<p class="mode-desc">' + chord.modeDescription + '</p>' +
        '<div class="mode-formula-block">' +
          '<div class="mode-formula-row mode-formula-row--steps">' + stepsHtml + '</div>' +
          '<div class="mode-formula-row mode-formula-row--iv">' + ivHtml + '</div>' +
          '<div class="mode-formula-row mode-formula-row--notes">' + notesHtml + '</div>' +
        '</div>' +
        '<div class="mode-wild" id="' + wildSectionId + '" style="display:none">' +
          '<ul class="wild-list">' + wildItemsHtml + '</ul>' +
        '</div>' +
        '<button class="btn-wild-toggle" data-target="' + wildSectionId + '" title="Show song references">' +
          '▶ In the Wild' +
        '</button>' +
      '</div>' +
      '<span class="mode-generate-hint">Generate</span>';

    list.appendChild(row);
  });

  // Wire In the Wild toggles (stop propagation to avoid generating progression)
  list.querySelectorAll('.btn-wild-toggle').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var targetId = btn.dataset.target;
      var section  = document.getElementById(targetId);
      if (!section) return;
      var isOpen = section.style.display !== 'none';
      section.style.display = isOpen ? 'none' : 'block';
      btn.textContent = isOpen ? '▶ In the Wild' : '▼ In the Wild';
    });
  });
}

// ---------------------------------------------------------------
// initBorrowedToggle()
// Wires the #btn-borrowed toggle button.
// ---------------------------------------------------------------
function initBorrowedToggle() {
  var btn = document.getElementById('btn-borrowed');
  if (!btn) return;

  btn.addEventListener('click', function() {
    AppState.borrowedChordsVisible = !AppState.borrowedChordsVisible;
    btn.classList.toggle('active-state', AppState.borrowedChordsVisible);
    btn.textContent = AppState.borrowedChordsVisible ? 'Borrowed ✓' : 'Borrowed';

    if (AppState.currentChords && AppState.currentChords.length) {
      renderChordGrid(AppState.currentChords, AppState.currentKey);
    }
  });

  // Also wire click events for borrowed cards (delegated from chord-grid)
  // This is handled in app.js chord-grid click handler
}
