/* =============================================================
   songLookup.js — Song Chord Finder (Tab 6)
   Generates direct search links to trusted chord/tab sites.
   No API key, no backend, no rate limits — always works.
   ============================================================= */

(function() {

  // ── Trusted sites ──────────────────────────────────────────
  var SITES = [
    {
      name: 'Ultimate Guitar',
      domain: 'ultimate-guitar.com',
      badge: 'Tabs + Chords',
      badgeClass: 'sl-badge--primary',
      desc: 'Largest tab & chord database online. Community-verified chords.',
      url: function(q) {
        return 'https://www.ultimate-guitar.com/search.php?search_type=title&value=' + q;
      }
    },
    {
      name: 'Chordify',
      domain: 'chordify.net',
      badge: 'Auto-detect',
      badgeClass: 'sl-badge--accent',
      desc: 'Automatically extracts chords from audio. Great for accuracy.',
      url: function(q) {
        return 'https://chordify.net/search/' + q;
      }
    },
    {
      name: 'Songsterr',
      domain: 'songsterr.com',
      badge: 'Interactive',
      badgeClass: 'sl-badge--accent',
      desc: 'Interactive guitar & bass tabs with playback. Excellent for learning.',
      url: function(q) {
        return 'https://www.songsterr.com/a/wa/search?pattern=' + q;
      }
    },
    {
      name: 'E-Chords',
      domain: 'e-chords.com',
      badge: 'Chords',
      badgeClass: 'sl-badge--muted',
      desc: 'Clean, printable chord charts. Simple and no-frills.',
      url: function(q) {
        return 'https://www.e-chords.com/search-chord/' + q;
      }
    },
    {
      name: 'Chordie',
      domain: 'chordie.com',
      badge: 'Chords',
      badgeClass: 'sl-badge--muted',
      desc: 'Large free chord database. Transpose chords to any key.',
      url: function(q) {
        return 'https://www.chordie.com/results.php?q=' + q;
      }
    },
    {
      name: 'AZ Chords',
      domain: 'azchords.com',
      badge: 'Chords',
      badgeClass: 'sl-badge--muted',
      desc: 'Simple chord charts for thousands of songs.',
      url: function(q) {
        return 'https://www.azchords.com/?s=' + q;
      }
    },
    {
      name: 'Google (filtered)',
      domain: 'google.com',
      badge: 'Web Search',
      badgeClass: 'sl-badge--google',
      desc: 'Google search pre-filtered to top chord sites. Useful fallback.',
      url: function(q, song, artist) {
        var terms = (artist ? artist + ' ' : '') + song + ' chords tabs';
        return 'https://www.google.com/search?q=' + encodeURIComponent(terms) +
               '+site%3Aultimate-guitar.com+OR+site%3Achordify.net+OR+site%3Ae-chords.com';
      }
    }
  ];

  // ── Helpers ────────────────────────────────────────────────
  function setStatus(el, html, cls) {
    el.className = 'song-lookup-status' + (cls ? ' ' + cls : '');
    el.innerHTML = html;
    el.style.display = html ? 'block' : 'none';
  }

  function buildQuery(song, artist) {
    var raw = artist ? song + ' ' + artist : song;
    return encodeURIComponent(raw);
  }

  // ── Render result cards ────────────────────────────────────
  function renderResults(resultsEl, song, artist) {
    var q = buildQuery(song, artist);
    var label = song + (artist ? ' — ' + artist : '');

    var cards = SITES.map(function(site) {
      var href = site.url(q, song, artist);
      var favicon = 'https://www.google.com/s2/favicons?domain=' + site.domain + '&sz=16';
      return (
        '<div class="sl-card">' +
          '<div class="sl-card-header">' +
            '<img class="sl-card-favicon" src="' + favicon + '" alt="" width="16" height="16" onerror="this.style.display=\'none\'">' +
            '<span class="sl-card-name">' + site.name + '</span>' +
            '<span class="sl-badge ' + site.badgeClass + '">' + site.badge + '</span>' +
          '</div>' +
          '<p class="sl-card-desc">' + site.desc + '</p>' +
          '<a class="btn btn--primary sl-card-btn" href="' + href + '" target="_blank" rel="noopener noreferrer">Open Search ↗</a>' +
          '<div class="sl-card-url">' + site.domain + '</div>' +
        '</div>'
      );
    }).join('');

    resultsEl.innerHTML =
      '<div class="sl-results-label">Searching for: <strong>' + label + '</strong></div>' +
      '<div class="sl-results-grid">' + cards + '</div>';
    resultsEl.style.display = 'block';
  }

  // ── Main init ──────────────────────────────────────────────
  window.initSongLookup = function() {
    var section = document.getElementById('song-lookup-section');
    if (!section) return;

    section.innerHTML =
      '<div class="panel song-lookup-panel">' +
        '<h2 class="panel-title">Song Chord Finder</h2>' +
        '<p class="song-lookup-desc">Enter a song name to get direct search links to the top chord &amp; tab sites. Click any card to open that site\'s results in a new tab.</p>' +

        '<div class="song-lookup-form">' +
          '<div class="song-lookup-inputs">' +
            '<input class="song-lookup-input" id="sl-song" type="text" placeholder="Song name" maxlength="80" autocomplete="off">' +
            '<input class="song-lookup-input song-lookup-input--artist" id="sl-artist" type="text" placeholder="Artist (optional)" maxlength="50" autocomplete="off">' +
          '</div>' +
          '<div class="song-lookup-form-footer">' +
            '<button class="btn btn--primary song-lookup-search-btn" id="sl-search">Search</button>' +
          '</div>' +
        '</div>' +

        '<div class="song-lookup-status" id="sl-status" style="display:none"></div>' +
        '<div class="sl-results" id="sl-results" style="display:none"></div>' +
      '</div>';

    var songInput   = section.querySelector('#sl-song');
    var artistInput = section.querySelector('#sl-artist');
    var searchBtn   = section.querySelector('#sl-search');
    var statusEl    = section.querySelector('#sl-status');
    var resultsEl   = section.querySelector('#sl-results');

    function doSearch() {
      var song   = songInput.value.trim();
      var artist = artistInput.value.trim();

      if (song.length < 2) {
        setStatus(statusEl, 'Please enter a song name (at least 2 characters).', 'song-lookup-status--error');
        resultsEl.style.display = 'none';
        return;
      }

      setStatus(statusEl, '', '');
      renderResults(resultsEl, song, artist);
    }

    searchBtn.addEventListener('click', doSearch);

    [songInput, artistInput].forEach(function(inp) {
      inp.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') doSearch();
      });
    });
  };

})();
