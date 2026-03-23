# Changelog

All notable changes to Music Guitar Tools are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- **Scales on fretboard — 8 scales**: Minor Pentatonic, Major Pentatonic, Blues Scale, Major Blues, Harmonic Minor, Melodic Minor, Diminished W-H, and Whole Tone can now be visualised on the interactive fretboard with root (orange), character note (purple), and scale tone (teal) dot colouring
- **Scale type switcher**: MODES / SCALES toggle buttons in the fretboard control bar switch between the 7-mode row and the 8-scale row; each mode resets CAGED position to All and updates the key label
- **Scale Reference Panel**: a collapsible card panel (mirrors the Mode Relationship Panel) appears below the fretboard when SCALES mode is active, showing intervals, note names, feel description, related modes, and a built-from bridge tip for each of the 8 scales
- **Learning Path panel**: a collapsible 12-step timeline at the bottom of the Fretboard tab guides players from Minor Pentatonic → Whole Tone; each step shows a why-learn-it blurb and a practical fingering tip; scale steps are badged orange, mode steps blue
- **Play Scale in scale mode**: the fretboard practice sequencer correctly uses scale intervals (instead of mode intervals) when SCALES mode is active, including correct interval labels in the live info readout

### Fixed
- **Hint box extension numbers contrast**: "4 + 7" numbers inside the "You know X — add 4 + 7 to play Y" hint box were near-invisible in light mode (~1.45:1 contrast). Introduced a `--primary-text` token (`#883100` dark burnt orange in light mode, `#e8742a` vivid orange in dark mode) so orange text on grey surfaces meets WCAG AA (≥4.5:1) without affecting buttons, borders, or other `--primary` accents.
- **Fretboard dot fills — pastel in light mode**: introduced separate `--color-root-dot`, `--color-scale-dot`, and `--color-character-dot` tokens so fretboard dot fills can be soft pastels (peach `#f4a87a`, mint `#6ecdc5`, lavender `#b8a4e4`) in light mode without affecting badge/legend text contrast. Dark mode restores vivid fills (`#f97316`, `#14b8a6`, `#8b5cf6`) via `[data-theme="dark"]` overrides. Badge and legend text continue using the existing darkened `--color-root/scale/character` tokens unchanged.
- **Light theme colour contrast**: badge/pill text (TONIC, DOMINANT, genre pills, fretboard legend) was near-invisible at contrast ratios as low as 1.07:1. Fixed by lightening `--muted` from `#b8b5af` to `#c8c5bf` and darkening all semantic colour tokens to deep Tailwind 700/800-range values in light mode. Dark mode is unaffected — all vivid original values are restored via `[data-theme="dark"]` overrides, so dark-mode badge colours remain unchanged. `--color-genre-metal` also fixed from near-invisible grey-on-grey to clearly readable slate-700.
- **Mobile nav drawer gap**: switching `.mobile-nav` from `position: sticky` to `position: fixed` removes the ~300 px blank gap that appeared below the header when the drawer was closed; added `visibility: hidden` and `pointer-events: none` on the closed state to prevent invisible tap targets, and `visibility: visible; pointer-events: auto` on `.is-open`

### Added
- **Hamburger menu (mobile)**: on screens ≤600 px the tab-bar is replaced by a hamburger button in the header that opens a full-width slide-down nav drawer; menu closes on outside click, Escape key, or after selecting a tab; active tab is highlighted in the drawer
- **Mobile nav drawer**: six-item vertical nav (`circle`, `fretboard`, `modes`, `progressions`, `practice`, `song-lookup`) with ARIA attributes (`aria-expanded`, `aria-hidden`, `aria-controls`) for accessibility and keyboard navigation

### Changed
- **Responsive layout — mobile (≤600 px)**: header title hidden to maximise header space; key selector font reduced to 11 px; Circle SVG scales to full viewport width; hamburger replaces horizontal tab-bar
- **Responsive layout — tablet (601–1200 px)**: tab buttons narrowed (`padding: 6px 10px`, `font-size: 12px`) and header gap tightened to improve readability on mid-range screens

