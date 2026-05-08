## Context

The Select Category page already sends the selected department loading location into `/loading` as a URL parameter. The mapping is inherited from legacy behavior: Roll uses `1`, Wrap uses `2`, and Parts uses `3`.

The Loading page currently uses that URL location for the first drop-detail query, but later uses `selectedDropDetail.locationId` for union-label lookup, visible label filtering, scan payloads, retry payloads, and refresh keys. If a returned detail row carries a different `LocationID` than the selected route location, the page can show labels from another department while the shell still says the selected department.

Legacy FlutterFlow keeps the route/widget `locationID` authoritative when it calls `LoadLabelsUnionViewCall`, so this change restores that contract in the SvelteKit implementation.

## Goals / Non-Goals

**Goals:**

- Keep the Select Category-selected `locationId` authoritative for the whole Loading session.
- Prevent Wrap labels from appearing during Roll or Parts Loading when backend detail rows include a mismatched `LocationID`.
- Preserve the existing DST endpoint calls and payload field names.
- Cover the mismatch with a focused browser regression test.

**Non-Goals:**

- Changing department-to-location mappings.
- Changing backend endpoints or adding new API filtering parameters.
- Reintroducing `CategoryID` as the primary Loading label filter.
- Redesigning the Loading UI.
- Changing driver-location scan behavior.

## Decisions

1. Use `loadingEntry.locationId` as the active loading location for label scoping.

   Rationale: `loadingEntry.locationId` is the value selected in Select Category and matches FlutterFlow's `widget.locationID` behavior. It is the only stable value that represents the operator's intended department after route handoff.

   Alternative considered: keep `selectedDropDetail.locationId` and add extra defensive filtering. This preserves the current bug because the detail row can carry the wrong department location.

2. Keep filtering returned label rows by returned `label.locationId`, but compare against the active route location.

   Rationale: Prior repo decisions established that `CategoryID` is unreliable for Loading labels and that the DST union endpoint can return rows needing client-side guarding. Comparing returned row `LocationID` to the authoritative selected location preserves that defense without relying on a possibly wrong drop-detail location.

   Alternative considered: trust the backend query result without client-side filtering. That would remove existing protection against mixed union rows.

3. Use the same active route location for scan and retry payloads.

   Rationale: Scan mutations should target the department/location the operator entered from Select Category, not a value copied from a potentially inconsistent detail row.

   Alternative considered: only fix the visible labels. That would make the UI look correct while scan submissions could still use the wrong location.

4. Keep changes local to the Loading route and route tests.

   Rationale: Select Category handoff, shared lifecycle parsing, and server DST query wrappers already pass `locationId` correctly. The fault is in how Loading reuses a detail row field after handoff.

## Risks / Trade-offs

- Backend detail rows may intentionally carry a different `LocationID` for a rare workflow -> Mitigation: legacy FlutterFlow uses the selected route location, and product expectation confirms the selected location should scope labels.
- Refreshed scan payloads may include cached label keys from backend responses -> Mitigation: use the active route location consistently for lookup keys and fallback refreshes; preserve backend-provided combined refresh data only when it is keyed to the active location.
- Existing tests may assume `selectedDropDetail.locationId` is the active location -> Mitigation: update/add focused tests that distinguish route location from row location.
