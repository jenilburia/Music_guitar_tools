# Product Requirements Document — Circle of Fifths Guitar Tool

---

## Product Summary

A browser-based Circle of Fifths tool for guitarists who want to break out of familiar scale/mode
ruts and instantly generate beautiful chord progressions for original instrumental music.

Open `index.html` directly in any browser — no server, no install, no build step required.

---

## User Profile

| Attribute      | Detail                                          |
|----------------|-------------------------------------------------|
| Player type    | Left-handed guitarist                           |
| Experience     | 17 years, intermediate level                    |
| Goal           | Create original instrumental music              |
| Problem        | Stuck on the same scales and modes              |
| Rig            | Boss ME-70, Squier Telecaster, Katana 50 MK2    |
| Looper         | Mooer GL100 (real-time chord layering workflow) |

---

## Features & Acceptance Criteria

### 1. Interactive Circle of Fifths (SVG)
- 12 outer segments = major keys, 12 inner segments = relative minors
- C sits at 12 o'clock, keys progress clockwise through the circle
- Clicking a key:
  - Highlights it in violet (selected)
  - Highlights its perfect 5th (clockwise neighbor) in teal
  - Highlights its perfect 4th (counter-clockwise neighbor) in dark teal
  - Highlights the relative minor (inner ring, same slice) in violet
- Hover state on each segment

### 2. Diatonic Chord Display
- Shows all 7 diatonic chords for the selected key
- Each chord card shows: Roman numeral (I, ii, iii...), chord name, mode name
- Color-coded by quality: gold = major, gray = minor, red = diminished
- Clicking a chord adds it to the progression builder
- "Diagram" button opens the left-handed chord diagram

### 3. Chord Progression Builder
- Up to 8 chord slots
- Click a chord card to append to the progression
- Click × on a slot to remove that chord
- Clear button wipes the whole progression
- Copy button copies chord names to clipboard (e.g., "Am - F - C - G")

### 4. Mode Explorer
- Displayed below the chord grid
- One row per diatonic chord showing: chord name, Roman numeral, mode name, mood description
- Color-coded left border per mode
- Descriptions use guitarist-friendly language (references Santana, Satriani, etc.)

### 5. Left-Handed Chord Diagrams
- Opens in a modal on "Diagram" button click
- Fretboard is mirrored: low E string on the RIGHT side
- Shows: nut, 4 fret rows, 6 string lines, finger dots, open/mute markers
- Barre chord detection: draws a thick bar for 3+ strings on same fret
- Fret position label shown for above-first-position chords

---

## Architecture Decisions

| Decision                        | Reason                                                                 |
|---------------------------------|------------------------------------------------------------------------|
| Vanilla HTML/CSS/JS             | No build tools, works as file:// in any browser                        |
| No `type="module"` on scripts   | file:// protocol blocks ES module imports due to CORS policy           |
| 6 separate JS files             | Separation of concerns; each file owns one domain                      |
| AppState global object          | Simple shared state without a framework; declared before all scripts   |
| Standard voicing → lefty mirror | Store once in standard format, reverse array for left-hand display     |
| SVG for circle and diagrams     | Scalable, no canvas API complexity, easy CSS styling                   |
| viewBox="-200 -200 400 400"     | Centered origin makes trig math clean (no offset adjustments)          |

---

## File Structure

```
Music_guitar_tools/
├── index.html          # App shell + script loading order
├── prd.md              # This document + build log
├── css/
│   └── style.css       # All styling (dark studio theme, CSS custom properties)
└── js/
    ├── theory.js       # CIRCLE, REL_MINORS, getDiatonicChords(), getNeighborIndices()
    ├── voicings.js     # VOICINGS database, getVoicing(), mirrorForLefty()
    ├── circle.js       # initCircle(), createArcPath(), selectKey()
    ├── chords.js       # renderChordGrid(), renderModeList()
    ├── progression.js  # addToProgression(), clearProgression(), renderProgression()
    └── app.js          # DOMContentLoaded wiring + renderChordDiagram() (lefty SVG)
```

---

## Music Theory Reference

### Circle of Fifths Order (clockwise from C)
`C – G – D – A – E – B – F# – Db – Ab – Eb – Bb – F`

### Relative Minors (aligned with above)
`Am – Em – Bm – F#m – C#m – G#m – D#m – Bbm – Fm – Cm – Gm – Dm`

