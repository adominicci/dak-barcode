## Why

Loading can hide valid labels when `LoadViewDetail` reports `LabelCount = 0` for the active drop even though `vwLoadLabelsUnion` returns unscanned labels for the same `LoadNumber`, `DSSequence`, and selected loading `LocationID`. Access and FlutterFlow render the label grid from `vwLoadLabelsUnion` independently of the counter row, so SvelteKit currently diverges from legacy behavior and can leave operators unable to see or scan labels that the old app shows.

The investigation also found a post-scan refresh risk in the CustomerPortalAPI combined loading endpoint: after a successful scan, refresh rows can be keyed with the returned drop-detail `LocationID` instead of the selected route `LocationID`, which can reintroduce the older location-scope bug after scan settlement.

## What Changes

- Update the Loading label-list empty-state rule so `LabelCount = 0` does not suppress returned `vwLoadLabelsUnion` rows.
- Preserve the existing Loading counters from `LoadViewDetail`; do not recalculate `Labels`, `Scanned`, or `Need Pick` from the union list in SvelteKit.
- Keep the selected route `locationId` authoritative for initial label queries, visible label filtering, scan payloads, retry payloads, fallback refresh keys, and combined post-scan refresh keys.
- Fix the CustomerPortalAPI `process-loading-scan-v2` refresh payload so it queries and returns `load_view_union_key.location_id` using the requested `LocationID`, not `selected_drop.LocationID`.
- Add targeted regression coverage for the legacy parity case: the label grid renders non-empty union rows even when the active detail counters are zero.
- Add targeted backend regression coverage for post-scan refresh scoping when the returned detail row carries a different `LocationID`.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `loading-location-label-scope`: extend the selected-location contract so legacy union label rows remain visible when detail counters are zero, and ensure combined scan refresh payloads preserve the selected loading location.

## Impact

- Frontend:
  - `src/routes/(app)/loading/+page.svelte`
  - `src/routes/(app)/loading/loading-page.svelte.spec.ts`
- Backend dependency:
  - `/Users/andresdominicci/Projects/CustomerPortalAPI-PY/src/barcode_module/routes/barcode_update.py`
  - `/Users/andresdominicci/Projects/CustomerPortalAPI-PY/tests/barcode_module/test_process_loading_scan_v2.py`
- Docs and durable memory:
  - `openspec/specs/loading-location-label-scope/spec.md` through the delta spec
  - `docs/current-context.md`, `docs/project-state.yaml`, and possibly `docs/decisions.md` if implementation changes durable behavior
- No changes are expected in `dakview-web`; the active SvelteKit loading scan path uses the CustomerPortalAPI combined endpoint for scan mutations and refresh rows.
