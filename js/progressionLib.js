/* =============================================================
   progressionLib.js — Curated Progression Library
   Features: 25+ progressions by genre, genre filter,
             load into progression builder.
   Depends on: theory.js, progression.js (setProgression),
               app.js (AppState)
   ============================================================= */

var PROGRESSION_LIBRARY = [
  // Rock
  { name: 'I–V–vi–IV',    genre: 'rock',    mood: "The 'Axis of Awesome' — powers thousands of pop/rock songs",  numerals: [0,4,5,3] },
  { name: 'I–IV–V',       genre: 'rock',    mood: 'Classic 3-chord rock. Chuck Berry, Stones. Works in any key.', numerals: [0,3,4] },
  { name: 'I–bVII–IV',    genre: 'rock',    mood: "Mixolydian rock swagger — Sweet Home Alabama, Free Fallin'",  numerals: [0,'b7',3], special: true },
  { name: 'vi–IV–I–V',    genre: 'rock',    mood: 'Minor-feeling but major key. Emotional without going full minor.', numerals: [5,3,0,4] },
  { name: 'I–V–IV–V',     genre: 'rock',    mood: 'Two-chord turnaround feel. Great for jamming over.',           numerals: [0,4,3,4] },
  // Blues
  { name: 'I7–IV7–V7 (12-bar)', genre: 'blues', mood: 'The foundation of all blues. 12-bar form.',              numerals: [0,3,4] },
  { name: 'I–IV–I–V–IV–I', genre: 'blues',  mood: 'Texas blues turnaround — Stevie Ray style',                   numerals: [0,3,0,4,3,0] },
  { name: 'i–IV–i–V',     genre: 'blues',   mood: 'Minor blues — more haunting, Hendrix Manic Depression feel',  numerals: [0,3,0,4], minor: true },
  // Jazz
  { name: 'ii–V–I',       genre: 'jazz',    mood: 'The most common jazz cadence. Essential vocabulary.',          numerals: [1,4,0] },
  { name: 'I–vi–ii–V',    genre: 'jazz',    mood: "The 'Rhythm Changes' loop. Bebop backbone.",                  numerals: [0,5,1,4] },
  { name: 'I–vi–IV–V',    genre: 'jazz',    mood: '50s doo-wop meets jazz. Warm, nostalgic.',                    numerals: [0,5,3,4] },
  { name: 'iii–vi–ii–V',  genre: 'jazz',    mood: 'All minor-quality chords descending. Smooth jazz feel.',      numerals: [2,5,1,4] },
  // Pop
  { name: 'I–V–vi–iii–IV', genre: 'pop',   mood: 'Canon in D / Pachelbel descending. Epic, timeless.',           numerals: [0,4,5,2,3] },
  { name: 'vi–IV–I–V',    genre: 'pop',    mood: 'Emotional pop ballad. Let Her Go, Someone Like You.',          numerals: [5,3,0,4] },
  { name: 'I–IV–vi–V',    genre: 'pop',    mood: 'Slightly darker pop. Uplifting but with tension.',             numerals: [0,3,5,4] },
  // Folk
  { name: 'I–IV–I–V',     genre: 'folk',   mood: 'Traditional folk backbone. Acoustic strumming essential.',     numerals: [0,3,0,4] },
  { name: 'I–ii–IV–I',    genre: 'folk',   mood: 'Moving stepwise. Irish/Celtic fingerpicking territory.',       numerals: [0,1,3,0] },
  // Neo-Soul
  { name: 'Imaj7–iii7–vi7–IV', genre: 'neo-soul', mood: "D'Angelo, Erykah Badu territory. Rich, jazzy soul.",   numerals: [0,2,5,3] },
  { name: 'i–bVII–bVI–V', genre: 'neo-soul', mood: 'Andalusian cadence. Flamenco meets neo-soul darkness.',     numerals: [0,'b7','b6',4], minor: true },
  { name: 'ii–V–I–vi',    genre: 'neo-soul', mood: 'Extended ii-V-I with minor turn. Very John Mayer.',         numerals: [1,4,0,5] },
  // Metal
  { name: 'i–bVII–bVI–bVII', genre: 'metal', mood: 'Power chord driving. Paranoid (Sabbath), War Pigs feel.',   numerals: [0,'b7','b6','b7'], minor: true },
  { name: 'i–bVI–bIII–bVII', genre: 'metal', mood: 'Aeolian metal backbone. Palace of Versailles darkness.',   numerals: [0,'b6','b3','b7'], minor: true },
  { name: 'i–iv–bVII–bVI', genre: 'metal',  mood: 'Phrygian-flavored drop-D crunch.',                          numerals: [0,3,'b7','b6'], minor: true },
  // Ambient/Cinematic
  { name: 'I–iii–IV–iv',  genre: 'ambient', mood: 'Major to parallel minor IV. Bittersweet, cinematic.',        numerals: [0,2,3,'iv-borrowed'], special: true },
  { name: 'I–bVII–vi–IV', genre: 'ambient', mood: 'Lydian-leaning warmth. Film score, Satriani ambience.',      numerals: [0,'b7',5,3], special: true }
];

