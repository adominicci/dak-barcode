## ADDED Requirements

### Requirement: Complete Load is displayed only when all departments are closed
The system SHALL display the Select Category `Complete Load` action only when the dropsheet category availability reports `allLoaded=true` and every dropsheet department status is either `NA` or `DONE`.

#### Scenario: All loaded and every department closed
- **WHEN** the dropsheet category availability reports `allLoaded=true`
- **AND** every department status is `NA` or `DONE`
- **THEN** the Select Category page SHALL display `Complete Load`

#### Scenario: Department is due
- **WHEN** the dropsheet category availability reports `allLoaded=true`
- **AND** at least one department status is `DUE`
- **THEN** the Select Category page SHALL NOT display `Complete Load`

#### Scenario: Department has a non-closed status
- **WHEN** the dropsheet category availability reports `allLoaded=true`
- **AND** at least one department status is not `NA` or `DONE`
- **THEN** the Select Category page SHALL NOT display `Complete Load`

#### Scenario: Dropsheet is not all loaded
- **WHEN** every department status is `NA` or `DONE`
- **AND** the dropsheet category availability does not report `allLoaded=true`
- **THEN** the Select Category page SHALL NOT display `Complete Load`

#### Scenario: Department status is unavailable
- **WHEN** the dropsheet category availability reports `allLoaded=true`
- **AND** department status data is missing, loading without a current value, or contains a blank or null department status
- **THEN** the Select Category page SHALL NOT display `Complete Load`

### Requirement: Complete Load execution remains unchanged when ready
The system SHALL preserve the existing Complete Load confirmation and submission behavior after the action is displayed under the readiness rule.

#### Scenario: Ready load is completed
- **WHEN** the Select Category page displays `Complete Load`
- **AND** the operator confirms completion
- **THEN** the system SHALL run the existing loaded-notification flow
- **AND** the system SHALL run the existing transfer-label export flow only when the dropsheet is a transfer load
