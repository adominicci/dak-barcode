## Why

The Loading entry loader picker on Select Category shows inactive/old loader names while the Dropsheets loader picker correctly shows only active loaders. Operators need both picker surfaces to match so the Loading workflow cannot start with a stale loader option.

## What Changes

- Filter the Select Category Loading loader picker to the same active-loader set used by Dropsheets.
- Centralize active loader option derivation so Dropsheets and Select Category do not drift again.
- Preserve the existing loader-session handoff behavior after an active loader is selected.
- Add focused tests proving inactive loaders are excluded from the Loading loader modal and the empty state still reports no active loaders when all returned loaders are inactive.

## Capabilities

### New Capabilities
- `active-loading-loader-selection`: Ensures Loading workflow loader selection presents only active loader records and stays aligned with the Dropsheets loader picker.

### Modified Capabilities

## Impact

- Affected code:
  - `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`
  - `src/routes/(app)/dropsheets/+page.svelte`
  - shared loader option helper/component code as needed
  - related Select Category and Dropsheets unit specs
- No backend API contract change is expected; the frontend already receives `isActive` from the loader lookup.
- No dependency changes are expected.
