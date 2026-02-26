/* =============================================================
   app.js — Main controller
   Wires all modules together on DOMContentLoaded.
   Also contains the chord diagram SVG renderer.
   ============================================================= */

document.addEventListener('DOMContentLoaded', function() {

  var circleSvg = document.getElementById('circle-svg');

  // ── Theme: restore from localStorage ───────────────────────
  var savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // ── Handedness: restore from localStorage ──────────────────
  var savedHand = localStorage.getItem('handedness') || 'left';
  AppState.isLefty = (savedHand === 'left');
  updateHandednessUI();

  // ── Initialize modules ──────────────────────────────────────
  initCircle(circleSvg);
  renderProgression();
  updateProgressionHint();

  // ── Event: key selected on circle ──────────────────────────
  circleSvg.addEventListener('keySelected', function(e) {
    var key   = e.detail.key;
    var index = e.detail.circleIndex;

    AppState.currentKey      = key;
    AppState.currentKeyIndex = index;
    AppState.currentChords   = getDiatonicChords(key);

    document.getElementById('header-key').textContent = key + ' Major';
    renderChordGrid(AppState.currentChords, key);
    renderModeList(AppState.currentChords);

    // Clear explanation when key changes
    renderExplanation(null);
  });

  // ── Event: chord card clicked (add to progression) ─────────
  document.getElementById('chord-grid').addEventListener('click', function(e) {
    if (e.target.matches('.btn-diagram') || e.target.closest('.btn-diagram')) return;

    var card = e.target.closest('.chord-card');
    if (!card) return;

    var idx   = parseInt(card.dataset.chordIndex, 10);
    var chord = AppState.currentChords[idx];
    if (!chord) return;

    addToProgression(chord);
    card.classList.add('active');
    setTimeout(function() { card.classList.remove('active'); }, 350);
  });

  // ── Event: Diagram button clicked ──────────────────────────
  document.getElementById('chord-grid').addEventListener('click', function(e) {
    var btn = e.target.closest('.btn-diagram');
    if (!btn) return;
    e.stopPropagation();
    openDiagramModal(btn.dataset.voicingKey, btn.dataset.chordName, btn.dataset.modeName);
  });

  // ── Event: Mode row clicked (generate mode-specific) ───────
  document.getElementById('mode-list').addEventListener('click', function(e) {
    var row = e.target.closest('.mode-row');
    if (!row || !row.dataset.modeName) return;
    if (!AppState.currentKey) return;

    generateAndDisplay(row.dataset.modeName);

    row.classList.add('active');
    setTimeout(function() { row.classList.remove('active'); }, 380);
  });

  // ── Event: Generate progression (key-based) ────────────────
  document.getElementById('btn-generate').addEventListener('click', function() {
    if (!AppState.currentKey) {
      flashBtn(this, 'Pick a key!');
      return;
    }
    generateAndDisplay(null);
  });

  // ── Event: Shuffle progression ──────────────────────────────
  document.getElementById('btn-shuffle').addEventListener('click', function() {
    if (!AppState.currentKey) {
      flashBtn(this, 'Pick a key!');
      return;
    }
    shuffleProgression();
  });

  // ── Event: Clear progression ────────────────────────────────
  document.getElementById('btn-clear').addEventListener('click', function() {
    clearProgression();
    renderExplanation(null);
  });

  // ── Event: Copy progression to clipboard ───────────────────
  document.getElementById('btn-copy').addEventListener('click', function() {
    var str = getProgressionString();
    if (!str) return;
    var btn = this;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(str).then(function() {
        flashBtn(btn, 'Copied!');
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = str;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      flashBtn(btn, 'Copied!');
    }
  });

  // ── Event: Theme toggle ─────────────────────────────────────
  document.getElementById('btn-theme').addEventListener('click', function() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = (current === 'dark') ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // ── Event: Handedness toggle ────────────────────────────────
  document.getElementById('btn-lefty').addEventListener('click', function() {
    AppState.isLefty = !AppState.isLefty;
    localStorage.setItem('handedness', AppState.isLefty ? 'left' : 'right');
    updateHandednessUI();
  });

  // ── Event: Close modal ──────────────────────────────────────
  document.getElementById('modal-close').addEventListener('click', closeDiagramModal);
  document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === e.currentTarget) closeDiagramModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDiagramModal();
  });

});

// ── Handedness helpers ─────────────────────────────────────────

function updateHandednessUI() {
  var btn = document.getElementById('btn-lefty');
  if (!btn) return;
  btn.textContent = AppState.isLefty ? 'L' : 'R';
  btn.title = AppState.isLefty
    ? 'Left-handed mode — click to switch to right-handed'
    : 'Right-handed mode — click to switch to left-handed';
  if (AppState.isLefty) {
    btn.classList.add('active-state');
  } else {
    btn.classList.remove('active-state');
  }
  var note = document.getElementById('diagram-hand-note');
  if (note) {
    note.textContent = AppState.isLefty
      ? 'Left-handed · low E on right'
      : 'Right-handed · low E on left';
  }
}

// ── Modal helpers ──────────────────────────────────────────────

function openDiagramModal(voicingKey, chordName, modeName) {
  document.getElementById('modal-title').textContent    = chordName;
  document.getElementById('modal-subtitle').textContent = modeName + ' mode';
  renderChordDiagram(voicingKey, document.getElementById('diagram-svg'));
  updateHandednessUI();
  document.getElementById('modal-overlay').removeAttribute('hidden');
}

