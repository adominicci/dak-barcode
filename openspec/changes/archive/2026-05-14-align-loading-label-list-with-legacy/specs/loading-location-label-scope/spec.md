## ADDED Requirements

### Requirement: Loading label list renders returned union rows independently from detail counters
The system SHALL render unscanned `vwLoadLabelsUnion` rows for the selected loading location even when the active `LoadViewDetail` row reports zero `LabelCount`, zero `Scanned`, and zero `NeedPick` counters.

The system SHALL continue to display the `Labels`, `Scanned`, and `Need Pick` counters from the active `LoadViewDetail` row; it SHALL NOT recalculate those counters from the union label list.

#### Scenario: Union labels display when detail counters are zero
- **WHEN** the operator enters Loading for a selected `locationId`
- **AND** the active `LoadViewDetail` row reports `LabelCount = 0`, `Scanned = 0`, and `NeedPick = 0`
- **AND** `vwLoadLabelsUnion` returns an unscanned row whose `LocationID` matches the selected `locationId`
- **THEN** the Loading page SHALL show that unscanned union row in the label list
- **AND** the Loading page SHALL NOT show the empty-drop message
- **AND** the Loading page SHALL keep the drop counters at the values returned by `LoadViewDetail`

#### Scenario: Empty message remains when counters and union labels are empty
- **WHEN** the operator enters Loading for a selected `locationId`
- **AND** the active `LoadViewDetail` row reports `LabelCount = 0`
- **AND** `vwLoadLabelsUnion` returns no unscanned rows whose `LocationID` matches the selected `locationId`
- **THEN** the Loading page SHALL show the empty-drop message

#### Scenario: Mismatched-location union rows stay hidden when counters are zero
- **WHEN** the operator enters Loading for a selected `locationId`
- **AND** the active `LoadViewDetail` row reports `LabelCount = 0`
- **AND** `vwLoadLabelsUnion` returns one unscanned row whose `LocationID` matches the selected `locationId`
- **AND** `vwLoadLabelsUnion` returns another unscanned row whose `LocationID` does not match the selected `locationId`
- **THEN** the Loading page SHALL show only the unscanned row whose `LocationID` matches the selected `locationId`

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
