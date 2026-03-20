# Screen Map

This document maps the provided reference screens to likely app surfaces in this repo.

## Home / Module Selector

Reference:
- `screens/module-selector-two-column.html`

Use this for:
- Home page
- module entry points
- loader utility entry cards
- any two-column launch surface

Key patterns:
- centered content canvas
- large white action cards
- left icon tile + title/description
- subtle hover elevation
- one “special” dashed or tinted utility card

## Loading Category Selection

Reference:
- `screens/category-selection-strict-v4.html`

Use this for:
- category selection during loading
- delivery summary header areas
- total-weight stat blocks
- bottom action bar layouts

Key patterns:
- progress strip at top
- delivery identity panel + stat card
- large full-width category actions
- persistent bottom action area

## Staging Work Surface

Reference:
- `screens/staging-strict-v4.html`

Use this for:
- staging workflow page
- scan input + department/location controls
- data tables and row cards
- top nav states that expose operational tabs

Key patterns:
- tool row with scan input and selectors
- large tinted workspace panel
- muted uppercase data headers
- row-based white cards inside a grouped container

## How to choose

If a new screen combines patterns:

- start with the screen that matches the main workflow goal
- borrow local components from the others only where needed
- keep the overall page silhouette consistent with a single primary reference
