## Purpose
Ensure Loading sessions show and submit labels only for the location selected from Select Category.
## Requirements
### Requirement: Loading labels are scoped by selected loading location
The system SHALL use the Loading route `locationId` selected from Select Category as the authoritative loading location for label lookup and visible label filtering.

#### Scenario: Roll loading ignores Wrap detail row location
- **WHEN** the operator enters Loading from Select Category with `locationId=1` for Roll and the active drop-detail row contains `LocationID=2`
- **THEN** the system SHALL request union labels with `LocationID=1`
- **THEN** the system SHALL show only unscanned labels whose returned `LocationID` is `1`
- **THEN** the system SHALL NOT show labels whose returned `LocationID` is `2`

#### Scenario: Wrap loading shows Wrap labels only
- **WHEN** the operator enters Loading from Select Category with `locationId=2` for Wrap
- **THEN** the system SHALL request union labels with `LocationID=2`
- **THEN** the system SHALL show only unscanned labels whose returned `LocationID` is `2`

#### Scenario: Parts loading shows Parts labels only
- **WHEN** the operator enters Loading from Select Category with `locationId=3` for Parts
- **THEN** the system SHALL request union labels with `LocationID=3`
- **THEN** the system SHALL show only unscanned labels whose returned `LocationID` is `3`

### Requirement: Loading scans use selected loading location
The system SHALL submit loading scan and retry requests with the selected route `locationId` rather than the active drop-detail row `LocationID`.

#### Scenario: Scan payload preserves selected Roll location
- **WHEN** the operator scans a label in a Roll Loading session entered with `locationId=1` and the active drop-detail row contains `LocationID=2`
- **THEN** the loading scan request SHALL include `locationId=1`

#### Scenario: Retry payload preserves selected Roll location
- **WHEN** a Loading scan in a Roll session requires a driver location retry and the active drop-detail row contains `LocationID=2`
- **THEN** the retry request SHALL include `locationId=1`

### Requirement: Loading label list renders returned union rows independently from detail counters
The system SHALL render unscanned `vwLoadLabelsUnion` rows for the selected loading location even when the active legacy `LoadViewDetail` row reports zero `LabelCount`, zero `Scanned`, and zero `NeedPick` counters.

The system SHALL display the `Labels`, `Scanned`, and `Need Pick` counter cards from a matching barcode-derived counter payload when that payload is available for the active drop. If no matching barcode-derived counter payload is available, the system SHALL fall back to the active `LoadViewDetail` counters. The system SHALL NOT calculate the counter cards directly from the visible union label list in Svelte.

#### Scenario: Union labels display when legacy counters are zero
- **WHEN** the operator enters Loading for a selected `locationId`
- **AND** the active legacy `LoadViewDetail` row reports `LabelCount = 0`, `Scanned = 0`, and `NeedPick = 0`
- **AND** `vwLoadLabelsUnion` returns an unscanned row whose `LocationID` matches the selected `locationId`
- **AND** the matching barcode-derived counter payload reports non-zero `BarcodeLabelCount` and `BarcodeNeedPick`
- **THEN** the Loading page SHALL show that unscanned union row in the label list
- **AND** the Loading page SHALL NOT show the empty-drop message
- **AND** the Loading page SHALL display the barcode-derived counter values in the `Labels`, `Scanned`, and `Need Pick` cards

#### Scenario: Empty message remains when counters and union labels are empty
- **WHEN** the operator enters Loading for a selected `locationId`
- **AND** the active `LoadViewDetail` row reports `LabelCount = 0`
- **AND** the matching barcode-derived counter payload reports `BarcodeLabelCount = 0`
- **AND** `vwLoadLabelsUnion` returns no unscanned rows whose `LocationID` matches the selected `locationId`
- **THEN** the Loading page SHALL show the empty-drop message

#### Scenario: Mismatched-location union rows stay hidden when counters are zero
- **WHEN** the operator enters Loading for a selected `locationId`
- **AND** the active legacy `LoadViewDetail` row reports `LabelCount = 0`
- **AND** `vwLoadLabelsUnion` returns one unscanned row whose `LocationID` matches the selected `locationId`
- **AND** `vwLoadLabelsUnion` returns another unscanned row whose `LocationID` does not match the selected `locationId`
- **THEN** the Loading page SHALL show only the unscanned row whose `LocationID` matches the selected `locationId`

#### Scenario: Stale barcode counter payload is ignored
- **WHEN** the Loading page has a barcode-derived counter payload
- **AND** that payload does not match the active drop `DropSheetID`, `LoadNumber`, `DSSequence`, and selected route `LocationID`
- **THEN** the Loading page SHALL ignore that barcode-derived payload
- **AND** the Loading page SHALL display the active `LoadViewDetail` counters until a matching barcode-derived payload is available

### Requirement: Loading combined refresh preserves selected loading location
The system SHALL use the selected loading location submitted by the Loading route as the authoritative location for combined post-scan refresh label queries and refresh cache keys.

#### Scenario: Combined refresh ignores mismatched detail-row location
- **WHEN** a Loading scan succeeds with request `LocationID = 1`
- **AND** the refreshed active `LoadViewDetail` row has the selected `DSSequence` and `LoadNumber` but contains `LocationID = 2`
- **THEN** the combined refresh SHALL request `vwLoadLabelsUnion` with `LocationID = 1`
- **AND** the combined refresh SHALL return `load_view_union_key.location_id = 1`

#### Scenario: Combined refresh uses selected drop sequence after index clamp
- **WHEN** a Loading scan succeeds with a `SelectedDropIndex` outside the refreshed detail-row bounds
- **AND** the refresh clamps that index to an available detail row
- **THEN** the combined refresh SHALL use the clamped detail row `DSSequence` and `LoadNumber`
- **AND** the combined refresh SHALL use the request `LocationID` for the union label query and refresh cache key

