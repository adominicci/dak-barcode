# Current Context

## 2026-05-14 Loading Barcode-Derived Counter Endpoint

- Current worktree: `features/add-loading-barcode-counter-endpoint`; backend companion branch in `/Users/andresdominicci/Projects/CustomerPortalAPI-PY` uses the same branch name.
- Root cause: the confirmed Roll case `DropSheetID=27610`, `LoadNumber=05192026-0089`, `DSSequence=4`, `LocationID=1` returns four selected-location unscanned label units from `vwLoadLabelsUnion`/`qryBarcode`, while legacy `LoadViewDetail` counters remain `0/0/0`.
- CustomerPortalAPI-PY now has additive read-only `POST /api/barcode-update/loadview-barcode-counters`. It verifies the active `LoadViewDetail` context, groups matching `qryBarcode` rows by `LPID` and `LabelNumber`, returns barcode counters plus legacy comparison values, and leaves shared SQL objects unchanged.
- Loading now queries barcode counters for the active drop using selected route `locationId`. Counter cards use those values only when `DropSheetID`, `LoadNumber`, `DSSequence`, and `LocationID` match the active drop; stale/missing payloads fall back to `LoadViewDetail`.
- Successful combined loading scan refreshes can carry `load_view_barcode_counters`, letting Loading update Labels/Scanned/Need Pick without an extra post-scan counter request.
- PR #65 review hardening: frontend rejects barcode counter responses missing usable `LoadNumber`; separate post-scan counter refresh failures are swallowed inside the optional counter refresh so detail/union refreshes still settle before queued scans drain.
- Focused regressions added/updated:
  - `src/lib/server/type-mappers.spec.ts`
  - `src/lib/server/dst-queries.spec.ts`
  - `src/lib/server/dak-scan.spec.ts`
  - `src/routes/(app)/loading/loading-page.svelte.spec.ts`
  - `/Users/andresdominicci/Projects/CustomerPortalAPI-PY/tests/barcode_module/test_process_loading_scan_v2.py`
- Verification completed so far:
  - red backend run confirmed missing endpoint/combined-refresh payload
  - `pytest tests/barcode_module/test_process_loading_scan_v2.py -q` in CustomerPortalAPI-PY
  - red frontend run confirmed missing mapper/query/page counter wiring
  - `bun run test:unit -- --run src/lib/server/type-mappers.spec.ts src/lib/server/dst-queries.spec.ts src/lib/server/dak-scan.spec.ts 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`
  - `bun run test:unit -- --run`
  - `bun run check`
  - `npx @sveltejs/mcp svelte-autofixer './src/routes/(app)/loading/+page.svelte' --svelte-version 5`
  - Dockerized CustomerPortalAPI-PY `POST http://localhost:3002/api/barcode-update/loadview-barcode-counters?db=Canton` for `27610 / 05192026-0089 / 4 / 1` returned barcode `4/0/4`, legacy `0/0/0`, and `CounterMismatch=true`
- Memory Impact Analysis: update required because durable Loading counter source and backend contract changed; PR #65 review added reliability constraints for optional counter refresh and response identity validation. Updated current-context, project-state, decisions, architecture, and PRD.

## 2026-05-14 Loading Counter Bottom Dock

- Current worktree: `dev`.
- Root cause: the Loading work panel used only a max-height constraint, so the panel shrink-wrapped short label lists and left the `Drop X of Y`, previous/next arrows, and Labels/Scanned/Need Pick cards floating above unused page space.
- Loading now gives the workflow panel a fixed `calc(100dvh - 6.5rem)` height and wraps the drop counter bar in a flex bottom dock. The label list remains the scrollable region above the dock, keeping navigation and counters reachable on the shared iPad.
- Focused regression updated:
  - `src/routes/(app)/loading/loading-page.svelte.spec.ts`
- Verification completed:
  - red focused run confirmed the bottom dock was missing before implementation
  - `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts' --testNamePattern 'pins the active drop counter|constrains the loading workspace'`
  - `npx @sveltejs/mcp svelte-autofixer './src/routes/(app)/loading/+page.svelte' --async --svelte-version 5`
  - `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`
  - `bun run check`
- Memory Impact Analysis: update required because durable Loading iPad layout behavior changed. Updated current-context, project-state, decisions, and compact design references.

## 2026-05-14 Loading Union Labels With Zero Detail Counters

- Current worktree: `dev`; OpenSpec change archived as `openspec/changes/archive/2026-05-14-align-loading-label-list-with-legacy`.
- Root cause: Loading used `selectedDropDetail.labelCount === 0` as a hard empty-drop signal, but legacy Access and FlutterFlow render the label grid from `vwLoadLabelsUnion` independently from `LoadViewDetail` counters. This hid selected-location union rows when SQL detail counters were zero.
- Loading now shows unscanned union rows whose returned `LocationID` matches the Select Category route `locationId` even when the active detail row counters are `0/0/0`. The `Labels`, `Scanned`, and `Need Pick` counter cards still display the exact `LoadViewDetail` values and are not recalculated from union rows.
- CustomerPortalAPI-PY `_fetch_loading_refresh_payload` now uses the request `LocationID` for the post-scan `vwLoadLabelsUnion` query and `load_view_union_key.location_id`; it still uses the clamped selected detail row for `LoadNumber` and `DSSequence`.
- Focused regressions added/updated:
  - `src/routes/(app)/loading/loading-page.svelte.spec.ts`
  - `/Users/andresdominicci/Projects/CustomerPortalAPI-PY/tests/barcode_module/test_process_loading_scan_v2.py`
- Verification completed:
  - red focused frontend run confirmed the union label was hidden by the old empty-state rule
  - red focused backend run confirmed refreshed union keys used mismatched detail-row `LocationID`
  - `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`
  - `bun run check`
  - `bun run test:unit -- --run`
  - `python -m pytest tests/barcode_module/test_process_loading_scan_v2.py` in CustomerPortalAPI-PY
  - `openspec validate --all --strict`
