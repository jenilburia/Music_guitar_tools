/* =============================================================
   miniPlayer.js — Global mini practice transport
   Renders play/stop + Metro/Beats toggle in two locations:
     - Desktop: inside .tab-bar nav (right end)
     - Mobile:  inside .header-controls (sticky header)
   ============================================================= */

(function() {

  function _setBpmDisplay(v, val) {
    if (v.tagName === 'INPUT') v.value = val;
    else v.textContent = val;
  }

  window.initMiniPlayer = function() {
    _wire('mini-player-toggle', 'mini-player-mode');
    _wire('mini-player-toggle-m', 'mini-player-mode-m');
    _wireBpm('mini-bpm-dec', 'mini-bpm-inc');
    _wireBpm('mini-bpm-dec-m', 'mini-bpm-inc-m');
    _wireBpmInput('mini-bpm-display');
    _wireBpmInput('mini-bpm-display-m');

    // Set initial BPM display
    var initBpm = AppState.practiceBPM
      || parseInt(localStorage.getItem('practiceBPM'), 10)
      || 80;
    document.querySelectorAll('[data-mini-bpm-val]').forEach(function(v) {
      if (v.closest('.mini-player')) _setBpmDisplay(v, initBpm);
    });

    var state = typeof window.getPracticeState === 'function'
      ? window.getPracticeState()
      : { isPlaying: false, bpm: 80, hasChords: false };
    _syncUI(state);

    window.onPracticeStateChanged = _syncUI;
  };

  function _wire(toggleId, modeId) {
    var toggleBtn = document.getElementById(toggleId);
    var modeBtn   = document.getElementById(modeId);
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', function() {
      var s = typeof window.getPracticeState === 'function' ? window.getPracticeState() : {};
      if (s.isPlaying) {
        if (typeof window.stopPractice === 'function') window.stopPractice();
        if (typeof window.stopProgressionPlayback === 'function') window.stopProgressionPlayback();
        if (typeof stopDrumBeat === 'function') stopDrumBeat();
      } else {
        // Ensure drum beat is enabled when starting from the global player
        if (typeof window.setPracticeDrumEnabled === 'function') window.setPracticeDrumEnabled(true);
        if (typeof window.togglePractice === 'function') window.togglePractice();
      }
    });

    if (modeBtn) {
      modeBtn.addEventListener('click', function() {
        var cur  = typeof window.getDrumMode === 'function' ? window.getDrumMode() : 'beats';
        var next = cur === 'beats' ? 'metro' : 'beats';
        if (typeof window.setDrumMode === 'function') window.setDrumMode(next);
        // Sync both mode buttons (desktop: full text, mobile: single char)
        var modeLabels = {
          'mini-player-mode':   { beats: 'Beats', metro: 'Metro' },
          'mini-player-mode-m': { beats: 'B',     metro: 'M'     },
        };
        Object.keys(modeLabels).forEach(function(id) {
          var btn = document.getElementById(id);
          if (!btn) return;
          btn.textContent = next === 'metro' ? modeLabels[id].metro : modeLabels[id].beats;
          btn.setAttribute('aria-pressed', next === 'metro' ? 'true' : 'false');
        });
        // Sync practice tab drum-mode buttons
        var practiceGroup = document.getElementById('practice-drum-mode-group');
        if (practiceGroup) {
          practiceGroup.querySelectorAll('.practice-bpc-btn').forEach(function(b) {
            b.classList.toggle('active', b.dataset.dmode === next);
          });
        }
      });
    }
  }

  function _wireBpm(decId, incId) {
    var decBtn = document.getElementById(decId);
    var incBtn = document.getElementById(incId);
    if (!decBtn || !incBtn) return;

    function _adjustBpm(delta) {
      var cur = AppState.practiceBPM || parseInt(localStorage.getItem('practiceBPM'), 10) || 80;
      var next = Math.min(240, Math.max(40, cur + delta));
      // Fire input event on the first BPM slider to trigger the app.js sync cascade
      var slider = document.querySelector('[data-mini-bpm]');
      if (slider) {
        slider.value = next;
        var ev = new Event('input', { bubbles: true });
        slider.dispatchEvent(ev);
      } else {
        // No slider yet — update state directly
        AppState.practiceBPM = next;
        localStorage.setItem('practiceBPM', next);
        document.querySelectorAll('[data-mini-bpm-val]').forEach(function(v) {
          if (v.closest('.mini-player')) _setBpmDisplay(v, next);
        });
      }
    }

    decBtn.addEventListener('click', function() { _adjustBpm(-5); });
    incBtn.addEventListener('click', function() { _adjustBpm(+5); });
  }

  function _wireBpmInput(inputId) {
    var input = document.getElementById(inputId);
    if (!input || input.tagName !== 'INPUT') return;

    input.addEventListener('focus', function() { this.select(); });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { this.blur(); }
    });

    input.addEventListener('blur', function() {
      var val = parseInt(this.value, 10);
      if (isNaN(val)) val = AppState.practiceBPM || 80;
      val = Math.min(240, Math.max(40, val));
      // Fire the same sync path as the +/- buttons
      var slider = document.querySelector('[data-mini-bpm]');
      if (slider) {
        slider.value = val;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        AppState.practiceBPM = val;
        localStorage.setItem('practiceBPM', val);
        document.querySelectorAll('[data-mini-bpm-val]').forEach(function(v) {
          if (v.closest('.mini-player')) _setBpmDisplay(v, val);
        });
      }
    });
  }

  function _syncUI(state) {
    var playConfigs = [
      { toggle: 'mini-player-toggle',   player: 'mini-player',        playing: '&#9646;&#9646;', stopped: '&#9654;' },
      { toggle: 'mini-player-toggle-m', player: 'mini-player-mobile', playing: '&#9646;&#9646;', stopped: '&#9654;' },
    ];
    playConfigs.forEach(function(s) {
      var toggleBtn = document.getElementById(s.toggle);
      var playerEl  = document.getElementById(s.player);
      if (!toggleBtn) return;
      toggleBtn.innerHTML  = state.isPlaying ? s.playing : s.stopped;
      toggleBtn.setAttribute('aria-label', state.isPlaying ? 'Stop all audio' : 'Start practice');
      toggleBtn.disabled   = !state.isPlaying && !state.hasChords;
      if (playerEl) playerEl.classList.toggle('mini-player--active', !!state.isPlaying);
    });
  }

})();
