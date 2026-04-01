/* =============================================================
   generator.js — Chord Progression Templates + Generation Logic
   Depends on: theory.js (getDiatonicChords), progression.js (setProgression)
   Consumed by: app.js (event wiring)

   Template degrees[] use 0-based parent-key chord indexing:
     0=I  1=ii  2=iii  3=IV  4=V  5=vi  6=vii°
   This maps directly into AppState.currentChords[degree].

   Mode-specific templates use the parent-key index for each modal chord:
     Ionian:     tonic=0
     Dorian:     tonic=1, IV=3, V=4, bVII=0
     Phrygian:   tonic=2, bII=3, bVII=1, bVI=0
     Lydian:     tonic=3, II=4, vii=5
     Mixolydian: tonic=4, IV=0, bVII=3
     Aeolian:    tonic=5, bVI=3, bIII=2, bVII=4
     Locrian:    tonic=6, bII=0, bV=3
   ============================================================= */

// ---------------------------------------------------------------
// PROGRESSION_TEMPLATES
// ---------------------------------------------------------------
var PROGRESSION_TEMPLATES = [

  // ═══════════════════════════════════════════════════════════
  // KEY-BASED (mode: null) — works for any major key
  // ═══════════════════════════════════════════════════════════

  {
    name:        'Pop Anthem',
    numerals:    'I – V – vi – IV',
    degrees:     [0, 4, 5, 3],
    mode:        null,
    explanation: 'The most-played progression in modern pop. I establishes home, V ' +
                 'creates tension (it wants to resolve), vi drops to the relative ' +
                 'minor for emotional depth, and IV resolves with warmth. Each chord ' +
                 'shares two common tones with its neighbor — this smooth voice leading ' +
                 'is why it sounds effortless. "Let It Be," "No Woman No Cry," ' +
                 '"Africa," "Don\'t Stop Believin\'".'
  },
  {
    name:        'Doo-Wop / Fifties',
    numerals:    'I – vi – IV – V',
    degrees:     [0, 5, 3, 4],
    mode:        null,
    explanation: 'The timeless 1950s loop. I to vi is a descent to the relative minor ' +
                 '— same key signature, but suddenly more emotional. IV brightens things ' +
                 'up, and V pulls hard back to I. The genius is the I–vi movement: you ' +
                 'stay in the same key but shift the emotional center. "Stand By Me," ' +
                 '"Earth Angel," "Every Breath You Take."'
  },
  {
    name:        'Blues Backbone',
    numerals:    'I – IV – V – I',
    degrees:     [0, 3, 4, 0],
    mode:        null,
    explanation: 'The three primary chords of any major key. On the Circle of Fifths, ' +
                 'IV and V are the two immediate neighbors of I — they are the most ' +
                 'closely related keys possible. This is why I–IV–V sounds so natural ' +
                 'and inevitable. Every blues, rock, country, and folk song is rooted ' +
                 'in this backbone. Add a shuffle rhythm and you have the foundation ' +
                 'of all Western popular music.'
  },
  {
    name:        'Jazz Turnaround',
    numerals:    'ii – V – I',
    degrees:     [1, 4, 0],
    mode:        null,
    explanation: 'The fundamental cadence of jazz. ii is minor (gentle pull), V is ' +
                 'dominant (maximum tension — it contains the tritone, the most unstable ' +
                 'interval), and I resolves with authority. Notice: ii to V to I is ' +
                 'walking counter-clockwise around the Circle of Fifths by perfect ' +
                 'fourths. Every jazz standard is built from chains of ii–V–I movements ' +
                 'through different keys.'
  },
  {
    name:        'Singer-Songwriter',
    numerals:    'vi – IV – I – V',
    degrees:     [5, 3, 0, 4],
    mode:        null,
    explanation: 'The same four chords as "Pop Anthem" but starting on vi — which ' +
                 'completely changes the mood. Opening on the minor vi gives the ' +
                 'progression an introspective, searching quality. The I chord arrives ' +
                 'as brief relief before V kicks off the cycle again. Proof that chord ' +
                 'order shapes emotion as much as the chords themselves. ' +
                 '"Numb," "Save Tonight," "Zombie."'
  },
  {
    name:        'Axis of Awesome',
    numerals:    'I – IV – vi – V',
    degrees:     [0, 3, 5, 4],
    mode:        null,
    explanation: 'A reordering of the four-chord family. Starting I–IV gives an ' +
                 'uplifting, anthemic feel. The vi chord adds depth, and V drives ' +
                 'the turnaround. These four chords contain all seven notes of the ' +
                 'major scale between them — they have complete harmonic coverage ' +
                 'with minimal chords. The Axis of Awesome famously showed this ' +
                 'underlying four chords in over 40 hit songs.'
  },
  {
    name:        'Pachelbel Canon',
    numerals:    'I – V – vi – iii – IV – I – IV – V',
    degrees:     [0, 4, 5, 2, 3, 0, 3, 4],
    mode:        null,
    explanation: 'From 1694 and still in hundreds of songs. The bass line descends ' +
                 'stepwise through the scale, and each upper chord follows. The iii ' +
                 'chord (often omitted in modern pop) is the secret ingredient — it ' +
                 'creates a smooth passing motion between vi and IV. Every chord shares ' +
                 'two or three tones with the next: ultra-smooth voice leading. ' +
                 '"Basket Case," "Let It Be," "Graduation (Friends Forever)."'
  },
  {
    name:        'Andalusian Cadence',
    numerals:    'vi – V – IV – III',
    degrees:     [5, 4, 3, 2],
    mode:        null,
    explanation: 'A descending progression with roots in flamenco and classical Spanish ' +
                 'music. The bass steps down through the scale degrees: 6–5–4–3. The ' +
                 'final chord (iii, or in its Phrygian context, III) creates an exotic, ' +
                 'unresolved tension that begs to repeat. This stepwise descent is one ' +
                 'of the oldest and most powerful bass-line patterns in music. ' +
                 '"Hit the Road Jack," "Stairway to Heaven" intro.'
  },

  // ═══════════════════════════════════════════════════════════
  // IONIAN (mode: 'Ionian') — the home mode, scale degree 0
  // Tonic = parent key's I chord = index 0
  // ═══════════════════════════════════════════════════════════

  {
    name:        'Happy Resolution',
    numerals:    'I – IV – V – I',
    degrees:     [0, 3, 4, 0],
    mode:        'Ionian',
    explanation: 'Ionian is the natural major scale — the brightest, most resolved ' +
                 'mode. This classic cadence embodies it perfectly. The I chord is ' +
                 'pure home; IV is the subdominant (it "looks back" at I); V is the ' +
                 'dominant (maximum forward tension). Resolving from V back to I is ' +
                 'the strongest cadence in Western music because V contains a leading ' +
                 'tone just a half-step below the tonic, pulling like a magnet. ' +
                 'Every hymn, folk song, and anthem uses this logic.'
  },
  {
    name:        'Ascending Ionian',
    numerals:    'I – ii – iii – IV',
    degrees:     [0, 1, 2, 3],
    mode:        'Ionian',
    explanation: 'Walking up through Ionian scale degrees creates a sense of gradual ' +
                 'brightening and ascent. Each chord is one scale step higher than the ' +
                 'last, so the bass moves in a staircase pattern. The ii and iii chords ' +
                 'are minor — they provide contrast and momentary shadow before the IV ' +
                 'chord arrives as a major resolution. This progression teaches you ' +
                 'the character of every chord in the major scale in order. Try it ' +
                 'slowly with fingerpicking.'
  },
  {
    name:        'Ionian Cadence',
    numerals:    'I – IV – ii – V',
    degrees:     [0, 3, 1, 4],
    mode:        'Ionian',
    explanation: 'A more sophisticated Ionian loop. Starting from I and lifting to IV ' +
                 'feels bright and stable. Moving to ii (the supertonic minor) adds a ' +
                 'moment of reflection — ii and IV share two notes so the transition ' +
                 'is seamless. Then V drives back with dominant energy. This is the ' +
                 'core of classical and jazz harmony: tonic (I), subdominant area ' +
                 '(IV/ii), dominant (V), resolve back. The "tonic–subdominant–dominant" ' +
                 'cycle is the skeleton of all functional harmony.'
  },

  // ═══════════════════════════════════════════════════════════
  // DORIAN (mode: 'Dorian') — scale degree 1
  // Tonic = parent key's ii chord = index 1
  // IV (Dorian's major IV) = parent key's V = index 4
  //   Wait — let me re-examine. In C major:
  //   Dorian on D: D(1) E(2) F(3) G(4) A(5) B(6) C(7)
  //   Dorian i = Dm = index 1
  //   Dorian IV = G = index 4  (G is the IV of D Dorian, and it's major!)
  //   Dorian bVII = C = index 0 (C major, one whole step below D)
  //   Dorian ii° = Em = index 2 (the ii of Dorian is minor/half-dim)
  //   Dorian v = Am = index 5
  // ═══════════════════════════════════════════════════════════

  {
    name:        'Dorian Funk Vamp',
    numerals:    'i – IV',
    degrees:     [1, 4],
    mode:        'Dorian',
    explanation: 'The purest Dorian sound: a minor tonic rocking against a major IV. ' +
                 'In natural minor (Aeolian), the iv chord is also minor. But Dorian\'s ' +
                 'raised 6th degree makes the IV chord major — this is the defining ' +
                 'characteristic. That one raised note transforms the mode from dark ' +
                 'to soulful, hopeful, sophisticated. Santana\'s "Oye Como Va," ' +
                 'Miles Davis\'s "So What," and Carlos Santana\'s entire style live in ' +
                 'this two-chord universe. Vamp between them with a funky groove.'
  },
  {
    name:        'Dorian Soul',
    numerals:    'i – IV – i – V',
    degrees:     [1, 4, 1, 4],
    mode:        'Dorian',
    explanation: 'Expanding the Dorian vamp with the dominant V chord for forward ' +
                 'motion. The minor i establishes the dark center. The major IV shines ' +
                 'with Dorian\'s characteristic brightness (that raised 6th). V adds ' +
                 'tension — but notice V in Dorian context is the major chord on the ' +
                 '5th degree, which pushes strongly toward i. This three-chord palette ' +
                 'is behind countless soul, funk, and R&B tracks. Try each chord with ' +
                 'a staccato, funky strum.'
  },
  {
    name:        'Dorian Minor Groove',
    numerals:    'i – bVII – IV – i',
    degrees:     [1, 0, 4, 1],
    mode:        'Dorian',
    explanation: 'Bringing in the bVII chord (the major chord one whole step below the ' +
                 'Dorian tonic — it\'s actually the I chord of the parent major key). ' +
                 'The bVII has a strong pull in modal music because it avoids the ' +
                 'leading-tone resolution of classical harmony, creating a more ' +
                 'floating, groove-oriented feel. The sequence i–bVII–IV–i creates a ' +
                 'descending bass line and then a lift back. This is heavy Santana, ' +
                 'early Cream, and modal jazz territory.'
  },

  // ═══════════════════════════════════════════════════════════
  // PHRYGIAN (mode: 'Phrygian') — scale degree 2
  // In C major, Phrygian is on E:
  //   Phrygian i = Em = index 2
  //   Phrygian bII = F = index 3 (F major, one half-step above E)
  //   Phrygian bVII = D = index 1 (Dm, one whole step below E)
  //   Phrygian bVI = C = index 0 (C major)
  //   Phrygian bIII = G = index 4 (G major)
  // ═══════════════════════════════════════════════════════════

  {
    name:        'Phrygian Metal',
    numerals:    'i – bII',
    degrees:     [2, 3],
    mode:        'Phrygian',
    explanation: 'The signature Phrygian sound: a minor tonic rocking against a major ' +
                 'chord just one semitone above. That half-step interval (minor 2nd) ' +
                 'is the smallest in Western music — it creates immediate tension and ' +
                 'an exotic, dangerous feel. Phrygian is the mode of flamenco, metal, ' +
                 'and djent. Palm-mute the low strings and alternate between these two ' +
                 'power chords for instant heaviness. Metallica\'s "Wherever I May Roam," ' +
                 'Megadeth\'s "Symphony of Destruction."'
  },
  {
    name:        'Phrygian Descent',
    numerals:    'i – bVII – bVI – bII',
    degrees:     [2, 1, 0, 3],
    mode:        'Phrygian',
    explanation: 'The classic Phrygian cadence used in flamenco and film scores. The ' +
                 'bass descends: i (minor) → bVII (minor) → bVI (major) → bII (major). ' +
                 'The contrast between the dark minor starting chords and the bright ' +
                 'major arrival on bVI and bII is viscerally dramatic. This cadence ' +
                 'resolves back to i by a half-step — the most powerful resolution in ' +
                 'Phrygian. Perfect for arpeggiated fingerpicking or classical guitar. ' +
                 'Use tremolo picking on the bII chord for authentic flamenco.'
  },
  {
    name:        'Phrygian Tension Loop',
    numerals:    'i – bII – bVII – i',
    degrees:     [2, 3, 1, 2],
    mode:        'Phrygian',
    explanation: 'A looping Phrygian progression emphasizing both defining intervals: ' +
                 'the ♭2nd (bII, half-step above) and the ♭7th (bVII, whole-step below). ' +
                 'The bII creates exotic tension, bVII provides a descending whole-step ' +
                 'motion, and i grounds the cycle. This pattern appears in Middle Eastern ' +
                 'and Mediterranean music as well as modern metal. With reverb and delay, ' +
                 'it creates a cinematic, ancient atmosphere. Try with open strings ' +
                 'ringing for extra resonance.'
  },

  // ═══════════════════════════════════════════════════════════
  // LYDIAN (mode: 'Lydian') — scale degree 3
  // In C major, Lydian is on F:
  //   Lydian I = F = index 3
  //   Lydian II = G = index 4 (major! — the ♯4 raises the 2nd chord)
  //   Lydian vii = E = index 2 (minor in Lydian context)
  //   Lydian iii = A = index 5 (minor)
  // ═══════════════════════════════════════════════════════════

  {
    name:        'Lydian Float',
    numerals:    'I – II',
    degrees:     [3, 4],
    mode:        'Lydian',
    explanation: 'The simplest Lydian sound. In Ionian (normal major), the ii chord ' +
                 'is minor. But Lydian\'s raised 4th degree (♯4) makes the II chord ' +
                 'major — and this changes everything. Moving from a major I to a major ' +
                 'II chord (a whole-step up) creates a floating, dreamy quality with no ' +
                 'resolution. Joe Satriani\'s "Flying in a Blue Dream" and many John ' +
                 'Williams themes (E.T., Star Wars) use this motion. Let open strings ' +
                 'ring over both chords for a shimmering, ethereal effect.'
  },
  {
    name:        'Lydian Dreamscape',
    numerals:    'I – II – vii – I',
    degrees:     [3, 4, 2, 3],
    mode:        'Lydian',
    explanation: 'Expanding the Lydian float with the natural vii chord (minor in this ' +
                 'context). The I–II motion establishes the dreamlike Lydian character. ' +
                 'The minor vii adds a touch of wistfulness — like a shadow crossing ' +
                 'a sunny sky — before the major I returns with warmth. This combination ' +
                 'of bright and bittersweet is what makes Lydian the "movie wonder" mode. ' +
                 'Use it for pieces that evoke awe, nostalgia, or magic. Clean tone ' +
                 'with reverb is ideal.'
  },
  {
    name:        'Lydian Shimmer',
    numerals:    'I – II – IV – I',
    degrees:     [3, 4, 5, 3],
    mode:        'Lydian',
    explanation: 'A Lydian loop using the major II and the minor iv (which in Lydian ' +
                 'is actually the vi of the parent key). The I–II movement establishes ' +
                 'the floating quality. The minor chord adds emotional contrast, and ' +
                 'the return to I feels resolved but not heavy. This three-chord ' +
                 'progression captures Lydian\'s characteristic blend of brightness and ' +
                 'gentle melancholy. Fingerpicked arpeggios work exceptionally well here. ' +
                 'Try it at a slow tempo with lots of sustain.'
  },

  // ═══════════════════════════════════════════════════════════
  // MIXOLYDIAN (mode: 'Mixolydian') — scale degree 4
  // In C major, Mixolydian is on G:
  //   Mixolydian I = G = index 4
  //   Mixolydian IV = C = index 0 (major)
  //   Mixolydian bVII = F = index 3 (major — the defining Mixolydian chord)
  //   Mixolydian ii = A = index 5 (minor)
  //   Mixolydian iii° = B = index 6 (diminished)
  // ═══════════════════════════════════════════════════════════

  {
    name:        'Mixolydian Rock',
    numerals:    'I – bVII – IV',
    degrees:     [4, 3, 0],
    mode:        'Mixolydian',
    explanation: 'The classic rock Mixolydian sound. In Ionian, the VII chord is ' +
                 'diminished. But Mixolydian\'s flatted 7th makes it a strong, stable ' +
                 'major chord (bVII). Combined with IV, this creates the signature ' +
                 'sound of classic rock: "Sweet Home Alabama," "Sympathy for the Devil," ' +
                 '"Free Fallin\'." The descending motion I → bVII → IV forms a natural ' +
                 'bass line stepping down by whole steps. On guitar, these are usually ' +
                 'played as open or power chords with a driving rhythm.'
  },
  {
    name:        'Mixolydian Shuffle',
    numerals:    'I – bVII – IV – I',
    degrees:     [4, 3, 0, 4],
    mode:        'Mixolydian',
    explanation: 'Adding the tonic return turns the three-chord Mixolydian loop into ' +
                 'a four-bar cycle. The I chord sits on the dominant (5th degree) of ' +
                 'the parent key, giving it inherent bluesy energy — it never fully ' +
                 'rests the way a true tonic does. Descending through bVII to IV and ' +
                 'returning to I creates a satisfying circular motion. This progression ' +
                 'is a workhorse for jam sessions and works perfectly under pentatonic ' +
                 'or full Mixolydian scale improvisation.'
  },
  {
    name:        'Mixolydian Suspended',
    numerals:    'I – IV – bVII – IV',
    degrees:     [4, 0, 3, 0],
    mode:        'Mixolydian',
    explanation: 'A Mixolydian groove oscillating between the tonic and its two ' +
                 'neighbors. The IV and bVII chords bracket the I from both directions. ' +
                 'Because the Mixolydian tonic is the dominant (V) of the parent key, ' +
                 'there is a built-in unresolved energy — the mode never fully settles. ' +
                 'This restlessness makes it perfect for extended grooves and solos. ' +
                 'Think of the vamping sections in long jam band improvisations, or ' +
                 'the verses of blues-rock anthems that never want to resolve.'
  },

  // ═══════════════════════════════════════════════════════════
  // AEOLIAN (mode: 'Aeolian') — scale degree 5 (natural minor)
  // In C major, Aeolian is on A:
  //   Aeolian i = Am = index 5
  //   Aeolian bVI = F = index 3 (major)
  //   Aeolian bIII = C = index 0 (major)
  //   Aeolian bVII = G = index 4 (major — but in natural minor, not dominant)
  //   Aeolian iv = Dm = index 1 (minor)
  //   Aeolian v = Em = index 2 (minor in natural minor — not dominant)
  // ═══════════════════════════════════════════════════════════

  {
    name:        'Epic Minor Ballad',
    numerals:    'i – bVI – bIII – bVII',
    degrees:     [5, 3, 0, 4],
    mode:        'Aeolian',
    explanation: 'The "cinematic minor" progression. Starting on the minor tonic, ' +
                 'it moves through all three major chords available in natural minor: ' +
                 'bVI, bIII, and bVII. Each of these major chords provides a flash ' +
                 'of brightness against the dark minor home. The ascending motion ' +
                 '(i → bVI → bIII → bVII by root) creates a sense of building toward ' +
                 'a peak. Used everywhere in rock ballads, film scores, and power metal. ' +
                 '"Nothing Else Matters," countless film trailers.'
  },
  {
    name:        'Aeolian Sorrow',
    numerals:    'i – bVII – bVI – V',
    degrees:     [5, 4, 3, 4],
    mode:        'Aeolian',
    explanation: 'A descending minor progression with a dramatic twist: ending on V ' +
                 '(major). In pure natural minor, the v chord would be minor. But ' +
                 'borrowing the major V from harmonic minor adds a strong leading tone ' +
                 'that pulls urgently back to i. The descending bass (i → bVII → bVI) ' +
                 'creates a sinking, tragic feeling. The V arrival is like a sudden ' +
                 'burst of light before the darkness returns. This combination of ' +
                 'modal descent and tonal dominant is everywhere in dark rock and metal.'
  },
  {
    name:        'Aeolian Pop Minor',
    numerals:    'i – bVI – bVII – i',
    degrees:     [5, 3, 4, 5],
    mode:        'Aeolian',
    explanation: 'The simplest and most powerful minor progression. The minor i sets ' +
                 'the somber tone. bVI (one of the most consonant minor-key chords) ' +
                 'adds warmth. bVII provides upward momentum — stepping up a whole tone ' +
                 'to bVII creates energy for the return to i. These three chords are ' +
                 'the "primary chords" of natural minor, just as I–IV–V are primary in ' +
                 'major. Direct, powerful, emotionally effective. Half your favorite ' +
                 'minor-key songs use exactly this progression.'
  },

  // ═══════════════════════════════════════════════════════════
  // LOCRIAN (mode: 'Locrian') — scale degree 6 (most unstable)
  // In C major, Locrian is on B:
  //   Locrian i° = B° = index 6 (diminished!)
  //   Locrian bII = C = index 0 (major — one half-step above the tonic)
  //   Locrian bV = F = index 3 (tritone above — maximum dissonance)
  //   Locrian bIII = D = index 1 (minor)
  // ═══════════════════════════════════════════════════════════

  {
    name:        'Locrian Tension',
    numerals:    'i° – bII – bIII',
    degrees:     [6, 0, 1],
    mode:        'Locrian',
    explanation: 'Locrian is the only mode with a diminished tonic chord — making ' +
                 'it inherently unstable and resistant to resolution. The diminished i° ' +
                 'creates immediate unease and uncertainty. Moving to bII (a half-step ' +
                 'up, major) provides momentary relief. The minor bIII extends the ' +
                 'motion without fully resolving. This progression never truly lands — ' +
                 'use it for maximum suspense, disorientation, or horror. Best used ' +
                 'sparingly as a color, not a sustained tonality. The tritone in the ' +
                 'diminished chord is what makes everything so unsettled.'
  },
  {
    name:        'Locrian Drift',
    numerals:    'i° – bII – bV – bII',
    degrees:     [6, 0, 3, 0],
    mode:        'Locrian',
    explanation: 'An experimental loop using the tritone (bV) — the most dissonant ' +
                 'interval in Western music, historically called "diabolus in musica" ' +
                 '(the devil in music). The diminished tonic unsettles the listener, ' +
                 'bII offers a half-step of relief, and bV (a tritone away from the ' +
                 'tonic) adds maximum harmonic tension. The return to bII creates a ' +
                 'fragile, temporary resting point. Best with clean tone, reverb, and ' +
                 'volume swells. This is film score territory — use it for unease and ' +
                 'the uncanny.'
  }

];