- OpenSpec archived to `openspec/changes/archive/2026-05-14-align-loading-label-list-with-legacy` after syncing the delta into `openspec/specs/loading-location-label-scope/spec.md`.
- Memory Impact Analysis: update required because durable Loading label visibility and the combined refresh backend contract changed. Updated current-context, project-state, decisions, architecture, PRD, and the agile plan.

## 2026-05-13 Freeport Trailer Lookup Dirty Row Fix

- Current worktree: `dev`.
- Root cause: Freeport trailer lookup from dakview-web `GET /v1/lookup-tables/equipments?equipment_category=Trailers&location=Freeport` can include equipment rows with a blank/missing `id` or `equipment_name`; the frontend mapper threw on the first unusable row and turned the Dropsheets trailer picker into a page-level remote `500`.
- Trailer lookup still uses `X-Db: EQUIPMENT` and active app target as the `location` filter. The frontend now skips unusable equipment rows and returns the usable trailer options instead of failing the whole query.
- Focused regression updated:
  - `src/lib/server/dak-equipment.spec.ts`
- Verification completed:
  - red focused run reproduced `DAK route /v1/lookup-tables/equipments returned no usable equipment record`
  - `bun run test:unit -- --run src/lib/server/dak-equipment.spec.ts`
  - `bun run test:unit -- --run src/lib/server/dak-equipment.spec.ts src/lib/target-scoped-lookups.spec.ts 'src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts'`
- Memory Impact Analysis: update required because repo-tracked Dropsheets trailer lookup behavior changed. Updated current-context and project-state; backend contract remains unchanged.

## 2026-05-13 Complete Load Progress Gate Fix

- Current worktree: `features/complete-load-percent-gate`.
- Root cause: the 2026-05-12 readiness gate used category availability `allLoaded`, but that flag can remain false before the operator presses `Complete Load`; the live loading categories and Dropsheets row can already be 100%.
- Complete Load visibility now treats the load as fully scanned when every live loading category with labels is at 100%; if live category availability is unavailable or contains no loading categories with labels, it falls back to carried `percentCompleted >= 1`.
- The closed-status rule remains unchanged: all six dropsheet department statuses must be `NA` or `DONE`; any due, pending, blank, null, or unavailable department status hides the action.
- Focused regressions added/updated:
  - `src/lib/complete-load-readiness.spec.ts`
  - `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
- Verification completed:
  - red focused run confirmed the button was hidden when live category progress was 100% and `allLoaded=false`
  - `bun run test:unit -- --run src/lib/complete-load-readiness.spec.ts 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'`
- Memory Impact Analysis: update required because durable Complete Load readiness behavior changed. Updated current-context, project-state, decisions, and complete-load-readiness spec.

## 2026-05-12 Complete Load Readiness Gate

- Current worktree: `features/complete-load-readiness`; OpenSpec change archived as `openspec/changes/archive/2026-05-12-gate-complete-load-by-department-status`.
- Root cause: Select Category showed `Complete Load` when `percentCompleted === 1`, even if a department status still showed `DUE`.
- Superseded by the 2026-05-13 Complete Load progress gate fix: Complete Load visibility uses live loading-category progress instead of the category availability `allLoaded` flag, while still requiring all six dropsheet department statuses closed as `NA` or `DONE`.
- Existing Complete Load modal, notification, transfer-label export, warning, and return behavior remains unchanged after the action is legitimately visible.
- Focused regressions added/updated:
  - `src/lib/complete-load-readiness.spec.ts`
  - `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
- Verification completed:
  - red focused run confirmed missing helper and current rendering with `DUE`/non-closed/unavailable status
  - Svelte MCP docs/autofixer checked the touched Svelte derived/conditional rendering path
  - `bun run test:unit -- --run src/lib/complete-load-readiness.spec.ts 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'`
  - `bun run check`
  - `openspec validate --all --strict`
- OpenSpec archived to `openspec/changes/archive/2026-05-12-gate-complete-load-by-department-status` after syncing delta spec to `openspec/specs/complete-load-readiness/spec.md`.
- Memory Impact Analysis: update required because durable Loading completion behavior changed. Updated current-context, project-state, and decisions.

## 2026-05-12 Active Loader Picker Alignment

- Current worktree: `dev`; OpenSpec change `align-loading-loader-picker-active-list`.
- Root cause: Dropsheets filtered loader picker options to active loaders, but Select Category's Loading entry modal mapped the full loader lookup and exposed inactive/old names.
- Added shared `getActiveLoaderOptions` so Dropsheets and Select Category derive picker options from the same `isActive === true` rule.
- Focused regressions added:
  - `src/lib/loader-options.spec.ts`
  - `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
- Verification completed:
  - red focused run confirmed missing helper and inactive loader names appearing in the Select Category loader modal
  - Svelte MCP autofixer checked touched Dropsheets and Select Category Svelte snippets with no issues
  - `bun run test:unit -- --run src/lib/loader-options.spec.ts 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts' 'src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts'`
  - `bun run check`
  - `openspec validate --all --strict`
- OpenSpec archived to `openspec/changes/archive/2026-05-12-align-loading-loader-picker-active-list` after syncing delta spec to `openspec/specs/active-loading-loader-selection/spec.md`.
- Memory Impact Analysis: update required because durable operational loader-picker behavior changed. Updated current-context, project-state, and decisions.

## 2026-05-08 Loading Location Label Scope Fix

- Current worktree: `dev`; OpenSpec change `fix-loading-location-label-scope`.
- Root cause: Loading parsed the selected route location from Select Category but later used the returned drop-detail `LocationID` for union-label lookup/filtering and scan/retry payloads.
- Loading now treats `loadingEntry.locationId` as authoritative for label query keys, `getLoadViewUnion`, visible unscanned label filtering, direct scan requests, retry requests, and fallback refresh/log context.
- Legacy FlutterFlow confirmation: `LoadingWidget` uses widget `locationID` for `LoadLabelsUnionViewCall`; Select Category sends Wrap `2`, Parts `3`, and Roll `1`.
- Focused regressions added in `src/routes/(app)/loading/loading-page.svelte.spec.ts` for URL Roll `locationId=1` with detail row Wrap `locationId=2`, direct scan payload, and retry payload.
- Verification completed:
  - red focused regression run confirmed the old behavior sent/read `locationId=2`
  - `bunx vitest run 'src/routes/(app)/loading/loading-page.svelte.spec.ts' --testNamePattern 'selected route location|Roll labels'`
  - `bunx vitest run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`
  - Svelte MCP autofixer checked `src/routes/(app)/loading/+page.svelte` with no blocking issues
  - `bun run check`
  - `bun run test:unit -- --run`