var ALL_GENRES = ['all','rock','blues','jazz','pop','folk','neo-soul','metal','ambient'];

var _activeGenre = 'all';

// ---------------------------------------------------------------
// resolveLibraryChords(libEntry)
// Maps numerals indices to current key's diatonic chords.
// Returns array of chord objects (skips non-integer entries).
// ---------------------------------------------------------------
function resolveLibraryChords(libEntry) {
  if (!AppState.currentChords || !AppState.currentChords.length) return [];
  var chords = [];
  libEntry.numerals.forEach(function(num) {
    if (typeof num === 'number' && num >= 0 && num <= 6) {
      chords.push(AppState.currentChords[num]);
    }
    // Skip borrowed/special string entries (b7, b6, etc.)
  });
  return chords;
}

// ---------------------------------------------------------------
// renderProgressionLib()
// Renders genre filter + progression cards into #prog-lib-section.
// ---------------------------------------------------------------
function renderProgressionLib() {
  var cardsContainer = document.getElementById('prog-lib-cards');
  if (!cardsContainer) return;

  var filtered = _activeGenre === 'all'
    ? PROGRESSION_LIBRARY
    : PROGRESSION_LIBRARY.filter(function(p) { return p.genre === _activeGenre; });

  cardsContainer.innerHTML = '';

  filtered.forEach(function(prog) {
    var card = document.createElement('div');
    card.className = 'prog-lib-card';
    card.dataset.progName = prog.name;

    var disabled = !AppState.currentKey;
    if (disabled) card.classList.add('prog-lib-card--disabled');

    var numeralDisplay = prog.numerals.map(function(n) {
      return typeof n === 'number' ? (n === 0 ? 'I' : ['I','ii','iii','IV','V','vi','vii°'][n]) : n;
    }).join(' – ');

    card.innerHTML =
      '<div class="prog-lib-card-header">' +
        '<span class="prog-lib-name">' + prog.name + '</span>' +
        '<span class="prog-lib-genre-badge prog-lib-genre--' + prog.genre.replace('-','') + '">' + prog.genre + '</span>' +
      '</div>' +
      '<p class="prog-lib-mood">' + prog.mood + '</p>' +
      '<div class="prog-lib-load">' +
        (disabled ? '<span class="prog-lib-hint">Select a key to load</span>' : '<button class="btn prog-lib-load-btn">Load</button>') +
      '</div>';

    if (!disabled) {
      card.querySelector('.prog-lib-load-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        var chords = resolveLibraryChords(prog);
        if (chords.length) {
          setProgression(chords);
          // Flash the button
          var btn = e.target;
          var orig = btn.textContent;
          btn.textContent = 'Loaded!';
          setTimeout(function() { btn.textContent = orig; }, 1200);
        }
      });
    }

    cardsContainer.appendChild(card);
  });
}

// ---------------------------------------------------------------
// initProgressionLib()
// Builds the initial HTML and wires genre filter buttons.
// ---------------------------------------------------------------
function initProgressionLib() {
  var section = document.getElementById('prog-lib-section');
  if (!section) return;

  var genreFilterHtml = ALL_GENRES.map(function(g) {
    var label = g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1);
    return '<button class="btn genre-filter-btn' + (g === 'all' ? ' active' : '') + '" data-genre="' + g + '">' + label + '</button>';
  }).join('');

  section.innerHTML =
    '<div class="panel prog-lib-panel">' +
      '<h2 class="panel-title">Common Progressions Library</h2>' +
      '<div class="genre-filter-bar">' + genreFilterHtml + '</div>' +
      '<div class="prog-lib-cards" id="prog-lib-cards"></div>' +
    '</div>';

  // Genre filter events
  section.addEventListener('click', function(e) {
    var btn = e.target.closest('.genre-filter-btn');
    if (!btn) return;
    _activeGenre = btn.dataset.genre;
    section.querySelectorAll('.genre-filter-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.genre === _activeGenre);
    });
    renderProgressionLib();
  });

  renderProgressionLib();
}
