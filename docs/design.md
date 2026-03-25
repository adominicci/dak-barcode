# Design System Document

## 1. Overview & Current Direction

The implemented app is still aligned with the **"Industrial Precisionist"** direction, but the live UI is more grounded and operational than the earlier write-up implied. The current product leans on bright surfaces, large radii, soft gradients, glass headers, and roomy spacing for shared iPad use.

The strongest visual patterns in the shipped screens are:

- a light `#faf9fe` page canvas with subtle blue atmospheric blur
- glass or translucent headers for app chrome
- large white cards sitting inside tinted grouping panels
- uppercase utility labels paired with bold operational headings
- restrained status color used for progress, chips, and completion states

Intentional asymmetry still matters, especially on Home, Account, and Target selection, but the overall app shell is currently more consistent and structured than editorial.

---

## 2. Colors & Live Tokens

The current implementation is driven by the token set in `src/app.css`.

### Core surfaces

- `--surface-page`: `#faf9fe`
- `--surface-low`: `#f4f3f8`
- `--surface-container`: `#eeedf3`
- `--surface-container-high`: `#e9e7ed`
- `--surface-high`: `#e3e2e7`
- `--surface-card`: `#ffffff`

### Core brand and text

- `--primary`: `#0058bc`
- gradient accent end: `#0070eb`
- `--text-strong`: `#1a1b1f`
- `--text-muted`: `#414755`
- `--text-subtle`: `#717786`

### Border guidance: use the soft-line rule

The app does **not** use hard borders as its primary layout system, but the live implementation does allow subtle hairlines when they improve clarity.

Use soft borders or rings for:

- glass headers with a faint bottom edge
- compact progress strips
- auth and recovery inputs that need explicit affordance
- dashed utility treatments such as the Home page utility card

Do not fall back to visible borders for every card, table, or panel. Tonal separation should still do most of the work.

### Glass & gradient

These patterns are live and should remain consistent:

- glass headers use a white translucent surface with `backdrop-blur: 20px`
- primary actions use a `135deg` blue gradient from `#0058bc` to `#0070eb`
- blue glow should stay soft and diffused rather than neon

---

## 3. Typography

The current font system is split into a practical operational stack and a restrained editorial accent:

- `Inter` is the default sans for app UI, labels, tables, buttons, and operational headings
- `Newsreader Variable` is the serif accent used selectively for auth and account hero headings
- `font-display` currently resolves to `Inter`, not serif

### Type behavior in the shipped UI

- page and module headings are compact, bold, and sans-first
- utility labels are small, uppercase, and wide-tracked
- supporting copy uses softened gray instead of high-contrast black
- serif display should stay reserved for lower-density moments such as auth and account surfaces

Do not introduce serif styling into dense operational tables, scan tools, or list-heavy workflows.

---

## 4. Elevation, Radius & Structure

The current hierarchy comes from tonal layering first, then shadow, then occasional soft edge definition.

### Radius system in use

- auth cards and auth controls: `8px`
- standard controls: `8px`
- primary cards: `24px`
- major panels and grouped work surfaces: `32px`
- pills, avatars, and utility chips: full radius

### Depth rules

- white cards sit on top of lavender-gray grouping surfaces
- shadows are broad and low-contrast
- glass treatments are used in headers and select high-emphasis account or blocked-state surfaces
- inset emphasis is acceptable on form controls, especially in auth flows

---

## 5. Component Patterns

### Buttons

- **Primary:** blue gradient, white text, soft blue shadow
- **Secondary:** filled surface treatment, often pill-shaped, with muted or primary text
- **Utility or destructive:** tinted surface background, sometimes with a dashed or rose treatment instead of a formal outline

Rounded-full CTAs are common in the authenticated shell. Rounded-lg buttons are also used in auth and recovery forms.

### Inputs

The implementation currently uses two valid input treatments:

- operational pages: filled tonal fields with no visible border
- auth and recovery flows: softer bordered inputs with light backgrounds and blue focus emphasis

Both are acceptable when chosen intentionally for context.

### Cards & lists

- list rows should read as cards or grouped blocks, not spreadsheet rows
- spacing and chips should separate records before dividers do
- utility cards may use a dashed border when the affordance is intentionally different from the main flow

### App chrome

The current app standard is a fixed glass top header for authenticated routes. A persistent bottom action bar is **not** part of the live implementation yet and should be treated as a future workflow pattern, not a present default.

---

## 6. Do's and Don'ts

### Do

- use white space and tinted grouping panels as primary structure
- keep touch targets generous for shared iPad use
- use uppercase micro-labels to clarify context without heavy bars
- keep gradients, shadows, and glass effects soft and controlled

### Don't

- do not recreate legacy full-width saturated blue headers
- do not use hard borders as default scaffolding for every surface
- do not use pure black text
- do not overuse serif display outside hero or account-style moments
