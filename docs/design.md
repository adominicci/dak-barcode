# Design System Document

## 1. Current Direction

The authenticated operator app now follows a compact **iPad Operational** design system. The product still uses the existing workflow references for content and behavior, but the visual standard is the newer scanner-first iPad direction: fixed-height chrome, tighter radii, reduced padding, full-width work areas, and dense card grids that suit repeated barcode work.

Precedence for UI decisions:

1. Existing workflow references and implemented product rules decide what each screen shows.
2. The iPad Operational system decides layout density, component anatomy, touch sizing, scan inputs, centered modals, counters, and card radius.
3. Auth/account surfaces may keep their existing lower-density styling until intentionally redesigned.

The operational aesthetic is utilitarian and bright: white cards on a neutral gray page, blue action surfaces, functional status color, visible text labels on statuses, and minimal decoration.

---

## 2. Colors & Tokens

Operational tokens live in `src/app.css` with the `--ds-*` prefix.

- `--ds-blue-600`: `#1565C0`
- `--ds-blue-500`: `#1976D2`
- `--ds-blue-400`: `#2196F3`
- `--ds-blue-50`: `#E3F2FD`
- `--ds-teal-500`: `#3BBB8A`
- `--ds-green-500`: `#2E7D32`
- `--ds-red-500`: `#D32F2F`
- `--ds-amber-500`: `#F9A825`
- `--ds-gray-900`: `#1A1A1A`
- `--ds-gray-600`: `#6B6B6B`
- `--ds-gray-300`: `#D4D4D4`
- `--ds-gray-100`: `#F5F5F5`

Use blue for primary workflow actions, scan focus, counters, and active state. Use teal for `NA`/`DONE`, amber for due/pending states, green for weight/success accents, and red only for destructive/error states.

---

## 3. Type, Spacing, Radius

- Keep `Inter` as the app font for now.
- Page titles: compact, bold, operational.
- Labels: `11-12px`, uppercase, tracked, gray.
- Barcode/ID text: monospace, `17px`, semibold.
- Page gutters: `24px` on iPad.
- Top bar: fixed `56px`.
- Standard controls: minimum `48px` high.
- Navigation arrows: `64px` square.
- Controls/cards: `10-12px` radius.
- Centered modals: `16px` radius.

Avoid the previous operational habit of `rounded-[2rem]`, `p-8`, centered narrow columns, and nested cards inside cards.

---

## 4. Component Patterns

### App Chrome

Top bars are white, `56px` tall, full-width, and separated by a subtle gray bottom border. Use 48px back/account/refresh controls and keep route content full-width below the header.

### Action Cards

Home and general selection cards use a 2-column grid where available, blue fill, white text, 12px radius, left icon tile, title/detail text, and a trailing icon. Loading category department handoff cards use a 3-column grid on iPad so Wrap, Roll, and Parts stay in one row. Cards are `80px` minimum height with `scale(0.97)` active feedback.

### Scan Inputs

Workflow scan fields stay visible near the top of the page. They are full-width, blue-tinted, bordered with `--ds-blue-400`, include a scan icon, clear/refocus after attempts, and keep scanner-friendly autocomplete/spellcheck disabled.

### Department Status Pills

Render six labeled pills: Slit, Trim, Wrap, Roll, Parts, Soffit. Labels are always visible above pill values. Status values must include text (`NA`, `DONE`, `DUE`, etc.); never rely on color alone.

### Loading Drop Counter

Use 64px previous/next arrow buttons flanking three counter cards: Labels, Scanned, Need Pick. Counters use blue-600/500/400 fills and centered white numbers.

### Scanned Item Cards

Use a 3-column grid. Each card shows only the barcode or ID in monospace; no extra metadata.

### Centered Modals

Touch modals use centered dialogs with a dimmed backdrop, compact 16px radius, and max height constrained to the viewport. Do not use bottom-aligned sheets or drag handles for operational selection flows.

---

## 5. Do's and Don'ts

Do:

- keep workflow content full-width with 24px gutters
- prefer shared DS primitives over one-off Tailwind card styling
- keep scan inputs and primary navigation easy to hit on iPad
- use visible status labels and text values

Don't:

- center a narrow operational card grid in empty space
- use 24-32px radii for routine workflow cards
- hide critical controls behind hover-only states
- add metadata to scanned-item cards
- reintroduce decorative blur/orb backgrounds in scanner workflows
