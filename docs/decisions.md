# Decisions

Use this file as the append-only ADR-style log for durable repo decisions. Add new entries at the top and keep older entries intact.

## 2026-05-14 - Loading counters use additive barcode-derived endpoint when available

- Tags: product, loading, backend-contract, legacy-dst, reliability
- Decision: Loading counter cards now use a matching barcode-derived active-drop payload from CustomerPortalAPI-PY `POST /api/barcode-update/loadview-barcode-counters` when available. The match key is `DropSheetID`, `LoadNumber`, `DSSequence`, and the Select Category route `LocationID`.
- Decision: If the barcode counter payload is missing or stale, the page falls back to active `LoadViewDetail` counters. The page still renders label-list visibility from selected-location `vwLoadLabelsUnion` rows and does not calculate counters directly from those rows in Svelte.
- Rationale: The confirmed Roll case `DropSheetID=27610`, `LoadNumber=05192026-0089`, `DSSequence=4`, `LocationID=1` has four visible unscanned barcode label units while legacy `LoadViewDetail` reports `0/0/0`. An additive read-only endpoint preserves shared SQL objects and makes the mismatch observable through returned legacy comparison values.
- Impacted areas: `src/lib/types/index.ts`, `src/lib/types/raw-dst.ts`, `src/lib/types/raw-dak.ts`, `src/lib/server/type-mappers.ts`, `src/lib/server/dst-queries.ts`, `src/lib/load-view.remote.ts`, `src/lib/server/dak-scan.spec.ts`, `src/routes/(app)/loading/+page.svelte`, `src/routes/(app)/loading/loading-page.svelte.spec.ts`, `/Users/andresdominicci/Projects/CustomerPortalAPI-PY/src/barcode_module/routes/barcode_update.py`, `/Users/andresdominicci/Projects/CustomerPortalAPI-PY/tests/barcode_module/test_process_loading_scan_v2.py`
- Supersedes/refines: `2026-05-14 - Loading union labels can render when detail counters are zero` by changing counter-card source from always-legacy to barcode-derived when an exact active-drop payload exists.
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes

## 2026-05-14 - Loading drop counter is bottom docked

- Tags: design-system, loading, iPad, workflow-ui
- Decision: The Loading workflow panel fills the available iPad viewport height, and the active drop counter bar is a flex bottom dock inside that panel. The label list scrolls above the dock so `Drop X of Y`, previous/next arrows, and Labels/Scanned/Need Pick cards stay reachable.
- Rationale: Operators need the active drop navigation and counters visible even when a drop has only a few labels. A fixed-height work surface also avoids leaving the footer controls floating above empty page space.
- Impacted areas: `src/routes/(app)/loading/+page.svelte`, `src/routes/(app)/loading/loading-page.svelte.spec.ts`, `docs/project-state.yaml`, `docs/current-context.md`, `docs/design.md`, `docs/ui-reference/tokens.md`, `docs/ui-reference/screen-map.md`
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes

## 2026-05-14 - Loading union labels can render when detail counters are zero

- Tags: product, loading, legacy-dst, backend-contract, reliability
- Decision: The Loading label list uses selected-location `vwLoadLabelsUnion` rows as the visibility source. If that union list returns unscanned rows for the Select Category route `locationId`, the page renders those rows even when the active `LoadViewDetail` row reports `LabelCount = 0`, `Scanned = 0`, and `NeedPick = 0`.
- Decision: The Loading counter cards remain sourced from `LoadViewDetail` and are not recalculated from union labels. CustomerPortalAPI-PY combined post-scan refresh now uses the request `LocationID` for the `vwLoadLabelsUnion` query and `load_view_union_key.location_id`, while still using the clamped detail row for `LoadNumber` and `DSSequence`.
- Rationale: Access binds counters to `qryPassThroughPick`/`LoadViewDetail` while the subform label grid reads `vwLoadLabelsUnion`; FlutterFlow uses the same split with separate detail and union API calls. Keeping that split prevents valid legacy label rows from being hidden and avoids introducing a second frontend counter implementation.
- Impacted areas: `src/routes/(app)/loading/+page.svelte`, `src/routes/(app)/loading/loading-page.svelte.spec.ts`, `/Users/andresdominicci/Projects/CustomerPortalAPI-PY/src/barcode_module/routes/barcode_update.py`, `/Users/andresdominicci/Projects/CustomerPortalAPI-PY/tests/barcode_module/test_process_loading_scan_v2.py`, `openspec/specs/loading-location-label-scope/spec.md`, `docs/project-state.yaml`, `docs/current-context.md`, `docs/architecture.md`, `docs/prd.md`, `agile_plan/stage-load-implementation-plan.md`
- Supersedes/refines: the 2026-05-08 selected route location decision by clarifying that the selected location also governs combined refresh keys and that union list visibility takes precedence over zero detail counters.
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes

