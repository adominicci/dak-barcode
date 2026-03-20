# UI Reference Package

This folder preserves the sample UI direction provided for the Stage & Load rebuild and turns it into repo-local guidance we can reuse while building SvelteKit screens.

## Purpose

Use this package when designing or implementing any operator-facing screen. The goal is not to copy the samples pixel-for-pixel, but to stay close to their layout language, visual hierarchy, and interaction patterns unless the product direction changes.

## What's here

- `screens/` contains the raw HTML references copied from the provided sample files.
- `tokens.md` extracts reusable styling guidance from those samples.
- `screen-map.md` explains which sample best matches each future app surface.

## How to use it

1. Start with `tokens.md` for colors, typography, radius, spacing, shadows, and component patterns.
2. Check `screen-map.md` to pick the closest sample for the screen you are building.
3. Open the matching raw HTML file in `screens/` when you need exact structure, wording style, or density cues.
4. Cross-check against `docs/design.md` when there is tension between the older “Industrial Precisionist” direction and these newer samples.

## Current intent

These references currently point the app toward a cleaner Inter-based operational UI with:

- bright white cards over cool light surfaces
- saturated blue primary actions
- softer gray metadata
- large operational headings
- generous touch spacing
- fewer decorative effects than the auth shell experiments

If the visual system evolves, update this package alongside `docs/design.md` instead of letting the references drift.
