## 1. Implementation Preflight

- [x] 1.1 Re-read `AGENTS.md`, `docs/project-state.yaml`, `docs/current-context.md`, and `docs/decisions.md` before touching code.
- [x] 1.2 Re-check the active frontend route files: `src/routes/(app)/loading/+page.svelte`, `src/routes/(app)/loading/loading-page.svelte.spec.ts`, `src/lib/load-view.remote.ts`, and `src/lib/server/dst-queries.ts`.
- [x] 1.3 Re-check the legacy sources used for parity: `docs/access_fe/forms/frmScanPick.txt`, `docs/access_fe/forms/frmSelectCategoryPIck.txt`, `legacy_flutterflow_fe/lib/pages/loading/loading_widget.dart`, and `legacy_flutterflow_fe/lib/backend/api_requests/api_calls.dart`.
- [x] 1.4 Confirm whether this implementation session is allowed to modify `/Users/andresdominicci/Projects/CustomerPortalAPI-PY`; if not, keep backend work as a separate handoff item.
- [x] 1.5 If touching Svelte code, use the required Svelte-related guidance and current docs before implementation.

## 2. Frontend Regression Coverage

- [x] 2.1 Add a failing Loading page regression where `LoadViewDetail` returns `labelCount: 0`, `scannedCount: 0`, `needPickCount: 0`, and `getLoadViewUnion` returns one unscanned label for the selected route `locationId`; assert the label renders and the empty-drop message does not.
- [x] 2.2 Extend the regression with a mismatched-location union row; assert only the selected route-location row renders.
- [x] 2.3 Preserve the existing empty-state coverage where counters are zero and the union list is empty; assert the empty-drop message still renders.
- [x] 2.4 Assert the `DropCounterBar` still receives the zero `LoadViewDetail` counter values when union labels render.
- [x] 2.5 Run the focused frontend test and confirm it fails for the expected empty-state reason before changing implementation.

## 3. Frontend Implementation

- [x] 3.1 Update Loading derived state so `isEmptyDrop` requires both zero detail counters and no visible selected-location union rows.
- [x] 3.2 Ensure the render branch prioritizes non-empty `unscannedDropLabels` over the empty-drop message.
- [x] 3.3 Keep `isFullyScannedDrop` behavior intact for drops with attached labels and no remaining unscanned selected-location rows.
- [x] 3.4 Keep all label lookup, visible filtering, scan payload, retry payload, fallback refresh, and timing metadata paths using `activeLoadingLocationId`.
- [x] 3.5 Avoid counter recalculation; keep `DropCounterBar` values sourced from `selectedDropDetail.labelCount`, `selectedDropDetail.scannedCount`, and `selectedDropDetail.needPickCount`.

## 4. Backend Regression Coverage

- [x] 4.1 In CustomerPortalAPI-PY, add a failing `process-loading-scan-v2` regression where the request `LocationID` is `1`, the selected refreshed detail row has `LocationID = 2`, and the returned union query/key must still use `1`.
- [x] 4.2 Add or adjust a regression for out-of-range `SelectedDropIndex` so the refresh uses the clamped detail row `DSSequence` and `LoadNumber` while still using the request `LocationID`.
- [x] 4.3 Preserve the numeric driver-location scan test that returns no refresh payload.
- [x] 4.4 Run the focused backend test and confirm the new mismatch regression fails before changing implementation.

## 5. Backend Implementation

- [x] 5.1 In CustomerPortalAPI-PY `_fetch_loading_refresh_payload`, derive `union_location_id` from `data.LocationID`, not `selected_drop.LocationID`.
- [x] 5.2 Continue deriving `union_load_number` and `union_sequence` from the clamped selected detail row when available, falling back to request values only when the row omits them.
- [x] 5.3 Ensure `load_view_union_key.location_id` matches the request `LocationID`.
- [x] 5.4 Do not change dakview-web unless new evidence shows the active SvelteKit loading mutation path has moved from CustomerPortalAPI-PY to dakview-web.

## 6. Verification

- [x] 6.1 Run `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'` in `dak-barcode`.
- [x] 6.2 Run `bun run check` in `dak-barcode`.
- [x] 6.3 Run `bun run test:unit -- --run` in `dak-barcode` if focused tests and check pass.
- [x] 6.4 Run the focused `tests/barcode_module/test_process_loading_scan_v2.py` suite in CustomerPortalAPI-PY using that repo's existing test command.
- [x] 6.5 Run `openspec validate --all --strict` in `dak-barcode`.
- [x] 6.6 If backend edits are made, capture the exact backend verification command/output in the final implementation summary.

## 7. Documentation and Memory

- [x] 7.1 Run Memory Impact Analysis after implementation because Loading workflow behavior and backend refresh contract change.
- [x] 7.2 Update `docs/current-context.md` with the implemented behavior and verification.
- [x] 7.3 Update `docs/project-state.yaml` if the behavior becomes durable project truth.
- [x] 7.4 Append `docs/decisions.md` if the implementation records a durable decision about union labels taking precedence over zero detail counters for visibility.
- [x] 7.5 Archive the OpenSpec change after implementation and sync the delta into `openspec/specs/loading-location-label-scope/spec.md`.
