# Decisions

Use this file as the append-only ADR-style log for durable repo decisions. Add new entries at the top and keep older entries intact.

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