- Memory Impact Analysis: update required because durable Loading workflow behavior changed. Updated current-context, project-state, and decisions.

## 2026-05-07 Complete Load Transfer Label Repair UX

- Current worktree: `features/complete-load-transfer-label-ux`.
- Complete Load now uses two awaited SvelteKit remote commands instead of one combined command:
  - `sendLoadedNotification` posts dakview-web `POST /v1/logistics/dropsheet-notify`.
  - `exportTransferLabels` posts dakview-web `POST /v1/logistics/dropsheet-transfer-label-export` only for `transfer=true`.
- Transfer label export now sends `{ dropsheet_id, mode: "repair_missing_target" }`, active-target `X-Db`, and `Y-Db: AZURE` so already-flagged source orders can repair missing Azure proxy labels.
- The Select Category Complete Load modal stays open while processing, disables controls, shows `Sending E-mails. Please wait...`, and switches to `This is a transfer order. Creating labels. Please wait...` during transfer export.
- `fetchDak` keeps the default 8s timeout but accepts a per-call `timeoutMs`; Complete Load notify uses 20s and transfer export uses 35s to surface Heroku router errors instead of timing out locally at 8s.
- Focused regressions updated:
  - `src/lib/server/dak-loading-complete.spec.ts`
  - `src/lib/server/proxy.spec.ts`
  - `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
- Verification completed:
  - Red run confirmed old pending-mode/export-single-command behavior and missing timeout override.
  - Targeted frontend tests passed after implementation.
  - Svelte MCP autofixer still reports the known `goto()`/`resolve()` advisory because `returnTo` may already be resolved.
  - `bun run check`
  - `bun run test:unit -- --run src/lib/server/dak-loading-complete.spec.ts src/lib/server/proxy.spec.ts 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'`
  - `bun run build`
- Memory Impact Analysis: update required because Complete Load runtime behavior and backend contract changed. Updated current-context, project-state, decisions, and architecture.

## 2026-05-04 PR54 Review Fixes

- Current worktree: `dev`; PR #54 promotes `dev` to `main`.
- Complete Load partial-success warnings now append actionable diagnostics when available:
  - `post_send_sync` errors or affected order numbers
  - `transferLabelExport.message`
- Dropsheets trailer lookup now requires an explicit active target. `getTrailers(null|undefined)` throws before calling the remote query so no caller silently receives Canton equipment options.
- Focused regressions updated:
  - `src/lib/target-scoped-lookups.spec.ts`
  - `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
- Verification completed:
  - Red run confirmed both review issues first.
  - `bun run test:unit -- --run src/lib/target-scoped-lookups.spec.ts`
  - `bun run test:unit -- --run 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'`
  - Svelte MCP autofixer checked Select Category and only reported the pre-existing `goto()`/`resolve()` advisory.
  - `bun run check`
  - `bun run test:unit -- --run`
  - `bun run build`
- Memory Impact Analysis: update required because repo-tracked runtime behavior changed. Updated current-context and project-state; no product or backend contract changed.

## 2026-05-01 Transfer Label Export on Complete Load

- Current worktree: `features/label-export`.
- Complete Load still sends the loaded notification through dakview-web `POST /v1/logistics/dropsheet-notify` first.
- The Complete Load remote command now requires the carried Select Category `transfer` boolean. When `transfer=true`, it calls dakview-web `POST /v1/logistics/dropsheet-transfer-label-export` after notification success with body `{ dropsheet_id, mode: "pending" }`.
- Transfer export uses the active app target as dak-web `X-Db` through `fetchDak` and adds `Y-Db: AZURE`; `repair_missing_target` is intentionally not used by the frontend.
- If notification succeeds but transfer export fails or returns skipped rows (`orders_skipped > 0`, including `reason="source_packages_missing"`), the command returns partial success. Select Category warns the operator and still exits to Dropsheets to avoid duplicate loaded emails from a retry.
- Focused regressions added or updated:
  - `src/lib/server/dak-loading-complete.spec.ts`
  - `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
- Verification completed:
  - Red run confirmed missing transfer validation/call forwarding and missing transfer export behavior.
  - `bun run test:unit -- --run src/lib/server/dak-loading-complete.spec.ts 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'`
  - Svelte MCP autofixer checked Select Category and only reported the pre-existing `goto()`/`resolve()` advisory.
  - `bun run check`
  - `bun run build`
- Memory Impact Analysis: update required because Complete Load backend behavior and the transfer endpoint contract changed. Updated current-context, project-state, decisions, architecture, and PRD.

## 2026-05-01 Dropsheet Transfer Flag Handoff

