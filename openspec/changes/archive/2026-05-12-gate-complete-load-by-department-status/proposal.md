## Why

Select Category can currently show `Complete Load` when the dropsheet is 100% by percent, even while a department still displays `DUE`. Operators must not be able to complete a load unless the backend confirms all loading work is complete and every department status is closed out as `NA` or `DONE`.

## What Changes

- Replace the current `Complete Load` visibility gate with a stricter readiness rule:
  - `categoryAvailability.allLoaded === true`
  - every department status value is `NA` or `DONE`
- Hide `Complete Load` whenever any department is `DUE`.
- Hide `Complete Load` for any other non-closed status, including `WAIT`, `STOP`, `READY`, `BOT`, `BOL`, blank/null, or unavailable status data.
- Keep the existing Complete Load confirmation and notification/export flow unchanged once the action is legitimately visible.
- Add focused Select Category regressions for allowed `NA`/`DONE` statuses and blocked `DUE` or unknown statuses.

## Capabilities

### New Capabilities
- `complete-load-readiness`: Defines when the Select Category `Complete Load` action may be displayed.

### Modified Capabilities

## Impact

- Affected code:
  - `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`
  - `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
  - docs/memory artifacts if the behavior is implemented
- No backend API contract change is expected; the frontend already receives `allLoaded` and department status data.
- No dependency changes are expected.
