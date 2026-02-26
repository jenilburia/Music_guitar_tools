/* =============================================================
   audio.js — Web Audio API chord synthesis
   Converts guitar voicing fret data → synthesized guitar-like tones.

   playChord(voicingKey)     — play a single chord (strummed)
   playProgression(chords)   — play all chords in sequence
   ============================================================= */

(function() {

  var _ctx = null;

  function getCtx() {
    if (!_ctx) {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_ctx.state === 'suspended') {
      _ctx.resume();
    }
    return _ctx;
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
  }

  // Play a single chord given its voicing key (looks up from voicings.js)
  window.playChord = function(voicingKey) {
    if (!(window.AudioContext || window.webkitAudioContext)) return;
    if (typeof getVoicing !== 'function') return;

    var voicing = getVoicing(voicingKey);
    var ctx = getCtx();
    var now = ctx.currentTime;
    var strumDelay = 0.030; // 30ms between strings (low E → high e strum)

    for (var i = 0; i < 6; i++) {
      var fret = voicing.frets[i];
      if (fret === -1) continue; // muted string — skip
      var midi = OPEN_MIDI[i] + fret + (voicing.baseFret - 1);
      playNote(ctx, midiToFreq(midi), now + i * strumDelay, 1.8);
    }
  };

  // Play all chords in a progression with timing between them
  window.playProgression = function(chords, bpm) {
    if (!(window.AudioContext || window.webkitAudioContext)) return;
    if (!chords || !chords.length) return;
    if (typeof getVoicing !== 'function') return;

    var ctx          = getCtx();
    var secPerBeat   = 60 / (bpm || 72);
    var beatsPerChord = 4;
    var chordDuration = secPerBeat * beatsPerChord;

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
  };

})();
