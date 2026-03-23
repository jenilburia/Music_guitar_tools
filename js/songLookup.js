/* =============================================================
   songLookup.js — Song Chord Extractor (Tab 6)
   Uses Claude Haiku via user-supplied API key stored in localStorage.
   All rate limiting and caching are client-side.
   ============================================================= */

(function() {

  // ── Constants ──────────────────────────────────────────────
  var API_URL         = 'https://api.anthropic.com/v1/messages';
  var MODEL           = 'claude-3-5-haiku-20241022';
  var MAX_TOKENS      = 320;
  var COOLDOWN_SEC    = 10;   // lockout seconds after each request
  var SESSION_LIMIT   = 10;   // max requests per browser session
  var DAILY_LIMIT     = 30;   // max requests per day

  var KEY_API         = 'anthropic_api_key';
  var KEY_DAILY       = 'song_lookup_daily';
  var KEY_CACHE       = 'song_lookup_cache';
  var KEY_SESSION     = 'song_lookup_session';

  var _cooldownTimer  = null;
  var _cooldownRemain = 0;

  // ── Session counter ────────────────────────────────────────
  function getSessionCount() {
    return parseInt(sessionStorage.getItem(KEY_SESSION) || '0', 10);
  }
  function incrementSessionCount() {
    sessionStorage.setItem(KEY_SESSION, getSessionCount() + 1);
  }

  // ── Daily counter ──────────────────────────────────────────
  function getDailyRecord() {
    try {
      var rec = JSON.parse(localStorage.getItem(KEY_DAILY) || 'null');
      var today = new Date().toDateString();
      if (!rec || rec.date !== today) return { date: today, count: 0 };
      return rec;
    } catch(e) { return { date: new Date().toDateString(), count: 0 }; }
  }
  function incrementDailyCount() {
    var rec = getDailyRecord();
    rec.count++;
    localStorage.setItem(KEY_DAILY, JSON.stringify(rec));
  }
  function getDailyRemaining() {
    return DAILY_LIMIT - getDailyRecord().count;
  }

  // ── Cache ──────────────────────────────────────────────────
  function cacheKey(song, artist) {
    var raw = (song + '|' + artist).toLowerCase().replace(/\s+/g, ' ');
    // Simple hash
    var h = 0;
    for (var i = 0; i < raw.length; i++) {
      h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
    }
    return 'slc_' + Math.abs(h);
  }
  function getCached(song, artist) {
    try {
      var store = JSON.parse(localStorage.getItem(KEY_CACHE) || '{}');
      return store[cacheKey(song, artist)] || null;
    } catch(e) { return null; }
  }
  function setCached(song, artist, data) {
    try {
      var store = JSON.parse(localStorage.getItem(KEY_CACHE) || '{}');
      store[cacheKey(song, artist)] = data;
      // Cap cache at 100 entries
      var keys = Object.keys(store);
      if (keys.length > 100) { delete store[keys[0]]; }
      localStorage.setItem(KEY_CACHE, JSON.stringify(store));
    } catch(e) {}
  }

  // ── Input sanitisation ─────────────────────────────────────
  function sanitize(s) {
    return s
      .replace(/<[^>]*>/g, '')                         // strip HTML
      .replace(/[^\x20-\x7E]/g, '')                    // printable ASCII only
      .replace(/ignore\s+previous|system\s*:/gi, '')   // prompt injection
      .trim();
  }

  // ── API key helpers ────────────────────────────────────────
  function getApiKey() { return localStorage.getItem(KEY_API) || ''; }
  function saveApiKey(k) { localStorage.setItem(KEY_API, k.trim()); }
  function clearApiKey() { localStorage.removeItem(KEY_API); }

  // ── API call ───────────────────────────────────────────────
  async function lookupSong(song, artist, apiKey) {
    var prompt = 'Song: "' + song + '"' + (artist ? ' Artist: "' + artist + '"' : '') +
      '\nReturn ONLY valid JSON (no prose, no markdown) with these exact keys:\n' +
      '{"key": string, "numerals": string[], "chords": string[], "explanation": string, "genre": string, "found": boolean}' +
      '\nIf you cannot find reliable chord data, return {"found": false}.';

    var resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: 'You are a music theory assistant. Reply ONLY with valid JSON, no prose outside the JSON object.',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (resp.status === 401) throw { type: 'auth' };
    if (!resp.ok) throw { type: 'api', status: resp.status };

    var body = await resp.json();
    var text = (body.content && body.content[0] && body.content[0].text) || '';

    // Extract JSON — strip any surrounding markdown fences
    var jsonText = text.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim();
    var data;
    try { data = JSON.parse(jsonText); } catch(e) { throw { type: 'parse' }; }

    // Validate shape
    if (typeof data.found === 'boolean' && !data.found) throw { type: 'notfound' };
    if (!Array.isArray(data.chords) || !data.chords.length) throw { type: 'notfound' };
    var required = ['key', 'numerals', 'chords', 'explanation', 'genre'];
    for (var i = 0; i < required.length; i++) {
      if (!(required[i] in data)) throw { type: 'parse' };
    }
    return data;
  }

  // ── Cooldown ───────────────────────────────────────────────
  function startCooldown(searchBtn, countdownEl) {
    _cooldownRemain = COOLDOWN_SEC;
    searchBtn.disabled = true;
    if (_cooldownTimer) clearInterval(_cooldownTimer);
    _cooldownTimer = setInterval(function() {
      _cooldownRemain--;
      if (countdownEl) countdownEl.textContent = 'Wait ' + _cooldownRemain + 's';
      if (_cooldownRemain <= 0) {
        clearInterval(_cooldownTimer);
        searchBtn.disabled = false;
        if (countdownEl) countdownEl.textContent = '';
      }
    }, 1000);
  }

  // ── Render states ──────────────────────────────────────────
  function setStatus(statusEl, html, cls) {
    statusEl.className = 'song-lookup-status' + (cls ? ' ' + cls : '');
    statusEl.innerHTML = html;
    statusEl.style.display = html ? 'block' : 'none';
  }

  function renderResult(resultEl, data, song, artist) {
    var chordSlots = data.chords.map(function(ch, i) {
      var num = data.numerals[i] || '';
      return '<div class="prog-slot prog-slot--filled prog-slot--min">' +
               '<span class="prog-roman">' + num + '</span>' +
               '<span class="prog-name">' + ch + '</span>' +
             '</div>';
    }).join('');

    var genreClass = (data.genre || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    var genreLabel = data.genre || '';

    resultEl.innerHTML =
      '<div class="song-lookup-result-header">' +
        '<div class="song-lookup-song-title">' + song + (artist ? ' <span class="song-lookup-artist">— ' + artist + '</span>' : '') + '</div>' +
        '<div class="song-lookup-badges">' +
          '<span class="song-lookup-key-badge">' + (data.key || '') + '</span>' +
          (genreLabel ? '<span class="prog-lib-genre-badge prog-lib-genre--' + genreClass + '">' + genreLabel + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="progression-slots" style="margin:12px 0 4px;">' + chordSlots + '</div>' +
      '<div class="explanation-panel" style="display:block;margin-top:10px;">' +
        '<div class="explanation-header">' +
          '<span class="explanation-numerals">' + (data.numerals || []).join(' – ') + '</span>' +
        '</div>' +
        '<p class="explanation-text">' + (data.explanation || '') + '</p>' +
      '</div>' +
      '<button class="btn btn--primary song-lookup-load-btn" style="margin-top:12px;width:100%;">Load into Builder</button>';

    resultEl.style.display = 'block';

    // Wire Load button
    resultEl.querySelector('.song-lookup-load-btn').addEventListener('click', function() {
      // Build chord objects from names (resolve to diatonic chords that match)
      var chordNames = data.chords;
      if (!AppState.currentChords || !AppState.currentChords.length) {
        alert('Select a key first so the chords can be loaded into the builder.');
        return;
      }
      // Try to match chord names to AppState.currentChords
      var matched = [];
      chordNames.forEach(function(name) {
        var cleanName = name.replace(/maj/i, '').replace(/m$/,'m').toLowerCase().trim();
        var found = null;
        AppState.currentChords.forEach(function(ch) {
          if (ch.name && ch.name.toLowerCase() === name.toLowerCase()) { found = ch; }
        });
        if (!found) {
          // Fallback: use first chord
          found = AppState.currentChords[0];
        }
        matched.push(found);
      });
      if (typeof setProgression === 'function') {
        setProgression(matched);
      }
      if (typeof switchTab === 'function') {
        switchTab('circle');
      }
    });
  }

  // ── Main init ──────────────────────────────────────────────
  window.initSongLookup = function() {
    var section = document.getElementById('song-lookup-section');
    if (!section) return;

    section.innerHTML =
      '<div class="panel song-lookup-panel">' +
        '<h2 class="panel-title">Song Chord Extractor</h2>' +
        '<p class="song-lookup-desc">Type any song name and get its chord progression explained. Uses the Claude AI — requires your Anthropic API key.</p>' +

        // API key settings
        '<div class="song-lookup-key-row" id="sl-key-row">' +
          '<div class="song-lookup-key-section" id="sl-key-section" style="display:none">' +
            '<label class="song-lookup-key-label" for="sl-api-key-input">Anthropic API Key</label>' +
            '<div class="song-lookup-key-input-row">' +
              '<input class="song-lookup-key-input" id="sl-api-key-input" type="password" placeholder="sk-ant-…" autocomplete="off" spellcheck="false">' +
              '<button class="btn btn--primary song-lookup-key-save" id="sl-save-key">Save Key</button>' +
            '</div>' +
            '<p class="song-lookup-key-hint">Your key is stored only in your browser\'s localStorage and is never sent anywhere except directly to api.anthropic.com.</p>' +
          '</div>' +
          '<div class="song-lookup-key-set" id="sl-key-set" style="display:none">' +
            '<span class="song-lookup-key-status">API key saved ✓</span>' +
            '<button class="btn song-lookup-key-change" id="sl-change-key">Change key</button>' +
          '</div>' +
        '</div>' +

        // Search form
        '<div class="song-lookup-form">' +
          '<div class="song-lookup-inputs">' +
            '<input class="song-lookup-input" id="sl-song" type="text" placeholder="Song name" maxlength="80" autocomplete="off">' +
            '<input class="song-lookup-input song-lookup-input--artist" id="sl-artist" type="text" placeholder="Artist (optional)" maxlength="50" autocomplete="off">' +
          '</div>' +
          '<div class="song-lookup-form-footer">' +
            '<button class="btn btn--primary song-lookup-search-btn" id="sl-search">Look Up</button>' +
            '<span class="song-lookup-countdown" id="sl-countdown"></span>' +
            '<span class="song-lookup-remaining" id="sl-remaining"></span>' +
          '</div>' +
        '</div>' +

        // Status / errors
        '<div class="song-lookup-status" id="sl-status" style="display:none"></div>' +

        // Result
        '<div class="song-lookup-result" id="sl-result" style="display:none"></div>' +
      '</div>';

    var keySection  = section.querySelector('#sl-key-section');
    var keySet      = section.querySelector('#sl-key-set');
    var keyInput    = section.querySelector('#sl-api-key-input');
    var saveKeyBtn  = section.querySelector('#sl-save-key');
    var changeKeyBtn= section.querySelector('#sl-change-key');
    var songInput   = section.querySelector('#sl-song');
    var artistInput = section.querySelector('#sl-artist');
    var searchBtn   = section.querySelector('#sl-search');
    var countdownEl = section.querySelector('#sl-countdown');
    var remainingEl = section.querySelector('#sl-remaining');
    var statusEl    = section.querySelector('#sl-status');
    var resultEl    = section.querySelector('#sl-result');

    // Show correct key UI
    function updateKeyUI() {
      var hasKey = !!getApiKey();
      keySection.style.display = hasKey ? 'none' : 'block';
      keySet.style.display     = hasKey ? 'block' : 'none';
    }
    updateKeyUI();

    function updateRemainingLabel() {
      var rem = getDailyRemaining();
      var used = DAILY_LIMIT - rem;
      remainingEl.textContent = used + '/' + DAILY_LIMIT + ' searches today';
    }
    updateRemainingLabel();

    saveKeyBtn.addEventListener('click', function() {
      var k = keyInput.value.trim();
      if (!k) { setStatus(statusEl, 'Please enter your API key.', 'song-lookup-status--error'); return; }
      saveApiKey(k);
      keyInput.value = '';
      updateKeyUI();
      setStatus(statusEl, '', '');
    });

    changeKeyBtn.addEventListener('click', function() {
      clearApiKey();
      updateKeyUI();
      resultEl.style.display = 'none';
      setStatus(statusEl, '', '');
    });

    // Enter key in inputs triggers search
    [songInput, artistInput].forEach(function(inp) {
      inp.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') searchBtn.click();
      });
    });

    searchBtn.addEventListener('click', async function() {
      var song   = sanitize(songInput.value.trim());
      var artist = sanitize(artistInput.value.trim());

      // Inline validation
      if (song.length < 2) {
        setStatus(statusEl, 'Please enter a song name (at least 2 characters).', 'song-lookup-status--error');
        return;
      }

      // API key check
      var apiKey = getApiKey();
      if (!apiKey) {
        keySection.style.display = 'block';
        keySet.style.display = 'none';
        setStatus(statusEl, 'Enter your Anthropic API key above to use this feature.', 'song-lookup-status--warn');
        return;
      }

      // Check cache first (free, no rate limit impact)
      var cached = getCached(song, artist);
      if (cached) {
        setStatus(statusEl, '<span class="song-lookup-cache-badge">Cached</span> Showing saved result for this song.', 'song-lookup-status--info');
        renderResult(resultEl, cached, song, artist);
        return;
      }

      // Daily limit check
      if (getDailyRecord().count >= DAILY_LIMIT) {
        setStatus(statusEl, 'Daily search limit reached (' + DAILY_LIMIT + '/' + DAILY_LIMIT + '). Resets at midnight.', 'song-lookup-status--error');
        return;
      }

      // Session limit check
      if (getSessionCount() >= SESSION_LIMIT) {
        setStatus(statusEl, 'Session limit reached (' + SESSION_LIMIT + ' searches). Reload the page to continue.', 'song-lookup-status--error');
        return;
      }

      // Loading state
      resultEl.style.display = 'none';
      setStatus(statusEl, '<span class="song-lookup-spinner"></span> Looking up chords…', 'song-lookup-status--loading');
      searchBtn.disabled = true;

      try {
        var data = await lookupSong(song, artist, apiKey);

        // Success — increment counters, cache, render
        incrementSessionCount();
        incrementDailyCount();
        setCached(song, artist, data);
        updateRemainingLabel();

        setStatus(statusEl, '', '');
        renderResult(resultEl, data, song, artist);

      } catch(err) {
        resultEl.style.display = 'none';

        if (!err || !err.type) {
          // Network error (fetch threw)
          setStatus(statusEl, 'No internet connection. Check your connection and try again.', 'song-lookup-status--error');
        } else if (err.type === 'auth') {
          clearApiKey();
          updateKeyUI();
          setStatus(statusEl, 'Invalid API key. Re-enter it above.', 'song-lookup-status--error');
        } else if (err.type === 'api') {
          setStatus(statusEl, 'API error (' + (err.status || '?') + '). Check your API key or try again later.', 'song-lookup-status--error');
        } else if (err.type === 'notfound') {
          setStatus(statusEl, 'Couldn\'t find chord data for this song. Try adding or correcting the artist name.', 'song-lookup-status--warn');
        } else if (err.type === 'parse') {
          setStatus(statusEl, 'Unexpected response from AI. Try again.', 'song-lookup-status--error');
        } else {
          setStatus(statusEl, 'Something went wrong. Try again.', 'song-lookup-status--error');
        }
      } finally {
        startCooldown(searchBtn, countdownEl);
      }
    });
  };

})();
