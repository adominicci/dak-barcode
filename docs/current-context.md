# Current Context

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

## 2026-04-16 Remote Query `.run()` Hardening

- Current worktree: `dev`
- The select-category loading handoff bug was traced to imperative client code awaiting SvelteKit remote `query(...)` helpers directly instead of calling `.run()`.
- The repo now hardens the remaining operator-facing hotspots to use `.run()` for one-off client actions:
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
- Freshness note: this bug class is now covered in the audited imperative query call sites, but future remote-query reads added to event handlers or modal submit flows must use `.run()` from the start.

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
- Open diffs already reflected: `Yes. This file reflects the remote-function async fix, the imperative remote-query .run() hardening, and the target-scoped fresh-lookup fix currently in the worktree.`

## Active Branch Assumptions

- This worktree currently carries the production runtime fix for Svelte remote functions, operator-safe error banners, and imperative remote-query `.run()` hardening for affected client flows.
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
- This worktree also records that imperative remote `query(...)` reads must use `.run()` and that target-sensitive lookup wrappers should fetch fresh state while still including the target qualifier in the serialized remote query input, with focused regressions for the affected flows.
- Verification on this branch confirmed the production build succeeds after enabling async mode and the new operator-safe banner path.

## Next Reload Order

1. `AGENTS.md`
2. `docs/project-state.yaml`
3. `docs/current-context.md`
4. Relevant entries in `docs/decisions.md`
5. Active Linear issue and comments
6. `git status`, `git diff`, and recent commits
7. Code inspection for the touched subsystem
