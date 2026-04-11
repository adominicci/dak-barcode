# Loading Last-Drop Navigation Design

**Date:** 2026-04-10

## Summary

Change the loading workflow so operators begin on the last available drop instead of the first. The loading footer should reflect the backward-loading pattern the floor requested: if a load has `13` drops, the page opens at `Drop 13 of 13`, the `Next` action moves to `Drop 12`, and the `Previous` action moves back toward higher drop numbers.

## Problem

The current SvelteKit loading page initializes `selectedDropIndex` to `0`, which means loading always opens on the first drop. Operators in the field are working the truck in reverse order and want the app to match that pattern so they can start at the tail end of the load without repeated taps.

Legacy review confirmed the old FlutterFlow app did **not** start at the last drop; it opened on drop `1` and used directional navigation from there. This request is therefore an intentional behavior change rather than a strict legacy parity fix.

## Chosen Behavior

### Initial drop selection

- If drop details are available, the loading page opens on the last drop in the fetched sequence.
- If there are no drops, the page keeps the current empty-state behavior.

### Navigation semantics

- `Next` moves to the numerically previous drop.
- `Previous` moves to the numerically next drop.
- Example with `13` drops:
  - initial view: `Drop 13 of 13`
  - `Next` -> `Drop 12 of 13`
  - `Next` -> `Drop 11 of 13`
  - `Previous` from `Drop 11` -> `Drop 12`

### Bounds

- Navigation remains clamped.
- At the last drop, `Previous` is disabled because there is no higher-numbered drop.
- At the first drop, `Next` is disabled because there is no lower-numbered drop.
- There is no wraparound jump from `1` back to the last drop.

## Scope

### In scope

- Shared loading drop-navigation helper behavior
- Loading page initial drop selection
- Loading footer button semantics and enabled states
- Unit and route-level regression tests

### Out of scope

- Staging behavior
- Loader-session lifecycle behavior
- Any redesign of the loading layout
- Any new shortcut or wraparound navigation affordance

## Implementation Approach

Use the existing shared navigation helper in `src/lib/workflow/loading-drop-navigation.ts` as the single source of truth for initial index selection and button availability. The loading page should keep the current visual footer layout, but the button click handlers should map to the reversed drop-order workflow.

This keeps the change DRY:

- helper owns index math and bounds
- route owns UI wiring and footer interactions
- tests cover both pure navigation logic and the user-visible page behavior

## Testing Strategy

Follow TDD:

1. Add a route-level failing test proving the page opens on the last drop and counts down with `Next`.
2. Add helper-level failing tests proving the default selected index is the final record and that reverse movement clamps correctly.
3. Implement the smallest helper and route changes to satisfy the tests.
4. Re-run the focused loading specs.

## Risks And Guardrails

- The button labels and arrows already imply direction, so reversing the drop progression must be done carefully to avoid inverted disabled states.
- Loading data refreshes are keyed off `selectedDropDetail`, so the new initial index must still hydrate the correct detail and union queries on first render.
- This is a workflow-wide loading change, so tests should verify the visible `Drop X of Y` label, not only internal helper state.