## 2026-05-13 - Complete Load uses live loading progress, not AllLoaded flag

- Tags: product, loading, select-category, complete-load, reliability
- Decision: Select Category displays `Complete Load` only when every live loading category with labels is scanned to 100% and every dropsheet department status is closed as `NA` or `DONE`. If live category availability is unavailable or contains no loading categories with labels, the carried dropsheet `percentCompleted >= 1` value may be used as the loaded signal.
- Rationale: The category availability `allLoaded` flag can remain false before the operator presses `Complete Load`, even when the load is operationally fully loaded and all departments are closed. Using that flag hid the action on valid completed loads.
- Impacted areas: `src/lib/complete-load-readiness.ts`, `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`, related specs, `openspec/specs/complete-load-readiness/spec.md`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: requiring category availability `allLoaded=true` as the loaded signal for Complete Load visibility.
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes

## 2026-05-12 - Complete Load requires allLoaded and closed department statuses

- Tags: product, loading, select-category, complete-load, reliability
- Decision: Select Category displays `Complete Load` only when category availability reports `allLoaded=true` and every dropsheet department status is closed as `NA` or `DONE`. Any `DUE`, `READY`, `WAIT`, `STOP`, `BOT`, `BOL`, blank/null, or unavailable status data hides the action.
- Rationale: Percent complete can reach 100 while a department still reports `DUE`. Operators must not be offered the completion action unless both the all-loaded flag and department statuses prove the load is closed out.
- Impacted areas: `src/lib/complete-load-readiness.ts`, `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`, related specs, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: using `percentCompleted === 1` as the Complete Load display gate.
- Superseded by: 2026-05-13 decision to use live loading-category progress instead of category availability `allLoaded`.
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes

## 2026-05-12 - Operational loader pickers use active loaders only

- Tags: product, loading, dropsheets, loader-picker, legacy-dst
- Decision: Operator-facing loader picker options for Dropsheets and Select Category Loading entry are derived from loader lookup rows where `isActive === true`. Inactive loader rows may remain visible as historical assigned values, but they are not selectable for new dropsheet assignments or new Loading sessions.
- Rationale: Dropsheets already matched the expected behavior, while Select Category exposed old inactive names in the Loading modal. Legacy Access also builds the loader popup from `tlkLoader Where IsActive=True`.
- Impacted areas: `src/lib/loader-options.ts`, `src/routes/(app)/dropsheets/+page.svelte`, `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`, related specs, `docs/project-state.yaml`, `docs/current-context.md`
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes

## 2026-05-08 - Loading route location remains authoritative for labels and scans

- Tags: product, loading, legacy-dst, reliability
- Decision: Loading uses the route `locationId` selected from Select Category as authoritative for union-label query keys, `getLoadViewUnion`, visible label filtering, scan payloads, retry payloads, and fallback refresh metadata. Returned drop-detail `LocationID` no longer overrides it.
- Rationale: Operators saw Wrap labels while in Roll. Legacy FlutterFlow passes widget `locationID` through the label lookup, and the selected route location is the reliable department/location handoff. Detail rows can carry a different `LocationID`.
- Impacted areas: `src/routes/(app)/loading/+page.svelte`, `src/routes/(app)/loading/loading-page.svelte.spec.ts`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes/refines: `2026-04-29 - Filter Loading labels by legacy LocationID, not CategoryID` by clarifying that the active loading location is the selected route location, not the returned detail-row location.
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; retrieval memory updated in this turn

