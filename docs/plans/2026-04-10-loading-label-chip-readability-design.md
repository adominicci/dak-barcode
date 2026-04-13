# Loading Label Chip Readability Design

**Date:** 2026-04-10

## Summary

Increase the readability of loading label chips in the loading workspace by enlarging the chip text and bubble size while preserving the existing three-column label grid and footer layout.

## Problem

The current loading label chips use small text inside relatively compact bubbles, which makes long label IDs hard to read from shared-iPad distance. The request is to make the label text larger and, if needed, reclaim space by tightening padding near the top of the main loading card rather than collapsing the label grid.

## Chosen Behavior

- Keep the loading label grid at three columns on medium and larger widths.
- Increase the label chip text size and weight so label IDs are easier to scan.
- Increase chip padding slightly so the larger text still feels comfortably framed.
- If extra room is needed, reduce some padding in the main loading card and list container closer to the scan header.
- Do not change the footer stats layout.

## Scope

### In scope

- Loading route label chip typography
- Loading route label chip padding
- Small padding adjustments around the main loading workspace
- Focused loading page regression coverage

### Out of scope

- Drop navigation behavior
- Footer stat layout
- Scan input behavior
- Any change to the number of label grid columns

## Implementation Approach

Use the existing loading route card structure and only adjust spacing tokens where they directly improve label readability. The label list should remain a three-column grid, but each chip should get more visual weight through larger type and slightly roomier internal padding. If the larger chips need more breathing room, reduce surrounding container padding before changing the grid or footer.

## Testing Strategy

1. Update the loading page browser spec to assert larger label-chip typography and preserved three-column layout.
2. Run the test to confirm the current styling fails those expectations.
3. Implement the smallest Svelte class updates to satisfy the new readability target.
4. Re-run the focused loading page spec and Svelte autofixer.