function closeDiagramModal() {
  document.getElementById('modal-overlay').setAttribute('hidden', '');
}

function flashBtn(btn, text) {
  var original = btn.textContent;
  btn.textContent = text;
  setTimeout(function() { btn.textContent = original; }, 1500);
}

// ── Chord Diagram Renderer ────────────────────────────────────
//
// SVG viewBox="0 0 130 170"
// Left-handed when AppState.isLefty = true (frets[] reversed so low E is on right)
// Right-handed when AppState.isLefty = false (standard string order)

var D_START_X   = 22;
var D_START_Y   = 36;
var D_STR_GAP   = 17;
var D_FRET_GAP  = 22;
var D_NUM_FRETS = 4;
var D_DOT_R     = 7;
var D_OPEN_R    = 6;

function renderChordDiagram(voicingKey, svgEl) {
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

  var voicing  = getVoicing(voicingKey);
  // Respect handedness setting
  var frets    = AppState.isLefty ? mirrorForLefty(voicing.frets) : voicing.frets.slice();
  var baseFret = voicing.baseFret;
  var numStrings = 6;

  function el(tag, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs).forEach(function(k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  // Draw fret lines
  for (var f = 0; f <= D_NUM_FRETS; f++) {
    var y  = D_START_Y + f * D_FRET_GAP;
    var x1 = D_START_X;
    var x2 = D_START_X + (numStrings - 1) * D_STR_GAP;
    var cls = (f === 0 && baseFret === 1) ? 'fret-line fret-line--nut' : 'fret-line';
    svgEl.appendChild(el('line', { x1: x1, y1: y, x2: x2, y2: y, 'class': cls }));
  }

  // Draw string lines
  for (var s = 0; s < numStrings; s++) {
    var x = D_START_X + s * D_STR_GAP;
    svgEl.appendChild(el('line', {
      x1: x, y1: D_START_Y,
      x2: x, y2: D_START_Y + D_NUM_FRETS * D_FRET_GAP,
      'class': 'string-line'
    }));
  }

  // Base fret label
  if (baseFret > 1) {
    var fretLbl = el('text', {
      x: D_START_X - 5, y: D_START_Y + D_FRET_GAP * 0.5 + 4,
      'class': 'fret-number', 'text-anchor': 'end'
    });
    fretLbl.textContent = baseFret + 'fr';
    svgEl.appendChild(fretLbl);
  }

  // Mute / open markers
  for (var s2 = 0; s2 < numStrings; s2++) {
    var sx = D_START_X + s2 * D_STR_GAP;
    var markerY = D_START_Y - 14;
    if (frets[s2] === -1) {
      var half = 5;
      svgEl.appendChild(el('line', { x1: sx-half, y1: markerY-half, x2: sx+half, y2: markerY+half, 'class': 'dot-mute-line' }));
      svgEl.appendChild(el('line', { x1: sx+half, y1: markerY-half, x2: sx-half, y2: markerY+half, 'class': 'dot-mute-line' }));
    } else if (frets[s2] === 0) {
      svgEl.appendChild(el('circle', { cx: sx, cy: markerY, r: D_OPEN_R, 'class': 'dot-open' }));
    }
  }

  // Detect barre
  var playedFrets = frets.filter(function(f) { return f > 0; });
  var minFret = playedFrets.length ? Math.min.apply(null, playedFrets) : 0;
  var barreStrings = [];
  frets.forEach(function(f, i) {
    if (f === minFret && minFret > 0) barreStrings.push(i);
  });

  if (barreStrings.length >= 3) {
    var relFret = minFret - (baseFret - 1);
    var barY  = D_START_Y + (relFret - 0.5) * D_FRET_GAP;
    var barX1 = D_START_X + barreStrings[0] * D_STR_GAP;
    var barX2 = D_START_X + barreStrings[barreStrings.length - 1] * D_STR_GAP;
    svgEl.appendChild(el('line', { x1: barX1, y1: barY, x2: barX2, y2: barY, 'class': 'barre-bar' }));
  }

  // Finger dots
  for (var s3 = 0; s3 < numStrings; s3++) {
    var fretNum = frets[s3];
    if (fretNum <= 0) continue;
    var relFretNum = fretNum - (baseFret - 1);
    if (relFretNum < 1 || relFretNum > D_NUM_FRETS) continue;
    var dotX = D_START_X + s3 * D_STR_GAP;
    var dotY = D_START_Y + (relFretNum - 0.5) * D_FRET_GAP;
    var isBarre = (barreStrings.length >= 3 && fretNum === minFret);
    if (!isBarre) {
      svgEl.appendChild(el('circle', { cx: dotX, cy: dotY, r: D_DOT_R, 'class': 'fret-dot' }));
    }
  }

  // Extra dots on barre strings
  if (barreStrings.length >= 3) {
    for (var s4 = 0; s4 < numStrings; s4++) {
      var fn = frets[s4];
      if (fn <= 0 || fn === minFret) continue;
      var rfn = fn - (baseFret - 1);
      if (rfn < 1 || rfn > D_NUM_FRETS) continue;
      var dx = D_START_X + s4 * D_STR_GAP;
      var dy = D_START_Y + (rfn - 0.5) * D_FRET_GAP;
      svgEl.appendChild(el('circle', { cx: dx, cy: dy, r: D_DOT_R, 'class': 'fret-dot' }));
    }
  }
}