## 2026-05-07 - Complete Load splits notify and repair transfer labels visibly

- Tags: backend-contract, loading, complete-load, transfer, ux
- Decision: Complete Load now runs two awaited remote commands: `sendLoadedNotification` posts dakview-web `POST /v1/logistics/dropsheet-notify`, then `exportTransferLabels` posts `POST /v1/logistics/dropsheet-transfer-label-export` only when Select Category has `transfer=true`. The transfer export uses `{ dropsheet_id, mode: "repair_missing_target" }`, active-target `X-Db`, and `Y-Db: AZURE`.
- Decision: The Complete Load modal stays open while processing, disables controls, shows `Sending E-mails. Please wait...` during notify, then switches to `This is a transfer order. Creating labels. Please wait...` during transfer export.
- Rationale: The backend can repair source orders already marked `ExportedPackages = 1` but missing Azure proxy label rows. Splitting the frontend calls makes the long-running flow understandable to operators without moving to unsafe in-process fire-and-forget work.
- Impacted areas: `src/lib/server/dak-loading-complete.ts`, `src/lib/loading-complete.remote.ts`, `src/lib/server/proxy.ts`, `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`, related specs, `docs/project-state.yaml`, `docs/current-context.md`, `docs/architecture.md`
- Supersedes: frontend transfer export using `mode: "pending"` from the single Complete Load command
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; backend contract and retrieval memory updated in this turn

## 2026-05-01 - Transfer Complete Load exports labels through dedicated endpoint

- Tags: backend-contract, loading, complete-load, transfer
- Decision: Complete Load keeps the normal loaded notification call to dakview-web `POST /v1/logistics/dropsheet-notify`. When the carried Select Category `transfer` flag is true, the same remote command then calls dakview-web `POST /v1/logistics/dropsheet-transfer-label-export` with `{ dropsheet_id, mode: "pending" }`, active-target `X-Db`, and `Y-Db: AZURE`.
- Rationale: Transfer label export was moved out of dropsheet notify into a dedicated FastAPI endpoint. Running it only for transfer dropsheets preserves the normal load-completion flow while avoiding duplicate emails if export needs retry after notification succeeds.
- Impacted areas: `src/lib/server/dak-loading-complete.ts`, `src/lib/loading-complete.remote.ts`, `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`, related specs, `docs/project-state.yaml`, `docs/current-context.md`, `docs/architecture.md`, `docs/prd.md`
- Supersedes: relying on `/v1/logistics/dropsheet-notify` to export transfer labels
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; backend contract and retrieval memory updated in this turn

## 2026-05-01 - Dropsheet transfer flag is carried into Select Category

- Tags: backend-contract, dropsheets, select-category, transfer
- Decision: Frontend dropsheet records include a boolean `transfer` field from dakview-web dropsheet JSON. Dropsheets passes `transfer=true|false` when navigating to Select Category, Select Category exposes it in page data, and Select Category return URLs preserve the flag for downstream Loading handoffs.
- Rationale: The FastAPI dropsheet list now returns transfer status from the dropsheet source, and later workflow routes need the value without re-querying or losing it during route transitions.
- Impacted areas: `src/lib/types/index.ts`, `src/lib/types/raw-dst.ts`, `src/lib/server/type-mappers.ts`, `src/routes/(app)/dropsheets/+page.svelte`, `src/routes/(app)/select-category/[dropsheetId]/+page.server.ts`, `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`, related specs, `docs/project-state.yaml`, `docs/current-context.md`
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; retrieval memory updated in this turn

## 2026-05-01 - Trailer picker updates through dakview-web dropsheet trailer endpoint

