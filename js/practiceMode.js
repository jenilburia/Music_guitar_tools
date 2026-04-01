/* =============================================================
   practiceMode.js — Chord Sequencer / Practice Mode v2
   Features:
     1. Guided empty state
     2. Drum beat backing (audio.js scheduler)
     3. Beats-per-chord selector (1 / 2 / 4 / 8)
     4. Auto BPM ramp-up
     5. Next-chord preview (SVG diagram)
     6. Scale / mode hint per active chord
   Depends on: progression.js (getProgression), audio.js,
               app.js (renderChordDiagram), theory.js
   ============================================================= */

(function() {

  var _timer          = null;
  var _currentSlot    = -1;
  var _isPlaying      = false;
  var _bpm            = 80;
  var _beatsPerChord  = 4;
  var _drumEnabled    = false;
  var _rampEnabled    = false;
  var _rampBpm        = 5;
  var _rampLoops      = 2;
  var _rampMax        = 160;
  var _loopCount      = 0;
  var _loopsSinceRamp = 0;

  // ── Public state observer ─────────────────────────────────────

  function _notifyStateChange() {
    var snap = { isPlaying: _isPlaying, bpm: _bpm, hasChords: getProgression().length > 0 };
    if (typeof window.onPracticeStateChanged === 'function') window.onPracticeStateChanged(snap);
  }

  // ── Timing ──────────────────────────────────────────────────

  function getMsPerChord() {
    return (60 / _bpm) * _beatsPerChord * 1000;
  }

  // ── Slot highlighting in the Progression Builder ─────────────

  function highlightSlot(index) {
    var slots = document.querySelectorAll('#progression-slots .prog-slot--filled');
    slots.forEach(function(slot, i) {
      slot.classList.toggle('prog-slot--active', i === index);

      var bar = slot.querySelector('.prog-slot-bar');
      if (!bar) {
        bar = document.createElement('div');
        bar.className = 'prog-slot-bar';
        slot.appendChild(bar);
      }

      if (i === index) {
        bar.style.transition = 'none';
        bar.style.width = '100%';
        void bar.offsetWidth; // force reflow
        bar.style.transition = 'width ' + (getMsPerChord() / 1000).toFixed(2) + 's linear';
        bar.style.width = '0%';
      } else {
        bar.style.transition = 'none';
        bar.style.width = '0%';
      }
    });
  }

  function clearHighlights() {
    var slots = document.querySelectorAll('#progression-slots .prog-slot--filled');
    slots.forEach(function(slot) {
      slot.classList.remove('prog-slot--active');
      var bar = slot.querySelector('.prog-slot-bar');
      if (bar) { bar.style.transition = 'none'; bar.style.width = '0%'; }
    });
  }

  // ── Sequencer logic ─────────────────────────────────────────

  function tick() {
    var chords = getProgression();
    if (!chords.length) { stopPractice(); return; }

    var prevSlot = _currentSlot;
    _currentSlot = (_currentSlot + 1) % chords.length;

    // Detect loop completion (wrapped back to 0 after first pass)
    if (_currentSlot === 0 && prevSlot >= 0) {
      _loopCount++;
      _loopsSinceRamp++;
      if (_rampEnabled && _loopsSinceRamp >= _rampLoops && _bpm < _rampMax) {
        _bpm = Math.min(_rampMax, _bpm + _rampBpm);
        AppState.practiceBPM = _bpm;
        localStorage.setItem('practiceBPM', _bpm);
        _loopsSinceRamp = 0;
        if (_drumEnabled && typeof updateDrumBPM === 'function') {
          updateDrumBPM(_bpm);
        }
        updateBpmDisplay();
        _notifyStateChange();
      }
    }

    highlightSlot(_currentSlot);
    updateChordInfo(chords, _currentSlot);
    _timer = setTimeout(tick, getMsPerChord());
  }

  function startPractice() {
    if (_isPlaying) return;
    var chords = getProgression();
    if (!chords.length) return;

    _isPlaying      = true;
    _currentSlot    = -1;
    _loopCount      = 0;
    _loopsSinceRamp = 0;
    AppState.practiceActive = true;

    if (_drumEnabled && typeof startDrumBeat === 'function') {
      startDrumBeat(_bpm);
    }
    updatePracticeUI();
    tick();
    _notifyStateChange();
  }

  function pausePractice() {
    if (!_isPlaying) return;
    _isPlaying = false;
    AppState.practiceActive = false;
    clearTimeout(_timer);
    _timer = null;
    clearHighlights();
    if (typeof stopDrumBeat === 'function') stopDrumBeat();
    hideChordInfo();
    updatePracticeUI();
    _notifyStateChange();
  }

  function resetPractice() {
    _isPlaying      = false;
    AppState.practiceActive = false;
    clearTimeout(_timer);
    _timer          = null;
    _currentSlot    = -1;
    _loopCount      = 0;
    _loopsSinceRamp = 0;
    clearHighlights();
    if (typeof stopDrumBeat === 'function') stopDrumBeat();
    hideChordInfo();
    updatePracticeUI();
    _notifyStateChange();
  }

  function togglePractice() {
    if (_isPlaying) { pausePractice(); } else { startPractice(); }
  }

  // Called externally when progression is cleared mid-play
  window.stopPractice = function() { resetPractice(); };

  // Called by the global mini-player to enable/disable drum and sync the checkbox UI
  window.setPracticeDrumEnabled = function(enabled) {
    _drumEnabled = enabled;
    var cb = document.getElementById('practice-drum-enable');
    if (cb) cb.checked = enabled;
    var modeRow = document.getElementById('practice-drum-mode-row');
    if (modeRow) modeRow.style.display = enabled ? '' : 'none';
  };

  window.togglePractice = function() {
    if (_isPlaying) { pausePractice(); } else { startPractice(); }
  };

  window.getPracticeState = function() {
    return { isPlaying: _isPlaying, bpm: _bpm, hasChords: getProgression().length > 0 };
  };

  // ── Chord info panel (Features 5 + 6) ───────────────────────

  function updateChordInfo(chords, currentIdx) {
    var infoEl = document.getElementById('practice-chord-info');
    if (!infoEl) return;
    infoEl.style.display = '';

    var chord     = chords[currentIdx];
    var nextIdx   = (currentIdx + 1) % chords.length;
    var nextChord = chords[nextIdx];

    // Feature 6 — Scale / mode hint
    var hintEl = document.getElementById('practice-scale-hint');
    if (hintEl && chord) {
      var feel = chord.modeDescription || '';
      hintEl.innerHTML =
        '<span class="practice-scale-label">Over ' + chord.chordName + '</span>' +
        ' <span class="practice-scale-arrow">\u2192</span> ' +
        '<span class="practice-scale-mode">' + chord.modeName + '</span>' +
        (feel ? '<span class="practice-scale-feel"> \u2014 ' + feel + '</span>' : '');
    }

    // Feature 5 — Next chord preview
    var nextArea = document.getElementById('practice-next-chord-area');
    if (nextArea) {
      if (chords.length > 1 && nextChord) {
        nextArea.style.display = '';
        var nameEl = document.getElementById('practice-next-chord-name');
        if (nameEl) nameEl.textContent = nextChord.chordName;
        var svgEl = document.getElementById('practice-next-diagram');
        if (svgEl && typeof renderChordDiagram === 'function' && nextChord.voicingKey) {
          renderChordDiagram(nextChord.voicingKey, svgEl);
        }
      } else {
        nextArea.style.display = 'none';
      }
    }
  }

  function hideChordInfo() {
    var infoEl = document.getElementById('practice-chord-info');
    if (infoEl) infoEl.style.display = 'none';
  }

  // ── Mode sync helper ────────────────────────────────────────

  function _syncAllModeBtns(mode) {
    // Update practice tab drum-mode buttons
    document.querySelectorAll('#practice-drum-mode-group .practice-bpc-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.dmode === mode);
    });
    // Update global header mode buttons (desktop + mobile)
    var labels = {
      'mini-player-mode':   { beats: 'Beats', metro: 'Metro' },
      'mini-player-mode-m': { beats: 'B',     metro: 'M'     },
    };
    Object.keys(labels).forEach(function(id) {
      var btn = document.getElementById(id);
      if (!btn) return;
      btn.textContent = labels[id][mode];
      btn.setAttribute('aria-pressed', mode === 'metro' ? 'true' : 'false');
    });
  }

  // ── UI helpers ───────────────────────────────────────────────

  function updateBpmDisplay() {
    var bpmVal    = document.getElementById('practice-bpm-val');
    var bpmSlider = document.getElementById('practice-bpm');
    if (bpmVal)    bpmVal.textContent = _bpm + ' BPM';
    if (bpmSlider) bpmSlider.value    = _bpm;
  }

  function updatePracticeUI() {
    var chords    = getProgression();
    var hasChords = chords.length > 0;

    // Feature 1 — toggle empty state vs controls
    var emptyState   = document.getElementById('practice-empty-state');
    var controlsArea = document.getElementById('practice-controls-area');
    var mainHint     = document.getElementById('practice-main-hint');
    if (emptyState)   emptyState.style.display   = hasChords ? 'none' : '';
    if (controlsArea) controlsArea.style.display  = hasChords ? ''     : 'none';
    if (mainHint)     mainHint.style.display       = hasChords ? ''     : 'none';

    var startBtn = document.getElementById('practice-start');
    var resetBtn = document.getElementById('practice-reset');
    if (startBtn) {
      startBtn.textContent = _isPlaying ? '\u23f8 Pause' : '\u25b6 Start';
      startBtn.disabled    = !hasChords;
    }
    if (resetBtn) { resetBtn.disabled = false; }

    updateBpmDisplay();

    // Ramp-up fields visibility
    var rampFields = document.getElementById('practice-ramp-fields');
    if (rampFields) rampFields.style.display = _rampEnabled ? '' : 'none';
  }

  // Called from progression.js after any progression change
  window.onProgressionChanged = function() {
    if (_isPlaying && getProgression().length === 0) { resetPractice(); }
    updatePracticeUI();
    _notifyStateChange();
  };

  // ── Init ─────────────────────────────────────────────────────

  window.initPracticeMode = function() {
    var panel = document.getElementById('practice-panel');
    if (!panel) return;

    _bpm           = AppState.practiceBPM  || 80;
    _beatsPerChord = AppState.practiceBpC  || 4;

    var bpc = _beatsPerChord;

    panel.innerHTML =
      '<div class="panel practice-panel">' +
        '<h2 class="panel-title">Practice Mode</h2>' +

        // ── Feature 1: Empty state ──────────────────────────────
        '<div id="practice-empty-state" class="practice-empty-state">' +
          '<div class="practice-empty-icon">&#127925;</div>' +
          '<h3 class="practice-empty-title">How to Use Practice Mode</h3>' +
          '<ol class="practice-empty-steps">' +
            '<li>Go to the <strong>Circle &amp; Chords</strong> tab</li>' +
            '<li>Click a key on the circle, then click chord cards to add them to the Progression Builder &mdash; or hit <strong>Generate</strong></li>' +
            '<li>Come back here and hit <strong>&#9654; Start</strong></li>' +
            '<li>Each chord lights up in the Progression Builder at your chosen BPM</li>' +
          '</ol>' +
          '<p class="practice-empty-hint">Tip: enable <em>drum beat</em> for a backing groove, or <em>auto speed-up</em> to build speed gradually.</p>' +
        '</div>' +

        // ── Controls (shown only when chords exist) ─────────────
        '<div id="practice-controls-area" style="display:none">' +

          // Row 1: BPM slider + Start / Reset
          '<div class="practice-controls">' +
            '<div class="practice-bpm-group">' +
              '<label for="practice-bpm" class="practice-label">BPM</label>' +
              '<input type="range" id="practice-bpm" class="practice-bpm-slider"' +
                     ' min="40" max="240" value="' + _bpm + '" step="1">' +
              '<span id="practice-bpm-val" class="practice-bpm-val">' + _bpm + ' BPM</span>' +
            '</div>' +
            '<div class="practice-btn-group">' +
              '<button class="btn btn--primary" id="practice-start" disabled>&#9654; Start</button>' +
              '<button class="btn" id="practice-reset">Reset</button>' +
            '</div>' +
          '</div>' +

          // Row 2: Feature 3 — Beats per chord
          '<div class="practice-row">' +
            '<span class="practice-label">Beats&nbsp;/&nbsp;chord</span>' +
            '<div class="practice-bpc-group" id="practice-bpc-group">' +
              '<button class="practice-bpc-btn' + (bpc === 1 ? ' active' : '') + '" data-bpc="1">1</button>' +
              '<button class="practice-bpc-btn' + (bpc === 2 ? ' active' : '') + '" data-bpc="2">2</button>' +
              '<button class="practice-bpc-btn' + (bpc === 4 ? ' active' : '') + '" data-bpc="4">4</button>' +
              '<button class="practice-bpc-btn' + (bpc === 8 ? ' active' : '') + '" data-bpc="8">8</button>' +
            '</div>' +
          '</div>' +

          // Row 3: Feature 2 — Drum beat toggle
          '<div class="practice-row">' +
            '<label class="practice-check-label">' +
              '<input type="checkbox" id="practice-drum-enable">' +
              ' Enable drum beat <span class="practice-row-hint">(kick &middot; snare &middot; hi-hat)</span>' +
            '</label>' +
          '</div>' +

          // Row 3b: Drum mode (shown only when drum is enabled)
          '<div class="practice-row" id="practice-drum-mode-row" style="display:none">' +
            '<span class="practice-label">Drum mode</span>' +
            '<div class="practice-bpc-group" id="practice-drum-mode-group">' +
              '<button class="practice-bpc-btn active" data-dmode="beats">Beats</button>' +
              '<button class="practice-bpc-btn" data-dmode="metro">Metro</button>' +
            '</div>' +
          '</div>' +

          // Row 4: Feature 4 — Auto speed-up
          '<div class="practice-row practice-row--wrap">' +
            '<label class="practice-check-label">' +
              '<input type="checkbox" id="practice-ramp-enable">' +
              ' Auto speed-up' +
            '</label>' +
            '<div id="practice-ramp-fields" class="practice-ramp-fields" style="display:none">' +
              '<span class="practice-label">+</span>' +
              '<input type="number" id="practice-ramp-bpm-inc" value="5" min="1" max="30"' +
                     ' class="practice-num-input" title="BPM increase per step">' +
              '<span class="practice-label">BPM every</span>' +
              '<input type="number" id="practice-ramp-loops" value="2" min="1" max="20"' +
                     ' class="practice-num-input" title="Loops before each BPM increase">' +
              '<span class="practice-label">loops &nbsp;&mdash; max</span>' +
              '<input type="number" id="practice-ramp-max" value="160" min="40" max="240"' +
                     ' class="practice-num-input" title="Maximum BPM cap">' +
              '<span class="practice-label">BPM</span>' +
            '</div>' +
          '</div>' +

        '</div>' + // end #practice-controls-area

        // ── Features 5 + 6: chord info panel (hidden until playing) ──
        '<div id="practice-chord-info" class="practice-chord-info" style="display:none">' +
          '<div id="practice-scale-hint" class="practice-scale-hint"></div>' +
          '<div id="practice-next-chord-area" class="practice-next-chord-area" style="display:none">' +
            '<div class="practice-next-label">Coming up &#8594;</div>' +
            '<div id="practice-next-chord-name" class="practice-next-chord-name"></div>' +
            '<svg id="practice-next-diagram" viewBox="0 0 130 170" width="78" height="102"' +
                 ' aria-hidden="true" class="practice-next-svg"></svg>' +
          '</div>' +
        '</div>' +

        '<p class="practice-hint" id="practice-main-hint" style="display:none">' +
          'Chords light up in the Progression Builder at your chosen tempo. Watch this panel for scale hints and the next chord.' +
        '</p>' +

      '</div>';

    // BPM slider
    document.getElementById('practice-bpm').addEventListener('input', function() {
      _bpm = parseInt(this.value, 10);
      AppState.practiceBPM = _bpm;
      localStorage.setItem('practiceBPM', _bpm);
      updateBpmDisplay();
      document.querySelectorAll('[data-mini-bpm]').forEach(function(s) { s.value = _bpm; });
      document.querySelectorAll('[data-mini-bpm-val]').forEach(function(v) {
        if (v.tagName === 'INPUT') v.value = _bpm;
        else v.textContent = v.closest('.mini-player') ? _bpm : _bpm + ' BPM';
      });
      if (_isPlaying && _drumEnabled && typeof updateDrumBPM === 'function') {
        updateDrumBPM(_bpm);
      }
      _notifyStateChange();
    });

    // Start / Reset
    document.getElementById('practice-start').addEventListener('click', togglePractice);
    document.getElementById('practice-reset').addEventListener('click', resetPractice);

    // Feature 3 — Beats per chord
    document.getElementById('practice-bpc-group').addEventListener('click', function(e) {
      var btn = e.target.closest('.practice-bpc-btn');
      if (!btn) return;
      _beatsPerChord = parseInt(btn.dataset.bpc, 10);
      AppState.practiceBpC = _beatsPerChord;
      this.querySelectorAll('.practice-bpc-btn').forEach(function(b) {
        b.classList.toggle('active', b === btn);
      });
    });

    // Feature 2 — Drum beat
    document.getElementById('practice-drum-enable').addEventListener('change', function() {
      _drumEnabled = this.checked;
      var modeRow = document.getElementById('practice-drum-mode-row');
      if (modeRow) modeRow.style.display = _drumEnabled ? '' : 'none';
      if (_isPlaying) {
        if (_drumEnabled && typeof startDrumBeat === 'function') {
          startDrumBeat(_bpm);
        } else if (typeof stopDrumBeat === 'function') {
          stopDrumBeat();
        }
      }
    });

    // Row 3b — Drum mode toggle
    document.getElementById('practice-drum-mode-group').addEventListener('click', function(e) {
      var btn = e.target.closest('.practice-bpc-btn');
      if (!btn) return;
      var mode = btn.dataset.dmode;
      if (typeof window.setDrumMode === 'function') window.setDrumMode(mode);
      _syncAllModeBtns(mode);
    });

    // Init drum mode buttons to reflect current mode
    var initMode = typeof window.getDrumMode === 'function' ? window.getDrumMode() : 'beats';
    _syncAllModeBtns(initMode);

    // Feature 4 — Auto ramp-up
    document.getElementById('practice-ramp-enable').addEventListener('change', function() {
      _rampEnabled = this.checked;
      updatePracticeUI();
    });
    document.getElementById('practice-ramp-bpm-inc').addEventListener('input', function() {
      _rampBpm = Math.max(1, parseInt(this.value, 10) || 5);
    });
    document.getElementById('practice-ramp-loops').addEventListener('input', function() {
      _rampLoops = Math.max(1, parseInt(this.value, 10) || 2);
    });
    document.getElementById('practice-ramp-max').addEventListener('input', function() {
      _rampMax = Math.min(240, Math.max(40, parseInt(this.value, 10) || 160));
    });

    updatePracticeUI();
  };

})();
