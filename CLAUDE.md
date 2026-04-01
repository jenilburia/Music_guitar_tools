# CLAUDE.md — Music Guitar Tools

## Changelog rule (mandatory)

**Whenever you make any code change to this project, you must update `CHANGELOG.md` before finishing.**

- Add entries to the `[Unreleased]` section at the top of the file.
- Use [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) categories: `Added`, `Changed`, `Fixed`, `Removed`.
- Write a concise, human-readable description of *what* changed and *why* it matters to a user — not the file names alone.
- Do **not** create a new version block; keep everything under `[Unreleased]` until the user explicitly cuts a release.
- If multiple files are touched in one session, group the entries logically by feature, not by file.

This rule applies to every conversation, every session, no exceptions.

## UI control styling rule (mandatory)

All interactive controls — `<select>`, `<input>`, toggles, sliders — must be styled to match
the project's 3D keycap button aesthetic. Never ship unstyled or browser-default controls.

Checklist for any new `<select>`:
- `appearance: none; -webkit-appearance: none` — suppress native chrome
- Custom chevron via `background-image` (inline SVG) — one for light mode, one for `[data-theme="dark"]`
- `background-color: var(--btn-face)` (not `var(--surface)` — that token does not exist)
- `border: 1px solid var(--btn-border)`
- `box-shadow: inset 0 1px 0 var(--btn-border-top), 0 4px 0 var(--btn-shadow), 0 5px 8px rgba(0,0,0,0.2)`
- `font-family: var(--font)`, `font-size: 12px`, `font-weight: 700`
- `height: 34px` (same as .btn)
- `border-radius: var(--radius)` (4px, same as .btn)
- `:hover` → `background-color: var(--btn-face-hover)`
- `:focus` → `outline: 2px solid var(--ring); outline-offset: 2px`
