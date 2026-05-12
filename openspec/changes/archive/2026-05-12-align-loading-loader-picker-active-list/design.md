## Context

Dropsheets and Select Category both use the same loader lookup, but they derive picker options differently. Dropsheets filters the lookup to `loader.isActive` before rendering the loader picker; Select Category currently maps the entire lookup into the Loading entry modal. That allows inactive names to appear only when the operator starts Loading from a dropsheet.

Legacy Access supports the Dropsheets behavior: the loader popup queries `tlkLoader Where IsActive=True Order By Loader`. The SvelteKit rebuild should keep that active-only contract for all operator loader selection surfaces.

## Goals / Non-Goals

**Goals:**

- Make the Select Category Loading loader modal show only active loaders.
- Keep the Dropsheets loader picker and Select Category loader picker aligned through a shared helper or shared derivation.
- Keep the current active loader selection, loader-session creation, and Loading route navigation behavior unchanged for active loader choices.
- Cover the bug with focused tests that fail when inactive loader records are rendered.

**Non-Goals:**

- Change the backend loader endpoint or DST query contract.
- Change the Add Loader administration page, loader creation, or loader activation editing behavior.
- Change the department loader roster, which displays currently assigned loaders by department and is separate from the modal option list.
- Redesign the selection modal UI.

## Decisions

- Derive active loader picker options in one shared place.
  - Rationale: Dropsheets already has the correct filter, but duplicating it in Select Category keeps the same drift risk. A small helper such as `getActiveLoaderOptions(loaders)` keeps the active-only contract obvious and testable.
  - Alternative considered: filter inline in Select Category only. This fixes the immediate bug but leaves two picker implementations with separate rules.

- Keep filtering in the frontend for this change.
  - Rationale: The lookup already returns `isActive`, and Dropsheets already relies on the frontend filter. Changing the backend endpoint could affect Add Loader/admin surfaces and is outside this frontend-only repo's ownership.
  - Alternative considered: add a new backend active-loaders endpoint. That is unnecessary for this bug and would require separate backend approval.

- Treat missing or false `isActive` as not selectable in operational pickers.
  - Rationale: The operator picker should be conservative. If a row is not explicitly active, it should not be available for new Loading sessions.
  - Alternative considered: include rows when `isActive` is missing for compatibility. Current mapped loader records include the field, and allowing unknown rows would preserve the stale-name failure mode.

## Risks / Trade-offs

- Existing inactive loader assigned to an old dropsheet is no longer selectable for new Loading starts -> this is intended; previously assigned names may still display as historical values, but not as new choices.
- If the backend temporarily returns no active loaders, the modal will show the existing "No active loaders are available." empty state -> tests should cover this so operators do not see stale fallback names.
- A shared helper adds a small abstraction -> the benefit is preventing two operational picker surfaces from using different active-loader rules.
