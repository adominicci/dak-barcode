# Staging Location Memory Design

## Summary

This change keeps the existing staging surface and scan pipeline intact, but adjusts the missing-location recovery flow to match operator expectations. When `Wrap` or `Parts` operators scan a valid label without an active location, the app should immediately open the location selector, preserve the chosen location, and reuse it for later labels until the operator changes it. When `Roll` operators do the same, the app should also open the location selector immediately, but the chosen location is single-use and must clear after the next successful non-location label scan.

## Recommended Approach

Use the existing `staging-scan-controller` as the source of truth for scan outcomes and keep the retry behavior in the staging page. The controller already knows when a scan needs a location and already clears Roll locations after successful label scans. The missing piece is to surface `needs-location` as an automatic modal-open action instead of leaving the operator on the main input with only inline guidance. This approach is the smallest possible behavioral change, preserves the current separation of concerns, and avoids duplicating retry logic in the modal or page component.

## Behavior Rules

- `Wrap` and `Parts`
- If no location is selected and a valid label scan needs a location, open the location modal immediately.
- After the operator selects or scans a location in the modal, retry the pending label with that location.
- Keep the selected location active for later label scans until the operator manually changes it or changes department.

- `Roll`
- If no location is selected and a valid label scan needs a location, open the location modal immediately.
- After the operator selects or scans a location in the modal, retry the pending label with that location.
- Once that non-location scan succeeds, clear the active location so the next Roll label repeats the same cycle.
- If the operator preselects a Roll location manually before scanning, that location is still single-use and must clear after the next successful non-location scan.

## Test Strategy

Add controller coverage for `needs-location` opening the modal, then add page-level coverage for:

- automatic location modal opening after missing-location label scans
- Parts or Wrap keeping the selected location after the pending retry succeeds
- Roll clearing the selected location after the pending retry succeeds
- Roll clearing a manually preselected location after the next successful label scan
