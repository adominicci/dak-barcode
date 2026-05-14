## 1. Backend Endpoint

- [x] 1.1 Add CustomerPortalAPI-PY unit tests for `loadview-barcode-counters` before implementation, covering the confirmed `27610 / 05192026-0089 / DSSequence 4 / LocationID 1` mismatch shape.
- [x] 1.2 Add a request model with `DropSheetID`, `LoadNumber`, `DSSequence`, and `LocationID`.
- [x] 1.3 Implement a read-only endpoint that verifies the active `LoadViewDetail` context and computes barcode counters from grouped `qryBarcode` rows by `LPID` and `LabelNumber`.
- [x] 1.4 Return barcode counters, legacy counters, active drop identity fields, and `CounterMismatch` without modifying existing SQL views/functions.
- [x] 1.5 Extend `process-loading-scan-v2` tests so successful scan responses include the active barcode counter payload using the request `LocationID`.
- [x] 1.6 Update `process-loading-scan-v2` to include the active barcode counter payload in successful combined refresh responses.
- [x] 1.7 Run the targeted CustomerPortalAPI-PY backend tests for the new endpoint and loading scan refresh.

## 2. Frontend Contract

- [x] 2.1 Use current Svelte/SvelteKit documentation tooling before editing Svelte code.
- [x] 2.2 Add failing mapper/query tests for the new DST barcode counter response and endpoint request body.
- [x] 2.3 Add raw and normalized TypeScript types for the barcode counter payload.
- [x] 2.4 Add a mapper that normalizes barcode counters and preserves legacy comparison fields.
- [x] 2.5 Add a remote query helper for the new endpoint using the existing DST target normalization path.
- [x] 2.6 Extend scan response normalization so combined post-scan refresh can carry a barcode counter payload.

## 3. Loading Page Behavior

- [x] 3.1 Add failing Loading page tests for the confirmed mismatch behavior: union labels render and the counter cards show `4 / 0 / 4` from a matching barcode counter payload while legacy counters are `0 / 0 / 0`.
- [x] 3.2 Add Loading page tests that stale barcode counter payloads are ignored when `DropSheetID`, `LoadNumber`, `DSSequence`, or selected `LocationID` do not match the active drop.
- [x] 3.3 Query barcode counters for the active drop using selected route `locationId`.
- [x] 3.4 Render counter cards from matching barcode counters when available; otherwise fall back to active `LoadViewDetail` counters.
- [x] 3.5 Consume barcode counter payloads from successful post-scan refresh responses.
- [x] 3.6 Ensure empty and fully-scanned messages continue to use selected-location label visibility rules and do not derive counters from `vwLoadLabelsUnion` rows in Svelte.

## 4. Docs and Verification

- [x] 4.1 Update `docs/prd.md`, `docs/architecture.md`, `docs/decisions.md`, `docs/current-context.md`, and `docs/project-state.yaml` to reflect barcode-derived Loading counters.
- [x] 4.2 Run `openspec validate --all --strict`.
- [x] 4.3 Run frontend targeted unit tests for DST query mapping, scan response mapping, and Loading page behavior.
- [x] 4.4 Run `bun run check` and the relevant frontend test script.
- [x] 4.5 Run a live read-only endpoint check against `DropSheetID = 27610`, `LoadNumber = 05192026-0089`, `DSSequence = 4`, `LocationID = 1` after the backend endpoint is available.
- [x] 4.6 Run Memory Impact Analysis before completion and update the required memory artifacts.