- Current worktree: `features/trailers`.
- dakview-web `GET /v1/logistics/get-dropsheets` now exposes `transfer` as a boolean in the dropsheet JSON contract. A direct unauthenticated Heroku `curl` for `2026-05-01` / Canton returned `401 Authorization header is required`, so the frontend change was verified through mapper and route-contract tests plus the local backend docs/source.
- The frontend `DropSheet` contract now includes `transfer: boolean`; DST/dak dropsheet mapping accepts lowercase `transfer` and falls back to legacy-style `Transfer`, defaulting to `false`.
- Dropsheets navigation to Select Category now always carries `transfer=true|false` in the query string.
- Select Category server load parses the carried `transfer` flag as a boolean and exposes it in page data. The Select Category return URL used by Loading also preserves the flag so back/forward workflow handoffs do not lose it.
- Focused regressions added or updated:
  - `src/lib/server/type-mappers.spec.ts`
  - `src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts`
  - `src/routes/(app)/select-category/[dropsheetId]/select-category-page.server.spec.ts`
  - `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
- Verification completed:
  - `bun run test:unit -- --run src/lib/server/type-mappers.spec.ts 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.server.spec.ts' 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts' 'src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts'`
  - Svelte MCP autofixer checked Dropsheets with no issues; Select Category reported one pre-existing `goto()`/`resolve()` advisory outside this transfer change.
  - `bun run check`
  - `bun run build`
- Memory Impact Analysis: update required because the dropsheet route contract and select-category handoff changed. Updated current-context, project-state, and decisions.

## 2026-05-01 Loading iPad Viewport Density

- Current worktree: `features/trailers`.
- Loading now constrains the active workflow panel to `calc(100dvh - 6.5rem)` with internal scrolling for the part-list area, so the iPad viewport does not need page-level scrolling just to reach the drop counter.
- Vertical density tightened in Loading: panel padding, context/action gaps, queue row, scan input height, part-list shell padding, scanned item cards, and drop counter controls.
- Shared workflow primitives touched for the density pass:
  - `src/lib/components/workflow/workflow-scan-field.svelte`
  - `src/lib/components/workflow/drop-counter-bar.svelte`
  - `src/lib/components/workflow/scanned-id-grid.svelte`
- Focused regression added:
  - `src/routes/(app)/loading/loading-page.svelte.spec.ts` verifies the viewport-constrained panel, internal scan-section flex behavior, compact queue/list shell, and smaller drop navigation controls.
- Verification completed:
  - `bun run test:unit -- --run src/lib/components/workflow/operational-design-components.svelte.spec.ts 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`
  - Svelte autofixer checked Loading and changed workflow components; no issues reported. Existing suggestions remain around pre-existing `$effect` function calls and `bind:this`.
  - `bun run check`
  - `bun run build`
- Memory Impact Analysis: update required because repo-tracked iPad Loading layout behavior changed. Updated current-context and project-state; no backend or workflow contract decision changed.

## 2026-05-01 Dropsheets iPad Load Number Column

- Current worktree: `features/trailers`.
- Dropsheets table layout now keeps the `Load Number` column visible at tablet/iPad widths instead of hiding it until the `xl` breakpoint.
- The table uses explicit column widths plus tighter cell padding/action sizing so delivery number, drop weight, load number, trailer, completed percent, loaded timestamp, completed checkbox, loader, and go action can stay on a single row in the iPad operational layout.
- Focused regression added:
  - `src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts` verifies the load-number header and row cell are not hidden.
- Verification completed:
  - `bun run test:unit -- --run 'src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts'`
  - `bun run test:unit -- --run src/lib/components/workflow/selection-modal.svelte.spec.ts 'src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts'`
  - Svelte MCP autofixer checked `src/routes/(app)/dropsheets/+page.svelte` with no issues
  - `bun run check`
  - `bun run build`
- Memory Impact Analysis: update required because repo-tracked iPad Dropsheets layout behavior changed. Updated current-context and project-state; no backend or workflow contract decision changed.

## 2026-05-01 Dropsheets Trailer Update Enabled

- Current worktree: `features/trailers`.
- The Dropsheets trailer picker is no longer browse-only.
- Selecting a trailer now calls dakview-web `POST /v1/logistics/dropsheet-trailer-update` through the SvelteKit proxy with the active app target as the dak-web `X-Db` header.
- The update payload sends `DropSheetID`, `trailer_id`, `trailer_name`, and `trailer_url`; the existing legacy DST update helper remains in place but is no longer used by the trailer picker command.
- Trailer lookup still reads equipment options from dakview-web `GET /v1/lookup-tables/equipments` with `X-Db: EQUIPMENT`, `equipment_category=Trailers`, and `location=<active target>`.
- Equipment `photo_url` is preserved as `photoUrl` on frontend trailer options so the update command can send `trailer_url` when present.
- Loader picker behavior remains unchanged.
- Focused regressions added or updated:
  - `src/lib/server/dak-equipment.spec.ts`
  - `src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts`
- Verification completed:
  - `bun run test:unit -- --run src/lib/server/dak-equipment.spec.ts 'src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts'`
  - `bun run test:unit -- --run src/lib/server/dak-equipment.spec.ts src/lib/target-scoped-lookups.spec.ts src/lib/components/workflow/selection-modal.svelte.spec.ts 'src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts'`
  - Svelte MCP autofixer checked `src/routes/(app)/dropsheets/+page.svelte` with no issues
- Memory Impact Analysis: update required because repo-tracked behavior changed from browse-only to live trailer update. Updated current-context, project-state, and decisions.

## 2026-05-01 Dropsheets Trailer Lookup From Equipment DB

- Current worktree: `features/trailers`.
- Dropsheets trailer picker options now come from dakview-web `GET /v1/lookup-tables/equipments`.
- The equipment lookup uses `X-Db: EQUIPMENT` because equipment lives in a separate database, while `location` remains the active app target (`Canton`, `Freeport`, or `Sandbox`) and `equipment_category` is fixed to `Trailers`.
- The frontend maps dakview-web equipment rows to trailer picker options with `id` from `id` and label from `equipment_name`, allowing longer equipment names such as `16208-Transfer Trailer`.
- Superseded by `2026-05-01 Dropsheets Trailer Update Enabled`: trailer selection now updates through dakview-web instead of rendering browse-only.
- Focused regressions added or updated:
  - `src/lib/server/dak-equipment.spec.ts`
  - `src/lib/server/proxy.spec.ts`
  - `src/lib/target-scoped-lookups.spec.ts`
  - `src/lib/components/workflow/selection-modal.svelte.spec.ts`
  - `src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts`
- Verification completed:
  - `bun run test:unit -- --run src/lib/server/dak-equipment.spec.ts src/lib/server/proxy.spec.ts src/lib/target-scoped-lookups.spec.ts src/lib/components/workflow/selection-modal.svelte.spec.ts 'src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts'`
  - `npx @sveltejs/mcp svelte-autofixer './src/lib/components/workflow/selection-modal.svelte' --async --svelte-version 5`
  - `npx @sveltejs/mcp svelte-autofixer './src/routes/(app)/dropsheets/+page.svelte' --async --svelte-version 5`
  - `bun run check`
  - `bun run build`
- Memory Impact Analysis: update required because repo-tracked behavior and backend lookup source changed. Updated current-context, project-state, and decisions.

## 2026-04-30 Loading Scan CustomerPortal Contract

- Current worktree: `features/ui-redesign`.
- Loading scan submissions now use CustomerPortalAPI-PY through the DST proxy path `POST /api/barcode-update/process-loading-scan-v2` instead of the old `dak-web` `/v1/scan/process-loading` route.
- The frontend sends the active drop context with each loading scan: scanned text, department, selected driver location, load number, loader name, drop sheet id, active location id, sequence, and selected drop index.
- CustomerPortal loading scan responses can include refreshed `LoadViewDetailAll` and `LoadViewUnion` rows. The Loading page now consumes those rows directly when present and falls back to the old separate detail/union refresh calls if the combined refresh payload is absent.
- Focused regressions added or updated:
  - `src/lib/server/dak-scan.spec.ts`
  - `src/routes/(app)/loading/loading-page.svelte.spec.ts`
- Verification completed:
  - `bun run test:unit -- --run src/lib/server/dak-scan.spec.ts`
  - `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`
  - `npx @sveltejs/mcp svelte-autofixer src/routes/'(app)'/loading/+page.svelte --svelte-version 5`
  - `bun run check`
  - `bun run test:unit -- --run`
- Memory Impact Analysis: update required because the active loading scan backend contract changed. Updated current-context and project-state.

## 2026-04-30 iPad Operational Design System Upgrade

- Current worktree: `dak-barcode` active branch at time of update.
- Scope handled here: documentation plus first implementation wave for the operational core UI. No auth, backend contract, scan-processing, loader-session, or routing behavior changes were intended.
- Follow-up Select Category pass: `/select-category/[dropsheetId]` now uses the compact operational card density too. The page has an opt-in operational `LoadSummaryStrip`, shared department status pills, three-up department handoff cards on iPad, compact loader roster cards, and an in-flow utility action grid instead of the prior oversized rounded shells and sticky floating footer.
- Select Category typography follow-up: section headings, department card titles, loader roster headings, and loader/name chips are tightened through shared DS typography helper classes in `src/app.css` plus route-level size classes. This was a visual density change only.
- Select Category spacing follow-up: summary gaps, section panel padding, card padding, department/loader grid gaps, status padding, and footer padding were tightened for iPad information density. Shared `ds-operational-panel` and `ds-operational-card` helpers now live in `src/app.css`.
- Home 500 follow-up: `OperationalActionCard` no longer blindly calls `resolve()` on every `href`. Home passes hrefs that may already be resolved to relative paths during SSR, such as `./staging?returnTo=%2Fhome`; the shared card now resolves absolute internal paths only and leaves already-resolved hrefs untouched.
- Loading screen follow-up: `/loading` now uses the compact iPad operational panel composition inspired by the downloaded HTML while preserving the app's current data and actions. The active workspace is one compact panel with delivery/customer summary, department status pills, legacy Order Status/Dropsheet shortcuts, always-visible scan input, barcode-only scanned grid, and the existing 64px previous/next drop controls.
- Modal follow-up: operational selection/location modals are centered dialogs again, not bottom sheets. The shared DS modal shell, staging department gate, loader selection modal, staging/loading location modal, loader editor, and Will Call signature modal now center within the viewport and omit drag handles.
- Staging location modal follow-up: when the shared location modal shows a staging location list, it uses nearly the full available iPad viewport height and tighter tabs/cards so operators see more locations before scrolling. Loading keeps the same scan-only compact modal because it does not render the location list.
- Design-source precedence is now explicit:
  - current workflow references and live product rules decide what appears on each screen
  - the compact iPad Operational system decides density, radii, touch targets, scan inputs, centered modals, counters, and card anatomy
  - auth/account surfaces can keep older lower-density styling until intentionally redesigned
- New shared workflow primitives cover compact action cards, scan fields, department status pills, loading drop counters, barcode-only scanned ID grids, and centered modal shell styling.
- Home, app chrome, Staging scan controls/list panel, Loading scan/counter/status/scanned-item surfaces, selection modal shells, department selection, and staging/loading location modal styling now use the compact DS direction.
- Durable design docs updated:
  - `docs/design.md`
  - `docs/ui-reference/tokens.md`
  - `docs/ui-reference/screen-map.md`
  - `docs/ui-reference/README.md`
- Focused regressions added or updated:
  - `src/lib/components/workflow/operational-design-components.svelte.spec.ts`
  - `src/routes/(app)/home/home-page.svelte.spec.ts`
  - `src/routes/(app)/staging/staging-page.svelte.spec.ts`
  - `src/routes/(app)/loading/loading-page.svelte.spec.ts`
  - `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