- Tags: backend-contract, dropsheets, trailer-picker, dak-web
- Decision: Dropsheets trailer selection now calls dakview-web `POST /v1/logistics/dropsheet-trailer-update` with the active target database header and a payload containing `DropSheetID`, `trailer_id`, `trailer_name`, and `trailer_url`. The existing DST trailer update helper remains available for legacy code, but the trailer picker command uses the dak-web endpoint.
- Rationale: Trailer equipment identities come from dakview-web equipment rows, including string IDs and optional `photo_url`, and the backend now owns a narrow update endpoint for the matching `dbo.tblDropSheetMain` trailer fields.
- Impacted areas: `src/lib/server/dak-equipment.ts`, `src/lib/trailers.remote.ts`, `src/routes/(app)/dropsheets/+page.svelte`, related specs, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the browse-only portion of `2026-05-01 - Trailer lookup reads from dakview-web EQUIPMENT database`
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; retrieval memory updated in this turn

## 2026-05-01 - Trailer lookup reads from dakview-web EQUIPMENT database

- Tags: backend-contract, dropsheets, trailer-picker, dak-web
- Decision: Dropsheets trailer picker options now come from dakview-web `GET /v1/lookup-tables/equipments` with `X-Db: EQUIPMENT`, `equipment_category=Trailers`, and `location=<active target>`. The original browse-only limitation is superseded by the live dak-web update endpoint decision above.
- Rationale: Trailer equipment is now sourced from a separate equipment database, not CustomerPortalAPI-PY/DST trailer lookup tables. The operator still needs location-scoped options for the selected app target, but the SQL connection target must be `EQUIPMENT`.
- Impacted areas: `src/lib/server/proxy.ts`, `src/lib/server/dak-equipment.ts`, `src/lib/trailers.remote.ts`, `src/lib/trailers.cached.ts`, `src/lib/components/workflow/selection-modal.svelte`, `src/routes/(app)/dropsheets/+page.svelte`, related specs, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the assumption that Dropsheets trailer options are read from CustomerPortalAPI-PY/DST `get-trailers`
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; retrieval memory updated in this turn

## 2026-04-30 - Use centered modals for operational selection flows

- Tags: design-system, modal, iPad, workflow-ui
- Decision: Operator-facing modal flows use centered dialogs with viewport-constrained height and no drag handle. This supersedes the earlier bottom-sheet modal guidance from the compact iPad Operational UI rollout.
- Rationale: The current iPad workflow screenshots and operator feedback show bottom sheets occupying too much vertical context and making selections feel less like the previous app. Centered dialogs restore the expected interaction model while keeping compact DS radii, touch targets, and card density.
- Impacted areas: `docs/design.md`, `docs/ui-reference/*`, `src/app.css`, shared workflow modal components and specs
- Supersedes: the bottom-sheet selection-flow portion of `2026-04-30 - Adopt compact iPad Operational UI system`
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes

## 2026-04-30 - Adopt compact iPad Operational UI system

- Tags: design-system, scanner-ux, iPad, workflow-ui
- Decision: Operator-facing workflow screens use the compact iPad Operational design system for layout density, DS color tokens, 56px top bars, 10-12px radii, always-visible scan inputs, bottom-sheet selections, department status pills, loading drop counters, and barcode-only scanned item cards. Existing workflow references still decide what content and actions appear on each screen.
- Rationale: The prior operational UI overused wide radii, nested cards, decorative glass/blur, and excessive padding. The shared iPad scanning device benefits from denser, clearer, top-to-bottom workflow surfaces with large touch targets and fewer decorative layers.
- Impacted areas: `docs/design.md`, `docs/ui-reference/*`, `src/app.css`, `src/routes/(app)/+layout.svelte`, `src/routes/(app)/home/+page.svelte`, `src/routes/(app)/staging/+page.svelte`, `src/routes/(app)/loading/+page.svelte`, shared workflow components and specs
- Supersedes: the older “Industrial Precisionist” operational guidance that treated 24-32px cards, glass headers, and lavender grouping panels as the default for scanner workflows
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; design docs and retrieval memory updated in this turn

## 2026-04-29 - Loading location modal accepts any driver location

