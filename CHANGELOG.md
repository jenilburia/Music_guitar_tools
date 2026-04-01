# Changelog

All notable changes to Music Guitar Tools are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- **Mini-player — BPM typing**: the BPM display in the navbar transport is now an editable number input. Click it to type a value directly, then press Enter or click away to apply. Out-of-range values are clamped to 40–240. The input blends in visually (no border at rest) and shows a focus ring when active, consistent with the 3D keycap aesthetic.

### Fixed
- **BPM sync — mini-player ↔ practice panel**: typing a BPM value (or using the ±5 buttons) in the navbar mini-player now immediately updates the bottom "X BPM" display and the running metronome/drum tempo. Previously, the internal BPM variable in the practice engine was not notified of mini-player changes, causing the two displays to show different values. Moving the practice-panel BPM slider now also updates the mini-player number input.
- **Mini-player — button height inconsistency**: the − and + BPM buttons were 26 px tall while all surrounding buttons (Beats, ▶, L, ◑) were 36 px, making them appear noticeably shorter. Both buttons are now 36 px tall on desktop so the entire transport row is uniform.

### Added
- **Navbar mini player — BPM controls**: − and + buttons now appear in the sticky navbar transport (both desktop and mobile) so you can nudge BPM in steps of 5 without navigating to the Practice tab. The current BPM is displayed between the buttons and stays in sync with the Practice tab slider in both directions.

### Changed
- **Navbar play button — icon only**: the desktop play/stop button in the navbar now shows ▶ / ⏸⏸ without the "Practice" / "Stop All" label text, matching the existing mobile behaviour and saving horizontal space.

### Added
- **Modes tab — mode filter dropdown**: the mini progression player on the Modes tab now has the same "Any mode / Ionian / …" dropdown as the builder tab. Shuffle on that tab respects the selection, so you can stay in the Modes tab and still scope shuffles to a specific mode. Clicking a mode row syncs both the builder and Modes tab dropdowns simultaneously.
- **Progressions tab — genre-scoped Shuffle**: the Shuffle button in the mini player on the Progressions Library tab now loads a random progression from the currently-selected genre filter (e.g. Jazz, Blues, Starred) rather than generating a generic modal template — a more useful behaviour in a browsing context.

### Changed
- **Progressions tab — Generate button removed**: the Generate button has been removed from the Progressions tab mini player; modal template generation doesn't belong in a genre-curated library browsing context.
- **Progressions tab — Shuffle now surfs all genres**: Shuffle picks from the full library across all 20 genres, then jumps the genre filter bar to the loaded progression's genre, enabling quick cross-genre discovery ("channel surfing").

### Fixed
- **Mode filter dropdown styling**: the `.mode-filter-select` was using the undefined `var(--surface)` token and a mismatched `border-radius: 6px`. It now uses `var(--btn-face)`, `var(--radius)` (4px), and the full 3D keycap shadow + hover/focus treatment — matching every other button in the UI. Dark mode gets a correctly-coloured light chevron arrow.

### Added
- **Progression Builder — mode filter dropdown**: A "Any mode / Ionian / Dorian / …" select sits next to the Shuffle button. Shuffle now reads this dropdown so you can scope it to a specific mode without switching tabs. Clicking a mode row on the Modes tab also updates the dropdown automatically, keeping both controls in sync.

### Changed
- **Progression Builder — merged Generate and Shuffle into a single "Shuffle" button**: the separate Generate button (which only drew from 8 key-based templates) is removed. Shuffle now draws from all 32 templates across all modes by default, giving much more variety on each press. Clicking a mode row (e.g. Dorian) still scopes Shuffle to that mode's pool — mode rows act as a filter, Shuffle re-rolls within it.

### Removed
- **Generate button**: replaced by the unified Shuffle button described above.

### Added
- **Progression Library — 25 new progressions across 5 new genres and 8 existing ones**: library grows from ~65 to ~90 progressions.
  - **5 new genre tabs**: Hip-Hop (3 progressions: trap loop, cinematic, boom bap), EDM (3: progressive house, uplifting trance, minimal vamp), Indie (3: borrowed-iv Creep style, modal Mixolydian, dark descent), Classical (3: Bach circle descent, circle ascent, Baroque lament bass), Bossa Nova (3: jazz-bossa loop, extended cycle, bossa rhythm loop).
  - **10 additions to existing genres**: Jazz (backdoor cadence iv–bVII–I, extended fifth cycle iii–VI–ii–V–I), Pop (Royal Road IV–V–iii–vi, Creep-style borrowed iv), Rock (modal interchange I–bIII–IV–I), Metal (doom i–iv–bVI–bVII), Folk (Celtic Mixolydian I–bVII–IV–I), Gospel (lift cadence IV–V–vi–I), Ambient (drift I–bVII–ii–IV), Blues (quick-change 12-bar I–IV–I–V).