- Verification completed so far in this session:
  - `bun run test:unit -- --run src/lib/components/workflow/operational-design-components.svelte.spec.ts 'src/routes/(app)/home/home-page.svelte.spec.ts' 'src/routes/(app)/loading/loading-page.svelte.spec.ts' 'src/routes/(app)/staging/staging-page.svelte.spec.ts'`
  - `bun run test:unit -- --run 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'`
  - `bun run test:unit -- --run src/lib/components/workflow/operational-design-components.svelte.spec.ts`
  - `bun run test:unit -- --run src/lib/components/workflow/operational-design-components.svelte.spec.ts 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'`
  - `bun run test:unit -- --run src/lib/components/workflow/operational-design-components.svelte.spec.ts 'src/routes/(app)/home/home-page.svelte.spec.ts'`
  - `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`
  - `bun run test:unit -- --run src/lib/components/workflow/operational-design-components.svelte.spec.ts src/lib/components/workflow/staging-location-modal.svelte.spec.ts src/lib/components/workflow/selection-modal.svelte.spec.ts 'src/routes/(app)/staging/staging-page.svelte.spec.ts'`
  - `bun run test:unit -- --run src/lib/components/workflow/loader-editor-modal.svelte.spec.ts src/lib/components/workflow/will-call-signature-modal.svelte.spec.ts`
  - `bun run check`
  - `bun run test:unit -- --run`
  - `bun run build`
  - Svelte autofixer checked edited Svelte files; the Select Category route still has the pre-existing `goto()`/`resolve()` suggestion, intentionally left unchanged to avoid routing behavior changes
