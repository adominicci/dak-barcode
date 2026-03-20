# Design System Document

## 1. Overview & Creative North Star: "The Industrial Precisionist"

In the demanding environment of a logistics hub, clarity is safety. This design system departs from the cluttered, high-contrast "utility" apps of the past to embrace a North Star we call **"The Industrial Precisionist."** It utilizes the Apple-inspired aesthetic, refined depth, and premium spacing to fit the iPad landscape.

The goal is to move beyond the flat, boxed-in look seen in the reference material. Instead of a rigid grid of heavy blue headers and harsh white tables, we use **intentional asymmetry** and **tonal layering**. Elements are not just placed; they are curated on a stage. By using soft, overlapping surfaces and generous breathing room, we reduce cognitive load for warehouse operators and make high-stakes data feel manageable.

---

## 2. Colors

The color palette is anchored in a sophisticated range of cool grays and deep blues, designed to feel authoritative yet calm.

### The "No-Line" Rule

**Explicit Instruction:** Do not use 1px solid borders to section off content. In an industrial context, borders create visual noise. Boundaries should be defined through background color shifts and depth.

### Surface Hierarchy & Nesting

Treat the iPad screen as a physical stack of materials.

- **Base Layer:** `surface` (`#faf9fe`) for the foundation.
- **Sectional Layer:** `surface-container-low` (`#f4f3f8`) for large groupings or sidebars.
- **Interactive/Card Layer:** `surface-container-lowest` (`#ffffff`) for the most important data cards.

### The "Glass & Gradient" Rule

Use **Glassmorphism** for floating modals or persistent navigation bars. Apply a semi-transparent surface with a `backdrop-blur` of 20px. For primary CTAs, replace flat blue with a subtle linear gradient transitioning from `primary` (`#0058bc`) to `primary-container` (`#0070eb`) at 135 degrees.

---

## 3. Typography

The system uses **Inter** as a high-performance alternative to SF Pro for cross-platform rendering while keeping the overall feel precise and modern.

- **Display & Headline Scales:** Use large display styles for key operational metrics or primary screens.
- **Title Scales:** Use dark-on-light section headers instead of full-width saturated bars.
- **Body & Labels:** Use softer gray text for metadata and supporting copy to keep hierarchy clear without harsh contrast.

---

## 4. Elevation & Depth

We achieve hierarchy through **tonal layering** rather than structural lines.

- **Layering Principle:** Place bright cards on slightly darker sections for a soft lift.
- **Ambient Shadows:** Use diffused shadows with broad blur and low opacity for floating elements.
- **Ghost Border Fallback:** If a container must be defined, use a very soft outline rather than a hard line.
- **Glassmorphism:** Use it for the top navigation bar so content can move underneath without losing place.

---

## 5. Components

### Buttons

- **Primary:** Gradient-filled, extra-large radius, white text.
- **Secondary:** Soft surface background with primary-colored text and no border.
- **Tertiary:** Transparent background with primary-colored text for low-emphasis actions.

### Input Fields

Avoid thin-lined boxes. Prefer elevated or tonal backgrounds with focus states driven by color shift and a bottom emphasis rather than a full rectangular border.

### Cards & Lists

Do not use divider lines between warehouse records. Use spacing, alternating subtle tints, and pill-style status chips for separation and emphasis.

### Industrial "Action Bar"

A persistent glassmorphic bar at the bottom of the iPad landscape view can house high-priority actions such as scan entry or flow completion.

---

## 6. Do's and Don'ts

### Do

- Use white space as a structural element.
- Use subtle tinting for active states and contextual emphasis.
- Optimize for touch with targets at least 44x44pt.

### Don't

- Do not use high-contrast borders as layout scaffolding.
- Do not recreate the legacy full-width heavy blue header bars.
- Do not use pure black text; keep type slightly softened for a more premium editorial feel.