- Tags: product, loading, legacy-dst, location-selection
- Decision: The Loading page opens the shared location modal with `driverLocationOnly`, making it scan-only and accepting numeric drop areas when the legacy lookup returns `DriverLocation: true`. This explicit mode does not use the department-filtered location list and does not require `WrapLocation`, `PartLocation`, `RollLocation`, or `LoadLocation`.
- Rationale: Legacy Loading only validates that a numeric location exists and is a driver location. A live DST lookup for drop area `25` returned `DriverLocation: true` with all department/load flags false, so the prior department/load support check incorrectly rejected a valid driver location.
- Impacted areas: `src/lib/components/workflow/staging-location-modal.svelte`, `src/lib/components/workflow/staging-location-modal.svelte.spec.ts`, `src/routes/(app)/loading/loading-page.svelte.spec.ts`, `src/routes/(app)/move-orders/[dropsheetId]/move-orders-page.svelte.spec.ts`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the implicit assumption that the shared modal can use department location filters for Loading location selection
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; retrieval memory updated in this turn

## 2026-04-29 - Filter Loading labels by legacy LocationID, not CategoryID

- Tags: product, loading, legacy-dst, reliability
- Decision: Keep the existing DST `load-labels-union-view` endpoint call unchanged, but render Loading labels by the legacy loading `LocationID` contract. The visible list keeps only rows whose returned `LocationID` matches the active drop and `scanned === false`; it does not use `CategoryID` as a department guard.
- Rationale: A live DST check for load `04302026-1258` showed valid unscanned Roll and Parts rows returning with the correct `LocationID` and `CategoryID: 0`. Filtering by the prior category mapping hid those rows and incorrectly showed the completed message while `LabelCount`/`NeedPick` still showed pending work.
- Impacted areas: `src/lib/workflow/loading-entry.ts`, `src/routes/(app)/loading/+page.svelte`, `src/routes/(app)/loading/loading-page.svelte.spec.ts`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: `2026-04-29 - Guard loading labels by active department category`
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; retrieval memory updated in this turn

## 2026-04-29 - Show selected Loading driver location in the header

- Tags: product, loading, scanner-ux, confirmation
- Decision: When a Loading numeric driver-location scan succeeds, append the selected location label to the Loading route title, for example `Loading Roll Dezzirae - Location 1`, while the location remains selected.
- Rationale: Operators need confirmation that subsequent Loading label scans are being applied to the intended driver location. Reusing the existing `currentDropArea` workflow state keeps the display tied to the same source used for scan submissions and preserves existing Roll location-clearing behavior.
- Impacted areas: `src/routes/(app)/+layout.svelte`, `src/routes/(app)/app-layout-workflow-sync.svelte.spec.ts`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the prior Loading header title behavior that showed department and loader but not the active scanned driver location
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; retrieval memory updated in this turn

## 2026-04-29 - Keep loading scans sequential but queue input during refresh

- Tags: product, loading, scanner-ux, reliability
- Decision: Keep Loading scan mutations and post-scan refreshes strictly sequential, but do not disable the main scanner input while `isScanning`; instead queue up to five raw scan texts and drain them after the current scan plus detail/union refresh has settled.
- Rationale: DAK-245 scan-speed feedback points to a perceived 2-3 second dead window while the frontend waits on the mutation and refreshes. The safer production change is to preserve the existing backend contract and refresh-driven drop movement while preventing hardware scanner input from being dropped during that window.
- Impacted areas: `src/routes/(app)/loading/+page.svelte`, `src/routes/(app)/loading/loading-page.svelte.spec.ts`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the implicit assumption that `isScanning` should disable the main Loading scan input until all follow-up refresh work completes
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; retrieval memory updated in this turn

## 2026-04-29 - Guard loading labels by active department category

- Status: Superseded by `2026-04-29 - Filter Loading labels by legacy LocationID, not CategoryID`.
- Tags: product, loading, legacy-dst, reliability
- Decision: Keep the existing DST union endpoint call unchanged, but filter the Loading page's visible unscanned label list by the active loading department category mapping before rendering labels.
- Rationale: DAK-245 showed wrong-department rows appearing in Loading on shared iPads. The endpoint may return mixed union rows, and the operator surface should not rely solely on backend filtering when the active department is already known from the loader session.
- Impacted areas: `src/lib/workflow/loading-entry.ts`, `src/routes/(app)/loading/+page.svelte`, `src/routes/(app)/loading/loading-page.svelte.spec.ts`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the implicit assumption that `load-labels-union-view` always returns only rows for the selected loading department
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; retrieval memory updated in this turn

