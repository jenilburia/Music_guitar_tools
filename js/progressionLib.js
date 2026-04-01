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
  { name: 'vi–V–IV–I',   genre: 'rock',    mood: 'Cascading power ballad descent. Hotel California outro feel.',  numerals: [5,4,3,0],
    why: 'Descending root motion from vi through V and IV back to I creates an irresistible gravity. The relative minor opening gives this a searching, emotional quality before the final satisfying landing on I.' },
  { name: 'I–iii–IV–I',  genre: 'rock',    mood: 'Beatles mediant lift. Major key with emotional colour.',        numerals: [0,2,3,0],
    why: 'The mediant (iii) is the bridge between tonic and subdominant — a chord that shares two tones with I but feels more colourful. The Beatles used this voice-leading move constantly to add emotional depth without leaving the major key.' },
  { name: 'I–IV–bVII–I', genre: 'rock',    mood: 'Mixolydian rock oscillation. Perpetual groove.',               numerals: [0,3,'b7',0], special: true,
    why: 'Three chords cycling through IV and the borrowed bVII before returning to I — pure Mixolydian rock. The flat VII avoids the leading tone pull, keeping the groove open and unresolved. Classic for riff-based rock.' },
  { name: 'I–bIII–IV–I (modal rock)', genre: 'rock', mood: 'Modal interchange rock — She Sells Sanctuary, flat-III power.', numerals: [0,'b3',3,0], special: true,
    why: 'The flat III borrowed from the parallel minor is the most dramatic single-chord substitution in rock — it turns a major progression into something simultaneously heavy and ascending. The Cult\'s "She Sells Sanctuary" is built on this move: the bIII is a major chord from minor, and its unexpected brightness against the major I creates instant swagger. The IV restores the major-key feel before I closes the loop.' },

  // ── Blues ────────────────────────────────────────────────────
  { name: 'I7–IV7–V7 (12-bar)', genre: 'blues', mood: 'The foundation of all blues. 12-bar form.',              numerals: [0,3,4],
    why: 'All three primary chords voiced as dominant 7ths — normally a signal of unresolved tension, but here that tension IS the blues sound. The 12-bar form organizes these three chords into a cyclical structure that underpins all Western popular music.' },
  { name: 'I–IV–I–V–IV–I', genre: 'blues',  mood: 'Texas blues turnaround — Stevie Ray style',                   numerals: [0,3,0,4,3,0],
    why: 'A Texas-style turnaround that doubles through all three primary chords with extra repetitions of the tonic. The doubled I chords give the progression a loping, asymmetric feel that pairs perfectly with a shuffle rhythm and sliding bends.' },
  { name: 'i–IV–i–V',     genre: 'blues',   mood: 'Minor blues — more haunting, Hendrix Manic Depression feel',  numerals: [0,3,0,4], minor: true,
    why: 'Minor blues uses the same three primary chords but the minor tonic gives everything a darker, more haunting color. The IV chord becomes a flash of brightness in an otherwise shadowed progression — Hendrix used this contrast to devastating emotional effect.' },
  { name: 'I–IV–V–IV',   genre: 'blues',   mood: 'Shuffle return. The 4-bar blues riff foundation.',             numerals: [0,3,4,3],
    why: 'The 4-bar blues riff loop — the return to IV after V creates a rocking, symmetrical feel that drives the shuffle groove. This is the building block of 12-bar blues: expand it to include extra I bars and you have the full form.' },
  { name: 'I–IV–I–V (quick-change)', genre: 'blues', mood: 'Quick-change 12-bar — IV in bar 2 adds momentum to the form.', numerals: [0,3,0,4],
    why: 'The quick-change 12-bar variant — moving to IV in bar 2 (instead of staying on I for four bars) adds momentum right at the top and is standard in Chicago-style electric blues. The extra IV visit creates two I–IV movements per 12-bar cycle instead of one, giving the progression a rolling, forward-leaning energy that suits fast shuffles and turnarounds.' },

  // ── Jazz ─────────────────────────────────────────────────────
  { name: 'ii–V–I',       genre: 'jazz',    mood: 'The most common jazz cadence. Essential vocabulary.',          numerals: [1,4,0],
    why: 'The fundamental jazz cadence — ii provides a gentle minor pull, V contains the tritone that demands resolution, and I finally provides it. Every jazz standard is a chain of ii–V–I movements through different keys, often overlapping and substituted.' },
  { name: 'I–vi–ii–V',    genre: 'jazz',    mood: "The 'Rhythm Changes' loop. Bebop backbone.",                  numerals: [0,5,1,4],
    why: 'The four-bar bebop cycle used in hundreds of standards. The descending root motion (I→vi→ii→V) mirrors a walk around the Circle of Fifths — that cyclical motion creates an inevitable, self-perpetuating feel that never fully resolves before starting again.' },
  { name: 'I–vi–IV–V',    genre: 'jazz',    mood: '50s doo-wop meets jazz. Warm, nostalgic.',                    numerals: [0,5,3,4],
    why: 'The doo-wop loop given jazz voicings — warm, nostalgic, and harmonically complete. The I to vi movement is a "deceptive" substitution that replaces the expected resolution, giving the progression its characteristic bittersweet quality.' },
  { name: 'iii–vi–ii–V',  genre: 'jazz',    mood: 'All minor-quality chords descending. Smooth jazz feel.',      numerals: [2,5,1,4],
    why: 'Four consecutive chords descending through the Circle of Fifths by perfect fourths — a sequence of consistent intervallic motion. The smooth, inevitable descent is used as a turnaround or bridge in jazz standards.' },
  { name: 'I–iii–vi–ii', genre: 'jazz',    mood: 'Descending thirds cycle. Smooth voice-leading through the key.', numerals: [0,2,5,1],
    why: 'Descending through the key by thirds — I to iii to vi to ii — creates exceptionally smooth voice leading because each chord shares two tones with the next. This chain is the jazz arranger\'s secret for silky harmonic motion without a strong cadence.' },
  { name: 'vi–ii–V–I',   genre: 'jazz',    mood: 'Full cycle of fifths. The most complete diatonic resolution.',  numerals: [5,1,4,0],
    why: 'Four descending fifths arriving on I — the complete circle-of-fifths resolution. Jazz musicians use this to establish a key with maximum authority. Every chord pulls toward the next with the same gravitational logic: root motion by fourth.' },
  { name: 'IV–V–I–vi',   genre: 'jazz',    mood: 'Backdoor turnaround. IV approach creates plagal warmth.',       numerals: [3,4,0,5],
    why: 'The plagal approach (IV before V) gives the authentic cadence a warmer, less abrupt arrival. The vi at the end defers full resolution and restarts the cycle — a jazz technique for linking sections seamlessly.' },
  { name: 'ii–iii–IV–V', genre: 'jazz',    mood: 'Ascending stepwise build. Maximum momentum toward V.',          numerals: [1,2,3,4],
    why: 'Stepwise ascending root motion from ii through iii and IV to V builds irresistible upward momentum. Each chord increases tension until V demands resolution. A classic way to set up a ii–V–I by approaching from below.' },
  { name: 'iv–bVII–I (backdoor)', genre: 'jazz', mood: 'Backdoor cadence — jazz substitute for V–I. Warm plagal approach.', numerals: ['iv-borrowed','b7',0], special: true,
    why: 'The backdoor cadence replaces the standard V–I with iv–bVII–I — approaching the tonic from below rather than above. The borrowed iv creates a warm, minor-tinged subdominant pull, and the bVII resolves down a whole step rather than up a half. Jazz musicians use this in standards whenever they want resolution to feel surprising and warm rather than expected and bright.' },
  { name: 'iii–VI–ii–V–I (cycle)', genre: 'jazz', mood: 'Extended fifth cycle — five-chord descending resolution.', numerals: [2,5,1,4,0],
    why: 'The full extended descending-fifth cycle — iii, then three perfect fourths downward (VI→II→V), arriving on I. Each chord prepares the next with the same gravitational pull, so the sequence feels like a cascade of inevitability. Jazz pianists use this to state a key with maximum authority at the top of a chorus or after a modulation.' },

  // ── Pop ──────────────────────────────────────────────────────
  { name: 'I–V–vi–iii–IV', genre: 'pop',   mood: 'Canon in D / Pachelbel descending. Epic, timeless.',           numerals: [0,4,5,2,3],
    why: "Pachelbel's 1694 bass line still driving modern pop — the stepwise descending bass creates ultra-smooth voice leading because every chord shares two common tones with its neighbor. The iii chord is the secret ingredient that bridges vi and IV." },
  { name: 'vi–IV–I–V',    genre: 'pop',    mood: 'Emotional pop ballad. Let Her Go, Someone Like You.',          numerals: [5,3,0,4],
    why: 'Opens on the relative minor for an introspective, searching quality before landing on I as brief resolution. Starting on vi makes familiar major-key chords feel emotionally heavier — the same harmonic logic as countless breakup anthems.' },
  { name: 'I–IV–vi–V',    genre: 'pop',    mood: 'Slightly darker pop. Uplifting but with tension.',             numerals: [0,3,5,4],
    why: 'A slightly darker variation of the four-chord family — moving through IV before dropping to vi. The IV–vi motion creates a moment of contrast and shadow that sets up V\'s return to I with extra urgency.' },
  { name: 'I–vi–iii–IV', genre: 'pop',    mood: 'Nostalgic Pachelbel fragment. Bittersweet major cycle.',        numerals: [0,5,2,3],
    why: 'A fragment of the Pachelbel sequence that captures its bittersweet quality in just four chords. The iii chord is the secret — it sits between major and minor, giving this progression its nostalgic, emotionally complex flavour.' },
  { name: 'I–ii–V–I',    genre: 'pop',    mood: 'Simple jazz-pop turnaround. Works in any tempo.',               numerals: [0,1,4,0],
    why: 'A streamlined jazz cadence accessible to pop ears. The ii softens the approach to V, making the final resolution to I feel earned but not heavy. Works beautifully fingerpicked at any tempo.' },
  { name: 'IV–V–iii–vi (Royal Road)', genre: 'pop', mood: 'Royal Road — J-pop, Rick Astley, Eurodisco euphoria.', numerals: [3,4,2,5],
    why: 'Nicknamed the "Royal Road progression" in Japan, where it drives an enormous proportion of J-pop, city pop, and anime music. The deceptive move from V to iii (instead of the expected I) creates a moment of surprise before landing on vi — a bittersweet minor arrival that feels simultaneously satisfying and yearning. Western ears know it from "Never Gonna Give You Up" and Eurodisco productions.' },
  { name: 'I–iii–IV–iv (pop)', genre: 'pop', mood: "Creep-style — borrowed minor iv casts a shadow on a major key.", numerals: [0,2,3,'iv-borrowed'], special: true,
    why: 'One borrowed chord transforms a straightforward major progression into something emotionally complex. The move from major IV to minor iv (same root, lowered third) is a micro-voice-leading event — one note drops by a half step and everything dims. Radiohead\'s "Creep" made this move iconic, but it appears across decades of pop whenever songwriters want shadow without leaving the major key entirely.' },

  // ── Folk ─────────────────────────────────────────────────────
  { name: 'I–IV–I–V',     genre: 'folk',   mood: 'Traditional folk backbone. Acoustic strumming essential.',     numerals: [0,3,0,4],
    why: 'Traditional folk at its most elemental — two chords alternating in call-and-response before V pushes the turnaround. The sparse design leaves maximum room for melody, vocals, and fingerpicking ornamentation.' },
  { name: 'I–ii–IV–I',    genre: 'folk',   mood: 'Moving stepwise. Irish/Celtic fingerpicking territory.',       numerals: [0,1,3,0],
    why: 'A stepwise upward move from I through ii to IV before returning home. The ii chord creates a subtle passing motion characteristic of Celtic and Irish traditional music — more melodic than the standard I–IV–V approach.' },
  { name: 'I–V–IV–I',    genre: 'folk',   mood: 'Retrograde three-chord folk. Descended cadence.',               numerals: [0,4,3,0],
    why: 'The three-chord folk loop in a descending order: tension from V resolves down through IV rather than leaping directly home. This retrograde motion gives familiar chords a more contemplative, deliberate quality — perfect for fingerpicking.' },
  { name: 'I–bVII–IV–I (Celtic)', genre: 'folk', mood: 'Celtic Mixolydian — Irish / Scottish folk flat-VII swagger.', numerals: [0,'b7',3,0], special: true,
    why: 'The defining harmonic move of Celtic and Irish traditional music — the borrowed flat VII turns what would be a plain I–IV loop into something with modal swagger and ancient character. In Mixolydian mode the seventh degree is naturally lowered, so this isn\'t really "borrowing" — it\'s simply playing in a different mode. The I–bVII rocking motion underpins reels, jigs, and ballads from County Kerry to Cape Breton.' },

  // ── Neo-Soul ─────────────────────────────────────────────────
  { name: 'Imaj7–iii7–vi7–IV', genre: 'neo-soul', mood: "D'Angelo, Erykah Badu territory. Rich, jazzy soul.",   numerals: [0,2,5,3],
    why: 'Rich jazz voicings applied to a pop progression give neo-soul its sophisticated warmth. The chain of major-seventh to minor-seventh chords creates lush inner-voice movement — the harmonic hallmark of D\'Angelo and Erykah Badu.' },
  { name: 'i–bVII–bVI–V', genre: 'neo-soul', mood: 'Andalusian cadence. Flamenco meets neo-soul darkness.',     numerals: [0,'b7','b6',4], minor: true,
    why: 'The Andalusian cadence — a descending bass line rooted in flamenco that found its way into neo-soul. The contrast between dark minor starting chords and the bright major arrival on bVI creates visceral drama before V pulls back toward i.' },
  { name: 'ii–V–I–vi',    genre: 'neo-soul', mood: 'Extended ii-V-I with minor turn. Very John Mayer.',         numerals: [1,4,0,5],
    why: 'Extended jazz ii–V–I with a minor turn — the vi prevents full resolution and restarts the cycle with a new emotional color. This is the John Mayer approach: jazz vocabulary, pop song structure, neo-soul feeling.' },
  { name: 'I–bVII–IV–vi', genre: 'neo-soul', mood: 'Mixolydian neo-soul with minor turn. Wistful landing.',      numerals: [0,'b7',3,5], special: true,
    why: 'Mixolydian borrowed bVII adds swagger, then the vi lands with wistful minor colour instead of resolving home. The combination of major Mixolydian openness and the vi\'s introspection is quintessential neo-soul emotional complexity.' },
  { name: 'iii–vi–ii–I',  genre: 'neo-soul', mood: 'Smooth descending neo-soul. All minor-quality chords falling home.', numerals: [2,5,1,0],
    why: 'Three minor-quality chords descending by thirds before landing on the major I — the contrast of the major arrival makes home feel warm and surprising. Neo-soul players layer 9ths and 11ths over these chords for maximum lushness.' },

  // ── Metal ─────────────────────────────────────────────────────
  { name: 'i–bVII–bVI–bVII', genre: 'metal', mood: 'Power chord driving. Paranoid (Sabbath), War Pigs feel.',   numerals: [0,'b7','b6','b7'], minor: true,
    why: 'Power chord riffing between three minor-area chords — the bVII–bVI–bVII piston motion creates a hammering feel that Sabbath and Zeppelin used to establish heavy, dark, driving riffs. The return to bVII rather than i avoids resolution.' },
  { name: 'i–bVI–bIII–bVII', genre: 'metal', mood: 'Aeolian metal backbone. Palace of Versailles darkness.',   numerals: [0,'b6','b3','b7'], minor: true,
    why: 'Aeolian backbone — the four primary natural minor chords in a sequence that ascends in root motion. The three major chords (bVI, bIII, bVII) flash like bursts of light against the minor tonic, creating the classic epic metal contrast.' },
  { name: 'i–iv–bVII–bVI', genre: 'metal',  mood: 'Phrygian-flavored drop-D crunch.',                          numerals: [0,3,'b7','b6'], minor: true,
    why: 'Phrygian-flavored descent using the minor iv (not major IV) to keep the color dark throughout. There is no brightness to relieve the relentless minor tension — this is pure Phrygian crunch, ideal for drop-D tuning.' },
  { name: 'i–bVII–i–bVII', genre: 'metal', mood: 'Two-chord iron hammer. Raw Sabbath riff energy.',             numerals: [0,'b7',0,'b7'], minor: true,
    why: 'The most stripped-down heavy riff — just the minor tonic and the major chord a whole step below, hammered back and forth. No release, no resolution. The relentless repetition is exactly the point: this is pure riff hypnosis.' },
  { name: 'i–V–bVI–bVII',  genre: 'metal', mood: 'Aeolian power ascent. Minor tonic to major V to bVI to bVII lift.', numerals: [0,4,'b6','b7'], minor: true,
    why: 'The Aeolian ascent — minor tonic launches to the dramatic major V, then bVI and bVII lift to a hanging, unresolved top. The unexpected major V gives this an operatic intensity that distinguishes it from pure Sabbath-style riffing.' },
  { name: 'i–iv–bVI–bVII (doom)', genre: 'metal', mood: 'Doom metal descent — minor iv keeps the darkness total.', numerals: [0,'iv-borrowed','b6','b7'], minor: true, special: true,
    why: 'Pure Phrygian-flavored doom — using the minor iv (not the major IV) ensures there is no flash of brightness anywhere in the progression. Every chord is dark, flat, and heavy. The bVI and bVII arrive as ascending pressure rather than release, creating the oppressive, escalating weight that defines doom and death metal riffing.' },

  // ── Ambient/Cinematic ─────────────────────────────────────────
  { name: 'I–iii–IV–iv',  genre: 'ambient', mood: 'Major to parallel minor IV. Bittersweet, cinematic.',        numerals: [0,2,3,'iv-borrowed'], special: true,
    why: 'The iv chord is borrowed from the parallel minor key — one borrowed chord turns a simple progression into something bittersweet and cinematic. That unexpected shadow is what separates atmospheric music from straightforward pop.' },
  { name: 'I–bVII–vi–IV', genre: 'ambient', mood: 'Lydian-leaning warmth. Film score, Satriani ambience.',      numerals: [0,'b7',5,3], special: true,
    why: 'The borrowed bVII avoids the leading-tone pull and creates a floating, unresolved quality — the signature of film score harmony. Satriani and Williams use this sequence to evoke wonder, nostalgia, and vast open spaces.' },
  { name: 'iii–IV–I–V',  genre: 'ambient', mood: 'Mediant-approach floating texture. Unresolved, drifting.',    numerals: [2,3,0,4],
    why: 'Opening on the mediant (iii) creates an immediately ungrounded, floating quality — we are not sure where home is yet. The progression moves through familiar chords but the iii start keeps the texture hovering, perfect for ambient soundscapes.' },
  { name: 'I–IV–ii–V',   genre: 'ambient', mood: 'Jazz-ambient cycle. Clean voice leading, wide open feel.',    numerals: [0,3,1,4],
    why: 'Jazz voice-leading logic in an ambient context — every chord moves smoothly to the next, with plenty of internal common tones. Play slowly with reverb and let each chord breathe: the wide open spacing does the atmospheric work.' },
  { name: 'I–bVII–ii–IV (drift)', genre: 'ambient', mood: 'Ambient drift — borrowed bVII creates unmoored floating texture.', numerals: [0,'b7',1,3], special: true,
    why: 'The borrowed bVII disrupts the expected tonal gravity of I, creating an unmoored, drifting quality — we never quite know where home is. The ii and IV restore a sense of gentle forward motion without snapping fully into focus. Play each chord for 4–8 bars with heavy reverb and slow attack: this is the sound of ambient music that keeps you suspended between states without ever dropping anchor.' },

  // ── R&B ──────────────────────────────────────────────────────
  { name: 'ii–V–Imaj7–IV',  genre: 'rb', mood: 'Extended jazz cadence with dominant color. Smooth R&B sophistication.', numerals: [1,4,0,3],
    why: 'Jazz cadence with extended voicings places R&B between jazz sophistication and pop accessibility. The major-7th on the tonic creates the lush, warm landing that defines smooth R&B production.' },
  { name: 'i–bVII–bVI–bVII',genre: 'rb', mood: 'Neo-soul crossover. Dorian brightness against a minor tonic.', numerals: [0,'b7','b6','b7'], minor: true, special: true,
    why: 'The minor tonic rocking between two major chords a step apart — the raised VI (major instead of minor bVI) gives this a Dorian brightness that is the signature of modern R&B production. That one raised chord is what separates R&B from plain minor-key pop.' },
  { name: 'I–iii–IV–V',     genre: 'rb', mood: 'Pop-inflected R&B loop. Silky mediant transitions.', numerals: [0,2,3,4],
    why: 'The mediant (iii) acts as a pivot between tonic and subdominant, creating smooth descending voice leading in the inner parts — the secret of those silky R&B transitions. Lush chord voicings with 9ths and 7ths make this progression shine.' },
  { name: 'I–IV–vi–iii',   genre: 'rb', mood: 'Silky descending thirds. Smooth transitions and inner voice movement.', numerals: [0,3,5,2],
    why: 'Descending through the key by thirds — I to IV (a skip), then vi and iii stepwise — creates smooth, interweaving inner voice movement. The iv and iii share two tones, making transitions seamless. Layer 7ths and 9ths for full R&B texture.' },

  // ── Gospel ───────────────────────────────────────────────────
  { name: 'I–IV–I–V',       genre: 'gospel', mood: 'The gospel turnaround. Push-pull tension that powers choir builds.', numerals: [0,3,0,4],
    why: 'Two I chords framing the IV, then V driving home — the repeated I before V creates the characteristic push-pull tension that powers gospel choir builds. The extra I creates space for call-and-response between congregation and choir.' },
  { name: 'I–vi–IV–V–I',    genre: 'gospel', mood: 'Sanctified 5-chord loop. Double resolution at the cadence.', numerals: [0,5,3,4,0],
    why: 'Circles through the relative minor and subdominant before the final authentic cadence. The added V–I at the end gives the double resolution that gospel music lives for — the musical equivalent of saying "amen" twice.' },
  { name: 'IV–I–V–I',       genre: 'gospel', mood: 'Plagal approach. The liturgical "amen" cadence.', numerals: [3,0,4,0],
    why: 'Starting on IV (the plagal approach) feels liturgical and warm — the "amen" cadence of church music. The IV–I movement has been used to close hymns for centuries because it sounds both conclusive and gentle.' },
  { name: 'I–iii–IV–V–I',  genre: 'gospel', mood: 'Gospel mediant build. Five-chord sweep with double resolution.', numerals: [0,2,3,4,0],
    why: 'The mediant (iii) adds colour between I and IV, then the full IV–V–I cadence delivers the double resolution gospel music lives for. That sweep through five chords is the musical equivalent of a rising choir building to a triumphant close.' },
  { name: 'IV–V–vi–I (gospel lift)', genre: 'gospel', mood: 'Gospel lift — "surprise" major landing after minor approach.', numerals: [3,4,5,0],
    why: 'Gospel\'s "lift" cadence — IV and V build expectation toward the tonic, then vi arrives as a deceptive cadence (we expected I) before I finally lands. That moment of delay on vi followed by the major I feels like a joyful surprise even though it\'s structurally inevitable. Choirs use this to create the emotional peak of a song: the brief vi teases before the triumphant I resolution.' },

  // ── Latin ────────────────────────────────────────────────────
  { name: 'i–bVII–bVI–bVII',genre: 'latin', mood: 'Habanera-derived. Hypnotic salsa and mambo groove.', numerals: [0,'b7','b6','b7'], minor: true, special: true,
    why: 'Habanera-derived oscillation between the minor tonic and the major chord a whole step below — the repeated VII creates a hypnotic, danceable groove at the heart of salsa and mambo. The rhythmic pattern does as much work as the harmony.' },
  { name: 'i–iv–V–i',       genre: 'latin', mood: 'Flamenco essence. Minor iv keeps the darkness pure.', numerals: [0,3,4,0], minor: true,
    why: 'Flamenco essence — minor tonic, minor iv subdominant, and major V creating maximum tension before resolving. The minor iv keeps the color dark throughout, and V arrives with Spanish fire. Use triplet strumming for authentic rasgueado.' },
  { name: 'I–II–IV–I',      genre: 'latin', mood: 'Bossa nova dreamscape. Lydian major II creates sunshine.', numerals: [0,1,3,0],
    why: 'The major II chord (from Lydian) creates a dreamy, floating quality over the steady rhythmic pattern. Brazilian music took jazz harmony and turned it into sunshine — the Lydian major II is the sonic signature of bossa nova.' },
  { name: 'i–bIII–bVII–IV', genre: 'latin', mood: 'Bachata-style descent. Dark tonic, borrowed colour, major IV warmth.', numerals: [0,'b3','b7',3], minor: true,
    why: 'A bachata-flavoured descent through borrowed Aeolian chords before landing on the warm major IV. The minor tonic and flat III keep the colour dark, but IV brings unexpected brightness — the emotional signature of Latin romantic music.' },

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
  { name: 'I–V–iii–IV',   genre: 'country', mood: 'Country ascending inner-voice line. Pedal steel territory.',  numerals: [0,4,2,3],
    why: 'Moving from V down to iii before IV creates a descending inner voice (B–A–G# in G major) — the kind of chromatic movement that pedal steel lives for. This inner-voice motion is the hallmark of classic 1960s country ballads.' },

  // ── Funk ─────────────────────────────────────────────────────
  { name: 'I7–IV7 (vamp)',      genre: 'funk', mood: 'Two-chord funk vamp. Perpetual unresolved tension = the groove.', numerals: [0,3],
    why: 'Both chords voiced as dominant 7ths create perpetual tension that never fully resolves — and that unresolved tension IS the groove. The dominant 7th makes every beat feel like it\'s on the edge, driving the funk forward.' },
  { name: 'i7–IV7–i7 (JB)',     genre: 'funk', mood: 'James Brown\'s building block. The JB sound.', numerals: [0,3,0], minor: true,
    why: 'James Brown\'s fundamental building block — minor tonic and major IV both voiced as dominant 7ths. The minor i7 has a darker, grittier quality than a major I7, which is why funk sits in this emotional space rather than pop brightness.' },
  { name: 'I–bVII–IV–I (Mxo)', genre: 'funk', mood: 'Mixolydian funk. Continuous groove, no resolution.', numerals: [0,'b7',3,0], special: true,
    why: 'Mixolydian funk — the flat seventh chord avoids the leading-tone pull and keeps everything in a continuous groove. The descending I–bVII–IV bass line is the spine of countless funk riffs; the return to I feels grounded but never fully at rest.' },
  { name: 'I–IV–bVII–IV',  genre: 'funk',  mood: 'Mixolydian funk vamp. bVII creates the slink.',              numerals: [0,3,'b7',3], special: true,
    why: 'Oscillating between IV and the borrowed bVII creates a slinking, side-to-side groove motion — the IV is familiar and warm, the bVII is raw and earthy. Together they produce the unresolved tension that drives funk forward indefinitely.' },
  { name: 'i–bVII–IV–V',   genre: 'funk',  mood: 'Funk turnaround. Dark minor start, major cadence punch.',     numerals: [0,'b7',3,4], minor: true,
    why: 'A minor tonic gives this funk groove a darker, grittier opening, then the bVII–IV–V build punches to a strong authentic cadence. The major V arriving after borrowed chords hits like a snare accent — pure funk dynamics.' },

  // ── Cinematic ────────────────────────────────────────────────
  { name: 'I–vi–III–VII (epic)', genre: 'cinematic', mood: 'Zimmer-style epic. Chain of thirds, inevitable escalation.', numerals: [0,5,2,6],
    why: 'The iii chord voiced as major III creates a modal, heroic lift — Zimmer uses chains of thirds to create a sense of inevitable escalation. Moving through all four triads in a chain of thirds builds tension that feels both ancient and cinematic.' },
  { name: 'i–bVI–bIII–bVII',    genre: 'cinematic', mood: 'Epic minor. Ascending thirds, vast and building.', numerals: [0,'b6','b3','b7'], minor: true,
    why: 'Four chords in a sequence of ascending thirds through natural minor — this pattern appears in countless film trailers because the ascending root motion creates a sense of building toward something vast and inevitable.' },
  { name: 'I–V–vi–iii–IV–I',   genre: 'cinematic', mood: 'Six-chord Pachelbel loop. Wide-angle cinematic sweep.', numerals: [0,4,5,2,3,0],
    why: 'The full Pachelbel loop with the mediant (iii) included — a bridge between the major and minor worlds that is the harmonic equivalent of a wide-angle crane shot. Every chord shares two common tones with its neighbor for ultra-smooth voice leading.' },
  { name: 'i–v–bVI–bVII',      genre: 'cinematic', mood: 'Natural minor film score turnaround. Classic trailer sound.', numerals: [0,4,'b6','b7'], minor: true,
    why: 'The natural minor film score turnaround: minor i to minor v (lower case — the v chord of natural minor), then bVI and bVII ascend to leave the progression open and vast. This sequence appears in countless film trailers — tension with no resolution.' },
  { name: 'IV–I–bVII–IV',      genre: 'cinematic', mood: 'Mixolydian sweep. Cinematic plateau feeling, no full resolution.', numerals: [3,0,'b7',3], special: true,
    why: 'Starting on IV creates an immediately wide, searching quality — we are not home yet. The I arrives but immediately departs to the borrowed bVII, then returns to IV: a plateau that never fully resolves. Perfect for underscore and establishing shots.' },

  // ── Hip-Hop ───────────────────────────────────────────────────
  { name: 'i–bVII–bVI–bVII (trap)', genre: 'hip-hop', mood: 'Trap loop backbone — dark minor oscillation, 808 bass heaven.', numerals: [0,'b7','b6','b7'], minor: true, special: true,
    why: 'The engine of trap music: a minor tonic rocking between two major chords a whole step apart. The bVII–bVI–bVII piston motion creates the hypnotic, unresolved oscillation that lets an 808 bass line and vocal ad-libs loop indefinitely without harmonic fatigue.' },
  { name: 'i–bVI–bIII–bVII (hip-hop)', genre: 'hip-hop', mood: 'Cinematic hip-hop — Kanye / Kendrick orchestral sample energy.', numerals: [0,'b6','b3','b7'], minor: true, special: true,
    why: 'The Aeolian four-chord sequence beloved by sample-based producers — the ascending root motion from bVI through bIII to bVII creates a sense of escalating drama that makes it the harmonic backbone of countless cinematic hip-hop beats. Chop a string loop over this and it sounds like a film score.' },
  { name: 'i–iv–bVII–i (boom bap)', genre: 'hip-hop', mood: 'Boom bap loop — minor iv soul-sample darkness.', numerals: [0,'iv-borrowed','b7',0], minor: true, special: true,
    why: 'Classic East Coast boom bap harmony — the minor iv (borrowed from the parallel minor rather than the major IV) keeps the color dark and soulful throughout, while the bVII adds a moment of resolution-adjacent release before returning to the minor tonic. Soul and jazz records sampled by boom bap producers are saturated with this movement.' },

  // ── EDM ───────────────────────────────────────────────────────
  { name: 'i–bVI–bIII–bVII (progressive house)', genre: 'edm', mood: 'Big room EDM — the four chords that built a thousand drops.', numerals: [0,'b6','b3','b7'], minor: true, special: true,
    why: 'The universal language of big room and progressive house — four Aeolian chords cycling with relentless upward root motion. The ascending bass line creates an almost mechanical sense of inevitability that builds perfectly into a drop. Swedish House Mafia, Avicii, and countless anthems are built on this exact sequence.' },
  { name: 'vi–IV–I–V (trance)', genre: 'edm', mood: 'Uplifting trance — euphoric and anthemic, hands in the air.', numerals: [5,3,0,4],
    why: 'The uplifting trance loop — starting on vi gives the same four diatonic chords a searching, emotional quality that resolves briefly on I before V pushes forward again. At 138 BPM with a supersaw lead, the delayed I resolution feels like emotional release. This progression is programmed into the emotional DNA of an entire genre.' },
  { name: 'i–bVI–bVII (minimal vamp)', genre: 'edm', mood: 'Minimal EDM vamp — three chords, endless groove.', numerals: [0,'b6','b7'], minor: true, special: true,
    why: 'Minimal techno and deep house harmony stripped to its essence — three chords that create a continuous rocking motion without ever fully resolving. The bVI provides a flash of warmth, the bVII a step away from home, and i grounds everything without closing it down. Less is more: the tension never releases, so the groove never stops.' },

  // ── Indie ─────────────────────────────────────────────────────
  { name: 'I–iii–IV–iv (indie)', genre: 'indie', mood: 'Borrowed minor iv — emotionally complex indie guitar staple.', numerals: [0,2,3,'iv-borrowed'], special: true,
    why: 'The borrowed iv is the masterstroke that separates indie harmony from plain pop — a single minor chord dropped into a major key progression casts an immediate shadow. The major IV to minor iv movement (the same root, different quality) is a voice-leading micro-event that indie rock has exploited for decades for maximum emotional complexity with minimum harmonic effort.' },
  { name: 'I–bVII–IV–vi (modal indie)', genre: 'indie', mood: 'Modal Mixolydian indie — Radiohead / Fleet Foxes floating quality.', numerals: [0,'b7',3,5], special: true,
    why: 'Mixolydian harmony lands on the relative minor rather than returning home — the bVII creates a modal, rootless quality while the vi ending leaves everything unresolved and searching. This is the harmonic fingerprint of indie rock bands that want to feel both earthy (Mixolydian openness) and introspective (minor landing).' },
  { name: 'i–bVII–bVI–iv (dark indie)', genre: 'indie', mood: 'Dark indie descent — minor tonic, all borrowed palette.', numerals: [0,'b7','b6','iv-borrowed'], minor: true, special: true,
    why: 'A descending progression that stays relentlessly in the minor world — the borrowed iv instead of major IV keeps the final chord dark and unresolved rather than letting in any brightness. This is dark indie territory: Portishead, The National, Daughter — music that doesn\'t reach for the light.' },

  // ── Classical ─────────────────────────────────────────────────
  { name: 'i–iv–bVII–bIII–bVI–ii–V–i', genre: 'classical', mood: 'Bach circle descent — all 8 stations of natural minor in one sweep.', numerals: [0,'iv-borrowed','b7','b3','b6',1,4,0], minor: true, special: true,
    why: 'The descending circle-of-fifths sequence through natural minor — each chord\'s root falls a perfect fifth from the last. Bach and Handel used this as a structural backbone for entire movements: it provides eight harmonically inevitable steps of descending tension before the V–i cadence delivers final resolution. No other chord sequence covers the full key as completely.' },
  { name: 'I–IV–vii–iii–vi–ii–V–I', genre: 'classical', mood: 'Circle ascent — full major-key cycle of fifths resolution.', numerals: [0,3,6,2,5,1,4,0],
    why: 'The ascending circle-of-fifths sequence through the major key — eight diatonic chords each pulling toward the next by descending fifth root motion. Baroque composers used this as a demonstration of harmonic completeness: every diatonic chord appears exactly once, and the final V–I cadence delivers perfect authentic resolution. A self-contained harmonic universe.' },
  { name: 'i–bVII–bVI–V (lament)', genre: 'classical', mood: 'Baroque lament bass — Purcell, Bach passacaglia ground.', numerals: [0,'b7','b6',4], minor: true, special: true,
    why: 'The lament bass — one of the oldest ground bass patterns in Western music, descending stepwise from i to V through the borrowed bVII and bVI. Purcell\'s "Dido\'s Lament", Bach\'s Crucifixus, and dozens of Baroque pieces build entire structures over this four-chord ground. The stepwise descent creates an inexorable sense of grief that no other progression matches.' },

  // ── Bossa Nova ────────────────────────────────────────────────
  { name: 'I–vi–ii–V (bossa)', genre: 'bossa', mood: "Bossa nova jazz cycle — Girl from Ipanema harmonic DNA.", numerals: [0,5,1,4],
    why: 'The jazz-bossa four-chord loop at the heart of Brazilian harmony — the same cycle that powers "Girl from Ipanema" and hundreds of bossa nova standards. Play each chord with a lightly syncopated thumb-bass pattern and fingers on beats 2 and 4 of a slow 4/4: the gentle offbeat feel is what separates bossa from jazz. The ii–V at the end pulls back to I with warm inevitability.' },
  { name: 'iii–vi–ii–V (bossa)', genre: 'bossa', mood: 'Extended bossa descending cycle — sophisticated saudade.', numerals: [2,5,1,4],
    why: 'A more sophisticated bossa loop beginning on iii rather than I — this delays the tonic entirely, keeping the progression in a state of yearning suspension that perfectly captures the bossa nova concept of saudade (longing). Antônio Carlos Jobim often started sections on unexpected chords to avoid harmonic predictability; this is that impulse expressed as a repeating cycle.' },
  { name: 'I–IV–ii–V (bossa)', genre: 'bossa', mood: 'Bossa rhythm loop — Brazilian guitar meets jazz harmony.', numerals: [0,3,1,4],
    why: 'A bossa nova loop that foregrounds the subdominant before the ii–V resolution — the IV chord gives the progression a warmer, more folk-like opening before the ii–V jazz machinery takes over. Played with the characteristic Brazilian right-hand pattern (thumb bass on beats 1 and 3, fingers voicing the chord on the offbeats), this bridges folk simplicity and jazz sophistication.' }
];

