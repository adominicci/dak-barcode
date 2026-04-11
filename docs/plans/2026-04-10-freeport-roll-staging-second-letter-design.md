# Freeport Roll Staging Second-Letter Filter Design

## Goal

Reduce scrolling in the staging location selector for the Freeport Roll workflow by adding a second filtering step after the existing first-letter tabs.

## Approved Behavior

- Scope is limited to `mode === staging`, `target === Freeport`, and `department === Roll`.
- Outside that exact combination, the location modal behaves exactly as it does today.
- The first tab row remains the existing first-letter grouping.
- When a first-letter tab is active in the Freeport Roll case, show a second tab row for the active first-letter group.
- The second tab row starts with `All`, followed by second-letter groups in alphabetical order.
- Second-letter grouping ignores dashes and uses the next alphabetic segment after the first letter.
- Example:
  - `A-R-1`, `A-R-2`, `A-D-1`, `A-M-1`
  - first-level tab: `A`
  - second-level tabs: `All`, `D`, `M`, `R`
- Entries that do not yield a usable second letter remain visible under `All` so nothing is lost.

## Why This Design

- It matches the user request exactly without broadening behavior to Canton, Parts, Wrap, or Loading.
- It preserves the current mental model and adds one focused refinement only where the list is too large.
- `All` makes the feature resilient to inconsistent Freeport naming data.

## Likely Implementation Shape

- Keep the existing first-letter grouping data as the primary organization layer.
- Derive a second-level grouping from the active first-letter group only when the Freeport Roll staging condition is true.
- Track a second selected tab state alongside the current first-letter tab state.
- Reset the second-level selection to `All` whenever the first-letter tab changes.

## Files Expected To Change

- `src/lib/components/workflow/staging-location-modal.svelte`
- `src/lib/components/workflow/staging-location-modal.svelte.spec.ts`
- `src/routes/(app)/staging/staging-page.svelte.spec.ts`

## Verification Focus

- Freeport Roll shows `All` plus second-letter tabs for the chosen first-letter group.
- Second-level filtering narrows the grid correctly.
- Canton staging and non-Roll staging keep the current single-row tab behavior.
- Existing location selection and numeric lookup flows remain unchanged.
