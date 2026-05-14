## Context

The Loading page currently combines two legacy sources:

- `LoadViewDetail(DropSheetID, LocationID)` provides drop metadata and counter cards.
- `vwLoadLabelsUnion` provides the visible unscanned label rows for the active drop and selected loading location.

The live Roll case `DropSheetID = 27610`, `LoadNumber = 05192026-0089`, `DSSequence = 4`, `LocationID = 1` proves those sources can diverge. `LoadViewDetail` reports zero counters while `vwLoadLabelsUnion` returns four unscanned rows. The supplied SQL shows `vwLoadLabelsUnion` is ultimately based on `qryBarcode`, while the legacy counters use `LoadView`/`fnScannedLoad` by `LPID`. Those shared SQL objects are used by Access, FlutterFlow, and other app surfaces, so they must remain unchanged.

## Goals / Non-Goals

**Goals:**

- Add a read-only CustomerPortalAPI-PY endpoint that computes Loading drop counters from `qryBarcode`.
- Preserve the existing `LoadViewDetail` and `vwLoadLabelsUnion` endpoints.
- Display barcode-derived counters on the Svelte Loading counter cards when a usable barcode counter payload is available for the active drop.
- Keep legacy counter values in the API response for diagnostics and mismatch visibility.
- Keep selected route `LocationID` authoritative for labels, scans, counter lookup, and combined post-scan refresh.

**Non-Goals:**

- Do not modify `LoadView`, `LoadViewDetail`, `qryBarcode`, `vwLoadLabelsUnion`, or `fnScannedLoad`.
- Do not recalculate counters directly from `vwLoadLabelsUnion` in Svelte.
- Do not change scan write behavior or the `Scanned` bit semantics.
- Do not change Access or FlutterFlow behavior.

## Decisions

1. **Add an active-drop counter endpoint instead of changing shared SQL.**

   The endpoint should live in CustomerPortalAPI-PY because the current Loading scan flow already depends on CustomerPortalAPI-PY for detail rows, union labels, and combined post-scan refresh. The endpoint will be additive, read-only, and scoped to one active drop with request fields:

   - `DropSheetID`
   - `LoadNumber`
   - `DSSequence`
   - `LocationID`

   Alternative considered: change `LoadViewDetail` or `LoadView`. Rejected because those objects are shared legacy contracts and could alter Access, FlutterFlow, order status, move orders, or other operational surfaces.

2. **Compute barcode counters from grouped `qryBarcode` label units.**

   The counter query should group by `LPID` and `LabelNumber` for rows matching the request context and `PartListID IS NOT NULL`. This mirrors the label-unit shape used by the legacy count logic while sourcing rows from the same view that exposes the visible Loading labels.

   Query shape:

   ```sql
   WITH BarcodeLabels AS (
       SELECT
           DropSheetID,
           DropSheetCustID,
           LoadNumber,
           DSSequence,
           LocationID,
           LPID,
           LabelNumber,
           MAX(CASE WHEN Scanned = 1 THEN 1 ELSE 0 END) AS IsScanned
       FROM dbo.qryBarcode
       WHERE DropSheetID = ?
         AND LoadNumber = ?
         AND DSSequence = ?
         AND LocationID = ?
         AND PartListID IS NOT NULL
       GROUP BY
           DropSheetID,
           DropSheetCustID,
           LoadNumber,
           DSSequence,
           LocationID,
           LPID,
           LabelNumber
   )
   SELECT
       MAX(DropSheetID) AS DropSheetID,
       MAX(DropSheetCustID) AS DropSheetCustID,
       MAX(LoadNumber) AS LoadNumber,
       MAX(DSSequence) AS DSSequence,
       MAX(LocationID) AS LocationID,
       COUNT(*) AS BarcodeLabelCount,
       COALESCE(SUM(IsScanned), 0) AS BarcodeScanned,
       COUNT(*) - COALESCE(SUM(IsScanned), 0) AS BarcodeNeedPick
   FROM BarcodeLabels;
   ```

   If no barcode rows match, the endpoint should return zero barcode counters for the requested context rather than a 404. A 404 should be reserved for invalid active-drop detail context.

3. **Return legacy and barcode counters together.**

   Response payload should include:

   - `DropSheetID`, `DropSheetCustID`, `LoadNumber`, `DSSequence`, `LocationID`
   - `BarcodeLabelCount`, `BarcodeScanned`, `BarcodeNeedPick`
   - `LegacyLabelCount`, `LegacyScanned`, `LegacyNeedPick`
   - `CounterMismatch`

   This makes the mismatch auditable without requiring the frontend to call two unrelated endpoints for diagnostics.

4. **Frontend uses barcode counters only when the payload matches the active drop.**

   The Svelte page should request the new endpoint for the active `selectedDropDetail.loadNumber`, `selectedDropDetail.sequence`, `selectedDropDetail.dropSheetId`, and selected route `locationId`. The counter cards should display barcode-derived values only when the response matches the same four-field key. Otherwise they should continue displaying the active `LoadViewDetail` counters.

5. **Post-scan refresh includes active barcode counters.**

   `process-loading-scan-v2` currently returns refreshed detail rows and union labels. It should also include the same active barcode counter payload using the selected request `LocationID` and the clamped active detail row `LoadNumber`/`DSSequence`.

## Risks / Trade-offs

- **Risk: Barcode counters differ from legacy completion aggregates.** → Keep legacy values in the response and only use the new counters for the active Loading counter cards until the behavior is validated in production-like cases.
- **Risk: Extra active-drop endpoint adds request overhead during navigation.** → Scope the endpoint to one active drop and reuse post-scan refresh payloads to avoid broad all-drop queries.
- **Risk: Pallet rows could be counted incorrectly if counted from `vwLoadLabelsUnion` rows.** → Count grouped `qryBarcode` label units by `LPID` and `LabelNumber`, not visible union rows.
- **Risk: Invalid or stale frontend response could update the wrong drop.** → Require the frontend mapper/state to key responses by `DropSheetID`, `LoadNumber`, `DSSequence`, and selected `LocationID`.

## Migration Plan

1. Add backend unit tests and the read-only CustomerPortalAPI-PY endpoint.
2. Add combined post-scan refresh coverage for the new counter payload.
3. Add Svelte types, remote query helpers, mapper tests, and Loading page tests.
4. Update Loading to render barcode counters for the active drop when a matching payload is available.
5. Update docs and project memory artifacts during implementation completion.

Rollback is straightforward because existing endpoints and SQL objects remain unchanged. The frontend can revert to `LoadViewDetail` counters by removing the new query usage.

## Open Questions

- Confirm the final endpoint route name before implementation. Proposed: `POST /api/barcode-update/loadview-barcode-counters`.
