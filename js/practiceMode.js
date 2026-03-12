/* =============================================================
   practiceMode.js — Visual Chord Sequencer / Practice Mode
   Features: BPM slider, Start/Pause/Reset, visual countdown bar,
             highlights active chord slot in progression.
   No audio — purely visual.
   Depends on: progression.js (getProgression)
   ============================================================= */

(function() {

  var _timer        = null;
  var _currentSlot  = -1;
  var _isPlaying    = false;
  var _bpm          = 80;
  var _beatsPerChord = 4;

  // ── Timing helpers ──────────────────────────────────────────

  function getMsPerChord() {
    return (60 / _bpm) * _beatsPerChord * 1000;
  }

  // ── Slot highlighting ───────────────────────────────────────

  function highlightSlot(index) {
    var slots = document.querySelectorAll('#progression-slots .prog-slot--filled');
    slots.forEach(function(slot, i) {
      slot.classList.toggle('prog-slot--active', i === index);

      // Countdown bar
      var bar = slot.querySelector('.prog-slot-bar');
      if (!bar) {
        bar = document.createElement('div');
        bar.className = 'prog-slot-bar';
        slot.appendChild(bar);
      }

      if (i === index) {
        // Reset and animate the bar
        bar.style.transition = 'none';
        bar.style.width = '100%';
        // Force reflow so transition starts fresh
        void bar.offsetWidth;
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
      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
      }
    });
  }

  // ── Sequencer logic ─────────────────────────────────────────

  function tick() {
    var chords = getProgression();
    if (!chords.length) {
      stopPractice();
      return;
    }
    _currentSlot = (_currentSlot + 1) % chords.length;
    highlightSlot(_currentSlot);
    _timer = setTimeout(tick, getMsPerChord());
  }

  function startPractice() {
    if (_isPlaying) return;
    var chords = getProgression();
    if (!chords.length) return;

    _isPlaying = true;
    _currentSlot = -1;
    AppState.practiceActive = true;
    updatePracticeUI();
    tick();
  }

  function pausePractice() {
    if (!_isPlaying) return;
    _isPlaying = false;
    AppState.practiceActive = false;
    clearTimeout(_timer);
    _timer = null;
    clearHighlights();
    updatePracticeUI();
  }

  function resetPractice() {
    _isPlaying = false;
    AppState.practiceActive = false;
    clearTimeout(_timer);
    _timer = null;
    _currentSlot = -1;
    clearHighlights();
    updatePracticeUI();
  }

  function togglePractice() {
    if (_isPlaying) {
      pausePractice();
    } else {
      startPractice();
    }
  }

  // Stop if called externally (e.g., progression cleared)
  window.stopPractice = function() {
    resetPractice();
  };

  // ── UI helpers ───────────────────────────────────────────────

  function updatePracticeUI() {
    var startBtn = document.getElementById('practice-start');
    var resetBtn = document.getElementById('practice-reset');
    var bpmVal   = document.getElementById('practice-bpm-val');

    if (startBtn) {
      startBtn.textContent = _isPlaying ? '⏸ Pause' : '▶ Start';
    }
    if (bpmVal) {
      bpmVal.textContent = _bpm + ' BPM';
    }
    if (resetBtn) {
      resetBtn.disabled = false;
    }

    // Enable/disable start button based on progression
    if (startBtn) {
      var chords = getProgression();
      startBtn.disabled = chords.length === 0;
    }
  }

  // Called from progression.js after any progression change
  window.onProgressionChanged = function() {
    // If playing and progression is now empty, stop
    if (_isPlaying && getProgression().length === 0) {
      resetPractice();
    }
    updatePracticeUI();
  };

  // ── Init ─────────────────────────────────────────────────────

  window.initPracticeMode = function() {
    var panel = document.getElementById('practice-panel');
    if (!panel) return;

    panel.innerHTML =
      '<div class="panel practice-panel">' +
        '<h2 class="panel-title">Practice Mode</h2>' +
        '<div class="practice-controls">' +
          '<div class="practice-bpm-group">' +
            '<label for="practice-bpm" class="practice-label">BPM</label>' +
            '<input type="range" id="practice-bpm" class="practice-bpm-slider"' +
                   ' min="40" max="240" value="80" step="1">' +
            '<span id="practice-bpm-val" class="practice-bpm-val">80 BPM</span>' +
          '</div>' +
          '<div class="practice-btn-group">' +
            '<button class="btn btn--primary" id="practice-start" disabled>▶ Start</button>' +
            '<button class="btn" id="practice-reset">Reset</button>' +
          '</div>' +
        '</div>' +
        '<p class="practice-hint">Chords light up in sequence at the selected tempo. Add chords to the Progression Builder above to begin.</p>' +
      '</div>';

    var slider = document.getElementById('practice-bpm');
    if (slider) {
      slider.addEventListener('input', function() {
        _bpm = parseInt(slider.value, 10);
        AppState.practiceBPM = _bpm;
        updatePracticeUI();
        // If playing, the next tick will use the new BPM automatically
      });
    }

    var startBtn = document.getElementById('practice-start');
    if (startBtn) {
      startBtn.addEventListener('click', togglePractice);
    }

    var resetBtn = document.getElementById('practice-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetPractice);
    }

    updatePracticeUI();
  };

})();
