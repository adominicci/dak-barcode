## Purpose
Ensure operator loader selection for Loading uses the same active-loader list as Dropsheets.

## Requirements

### Requirement: Loading loader picker uses active loaders only
The system SHALL present only active loader records when an operator selects a loader to start Loading from Select Category.

#### Scenario: Inactive loaders are hidden from Loading entry
- **WHEN** the loader lookup returns active loader `Kaleb` and inactive loader `Austin`
- **THEN** the Select Category loader picker SHALL show `Kaleb`
- **THEN** the Select Category loader picker SHALL NOT show `Austin`

#### Scenario: Empty active list shows active-loader empty state
- **WHEN** the loader lookup returns only inactive loader records
- **THEN** the Select Category loader picker SHALL show the empty message `No active loaders are available.`
- **THEN** the Select Category loader picker SHALL NOT allow starting Loading with any inactive loader

### Requirement: Operational loader pickers share active-loader option rules
The system SHALL use the same active-loader option derivation for the Dropsheets loader picker and the Select Category Loading loader picker.

#### Scenario: Dropsheets and Loading entry receive the same loader records
- **WHEN** both picker surfaces receive the same loader lookup result with mixed active and inactive rows
- **THEN** both picker surfaces SHALL expose the same active loader names as picker options
- **THEN** neither picker surface SHALL expose inactive loader names as picker options
