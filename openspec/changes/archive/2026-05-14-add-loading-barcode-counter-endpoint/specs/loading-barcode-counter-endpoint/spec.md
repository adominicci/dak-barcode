## ADDED Requirements

### Requirement: Barcode-derived loading counters are available by active drop
The system SHALL expose an additive read-only CustomerPortalAPI-PY endpoint that returns barcode-derived Loading counters for one active drop using `qryBarcode`.

The request SHALL include `DropSheetID`, `LoadNumber`, `DSSequence`, and `LocationID`. The endpoint SHALL preserve existing shared SQL objects and SHALL NOT modify `LoadView`, `LoadViewDetail`, `qryBarcode`, `vwLoadLabelsUnion`, or `fnScannedLoad`.

#### Scenario: Counter endpoint returns qryBarcode counts for active Roll drop
- **WHEN** the caller requests counters for `DropSheetID = 27610`, `LoadNumber = 05192026-0089`, `DSSequence = 4`, and `LocationID = 1`
- **AND** `qryBarcode` has four unscanned grouped label units for that context
- **THEN** the response SHALL include `BarcodeLabelCount = 4`
- **AND** the response SHALL include `BarcodeScanned = 0`
- **AND** the response SHALL include `BarcodeNeedPick = 4`

#### Scenario: Counter endpoint returns zero barcode counts for an empty active drop
- **WHEN** the caller requests counters for a valid active drop
- **AND** `qryBarcode` has no grouped label units for that `DropSheetID`, `LoadNumber`, `DSSequence`, and `LocationID`
- **THEN** the response SHALL include `BarcodeLabelCount = 0`
- **AND** the response SHALL include `BarcodeScanned = 0`
- **AND** the response SHALL include `BarcodeNeedPick = 0`

#### Scenario: Counter endpoint includes legacy comparison values
- **WHEN** the caller requests counters for a valid active drop
- **THEN** the response SHALL include the matching legacy `LoadViewDetail` counter values as `LegacyLabelCount`, `LegacyScanned`, and `LegacyNeedPick`
- **AND** the response SHALL include `CounterMismatch = true` when any barcode counter differs from its legacy counterpart
- **AND** the response SHALL include `CounterMismatch = false` when all barcode counters match their legacy counterparts

#### Scenario: Invalid active detail context is rejected
- **WHEN** the caller requests counters for a `DropSheetID`, `LocationID`, and `DSSequence` that do not resolve to a usable `LoadViewDetail` row
- **THEN** the endpoint SHALL return an error instead of fabricating legacy comparison values

### Requirement: Loading scan refresh includes barcode counter payload
The existing Loading scan response SHALL include the active barcode-derived counter payload after a successful loading scan.

#### Scenario: Successful loading scan returns refreshed active counter payload
- **WHEN** a loading scan succeeds
- **AND** the combined refresh clamps the selected drop index to an active `LoadViewDetail` row
- **THEN** the scan response SHALL include the barcode-derived counter payload for the clamped row `LoadNumber` and `DSSequence`
- **AND** the scan response SHALL use the request `LocationID` for the barcode counter lookup

#### Scenario: Location retry response does not include counter payload
- **WHEN** a loading scan requires a driver location before any label update is written
- **THEN** the response SHALL NOT require a barcode counter refresh payload
