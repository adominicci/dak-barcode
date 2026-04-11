# Current Context

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

- Establish the retrieval memory system and make it the default reload surface for future contexts.
- Keep this branch limited to memory and documentation workflow changes. Do not mix in product or runtime behavior edits.
- Re-check Linear and Git freshness sensors before resuming feature delivery work; do not trust older handoff files by default.

## Freshness Check

- Last updated: 2026-04-01
- Branch basis: `features/design-context-memory-strategy` from `b1b80d4`
- Linked Linear issue: `None for this branch; resolve the active issue before product work resumes`
- Open diffs already reflected: `Yes. This file assumes the intended working-tree changes are AGENTS.md, README.md, docs/project-state.yaml, docs/current-context.md, and docs/decisions.md.`

## Active Branch Assumptions

- This branch exists to introduce retrieval-memory infrastructure, not to ship warehouse workflow changes.
- `docs/project-state.yaml` is the canonical fast-reload record and should be updated when durable current truth changes.
- `docs/current-context.md` is the rolling handoff and should absorb branch-specific focus, risk, and freshness notes.
- Files under `docs/handoffs/` remain historical snapshots only and should not outrank the current memory bundle.

## Open Risks

- The system will go stale if Memory Impact Analysis is skipped after a meaningful change.
- No automation enforces the freshness loop yet; the guardrail currently lives in repo instructions and reviewer discipline.
- Active Linear issue state still lives outside the repo and must be rechecked before feature work starts or resumes.
- `bun run check` currently fails on a pre-existing type mismatch in `src/lib/server/dst-queries.ts:336`; this branch does not change that file, but the next implementation session should account for the failing baseline.

## Recent Changes That Affect Retrieval

- `69be8b2` updated docs to reflect the current app migration status and is part of the baseline truth for this bundle.
- `b1b80d4` merged the markdown-docs work, which means repo documentation is the freshest baseline available before this branch.
- This branch adds the structured memory bundle and the standing Memory Impact Analysis rule.
- Verification on this branch confirmed the memory files parse cleanly and also surfaced the existing `dst-queries.ts` type-check failure, which is now recorded here for the next fresh context.

## Next Reload Order

1. `AGENTS.md`
2. `docs/project-state.yaml`
3. `docs/current-context.md`
4. Relevant entries in `docs/decisions.md`
5. Active Linear issue and comments
6. `git status`, `git diff`, and recent commits
7. Code inspection for the touched subsystem
