## MODIFIED Requirements

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
