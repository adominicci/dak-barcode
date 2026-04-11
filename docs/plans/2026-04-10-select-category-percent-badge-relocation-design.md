# Select-Category Percent Badge Relocation Design

**Date:** 2026-04-10

## Summary

Move the existing blue percentage badge on each select-category department card from the lower metadata row to the department heading row. The badge should sit next to the department name, remain visually consistent with the current badge style, and scale up so loaders can immediately see completion at a glance.

## Problem

The current select-category department cards place the percentage badge beneath the progress bar, alongside the loader chip. That location makes the value easy to miss, especially when loaders are looking for a fully completed department such as `100%`.

The user request is to keep the same badge treatment but relocate it beside the department title, roughly around the department title’s reading size.

## Chosen Behavior

### Badge placement

- Keep the existing percent badge.
- Move it into the top title row of each department card.
- Place it directly beside the department name.

### Badge sizing

- Increase the badge prominence so it reads closer to the department heading scale than the small metadata-chip scale.
- Keep it smaller than the main department label so the department name remains the primary anchor.

### Lower metadata row

- Remove the percentage badge from the lower metadata row.
- Keep the loader chip in that row so the lower area remains simple and readable.

## Scope

### In scope

- Select-category department card layout
- Percentage badge placement and sizing
- Regression tests for the new layout expectations

### Out of scope

- Loading page layout
- Dropsheet list percent display
- Changing the percent format itself
- Introducing a new badge component or color system

## Implementation Approach

Reuse the existing blue badge styling family already used in the select-category page. The card header will become a three-part composition:

- department title on the left
- percentage badge next to the title
- status pill aligned to the far right

The card body will keep the progress bar and loader chip, preserving the current information hierarchy while making the completion number much easier to scan.

## Testing Strategy

Follow TDD:

1. Update the select-category page spec to prove the percent badge renders in the header area next to the department name.
2. Add assertions that the lower chip row now only contains the loader label.
3. Implement the smallest Svelte markup/class changes to satisfy the new expectations.
4. Run the focused select-category page spec and Svelte autofixer.

## Risks And Guardrails

- The header row already contains a status pill, so spacing must preserve readability at iPad widths.
- The badge should stay visually related to the current blue chip family rather than introducing a second badge style.
- The lower row should not collapse awkwardly after removing the percent chip; spacing must still feel intentional.
