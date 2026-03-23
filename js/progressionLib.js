/* =============================================================
   progressionLib.js — Curated Progression Library
   Features: 65+ progressions by genre, genre filter, text search,
             favorites, load into progression builder, why explanations.
   Depends on: theory.js, progression.js (setProgression),
               app.js (AppState)
   ============================================================= */

var PROGRESSION_LIBRARY = [
  // ── Rock ────────────────────────────────────────────────────
  { name: 'I–V–vi–IV',    genre: 'rock',    mood: "The 'Axis of Awesome' — powers thousands of pop/rock songs",  numerals: [0,4,5,3],
    why: 'The most viral chord loop in pop history — I establishes home, V creates tension, vi drops to the relative minor for emotional depth, and IV resolves warmly. These four chords cover all seven scale tones, which is why any melody fits over them.' },
  { name: 'I–IV–V',       genre: 'rock',    mood: 'Classic 3-chord rock. Chuck Berry, Stones. Works in any key.', numerals: [0,3,4],
    why: 'The three primary chords of any key sit as immediate neighbors on the Circle of Fifths — that proximity is why I–IV–V sounds inevitable. Western ears have been conditioned by centuries of folk, blues, and rock built on this foundation.' },
  { name: 'I–bVII–IV',    genre: 'rock',    mood: "Mixolydian rock swagger — Sweet Home Alabama, Free Fallin'",  numerals: [0,'b7',3], special: true,
    why: 'The flat VII is borrowed from Mixolydian, where the 7th degree is lowered by a half-step — this turns the normally diminished VII chord into a powerful major chord. The descending I–bVII–IV bass line creates instant classic-rock confidence.' },
  { name: 'vi–IV–I–V',    genre: 'rock',    mood: 'Minor-feeling but major key. Emotional without going full minor.', numerals: [5,3,0,4],
    why: 'Same four chords as I–V–vi–IV but starting on vi shifts the emotional center to the relative minor, making familiar chords feel introspective rather than triumphant. Proof that chord order shapes mood as much as the chords themselves.' },
  { name: 'I–V–IV–V',     genre: 'rock',    mood: 'Two-chord turnaround feel. Great for jamming over.',           numerals: [0,4,3,4],
    why: 'Alternating tension (V) and relaxation (IV) without ever fully landing on I creates perpetual forward momentum — ideal for extended soloing or jamming. The V chord bookending every bar keeps the energy high.' },

  // ── Blues ────────────────────────────────────────────────────
  { name: 'I7–IV7–V7 (12-bar)', genre: 'blues', mood: 'The foundation of all blues. 12-bar form.',              numerals: [0,3,4],
    why: 'All three primary chords voiced as dominant 7ths — normally a signal of unresolved tension, but here that tension IS the blues sound. The 12-bar form organizes these three chords into a cyclical structure that underpins all Western popular music.' },
  { name: 'I–IV–I–V–IV–I', genre: 'blues',  mood: 'Texas blues turnaround — Stevie Ray style',                   numerals: [0,3,0,4,3,0],
    why: 'A Texas-style turnaround that doubles through all three primary chords with extra repetitions of the tonic. The doubled I chords give the progression a loping, asymmetric feel that pairs perfectly with a shuffle rhythm and sliding bends.' },
  { name: 'i–IV–i–V',     genre: 'blues',   mood: 'Minor blues — more haunting, Hendrix Manic Depression feel',  numerals: [0,3,0,4], minor: true,
    why: 'Minor blues uses the same three primary chords but the minor tonic gives everything a darker, more haunting color. The IV chord becomes a flash of brightness in an otherwise shadowed progression — Hendrix used this contrast to devastating emotional effect.' },

  // ── Jazz ─────────────────────────────────────────────────────
  { name: 'ii–V–I',       genre: 'jazz',    mood: 'The most common jazz cadence. Essential vocabulary.',          numerals: [1,4,0],
    why: 'The fundamental jazz cadence — ii provides a gentle minor pull, V contains the tritone that demands resolution, and I finally provides it. Every jazz standard is a chain of ii–V–I movements through different keys, often overlapping and substituted.' },
  { name: 'I–vi–ii–V',    genre: 'jazz',    mood: "The 'Rhythm Changes' loop. Bebop backbone.",                  numerals: [0,5,1,4],
    why: 'The four-bar bebop cycle used in hundreds of standards. The descending root motion (I→vi→ii→V) mirrors a walk around the Circle of Fifths — that cyclical motion creates an inevitable, self-perpetuating feel that never fully resolves before starting again.' },
  { name: 'I–vi–IV–V',    genre: 'jazz',    mood: '50s doo-wop meets jazz. Warm, nostalgic.',                    numerals: [0,5,3,4],
    why: 'The doo-wop loop given jazz voicings — warm, nostalgic, and harmonically complete. The I to vi movement is a "deceptive" substitution that replaces the expected resolution, giving the progression its characteristic bittersweet quality.' },
  { name: 'iii–vi–ii–V',  genre: 'jazz',    mood: 'All minor-quality chords descending. Smooth jazz feel.',      numerals: [2,5,1,4],
    why: 'Four consecutive chords descending through the Circle of Fifths by perfect fourths — a sequence of consistent intervallic motion. The smooth, inevitable descent is used as a turnaround or bridge in jazz standards.' },

  // ── Pop ──────────────────────────────────────────────────────
  { name: 'I–V–vi–iii–IV', genre: 'pop',   mood: 'Canon in D / Pachelbel descending. Epic, timeless.',           numerals: [0,4,5,2,3],
    why: "Pachelbel's 1694 bass line still driving modern pop — the stepwise descending bass creates ultra-smooth voice leading because every chord shares two common tones with its neighbor. The iii chord is the secret ingredient that bridges vi and IV." },
  { name: 'vi–IV–I–V',    genre: 'pop',    mood: 'Emotional pop ballad. Let Her Go, Someone Like You.',          numerals: [5,3,0,4],
    why: 'Opens on the relative minor for an introspective, searching quality before landing on I as brief resolution. Starting on vi makes familiar major-key chords feel emotionally heavier — the same harmonic logic as countless breakup anthems.' },
  { name: 'I–IV–vi–V',    genre: 'pop',    mood: 'Slightly darker pop. Uplifting but with tension.',             numerals: [0,3,5,4],
    why: 'A slightly darker variation of the four-chord family — moving through IV before dropping to vi. The IV–vi motion creates a moment of contrast and shadow that sets up V\'s return to I with extra urgency.' },

  // ── Folk ─────────────────────────────────────────────────────
  { name: 'I–IV–I–V',     genre: 'folk',   mood: 'Traditional folk backbone. Acoustic strumming essential.',     numerals: [0,3,0,4],
    why: 'Traditional folk at its most elemental — two chords alternating in call-and-response before V pushes the turnaround. The sparse design leaves maximum room for melody, vocals, and fingerpicking ornamentation.' },
  { name: 'I–ii–IV–I',    genre: 'folk',   mood: 'Moving stepwise. Irish/Celtic fingerpicking territory.',       numerals: [0,1,3,0],
    why: 'A stepwise upward move from I through ii to IV before returning home. The ii chord creates a subtle passing motion characteristic of Celtic and Irish traditional music — more melodic than the standard I–IV–V approach.' },

  // ── Neo-Soul ─────────────────────────────────────────────────
  { name: 'Imaj7–iii7–vi7–IV', genre: 'neo-soul', mood: "D'Angelo, Erykah Badu territory. Rich, jazzy soul.",   numerals: [0,2,5,3],
    why: 'Rich jazz voicings applied to a pop progression give neo-soul its sophisticated warmth. The chain of major-seventh to minor-seventh chords creates lush inner-voice movement — the harmonic hallmark of D\'Angelo and Erykah Badu.' },
  { name: 'i–bVII–bVI–V', genre: 'neo-soul', mood: 'Andalusian cadence. Flamenco meets neo-soul darkness.',     numerals: [0,'b7','b6',4], minor: true,
    why: 'The Andalusian cadence — a descending bass line rooted in flamenco that found its way into neo-soul. The contrast between dark minor starting chords and the bright major arrival on bVI creates visceral drama before V pulls back toward i.' },
  { name: 'ii–V–I–vi',    genre: 'neo-soul', mood: 'Extended ii-V-I with minor turn. Very John Mayer.',         numerals: [1,4,0,5],
    why: 'Extended jazz ii–V–I with a minor turn — the vi prevents full resolution and restarts the cycle with a new emotional color. This is the John Mayer approach: jazz vocabulary, pop song structure, neo-soul feeling.' },

  // ── Metal ─────────────────────────────────────────────────────
  { name: 'i–bVII–bVI–bVII', genre: 'metal', mood: 'Power chord driving. Paranoid (Sabbath), War Pigs feel.',   numerals: [0,'b7','b6','b7'], minor: true,
    why: 'Power chord riffing between three minor-area chords — the bVII–bVI–bVII piston motion creates a hammering feel that Sabbath and Zeppelin used to establish heavy, dark, driving riffs. The return to bVII rather than i avoids resolution.' },
  { name: 'i–bVI–bIII–bVII', genre: 'metal', mood: 'Aeolian metal backbone. Palace of Versailles darkness.',   numerals: [0,'b6','b3','b7'], minor: true,
    why: 'Aeolian backbone — the four primary natural minor chords in a sequence that ascends in root motion. The three major chords (bVI, bIII, bVII) flash like bursts of light against the minor tonic, creating the classic epic metal contrast.' },
  { name: 'i–iv–bVII–bVI', genre: 'metal',  mood: 'Phrygian-flavored drop-D crunch.',                          numerals: [0,3,'b7','b6'], minor: true,
    why: 'Phrygian-flavored descent using the minor iv (not major IV) to keep the color dark throughout. There is no brightness to relieve the relentless minor tension — this is pure Phrygian crunch, ideal for drop-D tuning.' },

  // ── Ambient/Cinematic ─────────────────────────────────────────
  { name: 'I–iii–IV–iv',  genre: 'ambient', mood: 'Major to parallel minor IV. Bittersweet, cinematic.',        numerals: [0,2,3,'iv-borrowed'], special: true,
    why: 'The iv chord is borrowed from the parallel minor key — one borrowed chord turns a simple progression into something bittersweet and cinematic. That unexpected shadow is what separates atmospheric music from straightforward pop.' },
  { name: 'I–bVII–vi–IV', genre: 'ambient', mood: 'Lydian-leaning warmth. Film score, Satriani ambience.',      numerals: [0,'b7',5,3], special: true,
    why: 'The borrowed bVII avoids the leading-tone pull and creates a floating, unresolved quality — the signature of film score harmony. Satriani and Williams use this sequence to evoke wonder, nostalgia, and vast open spaces.' },

  // ── R&B ──────────────────────────────────────────────────────
  { name: 'ii–V–Imaj7–IV',  genre: 'rb', mood: 'Extended jazz cadence with dominant color. Smooth R&B sophistication.', numerals: [1,4,0,3],
    why: 'Jazz cadence with extended voicings places R&B between jazz sophistication and pop accessibility. The major-7th on the tonic creates the lush, warm landing that defines smooth R&B production.' },
  { name: 'i–bVII–bVI–bVII',genre: 'rb', mood: 'Neo-soul crossover. Dorian brightness against a minor tonic.', numerals: [0,'b7','b6','b7'], minor: true, special: true,
    why: 'The minor tonic rocking between two major chords a step apart — the raised VI (major instead of minor bVI) gives this a Dorian brightness that is the signature of modern R&B production. That one raised chord is what separates R&B from plain minor-key pop.' },
  { name: 'I–iii–IV–V',     genre: 'rb', mood: 'Pop-inflected R&B loop. Silky mediant transitions.', numerals: [0,2,3,4],
    why: 'The mediant (iii) acts as a pivot between tonic and subdominant, creating smooth descending voice leading in the inner parts — the secret of those silky R&B transitions. Lush chord voicings with 9ths and 7ths make this progression shine.' },

  // ── Gospel ───────────────────────────────────────────────────
  { name: 'I–IV–I–V',       genre: 'gospel', mood: 'The gospel turnaround. Push-pull tension that powers choir builds.', numerals: [0,3,0,4],
    why: 'Two I chords framing the IV, then V driving home — the repeated I before V creates the characteristic push-pull tension that powers gospel choir builds. The extra I creates space for call-and-response between congregation and choir.' },
  { name: 'I–vi–IV–V–I',    genre: 'gospel', mood: 'Sanctified 5-chord loop. Double resolution at the cadence.', numerals: [0,5,3,4,0],
    why: 'Circles through the relative minor and subdominant before the final authentic cadence. The added V–I at the end gives the double resolution that gospel music lives for — the musical equivalent of saying "amen" twice.' },
  { name: 'IV–I–V–I',       genre: 'gospel', mood: 'Plagal approach. The liturgical "amen" cadence.', numerals: [3,0,4,0],
    why: 'Starting on IV (the plagal approach) feels liturgical and warm — the "amen" cadence of church music. The IV–I movement has been used to close hymns for centuries because it sounds both conclusive and gentle.' },

  // ── Latin ────────────────────────────────────────────────────
  { name: 'i–bVII–bVI–bVII',genre: 'latin', mood: 'Habanera-derived. Hypnotic salsa and mambo groove.', numerals: [0,'b7','b6','b7'], minor: true, special: true,
    why: 'Habanera-derived oscillation between the minor tonic and the major chord a whole step below — the repeated VII creates a hypnotic, danceable groove at the heart of salsa and mambo. The rhythmic pattern does as much work as the harmony.' },
  { name: 'i–iv–V–i',       genre: 'latin', mood: 'Flamenco essence. Minor iv keeps the darkness pure.', numerals: [0,3,4,0], minor: true,
    why: 'Flamenco essence — minor tonic, minor iv subdominant, and major V creating maximum tension before resolving. The minor iv keeps the color dark throughout, and V arrives with Spanish fire. Use triplet strumming for authentic rasgueado.' },
  { name: 'I–II–IV–I',      genre: 'latin', mood: 'Bossa nova dreamscape. Lydian major II creates sunshine.', numerals: [0,1,3,0],
    why: 'The major II chord (from Lydian) creates a dreamy, floating quality over the steady rhythmic pattern. Brazilian music took jazz harmony and turned it into sunshine — the Lydian major II is the sonic signature of bossa nova.' },

  // ── Reggae ───────────────────────────────────────────────────
  { name: 'I–IV–V (one-drop)',  genre: 'reggae', mood: 'Classic reggae one-drop. The rhythm transforms the chords.', numerals: [0,3,4],
    why: 'The same three primary chords as rock and folk — but played with a one-drop rhythm that leaves the downbeat empty. The rhythm transforms familiar harmony into something completely distinct; it is the groove, not the chords, that makes it reggae.' },
  { name: 'I–II (skank)',       genre: 'reggae', mood: 'Two-chord skank. Maximum groove with minimum chords.', numerals: [0,1],
    why: 'The simplest reggae groove — tonic and the major chord a whole step up, played with an offbeat skank. The rhythmic feel does all the work; the two-chord frame creates maximum hypnotic groove with minimum harmonic information.' },
  { name: 'I–vi–IV–V (rocksteady)', genre: 'reggae', mood: 'Rocksteady foundation. Laid-back syncopated doo-wop.', numerals: [0,5,3,4],
    why: 'The doo-wop four-chord loop given a laid-back, syncopated rocksteady treatment. The vi chord adds emotional depth while the offbeat rhythm — every chord landing between the beats — creates the characteristic forward-leaning reggae feel.' },

  // ── Country ──────────────────────────────────────────────────
  { name: 'I–IV–I–V (3-chord)',  genre: 'country', mood: 'Classic 3-chord country. A century of twang.', numerals: [0,3,0,4],
    why: 'The same structure as classic rock and blues but played with a twangy open-G or open-D tuning and a train-beat rhythm. These three chords have powered country music for a century — the simplicity is the point.' },
  { name: 'I–V–vi–IV (Nashville)', genre: 'country', mood: 'Modern country-pop crossover. Nashville production sound.', numerals: [0,4,5,3],
    why: 'The "Axis of Awesome" loop given a Nashville production treatment. The difference from rock is the articulation: chicken-picked arpeggios, pedal steel voicings, and a two-step feel turn the same four chords into something distinctly country.' },
  { name: 'I–IV–V–IV (shuffle)', genre: 'country', mood: 'Country shuffle. Two-step dancing guaranteed.', numerals: [0,3,4,3],
    why: 'The classic country shuffle — a 12/8 or shuffle-8 groove pattern. The IV–V–IV motion creates a rocking, comfortable turnaround that invites two-step dancing and communal singing along. Play with a steady alternating bass line.' },

  // ── Funk ─────────────────────────────────────────────────────
  { name: 'I7–IV7 (vamp)',      genre: 'funk', mood: 'Two-chord funk vamp. Perpetual unresolved tension = the groove.', numerals: [0,3],
    why: 'Both chords voiced as dominant 7ths create perpetual tension that never fully resolves — and that unresolved tension IS the groove. The dominant 7th makes every beat feel like it\'s on the edge, driving the funk forward.' },
  { name: 'i7–IV7–i7 (JB)',     genre: 'funk', mood: 'James Brown\'s building block. The JB sound.', numerals: [0,3,0], minor: true,
    why: 'James Brown\'s fundamental building block — minor tonic and major IV both voiced as dominant 7ths. The minor i7 has a darker, grittier quality than a major I7, which is why funk sits in this emotional space rather than pop brightness.' },
  { name: 'I–bVII–IV–I (Mxo)', genre: 'funk', mood: 'Mixolydian funk. Continuous groove, no resolution.', numerals: [0,'b7',3,0], special: true,
    why: 'Mixolydian funk — the flat seventh chord avoids the leading-tone pull and keeps everything in a continuous groove. The descending I–bVII–IV bass line is the spine of countless funk riffs; the return to I feels grounded but never fully at rest.' },

  // ── Cinematic ────────────────────────────────────────────────
  { name: 'I–vi–III–VII (epic)', genre: 'cinematic', mood: 'Zimmer-style epic. Chain of thirds, inevitable escalation.', numerals: [0,5,2,6],
    why: 'The iii chord voiced as major III creates a modal, heroic lift — Zimmer uses chains of thirds to create a sense of inevitable escalation. Moving through all four triads in a chain of thirds builds tension that feels both ancient and cinematic.' },
  { name: 'i–bVI–bIII–bVII',    genre: 'cinematic', mood: 'Epic minor. Ascending thirds, vast and building.', numerals: [0,'b6','b3','b7'], minor: true,
    why: 'Four chords in a sequence of ascending thirds through natural minor — this pattern appears in countless film trailers because the ascending root motion creates a sense of building toward something vast and inevitable.' },
  { name: 'I–V–vi–iii–IV–I',   genre: 'cinematic', mood: 'Six-chord Pachelbel loop. Wide-angle cinematic sweep.', numerals: [0,4,5,2,3,0],
    why: 'The full Pachelbel loop with the mediant (iii) included — a bridge between the major and minor worlds that is the harmonic equivalent of a wide-angle crane shot. Every chord shares two common tones with its neighbor for ultra-smooth voice leading.' }
];