var ALL_GENRES = [
  'all','starred',
  'rock','blues','jazz','pop','folk','neo-soul','metal','ambient',
  'rb','gospel','latin','reggae','country','funk','cinematic',
  'hip-hop','edm','indie','classical','bossa'
];

var GENRE_LABELS = {
  'all': 'All', 'starred': '★ Starred',
  'rock': 'Rock', 'blues': 'Blues', 'jazz': 'Jazz', 'pop': 'Pop',
  'folk': 'Folk', 'neo-soul': 'Neo-Soul', 'metal': 'Metal', 'ambient': 'Ambient',
  'rb': 'R&B', 'gospel': 'Gospel', 'latin': 'Latin', 'reggae': 'Reggae',
  'country': 'Country', 'funk': 'Funk', 'cinematic': 'Cinematic',
  'hip-hop': 'Hip-Hop', 'edm': 'EDM', 'indie': 'Indie', 'classical': 'Classical', 'bossa': 'Bossa Nova'
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
// Supports borrowed chord strings: 'b7' (bVII), 'b6' (bVI),
// 'b3' (bIII), 'iv-borrowed' (iv) via parallel minor scale.
// For minor progressions, index 0 resolves to the parallel minor i.
// ---------------------------------------------------------------
function resolveLibraryChords(libEntry) {
  if (!AppState.currentChords || !AppState.currentChords.length) return [];
  var key = AppState.currentKey;
  var pm  = getParallelMinorChords(key);

  var borrowedMap = {
    'b7':          pm[6],  // bVII
    'b6':          pm[5],  // bVI
    'b3':          pm[2],  // bIII
    'iv-borrowed': pm[3]   // iv
  };

  var chords = [];
  libEntry.numerals.forEach(function(num) {
    if (typeof num === 'number' && num >= 0 && num <= 6) {
      if (num === 0 && libEntry.minor) {
        chords.push(pm[0]);
      } else {
        chords.push(AppState.currentChords[num]);
      }
    } else if (typeof num === 'string' && borrowedMap[num]) {
      chords.push(borrowedMap[num]);
    }
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
// loadRandomLibraryProgression()
// Picks from the full library (genre surfing), then jumps the genre
// filter to the loaded progression's genre.
// ---------------------------------------------------------------
function loadRandomLibraryProgression() {
  if (!AppState.currentKey) return;
  // Pick from full library — genre surfing
  var pick = PROGRESSION_LIBRARY[Math.floor(Math.random() * PROGRESSION_LIBRARY.length)];
  var chords = resolveLibraryChords(pick);
  if (!chords.length) return;
  setProgression(chords);
  renderLibExplanation(pick);
  // Jump genre filter to the loaded progression's genre
  _activeGenre = pick.genre || 'all';
  var section = document.getElementById('prog-lib-section');
  if (section) {
    section.querySelectorAll('.genre-filter-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.genre === _activeGenre);
    });
  }
  renderProgressionLib();
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
