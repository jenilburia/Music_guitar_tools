/* =============================================================
   audio.js — Web Audio API chord synthesis
   Converts guitar voicing fret data → synthesized guitar-like tones.

   playChord(voicingKey)     — play a single chord (strummed)
   playProgression(chords)   — play all chords in sequence
   ============================================================= */

(function() {

  var _ctx = null;
  var _activeOscillators = [];
  var _audioUnsupported = !(window.AudioContext || window.webkitAudioContext);
  var _audioErrorShown  = false;

  function _showAudioError() {
    if (_audioErrorShown) return;
    _audioErrorShown = true;
    var el = document.getElementById('audio-error-msg');
    if (el) { el.style.display = 'block'; }
  }

  function getCtx() {
    if (!_ctx) {
      try {
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) {
        _showAudioError();
        return null;
      }
    }
    if (_ctx.state === 'suspended') {
      _ctx.resume();
    }
    return _ctx;
  }

  // Ensures AudioContext is running before invoking callback(ctx).
  // On mobile (iOS Safari) the context starts suspended; resume() is async,
  // so we must wait for it before scheduling any audio.
  function ensureCtx(callback) {
    if (_audioUnsupported) { _showAudioError(); return; }
    if (!_ctx) {
      try {
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) {
        _showAudioError();
        return;
      }
    }
    if (_ctx.state === 'suspended') {
      _ctx.resume().then(function() { callback(_ctx); });
    } else {
      callback(_ctx);
    }
  }

  // Standard tuning: MIDI note numbers for each open string
  // String order: [E2, A2, D3, G3, B3, e4] (low to high)
  var OPEN_MIDI = [40, 45, 50, 55, 59, 64];

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Play a single note with a guitar-like AR envelope
  function playNote(ctx, freq, startTime, duration) {
    var osc  = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'triangle';   // warmer than sine, softer than sawtooth
    osc.frequency.value = freq;

    // ADSR: very fast attack, medium decay, long sustain with fade
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.20, startTime + 0.012);  // attack
    gain.gain.exponentialRampToValueAtTime(0.09, startTime + 0.18);   // decay
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // release

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);

    _activeOscillators.push(osc);
    osc.onended = function() {
      var idx = _activeOscillators.indexOf(osc);
      if (idx !== -1) _activeOscillators.splice(idx, 1);
    };
  }

  // Play a single chord given its voicing key (looks up from voicings.js)
  window.playChord = function(voicingKey) {
    if (!(window.AudioContext || window.webkitAudioContext)) return;
    if (typeof getVoicing !== 'function') return;

    var voicing = getVoicing(voicingKey);
    ensureCtx(function(ctx) {
      var now = ctx.currentTime;
      var strumDelay = 0.030; // 30ms between strings (low E → high e strum)
      for (var i = 0; i < 6; i++) {
        var fret = voicing.frets[i];
        if (fret === -1) continue; // muted string — skip
        var midi = OPEN_MIDI[i] + fret + (voicing.baseFret - 1);
        playNote(ctx, midiToFreq(midi), now + i * strumDelay, 1.8);
      }
    });
  };

  window.playScaleNote = function(midiNote, duration) {
    if (!(window.AudioContext || window.webkitAudioContext)) return;
    ensureCtx(function(ctx) {
      playNote(ctx, midiToFreq(midiNote), ctx.currentTime, duration || 0.45);
    });
  };

  window.stopProgression = function() {
    var toStop = _activeOscillators.slice();
    _activeOscillators = [];
    toStop.forEach(function(osc) {
      try { osc.stop(0); } catch(e) {}
    });
  };

  // ── Drum Beat Scheduler ──────────────────────────────────────
  // Lookahead scheduler: schedules drum hits into the future using
  // Web Audio timestamps — much tighter than setTimeout-per-beat.

  var _drumTimer    = null;
  var _drumBeat8th  = 0;        // 0-7 (8th-note position in a 4/4 bar)
  var _drumNextTime = 0;        // AudioContext time of next 8th note
  var _drumBpm      = 80;
  var _drumNoiseBuffer = null;  // pre-built noise buffer (reused)
  var _drumMode     = 'beats';  // 'beats' | 'metro'

  var DRUM_LOOKAHEAD = 0.10;    // schedule 100 ms ahead
  var DRUM_SCHEDULE_MS = 25;    // scheduler fires every 25 ms

  function getDrumNoiseBuffer(ctx) {
    // Generate once and reuse to avoid GC churn inside the scheduler
    if (_drumNoiseBuffer && _drumNoiseBuffer.sampleRate === ctx.sampleRate) {
      return _drumNoiseBuffer;
    }
    var len = ctx.sampleRate * 0.25; // 250 ms of noise
    _drumNoiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = _drumNoiseBuffer.getChannelData(0);
    for (var i = 0; i < len; i++) { data[i] = Math.random() * 2 - 1; }
    return _drumNoiseBuffer;
  }

  function drumKick(ctx, t) {
    var osc  = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.05);
    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  function drumSnare(ctx, t) {
    var noise = ctx.createBufferSource();
    noise.buffer = getDrumNoiseBuffer(ctx);
    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.5;
    var noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.55, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.18);

    var osc  = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 200;
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  function drumHiHat(ctx, t) {
    var noise = ctx.createBufferSource();
    noise.buffer = getDrumNoiseBuffer(ctx);
    var filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.05);
  }

  function metroClick(ctx, time) {
    var osc  = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(time); osc.stop(time + 0.05);
  }

  function drumSchedulerTick() {
    var ctx = getCtx();
    if (!ctx) return;
    var secPer8th = (60 / _drumBpm) / 2;
    while (_drumNextTime < ctx.currentTime + DRUM_LOOKAHEAD) {
      var t = _drumNextTime;
      var beat = _drumBeat8th;
      if (_drumMode === 'metro') {
        // metronome click on every quarter note (8th positions 0, 2, 4, 6)
        if (beat === 0 || beat === 2 || beat === 4 || beat === 6) { metroClick(ctx, t); }
      } else {
        // hi-hat on every 8th note
        drumHiHat(ctx, t);
        // kick on beats 1 and 3 (8th positions 0 and 4)
        if (beat === 0 || beat === 4) { drumKick(ctx, t); }
        // snare on beats 2 and 4 (8th positions 2 and 6)
        if (beat === 2 || beat === 6) { drumSnare(ctx, t); }
      }
      _drumBeat8th  = (beat + 1) % 8;
      _drumNextTime += secPer8th;
    }
    _drumTimer = setTimeout(drumSchedulerTick, DRUM_SCHEDULE_MS);
  }

  window.startDrumBeat = function(bpm) {
    if (_drumTimer) { clearTimeout(_drumTimer); _drumTimer = null; }
    _drumBpm      = bpm || 80;
    _drumBeat8th  = 0;
    ensureCtx(function(ctx) {
      _drumNextTime = ctx.currentTime + 0.05; // tiny startup delay
      drumSchedulerTick();
    });
  };

  window.stopDrumBeat = function() {
    if (_drumTimer) { clearTimeout(_drumTimer); _drumTimer = null; }
  };

  window.updateDrumBPM = function(bpm) {
    _drumBpm = bpm || 80;
    // scheduler picks up new BPM on next invocation automatically
  };

  window.setDrumMode = function(mode) { _drumMode = mode; };
  window.getDrumMode = function() { return _drumMode; };

  // Play all chords in a progression with timing between them
  window.playProgression = function(chords, bpm) {
    if (!(window.AudioContext || window.webkitAudioContext)) return;
    if (!chords || !chords.length) return;
    if (typeof getVoicing !== 'function') return;

    var secPerBeat    = 60 / (bpm || 72);
    var beatsPerChord = 4;
    var chordDuration = secPerBeat * beatsPerChord;

    ensureCtx(function(ctx) {
      chords.forEach(function(chord, i) {
        var voicing    = getVoicing(chord.voicingKey);
        var chordStart = ctx.currentTime + i * chordDuration;

        for (var s = 0; s < 6; s++) {
          var fret = voicing.frets[s];
          if (fret === -1) continue;
          var midi = OPEN_MIDI[s] + fret + (voicing.baseFret - 1);
          playNote(ctx, midiToFreq(midi), chordStart + s * 0.030, chordDuration - 0.12);
        }
      });
    });
  };

})();