### Fixed
- **Sequencer — last chord no longer flashes when generating or loading a full progression**: the slot-flash animation now only fires when manually adding a single chord; loading a complete progression (Generate or Library) renders all slots at once with no spurious highlight on the final chord.
- **Progression Library — borrowed chords (bVII, bVI, bIII, iv) now load correctly**: previously `resolveLibraryChords()` silently skipped any non-numeric numeral, so progressions like `i–bVII–bVI–bVII` loaded only 1 chord instead of 4. All metal, ambient, latin, R&B, cinematic, and funk progressions containing borrowed chords now resolve fully via the parallel minor scale.
- **Progression Library — minor-key root chord quality corrected**: for progressions with `minor: true`, index 0 now resolves to the parallel minor i chord (e.g. Cm in key of C) rather than the major I chord — fixing a quality mismatch at the tonic of every minor-key progression.

### Added
- **Progression Library — 25 new curated progressions across all 15 genres**: library grows from ~45 to ~70 progressions. New entries span rock (mediant lift, Mixolydian oscillation, power ballad descent), blues (shuffle return), jazz (descending thirds, full cycle of fifths, backdoor turnaround, ascending build), pop (Pachelbel fragment, jazz-pop turnaround), folk (retrograde three-chord), neo-soul (Mixolydian with minor turn, descending thirds), metal (iron hammer two-chord, Aeolian ascent), ambient (mediant float, jazz-ambient cycle), R&B (silky descending thirds), gospel (mediant five-chord sweep), latin (bachata descent), country (pedal steel inner voice), funk (Mixolydian vamp, minor turnaround), and cinematic (natural minor turnaround, Mixolydian plateau).

### Added
- **Practice tab — Drum mode toggle (Beats / Metro)**: a "Drum mode" row now appears below the drum-enable checkbox when the drum beat is turned on. Clicking Beats or Metro switches the scheduler mode immediately and keeps the global header mode button in sync — so the mode change is visible and controllable from both locations.

### Fixed
- **Global "Beats / Metro" header button had no visible effect**: clicking the header mode button now also updates the practice-tab Drum mode buttons bidirectionally, so the mode change is always reflected wherever the user looks.
- **Global ▶ Practice button played silently — no audio**: the global mini-player's play button now auto-enables the drum beat before starting practice, so Beats/Metro audio always plays. The Practice tab drum checkbox is synced automatically so the two controls stay consistent.

### Changed
- **Song Lookup — replaced API-based lookup with direct search links**: removed the Anthropic Claude API integration (API key input, rate limiting, daily/session counters, localStorage cache). The tab now instantly generates clickable result cards linking to 7 trusted chord/tab sites (Ultimate Guitar, Chordify, Songsterr, E-Chords, Chordie, AZ Chords, Google filtered). No API key required, no quota limits, always works offline-friendly.

### Added
- **Song Lookup result cards**: 2-column card grid with site favicon, name, specialty badge, short description, and "Open Search ↗" button that opens the pre-filled search in a new tab.

### Removed
- **Song Lookup API key UI**: removed API key input, "Save Key / Change key" flow, cooldown timer, daily/session usage counter, localStorage chord cache, and all Claude API fetch logic.

### Fixed
- **Progression full — silent truncation**: shows "Progression is full (8/8)" hint for 2 s when all 8 slots are occupied, instead of silently ignoring the click.
- **Clear button native confirm() dialog**: replaced browser `confirm()` with inline 2-second "Sure?" confirmation — click once to arm, click again to confirm, or wait 2 s to cancel. Keeps the app's visual language consistent.
- **Silent audio failures**: `AudioContext` init errors now surface a one-line inline message ("Audio unavailable — try Chrome or Safari") in the progression panel rather than silently failing when Play is clicked.
- **`--danger` token conflict**: mini-player Stop All button now uses `var(--destructive)` / `var(--destructive-foreground)` consistently; removed the orphan `--danger` fallback and hardcoded `#fff`.
- **`#fff` hardcoded in beat-selector**: `.practice-bpc-btn.active` now uses `var(--primary-foreground)` so the active tab respects the theme token system.

### Added
- **Design tokens — color system completeness**: added `--color-note-active`, `--color-note-active-text`, four scale-category tokens (`--color-scale-cat-penta/blues/minor/sym`), `--color-lp-mode`, and four shadow tokens (`--shadow-sm/md/lg/card`). All hardcoded hex values in fretboard active dot, scale category badges, and learning path badges now reference these tokens.
- **Circle of Fifths first-time hint**: a pulsing "▲ Click a key to start" label appears beneath the circle on first visit; disappears after the first selection and is suppressed via `localStorage` flag thereafter.
- **Borrowed chords subtitle**: one-line explanation ("Chords from the parallel minor key.") below the Borrowed toggle provides context without needing to hover.
- **Chord diagram modal focus trap**: Tab / Shift+Tab cycle only within the open modal; focus is set to the close button on open. Keyboard users can no longer accidentally navigate out into the page behind.
- **Progression slot aria-labels**: each filled slot has `aria-label="Slot N: ChordName"` and its remove button has a matching label for screen reader users.
- **Fretboard button title attributes**: mode, position, and scale selector buttons now have descriptive `title` tooltips (e.g. "Dorian mode", "CAGED Position 2", "Blues Scale") visible on hover.
- **Slot flash animation**: the progression slot that receives a newly added chord briefly pulses to the primary colour — clear confirmation of the addition.
- **Settings saved feedback**: theme (◑) and handedness (L/R) icon buttons pulse their outline ring for 700 ms after writing to `localStorage` — confirms the preference was saved without any intrusive overlay.

