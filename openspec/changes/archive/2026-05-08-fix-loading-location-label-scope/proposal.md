## Why

Operators report that entering Loading for Roll can show the same labels seen in Wrap. The Select Category handoff already sends the intended loading location, but the Loading screen can later use a returned drop-detail `LocationID` instead of that selected location when querying and filtering labels.

This needs to be corrected now because Loading labels are department-scoped work instructions: showing Wrap labels during a Roll session can cause incorrect picks or false confidence that the wrong department has pending work.

## What Changes

- Treat the Loading route `locationId` parameter from Select Category as the authoritative selected loading location for the active session.
- Keep using the selected location for drop-detail loading, label lookup, visible unscanned-label filtering, scan request payloads, retry payloads, and post-scan refresh keys.
- Add regression coverage for a mismatch where the URL location is Roll (`1`) but a returned drop-detail row carries Wrap (`2`); the Roll page must not show Wrap labels.
- Preserve the existing legacy DST endpoints and request shapes.
- Preserve existing department mappings: Roll -> `1`, Wrap -> `2`, Parts -> `3`.

## Capabilities

### New Capabilities

- `loading-location-label-scope`: Loading sessions show and scan labels only for the selected loading location passed from Select Category.

### Modified Capabilities

None. This repository did not have existing OpenSpec specs before this change.

## Impact

- `src/routes/(app)/loading/+page.svelte`
- `src/routes/(app)/loading/loading-page.svelte.spec.ts`
- Potential memory/docs updates after implementation because this is durable Loading workflow behavior.
- No backend API changes expected.
- No dependency changes expected.