## 2026-04-16 - Fetch target-sensitive lookup lists fresh in the browser

- Tags: runtime, sveltekit, caching, reliability
- Decision: Do not browser-cache operator-facing loaders, trailers, or drop-area lookup lists. Keep the target qualifier in the remote `query(...)` input, but fetch fresh remote query state whenever those wrappers are used.
- Rationale: The target-key fix prevents cross-target query reuse, but the browser-cache layer still adds complexity to small lookup lists whose payloads are cheap to fetch. The production staging-location hang was enough evidence that reliability is more valuable here than shaving a small repeated-open latency.
- Impacted areas: `src/lib/loaders.cached.ts`, `src/lib/trailers.cached.ts`, `src/lib/drop-areas.cached.ts`, `src/lib/target-scoped-lookups.spec.ts`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the assumption that loaders, trailers, and drop-area lists should always hydrate from browser cache on the client
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; the lookup-fetch rule now lives in the memory bundle and this decision log

## 2026-04-16 - Scope target-sensitive lookup queries by serialized input

- Tags: runtime, sveltekit, caching, targeting
- Decision: Any lookup whose server result depends on the active target must include a target qualifier in the remote `query(...)` input itself, not only in browser cache keys.
- Rationale: SvelteKit client query instances are keyed by serialized query arguments. The staging location selector was hanging only on deployed Vercel because loaders, trailers, and drop-area lookups reused the same reactive query instance across target changes even though their browser cache entries were target-scoped.
- Impacted areas: `src/lib/loaders.cached.ts`, `src/lib/trailers.cached.ts`, `src/lib/drop-areas.cached.ts`, `src/lib/loaders.remote.ts`, `src/lib/trailers.remote.ts`, `src/lib/drop-areas.remote.ts`, `src/lib/target-scoped-lookups.spec.ts`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the implicit assumption that target-scoped browser cache keys were sufficient to isolate target-sensitive lookup state on the client
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; the lookup-key rule now lives in the memory bundle and this decision log

## 2026-04-29 - Use `readRemoteQuery` for imperative remote query reads

- Tags: runtime, sveltekit, remote-functions
- Decision: Imperative browser reads from SvelteKit remote `query(...)` helpers must go through `src/lib/remote-query-read.ts` instead of calling `.run()` directly or hand-awaiting a fresh query object inline.
- Rationale: The installed `@sveltejs/kit@2.55.0` runtime/types in this repo expose remote queries as promise-like resources with `refresh`, `set`, and `withOverride`, but no public `.run()`. On Select Category, that mismatch surfaced as `getNumberOfDrops(...).run is not a function` and blocked the loader handoff into Loading. The shared helper preserves compatibility if a future dependency exposes `.run()` while keeping the current installed contract working.
- Impacted areas: `src/lib/remote-query-read.ts`, `src/lib/components/workflow/will-call-scan-modal.svelte`, `src/lib/components/workflow/staging-location-modal.svelte`, `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`, related component specs, `docs/project-state.yaml`, `docs/current-context.md`, `docs/architecture.md`
- Supersedes: the 2026-04-16 blanket rule to call `.run()` directly for imperative remote query reads
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; the compatibility helper rule now lives in the memory bundle and architecture notes

## 2026-04-16 - Use `.run()` for imperative remote query reads