### Added
- **Practice Mode v2 — empty state**: guided numbered how-to steps displayed when no chords are in the progression, replacing a blank panel
- **Practice Mode v2 — drum beat**: toggle checkbox wires into a new Web Audio drum scheduler (`startDrumBeat` / `stopDrumBeat` / `updateDrumBPM`) with kick (sine 150→50 Hz), snare (bandpass noise + triangle), and hi-hat (highpass noise); lookahead scheduler at 25 ms interval / 100 ms lookahead for tight timing
- **Practice Mode v2 — beats-per-chord selector**: segmented 1 / 2 / 4 / 8 control, value persisted to `AppState.practiceBpC` (default 4)
- **Practice Mode v2 — auto BPM ramp-up**: checkbox with "+X BPM every Y loops, max Z BPM" fields; BPM increments automatically during a session
- **Practice Mode v2 — next-chord preview**: SVG chord diagram rendered via `renderChordDiagram()` for the upcoming chord while the current chord is playing
- **Practice Mode v2 — scale/mode hint**: contextual label shown per chord ("Over Cmaj7 → Ionian — Bright, happy…") sourced from `chord.modeName` / `chord.modeDescription`

---

## [2.0.0] — 2026-03-12

### Added
- SVG fretboard viewer (15 frets, CAGED system, handedness-aware)
- Mode Relationship Panel showing how modes relate to each other
- Character note highlighter for each mode
- Interval formula display per mode
- Pentatonic bridge panel per mode
- "In the Wild" song references for each mode
- Progressions Library with 25 curated progressions and genre filter
- Progression Analysis Panel with harmonic function labels (tonic / subdominant / dominant)
- Borrowed chords toggle (modal interchange)
- Practice Mode: visual chord sequencer with BPM slider and countdown bar

### Fixed
- Mode interval rotation logic producing incorrect scale degrees

---

## [1.5.0] — 2026-02-27

### Added
- Minor key support: Aeolian diatonic chords alongside major keys
- Dual-action circle clicks — single click selects key, second click adds tonic chord to progression
- Hover '+' pill on each arc for quick chord insertion
- Theory Guide modal with in-app music theory reference
- Next-chord suggestion strip based on current progression context

### Changed
- Higher contrast dark fills on circle arcs for legibility
- Circle SVG enlarged to 500 px
- Pulsing arc animation on selected key
- Spring slot animation when adding chords to progression
- VST / LED glow effects on active elements
- Radial gradient panel backgrounds

---

## [1.2.0] — 2026-02-26

### Added
- Web Audio API chord playback using triangle oscillators with strum simulation and ADSR envelope
- Play (▶) buttons on individual chord cards, progression slots, and a Play All action
- KO2 / EP-133 inspired UI: cool grey palette, TE orange (#f47c20) accent, 4 px sharp radius, industrial feel

---

## [1.1.0] — 2026-02-26

### Fixed
- Removed duplicate `audio.js` script block in `standalone.html` that caused audio initialisation errors

---

## [1.0.0] — 2026-02-26

### Added
- One-click progression generator with Shuffle button
- 30+ curated progression templates spanning all 8 modes
- Educational explanation shown per selected progression template
- Left / right hand toggle (preference persisted via localStorage)
- Dark / light mode toggle (preference persisted via localStorage)

### Changed
- Full CSS overhaul: shadcn design-token system, Space Mono font, mechanical keycap buttons, micro-animations throughout

---

## [0.3.0] — 2026-02-25

### Changed
- Material Design 3 redesign across all UI surfaces

### Added
- Vercel hosting configuration (`vercel.json`)

---

## [0.2.0] — 2026-02-25

### Added
- `standalone.html`: fully self-contained single-file version with all CSS and JS inlined for offline use

---

## [0.1.0] — 2026-02-25

### Added
- Initial release
- Circle of Fifths SVG with interactive key selection
- Diatonic chord grid for the selected key
- Mode explorer panel
- Basic progression builder
- Left-handed chord diagrams

---

[Unreleased]: https://github.com/user/music-guitar-tools/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/user/music-guitar-tools/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/user/music-guitar-tools/compare/v1.2.0...v1.5.0
[1.2.0]: https://github.com/user/music-guitar-tools/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/user/music-guitar-tools/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/user/music-guitar-tools/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/user/music-guitar-tools/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/user/music-guitar-tools/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/user/music-guitar-tools/releases/tag/v0.1.0
