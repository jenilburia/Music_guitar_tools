/* =============================================================
   progression.js — Progression builder state and rendering
   ============================================================= */

var MAX_SLOTS = 8;

// Internal state: array of chord descriptor objects
var _progression = [];

// ---------------------------------------------------------------
// addToProgression(chord)
// Appends a chord descriptor to the progression (max MAX_SLOTS).
// ---------------------------------------------------------------
function addToProgression(chord) {
  if (_progression.length >= MAX_SLOTS) return;
  _progression.push(chord);
  renderProgression();
  updateProgressionHint();
}

// ---------------------------------------------------------------
// removeFromProgression(index)
// Removes chord at array index.
// ---------------------------------------------------------------
function removeFromProgression(index) {
  _progression.splice(index, 1);
  renderProgression();
  updateProgressionHint();
}

// ---------------------------------------------------------------
// clearProgression()
// ---------------------------------------------------------------
function clearProgression() {
  _progression = [];
  renderProgression();
  updateProgressionHint();
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
      slot.className = 'prog-slot prog-slot--filled prog-slot--' + chord.quality;
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

      slot.appendChild(removeBtn);
      slot.appendChild(romanEl);
      slot.appendChild(nameEl);
      slot.appendChild(playBtn);
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