// ---------------------------------------------------------------
// _lastTemplateIndex — avoids repeating the same template on Shuffle
// ---------------------------------------------------------------
var _lastTemplateIndex = -1;
var _lastGeneratedMode = undefined;

// ---------------------------------------------------------------
// getTemplatesForMode(modeName)
// Returns templates for a given mode ('Ionian', 'Dorian', etc.)
// or all key-based templates if modeName is null.
// ---------------------------------------------------------------
function getTemplatesForMode(modeName) {
  if (modeName === undefined) {
    return PROGRESSION_TEMPLATES.slice();  // all 32 templates
  }
  return PROGRESSION_TEMPLATES.filter(function(t) {
    return t.mode === modeName;
  });
}

// ---------------------------------------------------------------
// generateProgression(modeName)
// Picks a random (non-repeating) template, resolves chord degrees
// to actual chord objects, calls setProgression(), returns template.
// ---------------------------------------------------------------
function generateProgression(modeName) {
  if (!AppState.currentKey || !AppState.currentChords.length) return null;

  var templates = getTemplatesForMode(modeName);
  if (!templates.length) return null;

  // Pick index, avoiding same as last time (if multiple available)
  var idx;
  if (templates.length === 1) {
    idx = 0;
  } else {
    do {
      idx = Math.floor(Math.random() * templates.length);
    } while (idx === _lastTemplateIndex);
  }
  _lastTemplateIndex = idx;

  var template = templates[idx];
  var chords = template.degrees.map(function(d) {
    return AppState.currentChords[d];
  });

  setProgression(chords);
  return template;
}