- Tags: runtime, sveltekit, remote-functions
- Decision: Treat SvelteKit remote `query(...)` helpers as reactive resources by default, and call `.run()` whenever a client event handler, modal submit action, or other imperative flow needs a one-off read.
- Rationale: The production select-category loading handoff stalled after local UI updates because imperative code awaited the query object directly. Current SvelteKit remote-function guidance requires `.run()` for non-reactive one-off reads, and the remaining audited hotspots followed the same unsupported pattern.
- Impacted areas: `src/lib/components/workflow/will-call-scan-modal.svelte`, `src/lib/components/workflow/staging-location-modal.svelte`, `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`, `src/lib/components/workflow/will-call-scan-modal.svelte.spec.ts`, `src/lib/components/workflow/staging-location-modal.svelte.spec.ts`, `src/routes/(app)/home/home-page.svelte.spec.ts`, `src/routes/(app)/staging/staging-page.svelte.spec.ts`, `src/routes/(app)/loading/loading-page.svelte.spec.ts`, `src/routes/(app)/move-orders/[dropsheetId]/move-orders-page.svelte.spec.ts`, `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the implicit assumption that remote `query(...)` helpers were safe to `await` directly inside imperative browser code as long as they happened to work in local preview
- Superseded by: 2026-04-29 `readRemoteQuery` compatibility helper rule, after the installed SvelteKit runtime/types proved `.run()` is not public in this worktree
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; the rule now lives in the memory bundle and this decision log

## 2026-04-16 - Enable async mode for remote functions and sanitize operator errors

- Tags: runtime, sveltekit, product, safety
- Decision: Keep `kit.experimental.remoteFunctions` enabled only together with `compilerOptions.experimental.async` in `svelte.config.js`. Route operator-facing remote-query errors through a shared helper that falls back to safe copy when the error message is a Svelte framework/runtime URL or `experimental_async_required`.
- Rationale: The official SvelteKit remote-functions docs require both config flags, and the production failure was the Svelte runtime guard emitted from `hydratable(...)` when async mode was missing. Raw framework URLs are not useful to operators and should not surface in task panels or banners.
- Impacted areas: `svelte.config.js`, `src/lib/operator-error.ts`, `src/lib/components/workflow/staging-list-panel.svelte`, `src/lib/components/workflow/staging-location-modal.svelte`, `src/routes/(app)/loaders/+page.svelte`, `src/routes/(app)/dropsheets/+page.svelte`, `src/routes/(app)/loading/+page.svelte`, `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`, `src/routes/(app)/order-status/[dropsheetId]/+page.svelte`, `src/routes/(app)/move-orders/[dropsheetId]/+page.svelte`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the implicit assumption that `kit.experimental.remoteFunctions` alone was enough for remote-function compilation and that `query.error.message` was always safe to render directly
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; the runtime guardrail is now captured in the memory bundle and this decision log

## 2026-04-10 - Treat Complete Load post-send sync failures as warnings

- Tags: product, loading, backend-contract
- Decision: Keep the legacy Complete Load request payload unchanged, but interpret dak-web `type="loaded"` responses with `post_send_sync.status = failed` as partial success on the frontend instead of surfacing them as total failure.
- Rationale: The backend now confirms that notifications may already be sent before the post-send order sync step fails. Showing a hard failure at that point encourages operators to retry and risks duplicate customer or driver emails.
- Impacted areas: `src/lib/server/dak-loading-complete.ts`, `src/lib/server/dak-loading-complete.spec.ts`, `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`, `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the prior assumption that any non-warning Complete Load problem should be shown as `Unable to complete loading.` regardless of whether the backend had already sent notifications
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; retrieval memory updated in this turn

## 2026-04-10 - Start loading on the final drop and navigate backward

- Tags: product, loading, workflow
- Decision: Change the loading workflow to open on the last available drop and make the footer navigation follow reverse numeric order so `Next` moves to lower-numbered drops while `Previous` moves to higher-numbered drops.
- Rationale: Operators are loading trucks from the tail end first, and starting on the final drop removes the extra taps previously required to reach the working position. The requested floor behavior is more important here than preserving the legacy FlutterFlow starting point.
- Impacted areas: `src/lib/workflow/loading-drop-navigation.ts`, `src/lib/workflow/loading-drop-navigation.spec.ts`, `src/routes/(app)/loading/+page.svelte`, `src/routes/(app)/loading/loading-page.svelte.spec.ts`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the prior assumption that loading should always initialize on drop `1` and progress upward with the `Next` button
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; retrieval memory updated in this turn

## 2026-04-10 - Scope nested staging location filters to Freeport Roll only