- Browser smoke check: dev server opened at `http://127.0.0.1:5173/` with Playwright viewport `1180x820`; authenticated workflow routes including Select Category redirect to `/login` without a session, so live authenticated workflow screenshot verification was blocked by auth.
- Memory Impact Analysis: update required because repo-tracked design docs, runtime UI components, and durable UI-source precedence changed. Updated current-context, project-state, and decisions.

## 2026-04-29 Loading List LocationID Correction

- Current worktree: `features/dak-245`
- Linked Linear issue: `DAK-245`
- Live read-only DST checks for load `04302026-1258` confirmed `load-labels-union-view` returns valid unscanned Roll and Parts rows with the selected `LocationID`, `Scanned: false`, and `CategoryID: 0`.
- Live read-only DST lookup for drop area `25` confirmed it is valid for Loading because `DriverLocation: true`, even though `WrapLocation`, `PartLocation`, `RollLocation`, and `LoadLocation` are false.
- Loading no longer treats `CategoryID` as the department guard. The visible unscanned label list now uses the legacy contract: selected department maps to `LocationID`, the endpoint is called with that `LocationID`, and the frontend only keeps rows whose returned `LocationID` matches the active drop and `scanned === false`.
- The Loading page now opens the shared location modal with an explicit driver-location-only mode. It does not call the department-filtered location list and does not require department or load-location support; numeric lookup only requires `supportsDriverLocation`.
- The driver-location-only Loading modal is scan-only and now follows the compact centered-modal operational style. It hides the browseable location-list card so operators only see the location input and close action.
- The empty/completed drop messages now use `items` wording: `No items are attached to this drop yet.` and `All items in this drop are scanned.`
- Verification for this correction:
  - `bun run test:unit -- --run src/lib/components/workflow/staging-location-modal.svelte.spec.ts`
  - `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`
  - `bun run test:unit -- --run 'src/routes/(app)/move-orders/[dropsheetId]/move-orders-page.svelte.spec.ts'`
  - `bun run test:unit -- --run`
  - Svelte autofixer checked `src/routes/(app)/loading/+page.svelte` with no blocking issues
  - Svelte autofixer checked `src/lib/components/workflow/staging-location-modal.svelte` with no blocking issues
- Current known verification gap: `bun run check` is blocked by an unrelated Staging remote-command type mismatch in `src/routes/(app)/staging/+page.svelte`.

## 2026-04-29 DAK-245 iPad Layout And Loading Department Guard

- Current worktree: `features/dak-245`
- Linked Linear issue: `DAK-245`
- Scope handled here: DAK-245 concerns 1 and 2, a frontend-only loading scan-readiness mitigation for speed feedback, and the Loading scanned-location confirmation requested as point 4. Backend SQL/API optimization remains deferred.
- Dropsheets no longer renders the fixed `min-w-[980px]` horizontally scrolling table shell that overflowed on shared iPad A16 Safari widths. The table keeps existing controls but uses a fluid table layout with lower-priority columns hidden at narrower widths.
- Loading visible unscanned labels are governed by the active loading `LocationID` and `scanned === false`; `CategoryID` is not a reliable department guard for this legacy union response.
- Superseded by the 2026-04-30 operational pass: Select Category support actions and Complete Load now live in a compact in-flow action grid. Normal completed loads show three compact buttons; Will Call completed loads show Order Status, Dropsheet, Signature, and Complete Load as four compact buttons so the loader cards remain visible on iPad.
- Select Category loader handoff now reads `getNumberOfDrops` through the shared `readRemoteQuery` helper, preventing the iPad runtime error `getNumberOfDrops(...).run is not a function` and allowing the loader session to navigate into Loading. The same helper now covers Will Call scan lookup and staging/location modal lookup reads.
- Loading scan input now stays enabled while a scan is in flight. If operators scan during the post-scan mutation/refresh window, the page queues up to five raw scan texts, drains them sequentially after refreshed drop data settles, and builds each queued request from the latest active drop state.
- Loading clears queued scan texts whenever the operator changes drops, so queued scans cannot be replayed against a different active drop after navigation.
- Loading now appends the active scanned driver location to the route title while selected, for example `Loading Roll Dezzirae - Location 1`, so operators can confirm which location subsequent scans use.
- AGENTS now records the two local FastAPI projects available for contract inspection: `/Users/andresdominicci/Projects/CustomerPortalAPI-PY` and `/Users/andresdominicci/Projects/dakview-web`. Modifying either backend still requires explicit approval because those endpoints may support production.
- Focused regressions added or updated:
  - `src/routes/(app)/app-layout-workflow-sync.svelte.spec.ts`
  - `src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts`
  - `src/routes/(app)/loading/loading-page.svelte.spec.ts`
  - `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
  - `src/lib/components/workflow/staging-location-modal.svelte.spec.ts`
  - `src/lib/components/workflow/will-call-scan-modal.svelte.spec.ts`
- Verification completed in this session:
  - `bun run test:unit -- --run 'src/routes/(app)/app-layout-workflow-sync.svelte.spec.ts'`
  - `bun run test:unit -- --run 'src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts'`
  - `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`
  - `bun run test:unit -- --run 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'`
  - `bun run test:unit -- --run src/lib/components/workflow/staging-location-modal.svelte.spec.ts src/lib/components/workflow/will-call-scan-modal.svelte.spec.ts`
  - `bun run test:unit -- --run 'src/routes/(app)/staging/staging-page.svelte.spec.ts'`
  - `bun run check`
  - `bun run test:unit -- --run --project client`
  - `bun run test:unit -- --run --project server`
  - `bun run test:unit -- --run`
  - Svelte autofixer checked edited Dropsheets, Loading, Select Category, staging-location modal, and Will Call scan modal Svelte files
  - Svelte autofixer checked edited app layout file
- Freshness note: the combined unit suite passes as of the Loading List LocationID correction above; `bun run check` is currently blocked by an unrelated Staging remote-command type mismatch.

## 2026-04-22 Staging Location Memory Refresh

