# UI Tokens And Patterns

This document extracts the operational system used by the iPad-first scanning app. The raw screen references remain useful for workflow content and placement inspiration, but these tokens control density and component anatomy for operator-facing screens.

## Precedence

- Current product screens decide what data/actions appear.
- This token guide decides spacing, radius, touch sizing, scan-field treatment, counters, centered modals, and card density.
- Auth/account pages are lower-priority and may keep older styling until explicitly redesigned.

## Typography

- Primary font: `Inter`.
- Page title: compact, bold, operational.
- Section/card header: `18-20px`, semibold.
- Body/table text: `16px`.
- Barcode/ID text: monospace, `17px`, semibold.
- Labels: `11-12px`, uppercase, `0.06-0.08em` tracking.

## Color System

Operational tokens in `src/app.css`:

- `--ds-blue-600`: `#1565C0`
- `--ds-blue-500`: `#1976D2`
- `--ds-blue-400`: `#2196F3`
- `--ds-blue-50`: `#E3F2FD`
- `--ds-teal-500`: `#3BBB8A`
- `--ds-green-500`: `#2E7D32`
- `--ds-green-400`: `#43A047`
- `--ds-red-500`: `#D32F2F`
- `--ds-amber-500`: `#F9A825`
- `--ds-gray-900`: `#1A1A1A`
- `--ds-gray-600`: `#6B6B6B`
- `--ds-gray-300`: `#D4D4D4`
- `--ds-gray-100`: `#F5F5F5`
- `--ds-white`: `#FFFFFF`

## Spacing And Radius

- Use an 8px rhythm.
- iPad page padding: `24px`.
- Top bar height: `56px`.
- Element/card gaps: `12-20px`.
- Controls: `10px` radius, `48px` minimum height.
- Cards: `12px` radius.
- Centered modals: `16px` radius with viewport-constrained height.
- Navigation arrows: `64px` square.

## Core Components

### Top Bar

White background, subtle bottom border, fixed `56px` height. Left area contains back affordance and page title. Right area contains status/target, account avatar, refresh/sign-out actions.

### Action Cards

Blue filled cards with white text, icon tile, title, detail, and trailing chevron/add icon. Use a 2-column grid on Home and selection surfaces.

### Scan Field

Full-width, always visible on workflow pages. Use blue-tinted background, blue border, left scan icon, and scanner-safe input attributes.

### Status Pills

Six-up department status row with labels above values. `NA` and `DONE` are teal; due/pending states are amber; unknown is gray.

### Drop Counter

Previous arrow, three counter cards, next arrow. Counter labels are uppercase and numbers are large, centered, white.

### Scanned Item Grid

Three columns, 12px gap, white cards with gray border. Show only the barcode/ID.

### Centered Modals

Selection modals use centered dialogs, not bottom sheets. Use a dimmed backdrop, compact radius, no drag handle, and a max height that fits inside the iPad viewport.

## Anti-Patterns

- `rounded-[2rem]` and `p-8` on routine operational cards.
- Centered narrow app surfaces on iPad.
- Long desktop tables with many tiny columns.
- Status colors without text labels.
- Extra metadata in scanned item cards.
