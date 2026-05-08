## ADDED Requirements

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