var ALL_GENRES = [
  'all','starred',
  'rock','blues','jazz','pop','folk','neo-soul','metal','ambient',
  'rb','gospel','latin','reggae','country','funk','cinematic'
];

var GENRE_LABELS = {
  'all': 'All', 'starred': '★ Starred',
  'rock': 'Rock', 'blues': 'Blues', 'jazz': 'Jazz', 'pop': 'Pop',
  'folk': 'Folk', 'neo-soul': 'Neo-Soul', 'metal': 'Metal', 'ambient': 'Ambient',
  'rb': 'R&B', 'gospel': 'Gospel', 'latin': 'Latin', 'reggae': 'Reggae',
  'country': 'Country', 'funk': 'Funk', 'cinematic': 'Cinematic'
};

var _activeGenre  = 'all';
var _searchQuery  = '';
var _favorites    = [];

// ---------------------------------------------------------------
// Favorites helpers
// ---------------------------------------------------------------
function loadFavorites() {
  try { _favorites = JSON.parse(localStorage.getItem('prog_favorites') || '[]'); }
  catch(e) { _favorites = []; }
}

function toggleFavorite(progName) {
  var idx = _favorites.indexOf(progName);
  if (idx === -1) { _favorites.push(progName); }
  else            { _favorites.splice(idx, 1); }
  localStorage.setItem('prog_favorites', JSON.stringify(_favorites));
}

