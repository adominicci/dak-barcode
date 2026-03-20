# UI Tokens And Patterns

This document extracts the practical design system implied by the provided sample screens:

- `module-selector-two-column.html`
- `category-selection-strict-v4.html`
- `staging-strict-v4.html`

## Typography

### Primary font

- Use `Inter` or the repo's closest equivalent sans font for almost all operational UI.
- Favor one consistent sans family across headings, body, labels, buttons, tables, and chips.
- Avoid serif display type in the main app shell unless a page has a specific branding need.

### Type behavior

- Page titles: bold, compact, operational, usually around `text-xl` to `text-2xl`.
- Section labels: uppercase, tight, small, gray-blue, often with wider tracking.
- Card headings: bold and direct, usually `text-2xl` or larger.
- Supporting copy: smaller, muted, but still readable on shared iPads.
- Table headers: uppercase, spaced out, subtle gray.

## Color system

These values repeat across the provided HTML files and should guide the app token system:

- Primary blue: `#0058bc`
- Bright primary gradient end: `#0070eb`
- Base background: `#faf9fe`
- Surface low: `#f4f3f8`
- Surface container: `#eeedf3`
- Surface highest: `#e3e2e7`
- White card surface: `#ffffff`
- Main text: `#1a1b1f`
- Muted text: `#414755` to `#717786`
- Success green seen in category cards: near `emerald-500`

### Color usage rules

- White is the primary card color.
- Light lavender-gray containers group tools, forms, and data zones.
- Blue should be reserved for primary actions, active states, and key links.
- Green should be functional and status-driven, not decorative.

## Radius

The raw screens mostly use a softer app language than the current auth page:

- Small controls: `8px` to `12px`
- Medium surfaces: `12px` to `16px`
- Large cards and modules: `24px` to `32px`
- Circular avatars and icon containers: full radius

Recommended app token direction:

- `--radius-control`: `8px`
- `--radius-card`: `24px`
- `--radius-panel`: `32px`

## Shadows And Depth

- Use very soft shadows with broad blur.
- Avoid hard outlines where possible.
- Pair white cards with subtle blue-gray shadowing.
- Keep the app bright and airy rather than glassy or overly dramatic.

## Spacing

- Generous horizontal padding is common throughout all samples.
- Major sections breathe with large gaps between rows and cards.
- Touch targets should feel oversized rather than merely adequate.
- Repeated layout rhythm:
  - top app bar
  - content container
  - grouped cards/modules
  - bottom action/navigation zone when needed

## Core component patterns

### Top app bar

- White or white-translucent bar
- left-aligned back action + page title
- right-aligned utility icons, date, and user avatar

### Primary action button

- saturated blue fill or blue gradient
- white text
- bold uppercase or semibold operational label
- strong but soft shadow

### Module cards

- white background
- large radius
- icon tile at left
- title + short description
- light hover elevation

### Form controls

- thick, soft, filled inputs
- muted background instead of strong border
- large height for touch
- focus state driven by blue emphasis

### Data panels and tables

- grouped inside a large tinted container
- rows displayed as nested white cards or softer blocks
- table labels are uppercase and muted
- status pills use tinted fills

### Category blocks

- large, full-width action surfaces
- centered type
- strong green status fill for completed categories

## Practical implementation note

When app visuals conflict with the current auth styling experiments, prefer this document for the main authenticated product UI. Treat these sample screens as the stronger reference for the operational app shell.