- Current worktree: `dev`
- Staging now auto-opens the location selector when a valid non-location label scan needs a location.
- Confirmed runtime behavior:
  - `Wrap` and `Parts` keep the chosen staging location active until the operator changes it or changes department.
  - `Roll` treats the chosen staging location as single-use, even when it was preselected manually before scanning the label.
- Durable implementation note: the behavior change lives in `src/lib/workflow/staging-scan-controller.ts`; the page already had the right retry and Roll-clearing behavior once the controller started returning `openLocationModal: true` for `needs-location`.
- Focused regressions added or updated:
  - `src/lib/workflow/staging-scan-controller.spec.ts`
  - `src/routes/(app)/staging/staging-page.svelte.spec.ts`
- Verification completed in this session:
  - `bun run test:unit -- --run src/lib/workflow/staging-scan-controller.spec.ts`
  - `bun run test:unit -- --run 'src/routes/(app)/staging/staging-page.svelte.spec.ts'`
  - `bun run test:unit -- --run src/lib/workflow/staging-scan-controller.spec.ts 'src/routes/(app)/staging/staging-page.svelte.spec.ts'`
  - `npx @sveltejs/mcp svelte-autofixer ./src/routes/'(app)'/staging/+page.svelte --svelte-version 5`
- Freshness note: the older remote-query `.run()` and staging spec type diagnostics mentioned for this session were resolved on 2026-04-29; `bun run check` is now clean.

## 2026-04-16 Target-Scoped Lookup Query Keys

- Current worktree: `main`
- The staging `Select Location` hang on deployed Vercel was traced to the shared lookup wrappers, not the staging route itself.
- Root cause: loaders, trailers, and drop-area lookups reused long-lived client query state across target changes. The durable fix is two-part: keep the target qualifier in the serialized SvelteKit remote `query(...)` input and stop hydrating those lookups from browser cache.
- Resulting behavior: target-sensitive selectors such as staging location, loader pickers, and trailer pickers now fetch fresh lookup state while still isolating query instances per target.
- The shared wrappers and remote functions now do this for:
  - `src/lib/loaders.cached.ts`
  - `src/lib/trailers.cached.ts`
  - `src/lib/drop-areas.cached.ts`
  - `src/lib/loaders.remote.ts`
  - `src/lib/trailers.remote.ts`
  - `src/lib/drop-areas.remote.ts`
- Focused regression added:
  - `src/lib/target-scoped-lookups.spec.ts`
- Verification completed in this session:
  - `bunx vitest run src/lib/target-scoped-lookups.spec.ts`
  - `bunx vitest run 'src/lib/components/workflow/staging-location-modal.svelte.spec.ts' 'src/routes/(app)/staging/staging-page.svelte.spec.ts' 'src/routes/(app)/loading/loading-page.svelte.spec.ts' 'src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts' 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts' 'src/routes/(app)/loaders/loaders-page.svelte.spec.ts' src/lib/target-scoped-lookups.spec.ts`
  - `bun run build`
- Freshness note: the widened Vitest batch still hit the pre-existing `dropsheets-page.svelte.spec.ts` date-picker timeout; the new target-scoping regression passed and the production build stayed green.

## 2026-04-16 Remote Query One-Off Read Hardening

- Current worktree: `dev`
- The select-category loading handoff bug was originally traced to imperative client code awaiting SvelteKit remote `query(...)` helpers directly.
- Current superseding rule from 2026-04-29: operator-facing imperative remote query reads must use `src/lib/remote-query-read.ts`, because the installed SvelteKit runtime/types expose promise-like query objects without public `.run()`.
- The repo hardens the remaining operator-facing hotspots through that shared helper:
  - `src/lib/components/workflow/will-call-scan-modal.svelte`
  - `src/lib/components/workflow/staging-location-modal.svelte`
  - `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`
- Focused regressions now cover the affected imperative paths in:
  - `src/lib/components/workflow/will-call-scan-modal.svelte.spec.ts`
  - `src/lib/components/workflow/staging-location-modal.svelte.spec.ts`
  - `src/routes/(app)/home/home-page.svelte.spec.ts`
  - `src/routes/(app)/staging/staging-page.svelte.spec.ts`
  - `src/routes/(app)/loading/loading-page.svelte.spec.ts`
  - `src/routes/(app)/move-orders/[dropsheetId]/move-orders-page.svelte.spec.ts`
  - `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
- Verification completed in this session:
  - `bunx vitest run 'src/lib/components/workflow/will-call-scan-modal.svelte.spec.ts' 'src/lib/components/workflow/staging-location-modal.svelte.spec.ts' 'src/routes/(app)/home/home-page.svelte.spec.ts' 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts' 'src/routes/(app)/staging/staging-page.svelte.spec.ts' 'src/routes/(app)/loading/loading-page.svelte.spec.ts' 'src/routes/(app)/move-orders/[dropsheetId]/move-orders-page.svelte.spec.ts'`
  - `bun run build`
- Freshness note: this bug class is now covered in the audited imperative query call sites; future remote-query reads added to event handlers or modal submit flows must use `readRemoteQuery` from the start.

## 2026-04-16 Remote Functions Async Guard Fix

- Current worktree: `dev`
- Enabled `compilerOptions.experimental.async` in `svelte.config.js` alongside `kit.experimental.remoteFunctions` so SvelteKit remote functions compile correctly in production and stop throwing `experimental_async_required` from hydratable query paths.
- Added a shared `getOperatorErrorMessage` helper and switched the operator-facing remote-query banners on staging, loaders, dropsheets, loading, select-category, order-status, move-orders, and the staging location modal to use fallback copy instead of raw framework/runtime error strings.
- Verification completed in this session:
  - `bunx vitest run src/lib/operator-error.spec.ts src/lib/components/workflow/staging-list-panel.svelte.spec.ts src/lib/components/workflow/staging-location-modal.svelte.spec.ts src/svelte-config.spec.ts`
  - `bunx vitest run src/lib/browser-cache.spec.ts`
  - `bun run build`
- Freshness note: `src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts` still has a pre-existing browser timeout in the date-picker flow under this async-mode run; it does not affect the production build result for the async-guard fix.

## 2026-04-10 Complete Load Partial-Success Refresh

