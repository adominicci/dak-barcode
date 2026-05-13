## Purpose

Ensure Select Category displays the Complete Load action only when the load is fully loaded and all departments are closed.

## Requirements

### Requirement: Complete Load is displayed only when loading progress is complete and all departments are closed
The system SHALL display the Select Category `Complete Load` action only when every live loading category with labels is scanned to 100% and every dropsheet department status is either `NA` or `DONE`.

If live category availability is unavailable or contains no loading categories with labels, the system MAY use the carried dropsheet `percentCompleted >= 1` value as the loaded signal.

#### Scenario: All loaded and every department closed
- **WHEN** every live loading category with labels is scanned to 100%
- **AND** every department status is `NA` or `DONE`
- **THEN** the Select Category page SHALL display `Complete Load`

#### Scenario: AllLoaded flag is not yet checked
- **WHEN** every live loading category with labels is scanned to 100%
- **AND** every department status is `NA` or `DONE`
- **AND** the dropsheet category availability `allLoaded` flag is false
- **THEN** the Select Category page SHALL display `Complete Load`

#### Scenario: Live category availability has no labeled categories
- **WHEN** live category availability contains no loading categories with labels
- **AND** the carried dropsheet `percentCompleted` value is at least 1
- **AND** every department status is `NA` or `DONE`
- **THEN** the Select Category page SHALL display `Complete Load`

#### Scenario: Department is due
- **WHEN** every live loading category with labels is scanned to 100%
- **AND** at least one department status is `DUE`
- **THEN** the Select Category page SHALL NOT display `Complete Load`

#### Scenario: Department has a non-closed status
- **WHEN** every live loading category with labels is scanned to 100%
- **AND** at least one department status is not `NA` or `DONE`
- **THEN** the Select Category page SHALL NOT display `Complete Load`

#### Scenario: Dropsheet is not all loaded
- **WHEN** every department status is `NA` or `DONE`
- **AND** at least one live loading category with labels is not scanned to 100%
- **THEN** the Select Category page SHALL NOT display `Complete Load`

#### Scenario: Department status is unavailable
- **WHEN** every live loading category with labels is scanned to 100%
- **AND** department status data is missing, loading without a current value, or contains a blank or null department status
- **THEN** the Select Category page SHALL NOT display `Complete Load`

### Requirement: Complete Load execution remains unchanged when ready
The system SHALL preserve the existing Complete Load confirmation and submission behavior after the action is displayed under the readiness rule.

#### Scenario: Ready load is completed
- **WHEN** the Select Category page displays `Complete Load`
- **AND** the operator confirms completion
- **THEN** the system SHALL run the existing loaded-notification flow
- **AND** the system SHALL run the existing transfer-label export flow only when the dropsheet is a transfer load
