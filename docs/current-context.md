# Current Context

## 2026-04-29 Loading List LocationID Correction

- Current worktree: `features/dak-245`
- Linked Linear issue: `DAK-245`
- Live read-only DST checks for load `04302026-1258` confirmed `load-labels-union-view` returns valid unscanned Roll and Parts rows with the selected `LocationID`, `Scanned: false`, and `CategoryID: 0`.
- Live read-only DST lookup for drop area `25` confirmed it is valid for Loading because `DriverLocation: true`, even though `WrapLocation`, `PartLocation`, `RollLocation`, and `LoadLocation` are false.
- Loading no longer treats `CategoryID` as the department guard. The visible unscanned label list now uses the legacy contract: selected department maps to `LocationID`, the endpoint is called with that `LocationID`, and the frontend only keeps rows whose returned `LocationID` matches the active drop and `scanned === false`.
- The Loading page now opens the shared location modal with an explicit driver-location-only mode. It does not call the department-filtered location list and does not require department or load-location support; numeric lookup only requires `supportsDriverLocation`.
- The driver-location-only Loading modal is scan-only, compact, and centered. It hides the browseable location-list card so operators only see the location input and close action.
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
- Select Category now keeps support actions and Complete Load in one compact sticky action grid. Normal completed loads show three compact buttons; Will Call completed loads show Order Status, Dropsheet, Signature, and Complete Load as four compact buttons so the loader cards remain visible on iPad.
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
