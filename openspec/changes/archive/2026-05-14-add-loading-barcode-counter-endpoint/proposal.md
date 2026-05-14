## Why

Loading can show valid unscanned Roll labels while the active `LoadViewDetail` row reports `LabelCount = 0`, `Scanned = 0`, and `NeedPick = 0`. The confirmed live case is `DropSheetID = 27610`, `LoadNumber = 05192026-0089`, `DSSequence = 4`, `LocationID = 1`, where `vwLoadLabelsUnion` returns four unscanned rows but the legacy detail counters stay zero.

## What Changes

- Add an additive CustomerPortalAPI-PY FastAPI endpoint that returns barcode-derived loading counters from `qryBarcode` without changing existing SQL objects.
- Scope the new counter lookup by `DropSheetID`, `LoadNumber`, `DSSequence`, and `LocationID`.
- Return barcode-derived `labelCount`, `scannedCount`, and `needPickCount` plus the legacy `LoadViewDetail` counters so mismatches remain observable.
- Update the Svelte Loading page to display barcode-derived counters when the new endpoint returns a usable row for the active drop.
- Keep `LoadView`, `LoadViewDetail`, `qryBarcode`, `vwLoadLabelsUnion`, and `fnScannedLoad` unchanged because they are shared by legacy Access, FlutterFlow, and other app surfaces.
- Preserve selected-route `locationId` as the authoritative loading location for labels, scans, counter lookup, and post-scan refresh.

## Capabilities

### New Capabilities

- `loading-barcode-counter-endpoint`: Add an additive API contract for barcode-derived Loading drop counters based on `qryBarcode`.

### Modified Capabilities

- `loading-location-label-scope`: Loading counter cards will display the barcode-derived counter values for the active selected-location drop when available, instead of always displaying the legacy `LoadViewDetail` values.

## Impact

- Frontend: `src/routes/(app)/loading/+page.svelte`, loading remote query helpers, type mappers, raw/normalized types, loading unit tests.
- Backend dependency: `/Users/andresdominicci/Projects/CustomerPortalAPI-PY/src/barcode_module/routes/barcode_update.py` and its tests.
- Documentation and memory artifacts: OpenSpec spec deltas plus `docs/prd.md`, `docs/architecture.md`, `docs/decisions.md`, `docs/current-context.md`, and `docs/project-state.yaml` during implementation/archive.
- Data dependencies: read-only use of existing `dbo.qryBarcode`; no in-place changes to shared SQL views/functions.