- Current worktree: `features/enhancements`
- Select Category now treats `POST /v1/logistics/dropsheet-notify` partial success as a warning flow when dak-web reports `post_send_sync.status = failed` after notifications were already sent.
- The frontend keeps the legacy request payload shape, closes the confirmation modal, warns the operator not to resend, and returns to the prior route instead of surfacing the old generic failure copy.
- Verification completed in this session:
  - `bun run test:unit -- --run 'src/lib/server/dak-loading-complete.spec.ts'`
  - `bun run test:unit -- --run 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'`
  - Svelte autofixer passed for `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`
- Important freshness note: true notification-send failures still remain hard errors. Only the new backend `post_send_sync` failure payload is downgraded to an operator-safe warning.

## 2026-04-10 Loading Last-Drop Navigation Refresh

- Current worktree: `features/enhancements`
- The loading workflow now opens on the last available drop instead of the first.
- Footer navigation follows the floor's reverse-loading sequence: `Next` counts down through lower drop numbers and `Previous` moves back toward higher drop numbers.
- Navigation remains clamped at the ends; there is no wraparound jump from drop `1` back to the final drop.
- Verification completed in this session:
  - `bun run test:unit -- --run 'src/lib/workflow/loading-drop-navigation.spec.ts'`
  - `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`
  - Svelte autofixer passed for `src/routes/(app)/loading/+page.svelte`
- Important freshness note: this is an intentional behavior change from both the current app baseline and the legacy FlutterFlow loading screen, which previously started on drop `1`.

## 2026-04-10 Freeport Roll Staging Filter Refresh

- Current worktree: `features/enhancements`
- The staging location modal now adds a second tab row only for `Freeport + Roll + staging`.
- The first row stays grouped by first letter; the second row exposes `All` plus second-letter buckets derived from location names while ignoring dashes.
- Locations without a usable second letter still remain available under `All`.
- Verification completed in this session:
  - `bun run test:unit src/lib/components/workflow/staging-location-modal.svelte.spec.ts --run`
  - `bun run test:unit src/routes/(app)/staging/staging-page.svelte.spec.ts --run`
  - Svelte autofixer passed for `src/lib/components/workflow/staging-location-modal.svelte`
- Important freshness note: this is a scoped runtime rule, not a global staging behavior. Canton and non-Roll staging still use the existing single-row tab flow.

## 2026-04-10 Home Session Action Refresh

- Current worktree: `dev`
- Home now exposes a header-level `Sign out` action that reuses the existing shared `POST /logout` flow instead of adding a new auth path.
- The shared fixed-domain auth field placeholder is normalized to lowercase `username`, so login and forgot-password now match the requested copy.
- Verification completed in this session:
  - `bun run test:unit src/routes/(app)/home/home-page.svelte.spec.ts --run`
  - `bunx playwright test src/routes/app-shell.e2e.ts --grep "generic username placeholder"`
- Important freshness note: this update changes live runtime behavior on `Home`, so use the current code and this note over older snapshots when evaluating the authenticated shell.

## 2026-04-01 DAK-220 Refresh

- Current worktree: `dev`
- Restored the missing `DAK-220` Will Call flow additively from the closed-but-unmerged branch history instead of resetting or overwriting current local changes.
- Runtime truth now matches the intended migrated surface: Home opens a Will Call scan modal, dropsheet handoff preserves the `willcall=true` flag, select-category exposes the signature action for Will Call, and DST helpers now cover will-call lookup/signature persistence.
- Verification completed in this session:
  - targeted unit/browser suite for Will Call and affected surfaces passed
  - `bun run check` passed cleanly after widening the shared DST query helper to accept boolean query params
- Important freshness note: the retrieval-memory rollout notes below remain useful background, but they no longer describe the active product-only focus of this worktree.

## Current Focus

- Keep the retrieval memory bundle current with verified runtime changes and bugfix context.
- Re-check Linear and Git freshness sensors before resuming feature delivery work; do not trust older handoff files by default.

## Freshness Check

- Last updated: 2026-04-16
- Branch basis: `dev`
- Linked Linear issue: `None captured in this session`
- Open diffs already reflected: `Yes. This file reflects the remote-function async fix, the imperative remote-query compatibility helper, and the target-scoped fresh-lookup fix currently in the worktree.`

## Active Branch Assumptions

- This worktree currently carries the production runtime fix for Svelte remote functions, operator-safe error banners, and imperative remote-query compatibility hardening for affected client flows.
- `docs/project-state.yaml` is the canonical fast-reload record and should be updated when durable current truth changes.
- `docs/current-context.md` is the rolling handoff and should absorb branch-specific focus, risk, and freshness notes.
- Files under `docs/handoffs/` remain historical snapshots only and should not outrank the current memory bundle.

## Open Risks

- The system will go stale if Memory Impact Analysis is skipped after a meaningful change.
- No automation enforces the freshness loop yet; the guardrail currently lives in repo instructions and reviewer discipline.
- A dropsheets date-picker browser spec timed out in this session and should be treated as a separate test flake unless it starts reproducing in the built preview.
- `bun run check` should be re-run after runtime or dependency changes even when the production build passes, because the repo still carries unrelated baseline risks elsewhere.

## Recent Changes That Affect Retrieval

- `69be8b2` updated docs to reflect the current app migration status and is part of the baseline truth for this bundle.
- `b1b80d4` merged the markdown-docs work, which means repo documentation is the freshest baseline available before this branch.
- This branch now records the remote-functions async-mode requirement and the shared operator error-sanitization helper.
- This worktree also records that imperative remote `query(...)` reads must use `src/lib/remote-query-read.ts` and that target-sensitive lookup wrappers should fetch fresh state while still including the target qualifier in the serialized remote query input, with focused regressions for the affected flows.
- Verification on this branch confirmed the production build succeeds after enabling async mode and the new operator-safe banner path.

## Next Reload Order

1. `AGENTS.md`
2. `docs/project-state.yaml`
3. `docs/current-context.md`
4. Relevant entries in `docs/decisions.md`
5. Active Linear issue and comments
6. `git status`, `git diff`, and recent commits
7. Code inspection for the touched subsystem
