# Screen Map

This document maps the raw UI references to app surfaces. Use the references for what belongs on a screen and general placement. Use `tokens.md` and `docs/design.md` for the newer compact iPad operational styling.

## Home / Module Selector

Reference:
- `screens/module-selector-two-column.html`

Use this for:
- Home
- module entry points
- loader utility entry cards

Operational adjustments:
- Fill the viewport with 24px gutters; do not center a narrow card island.
- Use compact blue action cards with 12px radius and 80px minimum height.
- Keep content/action labels aligned with current product behavior.

## Loading Category Selection

Reference:
- `screens/category-selection-strict-v4.html`

Use this for:
- category selection during loading
- delivery summary header areas
- total-weight stat blocks
- bottom action layouts

Operational adjustments:
- Keep summary information compact.
- Use the shared department status pill pattern when status appears.
- Keep Wrap, Roll, and Parts department handoff cards in a 3-column grid on iPad.
- Preserve workflow data and actions from the current implementation.

## Staging Work Surface

Reference:
- `screens/staging-strict-v4.html`

Use this for:
- staging workflow page
- scan input + department/location controls
- staging list panels

Operational adjustments:
- Pin the scan field near the top of the workflow.
- Use compact controls and list cards.
- Avoid oversized rounded panels and excessive padding.

## Loading Work Surface

Reference:
- downloaded iPad redesign plus current loading implementation.

Use this for:
- loading scan screen
- scanned item grid
- drop counter bar
- department status strip

Operational adjustments:
- Scanned item cards show barcode/ID only.
- Drop counters use 64px arrows plus three blue counter cards.
- Selection/location prompts use centered modals.

## Selection Modals

Use centered modals for:
- department selection
- loader selection
- location selection
- will-call scan/support selections when touched by operational workflows

Keep current option sets and behavior, but use viewport-constrained centered dialogs with 48px controls and compact cards.

For staging location selection, maximize usable height inside the centered dialog because location lists can be large. Keep the loading driver-location prompt compact and scan-only because it does not show a browseable list.