// ---------------------------------------------------------------
// resolveLibraryChords(libEntry)
// Maps numeral indices to current key's diatonic chords.
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
// renderLibExplanation(prog)
// Shows the why panel for a loaded library progression.
// ---------------------------------------------------------------
function renderLibExplanation(prog) {
  var panel = document.getElementById('prog-lib-explanation');
  if (!panel) return;
  if (!prog || !prog.why) { panel.style.display = 'none'; return; }

  var genreClass = prog.genre.replace(/-/g, '');
  var label = GENRE_LABELS[prog.genre] || prog.genre;

  panel.style.display = 'block';
  panel.innerHTML =
    '<div class="prog-lib-expl-header">' +
      '<span class="explanation-name">' + prog.name + '</span>' +
      '<span class="prog-lib-genre-badge prog-lib-genre--' + genreClass + '">' + label + '</span>' +
    '</div>' +
    '<p class="explanation-text">' + prog.why + '</p>';
}

// ---------------------------------------------------------------
// renderProgressionLib()
// Renders genre filter + progression cards into #prog-lib-section.
// ---------------------------------------------------------------
function renderProgressionLib() {
  var cardsContainer = document.getElementById('prog-lib-cards');
  if (!cardsContainer) return;

  var filtered = PROGRESSION_LIBRARY.filter(function(p) {
    // Genre / starred filter
    if (_activeGenre === 'starred') {
      if (_favorites.indexOf(p.name) === -1) return false;
    } else if (_activeGenre !== 'all') {
      if (p.genre !== _activeGenre) return false;
    }
    // Text search
    if (_searchQuery) {
      var q = _searchQuery.toLowerCase();
      return (p.name.toLowerCase().indexOf(q) !== -1) ||
             (p.mood.toLowerCase().indexOf(q) !== -1);
    }
    return true;
  });

  cardsContainer.innerHTML = '';

  if (!filtered.length) {
    cardsContainer.innerHTML = '<p class="placeholder">No progressions match your search.</p>';
    return;
  }

  filtered.forEach(function(prog) {
    var card = document.createElement('div');
    card.className = 'prog-lib-card';
    card.dataset.progName = prog.name;

    var disabled = !AppState.currentKey;
    if (disabled) card.classList.add('prog-lib-card--disabled');

    var isFav = _favorites.indexOf(prog.name) !== -1;
    var genreClass = prog.genre.replace(/-/g, '');
    var genreLabel = GENRE_LABELS[prog.genre] || prog.genre;

    card.innerHTML =
      '<div class="prog-lib-card-header">' +
        '<span class="prog-lib-name">' + prog.name + '</span>' +
        '<div class="prog-lib-card-meta">' +
          '<button class="prog-lib-star' + (isFav ? ' active' : '') + '" data-prog-name="' + prog.name + '" title="' + (isFav ? 'Remove from favorites' : 'Add to favorites') + '" aria-label="' + (isFav ? 'Remove from favorites' : 'Add to favorites') + '">' + (isFav ? '★' : '☆') + '</button>' +
          '<span class="prog-lib-genre-badge prog-lib-genre--' + genreClass + '">' + genreLabel + '</span>' +
        '</div>' +
      '</div>' +
      '<p class="prog-lib-mood">' + prog.mood + '</p>' +
      '<div class="prog-lib-load">' +
        (disabled
          ? '<span class="prog-lib-hint">Select a key to load</span>'
          : '<button class="btn prog-lib-load-btn">Load</button>') +
      '</div>';

    // Star toggle
    card.querySelector('.prog-lib-star').addEventListener('click', function(e) {
      e.stopPropagation();
      toggleFavorite(prog.name);
      renderProgressionLib();
    });

    if (!disabled) {
      card.querySelector('.prog-lib-load-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        var chords = resolveLibraryChords(prog);
        if (chords.length) {
          setProgression(chords);
          renderLibExplanation(prog);
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
// Builds the initial HTML and wires genre filter + search.
// ---------------------------------------------------------------
function initProgressionLib() {
  var section = document.getElementById('prog-lib-section');
  if (!section) return;

  loadFavorites();

  var genreFilterHtml = ALL_GENRES.map(function(g) {
    var label = GENRE_LABELS[g] || (g.charAt(0).toUpperCase() + g.slice(1));
    return '<button class="btn genre-filter-btn' + (g === 'all' ? ' active' : '') + '" data-genre="' + g + '">' + label + '</button>';
  }).join('');

  section.innerHTML =
    '<div class="panel prog-lib-panel">' +
      '<h2 class="panel-title">Common Progressions Library</h2>' +
      '<input class="prog-lib-search" type="search" id="prog-lib-search" placeholder="Search by name or mood…" aria-label="Search progressions">' +
      '<div class="genre-filter-bar">' + genreFilterHtml + '</div>' +
      '<div id="prog-lib-explanation" class="prog-lib-explanation-panel" style="display:none" aria-live="polite"></div>' +
      '<div class="prog-lib-cards" id="prog-lib-cards"></div>' +
    '</div>';

  // Search
  var searchInput = section.querySelector('#prog-lib-search');
  searchInput.addEventListener('input', function() {
    _searchQuery = this.value.trim();
    renderProgressionLib();
  });

  // Genre filter
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
