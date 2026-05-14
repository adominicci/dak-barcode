## Context

The Loading route currently receives a selected loading `locationId` from Select Category. Existing behavior already treats that route value as authoritative for `getLoadViewDetailAll`, `getLoadViewUnion`, visible label filtering, loading scan payloads, retry payloads, and fallback refresh keys.

The reported production parity issue is narrower: for a Roll drop, Access shows label rows in the grid while its bottom counters still read `LABELS: 0`, `SCANNED: 0`, and `LEFT: 0`. The SvelteKit Loading page currently treats `selectedDropDetail.labelCount === 0` as a hard empty-state signal and displays `No items are attached to this drop yet.` before considering whether the union label query returned rows.

Legacy source inspection shows this is not how Access is wired:

- `frmScanPick` binds the bottom `LabelCount`, `Scanned`, and `NeedPick` controls to the active `qryPassThroughPick` row, which is populated from `dbo.LoadViewDetail(dropSheetId, locationId)`.
- `frmScanPickSub` renders the label grid from `vwLoadLabelsUnion`, linked by `LoadNumber`, `DSSequence`, and `LocationID`.
- The category click handlers set the subform record source to `SELECT vwLoadLabelsUnion.* FROM vwLoadLabelsUnion WHERE LocationID = <selected loading location> ...`.
- FlutterFlow uses the same separation: `LoadViewDetailSequenceAllCall` feeds the active drop and counters, while `LoadLabelsUnionViewCall` feeds the visible grid using `loadNumber`, current drop sequence, and widget `locationID`.

The SQL supplied during discovery explains why the sources can disagree. `LoadViewDetail` materializes rows from `LoadView`; `LoadView` calculates counters through logistics package joins and `Sum_Labels`, while `vwLoadLabelsUnion` reads unscanned rows from `qryBarcode`. When the counter path returns zero but the barcode union still returns rows, legacy renders the rows and keeps the counters as returned.

The active SvelteKit loading scan path posts to CustomerPortalAPI-PY `POST /api/barcode-update/process-loading-scan-v2`, not dakview-web `POST /v1/scan/process-loading`. That combined endpoint returns refreshed `load_view_detail_all`, `load_view_union`, and `load_view_union_key` rows after successful scans. Its refresh helper currently derives the union refresh `location_id` from the selected detail row when available; this can reintroduce mismatched detail-row `LocationID` into the refresh cache after the frontend correctly submitted the selected route `LocationID`.

## Goals / Non-Goals

**Goals:**

- Preserve legacy Loading grid behavior: returned union labels remain visible even when the active detail row counters are zero.
- Preserve legacy counter behavior: `Labels`, `Scanned`, and `Need Pick` continue to display the `LoadViewDetail` values, including zero.
- Keep the selected route `locationId` authoritative for all label lookup, visible label filtering, scan payload, retry payload, fallback refresh, and combined refresh cache keys.
- Add focused TDD coverage in the SvelteKit repo before changing the Loading page.
- Add focused TDD coverage in CustomerPortalAPI-PY before changing `process-loading-scan-v2`.
- Keep changes minimal and avoid redesigning the Loading UI.

**Non-Goals:**

- Recalculating Loading counters from `vwLoadLabelsUnion` in SvelteKit.
- Changing SQL definitions for `LoadView`, `LoadViewDetail`, `vwLoadLabelsUnion`, `qryBarcode`, or `fnScannedLoad`.
- Changing department-to-location mappings (`Roll -> 1`, `Wrap -> 2`, `Parts -> 3`).
- Moving the Loading scan mutation from CustomerPortalAPI-PY to dakview-web.
- Changing dakview-web scan endpoints; no dakview-web implementation change is expected for this issue.
- Redesigning the operator workflow panel or changing visible copy beyond the conditional empty-state behavior.

## Decisions

1. Treat the union label list as the source of truth for whether there are visible rows.

   Rationale: Access and FlutterFlow render the grid from `vwLoadLabelsUnion` independently from `LoadViewDetail` counters. If the union list returns rows, those rows are actionable operator context and must not be hidden by a zero counter row.

   Alternative considered: keep `labelCount === 0` as the empty-state condition. This preserves the current bug and blocks labels that legacy shows.