// ---------------------------------------------------------------
// generateAndDisplay(modeName)
// Generate a progression and render the explanation panel.
// ---------------------------------------------------------------
function generateAndDisplay(modeName) {
  _lastGeneratedMode = modeName;
  var template = generateProgression(modeName);
  renderExplanation(template);
}

// ---------------------------------------------------------------
// shuffleProgression()
// Re-generate using the last mode filter, avoiding the last template.
// ---------------------------------------------------------------
function shuffleProgression() {
  generateAndDisplay(_lastGeneratedMode);
}

// ---------------------------------------------------------------
// renderExplanation(template)
// Populates (or hides) the #explanation-panel.
// ---------------------------------------------------------------
function renderExplanation(template) {
  var panel = document.getElementById('explanation-panel');
  if (!panel) return;

  if (!template) {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  var modeLabel = template.mode
    ? template.mode + ' mode'
    : AppState.currentKey + ' Major';

  panel.style.display = 'block';
  panel.innerHTML =
    '<div class="explanation-header">' +
      '<span class="explanation-name">' + template.name + '</span>' +
      '<span class="explanation-numerals">' + template.numerals + '</span>' +
      '<span class="explanation-mode-label">' + modeLabel + '</span>' +
    '</div>' +
    '<p class="explanation-text">' + template.explanation + '</p>';
}
