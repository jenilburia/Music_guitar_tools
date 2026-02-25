/* =============================================================
   app.js — Main controller
   Wires all modules together on DOMContentLoaded.
   Also contains the chord diagram SVG renderer (lefty).
   ============================================================= */

document.addEventListener('DOMContentLoaded', function() {

  var circleSvg = document.getElementById('circle-svg');

  // Initialize the circle of fifths
  initCircle(circleSvg);

  // Initialize progression display
  renderProgression();
  updateProgressionHint();

  // ── Event: key selected on circle ──────────────────────────
  circleSvg.addEventListener('keySelected', function(e) {
    var key   = e.detail.key;
    var index = e.detail.circleIndex;

    // Update shared state
    AppState.currentKey      = key;
    AppState.currentKeyIndex = index;
    AppState.currentChords   = getDiatonicChords(key);

    // Update header
    document.getElementById('header-key').textContent = key + ' Major';

    // Render chord grid and mode list
    renderChordGrid(AppState.currentChords, key);
    renderModeList(AppState.currentChords);
  });

  // ── Event: chord card clicked (add to progression) ─────────
  document.getElementById('chord-grid').addEventListener('click', function(e) {
    // Don't fire if the Diagram button was clicked
    if (e.target.matches('.btn-diagram') || e.target.closest('.btn-diagram')) return;

    var card = e.target.closest('.chord-card');
    if (!card) return;

    var idx   = parseInt(card.dataset.chordIndex, 10);
    var chord = AppState.currentChords[idx];
    if (!chord) return;

    addToProgression(chord);

    // Flash the card briefly
    card.classList.add('active');
    setTimeout(function() { card.classList.remove('active'); }, 300);
  });

  // ── Event: Diagram button clicked ──────────────────────────
  document.getElementById('chord-grid').addEventListener('click', function(e) {
    var btn = e.target.closest('.btn-diagram');
    if (!btn) return;
    e.stopPropagation();

    var voicingKey = btn.dataset.voicingKey;
    var chordName  = btn.dataset.chordName;
    var modeName   = btn.dataset.modeName;

    openDiagramModal(voicingKey, chordName, modeName);
  });

  // ── Event: Clear progression ────────────────────────────────
  document.getElementById('btn-clear').addEventListener('click', clearProgression);

  // ── Event: Copy progression to clipboard ───────────────────
  document.getElementById('btn-copy').addEventListener('click', function() {
    var str = getProgressionString();
    if (!str) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(str).then(function() {
        flashBtn(document.getElementById('btn-copy'), 'Copied!');
      });
    } else {
      // Fallback for older browsers
      var ta = document.createElement('textarea');
      ta.value = str;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      flashBtn(document.getElementById('btn-copy'), 'Copied!');
    }
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

// ── Modal helpers ─────────────────────────────────────────────

function openDiagramModal(voicingKey, chordName, modeName) {
  document.getElementById('modal-title').textContent    = chordName;
  document.getElementById('modal-subtitle').textContent = modeName + ' mode';
  renderChordDiagram(voicingKey, document.getElementById('diagram-svg'));
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

// ── Chord Diagram Renderer (left-handed SVG) ──────────────────
//
// Diagram coordinate system (SVG viewBox="0 0 130 170"):
//   Strings: 6 vertical lines
//   Frets:   4-5 horizontal lines + nut
//   Lefty:   frets[] is reversed so low E appears on right
//
// Layout constants:
var D_START_X   = 22;   // x of leftmost string line
var D_START_Y   = 36;   // y of nut/first fret line
var D_STR_GAP   = 17;   // horizontal spacing between strings
var D_FRET_GAP  = 22;   // vertical spacing between frets
var D_NUM_FRETS = 4;    // number of fret rows shown
var D_DOT_R     = 7;    // radius of finger dot circle
var D_OPEN_R    = 6;    // radius of open-string indicator

function renderChordDiagram(voicingKey, svgEl) {
  // Clear
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

  var voicing  = getVoicing(voicingKey);
  var frets    = mirrorForLefty(voicing.frets);  // reversed for lefty
  var baseFret = voicing.baseFret;

  var numStrings = 6;

  // Helper: create SVG element
  function el(tag, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs).forEach(function(k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  // ── Draw fret lines ──────────────────────────────────────
  for (var f = 0; f <= D_NUM_FRETS; f++) {
    var y = D_START_Y + f * D_FRET_GAP;
    var x1 = D_START_X;
    var x2 = D_START_X + (numStrings - 1) * D_STR_GAP;
    var cls = (f === 0 && baseFret === 1) ? 'fret-line fret-line--nut' : 'fret-line';
    svgEl.appendChild(el('line', { x1: x1, y1: y, x2: x2, y2: y, 'class': cls }));
  }

  // ── Draw string lines ────────────────────────────────────
  for (var s = 0; s < numStrings; s++) {
    var x = D_START_X + s * D_STR_GAP;
    svgEl.appendChild(el('line', {
      x1: x, y1: D_START_Y,
      x2: x, y2: D_START_Y + D_NUM_FRETS * D_FRET_GAP,
      'class': 'string-line'
    }));
  }

  // ── Base fret label (if above first position) ────────────
  if (baseFret > 1) {
    var fretLbl = el('text', {
      x: D_START_X - 5,
      y: D_START_Y + D_FRET_GAP * 0.5 + 4,
      'class': 'fret-number',
      'text-anchor': 'end'
    });
    fretLbl.textContent = baseFret + 'fr';
    svgEl.appendChild(fretLbl);
  }

  // ── Draw mute / open markers above nut ──────────────────
  for (var s2 = 0; s2 < numStrings; s2++) {
    var sx = D_START_X + s2 * D_STR_GAP;
    var markerY = D_START_Y - 14;

    if (frets[s2] === -1) {
      // Mute: draw X
      var half = 5;
      svgEl.appendChild(el('line', { x1: sx-half, y1: markerY-half, x2: sx+half, y2: markerY+half, 'class': 'dot-mute-line' }));
      svgEl.appendChild(el('line', { x1: sx+half, y1: markerY-half, x2: sx-half, y2: markerY+half, 'class': 'dot-mute-line' }));
    } else if (frets[s2] === 0) {
      // Open: hollow circle
      svgEl.appendChild(el('circle', { cx: sx, cy: markerY, r: D_OPEN_R, 'class': 'dot-open' }));
    }
  }

  // ── Detect barre (multiple strings sharing the same minimum fret) ─
  var playedFrets = frets.filter(function(f) { return f > 0; });
  var minFret = playedFrets.length ? Math.min.apply(null, playedFrets) : 0;

  var barreStrings = [];
  frets.forEach(function(f, i) {
    if (f === minFret && minFret > 0) barreStrings.push(i);
  });

  if (barreStrings.length >= 3) {
    // Draw barre bar
    var relFret = minFret - (baseFret - 1);
    var barY = D_START_Y + (relFret - 0.5) * D_FRET_GAP;
    var barX1 = D_START_X + barreStrings[0] * D_STR_GAP;
    var barX2 = D_START_X + barreStrings[barreStrings.length - 1] * D_STR_GAP;
    svgEl.appendChild(el('line', { x1: barX1, y1: barY, x2: barX2, y2: barY, 'class': 'barre-bar' }));
  }

  // ── Draw finger dots ─────────────────────────────────────
  for (var s3 = 0; s3 < numStrings; s3++) {
    var fretNum = frets[s3];
    if (fretNum <= 0) continue;   // muted or open handled above

    var relFretNum = fretNum - (baseFret - 1);
    if (relFretNum < 1 || relFretNum > D_NUM_FRETS) continue;

    var dotX = D_START_X + s3 * D_STR_GAP;
    var dotY = D_START_Y + (relFretNum - 0.5) * D_FRET_GAP;

    // Skip dot if covered by barre bar
    var isBarre = (barreStrings.length >= 3 && fretNum === minFret);
    if (!isBarre) {
      svgEl.appendChild(el('circle', { cx: dotX, cy: dotY, r: D_DOT_R, 'class': 'fret-dot' }));
    }
  }

  // If barre, draw individual dots on top of barre for non-barre strings
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