2. Keep `LoadViewDetail` counters unchanged.

   Rationale: The screenshot shows Access displaying both a populated label grid and zero counters. Recalculating counters from union rows would intentionally diverge from the old app and could mask SQL/data issues that operators or backend owners need to see.

   Alternative considered: derive `Labels`, `Scanned`, and `Need Pick` from `dropLabels`. This would make the Svelte screen internally consistent, but it would not be parity and would create a second counter implementation outside SQL Server.

3. Update frontend empty/completion state precedence.

   The Loading page should evaluate states in this order:

   - backend label query error
   - label query loading
   - visible unscanned labels exist: render `ScannedIdGrid`
   - no returned union rows and `selectedDropDetail.labelCount === 0`: render `No items are attached to this drop yet.`
   - no visible unscanned labels and the drop is fully scanned: render `All items in this drop are scanned.`
   - fallback: render an empty `ScannedIdGrid` or the existing fully-scanned message, depending on final testable implementation

   Rationale: Union rows must take precedence over the detail counter empty state. The fully-scanned state should still be available when the detail counters indicate labels existed and either all are scanned or the returned union list has no remaining unscanned rows.

   Alternative considered: only change `isEmptyDrop` to also check `dropLabels.length === 0`. This is likely sufficient, but the implementation should verify it does not accidentally prioritize the fully-scanned message over a non-empty unscanned label list.

4. Keep selected route location authoritative in CustomerPortalAPI-PY combined refresh.

   The refresh helper should use `data.LocationID` for the `vwLoadLabelsUnion` query and for `load_view_union_key.location_id`. It may still use the selected drop row for `LoadNumber` and `DSSequence` because those identify the active drop after index clamping.

   Rationale: SvelteKit already submits `LocationID` as the selected route location. Replacing it with `selected_drop.LocationID` after the scan violates the existing `loading-location-label-scope` contract and can poison the frontend refresh cache with mismatched-location rows.

   Alternative considered: trust the selected detail row location. This is the exact source of the earlier location-scope class of bugs.

5. Keep repo ownership boundaries explicit.

   The OpenSpec change lives in `dak-barcode`, but one task touches CustomerPortalAPI-PY. Implementation must not modify dakview-web unless new evidence shows the active deployed scan path moved back to dakview-web.

   Rationale: `dak-barcode` owns the frontend behavior and contract documentation. CustomerPortalAPI-PY owns the combined loading scan endpoint currently used by SvelteKit. dakview-web is relevant for scan endpoint history but not the mutation path being fixed here.

## Risks / Trade-offs

- Detail counters and visible rows may remain inconsistent by design. -> Mitigation: preserve the counters exactly as returned and document that the grid follows `vwLoadLabelsUnion` parity.
- Rendering union rows when counters are zero may surprise users who expect the counters to match. -> Mitigation: this matches Access/FlutterFlow behavior; do not introduce new explanatory UI unless requested.
- CustomerPortalAPI-PY change is outside the current repo. -> Mitigation: keep backend task narrow, TDD-covered, and explicitly require user approval before modifying that repo if the implementation session is scoped to frontend only.
- Existing Svelte tests may encode the old empty-state rule. -> Mitigation: update the existing empty-state test to require both zero counters and empty union rows, then add a new regression for zero counters plus non-empty union rows.
- Combined refresh may still receive `load_view_detail_all` rows with mismatched `LocationID`. -> Mitigation: frontend visible filtering remains keyed to the selected route location; backend refresh key and union query must also use the request location.
- Live SQL can continue producing zero counters for valid union rows. -> Mitigation: this proposal does not attempt to fix SQL; if counter correctness becomes required, create a separate backend/data change after comparing `LoadView`, `LoadViewDetail`, `vwLoadLabelsUnion`, and `qryBarcode` with production examples.

## Migration Plan

1. Implement frontend tests and Loading route behavior in `dak-barcode`.
2. Implement backend tests and refresh-key behavior in CustomerPortalAPI-PY if the user approves backend edits in that repo.
3. Run focused frontend verification:
   - `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`
   - `bun run check`
4. Run focused backend verification in CustomerPortalAPI-PY for `tests/barcode_module/test_process_loading_scan_v2.py`.
5. Run OpenSpec validation in `dak-barcode`.
6. Run Memory Impact Analysis and update durable docs because Loading workflow behavior and backend refresh contract are changing.

Rollback is straightforward: revert the frontend empty-state change and the CustomerPortalAPI-PY refresh-location change. No data migration is required.

## Open Questions

- None blocking. The supplied SQL confirms the legacy counter/list split and supports implementing the parity fix without changing SQL.