- Tags: product, staging, freeport
- Decision: Add a second location-tab row only when the staging selector is opened for the Freeport Roll workflow. The first tab row remains the existing first-letter grouping, and the second row uses `All` plus second-letter buckets derived from location names while ignoring dashes.
- Rationale: Freeport Roll has enough location density that first-letter grouping alone still produces excessive scrolling, but broadening the nested filter to all targets or departments would add behavior beyond the confirmed user request and increase regression risk.
- Impacted areas: `src/lib/components/workflow/staging-location-modal.svelte`, `src/lib/components/workflow/staging-location-modal.svelte.spec.ts`, `src/routes/(app)/staging/staging-page.svelte.spec.ts`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the prior assumption that all staging location selection uses only a single tab row
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; retrieval memory updated in this turn

## 2026-04-01 - Restore Will Call as a live migrated workflow

- Tags: product, workflow, legacy-parity
- Decision: Reproduce the missing `DAK-220` Will Call flow additively on `dev` by restoring the home entry point, dropsheet handoff flagging, legacy DST lookup/signature helpers, and the select-category signature action without removing current worktree changes.
- Rationale: Linear marked `DAK-220` done, but the original feature branch and PR were closed without merge, leaving the repo in a contradictory state where docs and tests partially assumed Will Call existed while the runtime still disabled it.
- Impacted areas: `src/routes/(app)/home/+page.svelte`, `src/routes/(app)/dropsheets/+page.svelte`, `src/routes/(app)/select-category/[dropsheetId]/*`, `src/lib/server/dst-queries.ts`, `src/lib/server/type-mappers.ts`, `docs/project-state.yaml`, `docs/current-context.md`
- Supersedes: the temporary assumption that Will Call should stay visible but disabled in the migrated surface
- `project-state.yaml` updated: yes
- Folded into long-lived docs: partial; retrieval memory is updated in this turn and broader product docs still need a separate pass if they continue to describe Will Call as Phase 2

## 2026-04-01 - Make Memory Impact Analysis mandatory

- Tags: process, freshness, docs
- Decision: After any repo-tracked change or issue-scope change, run Memory Impact Analysis before considering the task complete.
- Rationale: The repo's weakest failure mode is silent staleness after small changes that never make it into the retrieval bundle.
- Impacted areas: `AGENTS.md`, `README.md`, `docs/project-state.yaml`, `docs/current-context.md`, `docs/decisions.md`
- Supersedes: ad hoc doc refreshes performed only at ticket or PR boundaries
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; the standing rule is recorded in `AGENTS.md`

## 2026-04-01 - Use a hybrid retrieval model

- Tags: process, retrieval, git, linear
- Decision: Treat versioned repo docs as canonical memory, while Git and Linear act as freshness sensors rather than co-equal truth stores.
- Rationale: Fresh contexts need a stable center of gravity, but they also need a way to detect when repo memory no longer reflects the branch or issue reality.
- Impacted areas: `docs/project-state.yaml`, `docs/current-context.md`, `docs/decisions.md`
- Supersedes: relying on conversation history or dated handoff prompts as the primary source of current context
- `project-state.yaml` updated: yes
- Folded into long-lived docs: partial; captured in the new memory bundle and README catch-up order

## 2026-04-01 - Adopt a structured retrieval memory bundle

- Tags: process, retrieval, docs
- Decision: Use `docs/project-state.yaml` as the canonical fast-reload record, `docs/current-context.md` as the rolling handoff, and `docs/decisions.md` as the durable decision log.
- Rationale: Current project truth was previously split across AGENTS, narrative docs, dated handoffs, Linear, and Git, which made fresh-session catch-up too expensive and too easy to get wrong.
- Impacted areas: `AGENTS.md`, `README.md`, `docs/project-state.yaml`, `docs/current-context.md`, `docs/decisions.md`
- Supersedes: `docs/handoffs/*.md` as the default reload surface
- `project-state.yaml` updated: yes
- Folded into long-lived docs: partial; `AGENTS.md` and `README.md` were updated while product and architecture docs remain unchanged because runtime behavior did not change
