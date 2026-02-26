/* =============================================================
   chords.js — Diatonic chord panel and mode list rendering
   Reads from AppState.currentChords (set by app.js).
   ============================================================= */

// ---------------------------------------------------------------
// renderChordGrid(chords, keyName)
// Renders 7 chord cards into #chord-grid.
// Each card: Roman numeral, chord name, mode name, Diagram button.
// Clicking a card triggers addToProgression (progression.js).
// ---------------------------------------------------------------
function renderChordGrid(chords, keyName) {
  var grid = document.getElementById('chord-grid');
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
}

// ---------------------------------------------------------------
// renderModeList(chords)
// Renders 7 mode rows into #mode-list.
// Each row is clickable to generate a mode-specific progression.
// ---------------------------------------------------------------
function renderModeList(chords) {
  var list = document.getElementById('mode-list');
  list.innerHTML = '';

  chords.forEach(function(chord) {
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
      '</div>' +
      '<span class="mode-generate-hint">Generate</span>';

    list.appendChild(row);
  });
}