### Changed
- **Shadow scale**: defined `--shadow-sm/md/lg/card` tokens; applied to panels, mode-rel cards, progression library cards, and explanation panel for a consistent elevation hierarchy.
- **Font size floor raised to 10px**: replaced all `8px`, `8.5px`, and `9px` font sizes with `10px` — the minimum for legible Space Mono text. Eliminates the confusing near-identical micro-size cluster (8/8.5/9/10/11 px).
- **Button heights unified**: compact control buttons (Borrowed toggle, Wild toggle, Load chords) aligned to 26 px; action buttons remain at 34 px.
- **Border-radius normalised**: `calc(var(--radius) - 2px)` on number inputs and hardcoded `3px` on formula steps and interval badges replaced with `var(--radius)`.
- **Genre color tokens consolidated**: 7 additional genre tokens moved from a second isolated `:root` block into the main `:root` — single source of truth, easier to maintain.
- **Generate / Shuffle buttons disabled during operation**: prevents double-click queuing multiple back-to-back operations.
- **Drum mode synced on Practice tab activation**: the mini-player Beats/Metro button label reflects the current mode when switching to the Practice tab.
- **Fretboard scale mode and scale index persisted**: `scaleMode` and `currentScale` are saved to `localStorage` on change and restored on page load.

### Changed
- **Header button consistency**: mini player transport buttons (Beats/Metro toggle and
  Start/Stop) now match the same 36 px keycap-3D visual system as the L and ◑ icon
  buttons — unified height, border, and three-layer shadow. Previously they were 24–28 px
  with a shallower shadow, creating a visually inconsistent header.
- **Mini player moved out of `<nav>`**: the desktop transport is now a sibling element
  between the tab bar and the hamburger, rather than being embedded inside
  `<nav role="tablist">` (semantic fix).
- **Mobile mode button icon-only**: the "Beats" / "Metro" text label on mobile is replaced
  with a single-character "B" / "M" square matching the L/R handedness button convention,
  fixing the text truncation on narrow screens. The play button likewise shows icon-only
  (`▶` / `▐▐`) on mobile.

### Fixed
- CSS variable `--primary-fg` (undefined) corrected to `--primary-foreground` in the
  Metro mode active state; previously the button text colour was unresolved.

### Added
- **Global mini practice player**: a persistent transport control is now visible across all tabs — no need to navigate back to Practice to stop playback. On desktop it sits at the right end of the tab bar; on mobile it lives in the sticky header alongside the L (lefty) and ◑ (theme) buttons.
- **Start / Stop All button**: the mini player's single button starts the practice sequencer when idle, and stops everything simultaneously (sequencer + drum/metro + chord progression playback) when active. Shows red while playing as a clear signal.
- **Metro / Beats toggle**: switches the drum backing between the full kick/snare/hi-hat pattern ("Beats") and a simple metronome click ("Metro") — toggle takes effect on the next scheduled beat without restarting.

### Fixed
- **Mode row card layout — extra right padding**: the "Generate" hint badge was a flex item inside the card row, taking invisible space on the right even when hidden (opacity: 0). It is now absolutely positioned, so card content fills the full width correctly.
- **Mode row buttons — mismatched shadow depth**: "In the Wild" toggle had a flat 1px shadow while "Load chords" had full keycap depth. Both buttons now share the same 3px keycap shadow with inset highlight and press animation.
- **Mobile audio (iOS Safari, Chrome for Android)**: All audio — chord playback, scale notes, drum beat, progressions — was completely silent on mobile. The Web Audio API `AudioContext` starts in a `suspended` state on mobile and `resume()` is asynchronous; the previous code called `resume()` without awaiting it, so notes were scheduled against `currentTime = 0` while the context was still suspended, placing them in the past by the time audio actually started. All four play functions (`playChord`, `playScaleNote`, `playProgression`, `startDrumBeat`) now use an `ensureCtx()` helper that waits for the context to reach `running` state before scheduling any audio.

### Changed
- **Modes page — 2-column grid on desktop**: mode list now uses a 2-column grid on desktop (≥900px) and 3-column on wide screens (≥1300px), fitting more content in the first fold without scrolling; mobile stays single-column
- **Modes page — unified button row**: "In the Wild" and "Load chords" buttons now share a flex row with consistent 28px height and matching border/shadow aesthetic, replacing the mismatched stacked layout
- **Modes page — accordion position**: "In the Wild" accordion now expands below both buttons (not between formula and buttons), so clicking it no longer causes a disorienting layout jump
- **Modes page — "In the Wild" toggle icon**: changed from ▶/▼ (play-triangle) to ♪ + / ♪ − for clarity and music-theme consistency

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
