# UI Reference Package

This folder preserves the sample UI direction provided for the Stage & Load rebuild and turns it into repo-local guidance we can reuse while building SvelteKit screens.

## Purpose

Use this package when designing or implementing any operator-facing screen. The raw samples decide workflow placement inspiration and content references; `tokens.md` and `docs/design.md` decide the current compact iPad operational styling.

## What's here

- `screens/` contains the raw HTML references copied from the provided sample files.
- `tokens.md` extracts reusable styling guidance from those samples.
- `screen-map.md` explains which sample best matches each future app surface.

## How to use it

1. Start with `tokens.md` for colors, typography, radius, spacing, shadows, and component patterns.
2. Check `screen-map.md` to pick the closest sample for the screen you are building.
3. Open the matching raw HTML file in `screens/` when you need exact structure, wording style, or density cues.
4. Cross-check against `docs/design.md` when there is tension between an older large-radius sample and the newer scanner-first system.

## Current intent

These references currently point the app toward a compact Inter-based operational UI with:

- full-width iPad work areas with 24px gutters
- white top bars fixed at 56px
- saturated blue action cards with 12px radius
- always-visible scan inputs
- centered modal selection flows
- 64px navigation arrows and barcode-only scanned cards

If the visual system evolves, update this package alongside `docs/design.md` instead of letting the references drift.
