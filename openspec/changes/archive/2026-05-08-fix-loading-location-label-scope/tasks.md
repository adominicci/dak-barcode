## 1. Regression Coverage

- [x] 1.1 Add a Loading page browser regression where the URL `locationId=1` but the active drop-detail row has `locationId=2`, and assert Roll labels are requested/rendered with location `1` only.
- [x] 1.2 Add or update scan payload coverage so direct loading scans use the selected route location when the active drop-detail row location differs.
- [x] 1.3 Add or update retry payload coverage so location retry scans use the selected route location when the active drop-detail row location differs.

## 2. Loading Route Implementation

- [x] 2.1 Introduce a single active loading location value derived from `loadingEntry.locationId` in `src/routes/(app)/loading/+page.svelte`.
- [x] 2.2 Use the active loading location for union-label query keys and `getLoadViewUnion` input.
- [x] 2.3 Filter visible unscanned labels by the active loading location instead of `selectedDropDetail.locationId`.
- [x] 2.4 Use the active loading location for direct scan payloads, retry payloads, fallback refresh queries, and refresh timing metadata.
- [x] 2.5 Keep drop-detail loading scoped by `loadingEntry.locationId` and leave Select Category handoff unchanged.

## 3. Verification and Memory

- [x] 3.1 Run the focused Loading page spec.
- [x] 3.2 Run `bun run check`.
- [x] 3.3 Run `bun run test:unit -- --run` if the focused spec and check pass.
- [x] 3.4 Run Memory Impact Analysis and update `docs/current-context.md`, `docs/project-state.yaml`, and `docs/decisions.md` if the implementation changes durable workflow behavior.