### Diatonic Chord Qualities (major key)
| Degree | Roman | Quality    | Mode       |
|--------|-------|------------|------------|
| 1      | I     | Major      | Ionian     |
| 2      | ii    | minor      | Dorian     |
| 3      | iii   | minor      | Phrygian   |
| 4      | IV    | Major      | Lydian     |
| 5      | V     | Major      | Mixolydian |
| 6      | vi    | minor      | Aeolian    |
| 7      | vii°  | diminished | Locrian    |

### Mode Moods (guitarist language)
| Mode        | Mood                                                              |
|-------------|-------------------------------------------------------------------|
| Ionian      | Bright, happy, resolved. Home base of Western music.              |
| Dorian      | Minor with raised 6th. Soulful, funky. Santana. Use over ii.      |
| Phrygian    | Minor with ♭2nd. Dark, exotic, Spanish/metal. Djent, flamenco.    |
| Lydian      | Major with ♯4th. Dreamy, floating. Satriani. Great for ambience.  |
| Mixolydian  | Major with ♭7th. Bluesy rock, dominant. Classic rock backbone.    |
| Aeolian     | Natural minor. Sad, emotional. Most rock ballads live here.        |
| Locrian     | Diminished root. Unstable, tense. Rare — maximum drama only.       |

---

## Verification Checklist

- [ ] Open `index.html` in browser — dark page loads, circle visible
- [ ] Click C on the circle — C highlighted violet, G (5th) teal, F (4th) dark teal, Am purple
- [ ] Diatonic chords for C appear: C, Dm, Em, F, G, Am, B°
- [ ] Mode list shows Ionian through Locrian with descriptions
- [ ] Click G chord button — "G" appears in progression strip as gold slot
- [ ] Click × on progression slot — chord removed
- [ ] Click "Diagram" on Am — modal opens with mirrored lefty fretboard (low E on right)
- [ ] Click Clear — progression empties
- [ ] Click Copy — chord names copied to clipboard
- [ ] Test in Bb major: chords should be Bb, Cm, Dm, Eb, F, Gm, A° (flats, not sharps)

---

## Future Ideas (not in v1)

- Audio playback: strum each chord via Web Audio API
- Tempo / BPM display for looper workflow
- Export progression as PDF or image
- Secondary dominants and borrowed chords toggle
- Pentatonic / blues scale overlay on circle
- Transpose button (shift whole progression up/down by semitone)
- MIDI output (Web MIDI API)
- Mobile touch improvements
- Dark/light theme toggle

---

## Build Log

### 2026-02-25 — v1.0 initial build

**Branch:** `claude/improve-guitar-skills-NiMFw`

**Built:**
- Full project structure created from scratch (empty repo)
- `index.html` — app shell, AppState global, script load order
- `css/style.css` — dark studio theme with CSS custom properties, responsive grid layout
- `js/theory.js` — CIRCLE, REL_MINORS, CHROMATIC/FLAT_CHROMATIC, getDiatonicChords(),
  enharmonic spelling for flat keys (F, Bb, Eb, Ab, Db use flat note names)
- `js/voicings.js` — 36+ voicings (12 major, 12 minor, 12 diminished) in [E,A,D,G,B,e] format,
  getVoicing() with fallback, mirrorForLefty() for left-hand display
- `js/circle.js` — SVG arc path construction (viewBox centered at origin), initCircle(),
  selectKey() with CSS class-based highlighting, CustomEvent dispatch
- `js/chords.js` — renderChordGrid() with chord cards, renderModeList() with mode rows
- `js/progression.js` — addToProgression(), removeFromProgression(), clearProgression(),
  getProgressionString(), renderProgression() with up to 8 slots
- `js/app.js` — DOMContentLoaded wiring, modal open/close, renderChordDiagram() with full
  lefty SVG renderer (barre detection, mute/open markers, fret position labels)
- `prd.md` — this document

**Key decisions made during build:**
- No ES modules (file:// CORS issue) → plain global scripts
- mirrorForLefty() reverses the 6-element frets array so low E appears on right side of diagram
- Barre detection: if 3+ strings share the same minimum played fret, draw a barre bar
- Flat key enharmonic spelling: FLAT_KEYS list controls whether Bb major shows "Eb" vs "D#"
