# Next AI Collaborator Handoff

Use this prompt to continue work in `/Users/andresdominicci/Projects/dak-barcode`.

## Prompt

You are continuing work in:

`/Users/andresdominicci/Projects/dak-barcode`

Current repo state as of March 26, 2026:
- local `dev` is synced to `origin/dev` at `b7b33d1`
- local `main` is synced to `origin/main` at `770bfd6`
- `DAK-208` is merged, promoted through `main`, commented in Linear, and its merged feature branch was cleaned up locally and remotely
- current working branch should be treated as disposable; start all new feature work from local `dev`

Required workflow:
1. Read `/Users/andresdominicci/Projects/dak-barcode/AGENTS.md` and follow it strictly
2. Re-check Linear MCP first and confirm the next logical issue before coding
3. Base all new work on local `dev`
4. Use TDD: write a failing test first, run it, implement the smallest fix, rerun tests
5. Use Bun, SvelteKit 5, TypeScript, Tailwind 4, and shadcn-svelte
6. Use the Svelte skill, Svelte MCP, and Context7 before changing Svelte or framework-specific code
7. Use `frontend-design` for UI work
8. Cross-check legacy behavior in `/Users/andresdominicci/Projects/dak-barcode/legacy_flutterflow_fe`

Next logical issue:
- `DAK-209` — Loading: edge cases, error handling, and scan error-state mapping

Why this is next:
- `DAK-207` implemented the real loading scan loop and pending-scan bridge
- `DAK-208` replaced the bridge-only `needs_location` prompt with the dedicated loading location modal
- the next remaining loading work is richer scan-time error mapping and retry UX, which belongs to `DAK-209`

Linear issues to inspect first:
- `DAK-209` — https://linear.app/dakotastee-and-trim-it/issue/DAK-209/loading-edge-cases-error-handling-all-scan-error-states
- review the latest comments on `DAK-208` and `DAK-209` before changing code

Known implementation context from completed work:
- `/loading` already has the hardware-scanner-friendly input wired to `processLoadingScan()`
- successful non-location scans refresh both the active drop detail and the union label list together
- Roll still clears the current drop area after successful non-location scans
- timeout failures and non-timeout failures are handled separately
- `needs_location` now opens the dedicated location modal instead of using the temporary bridge-only UX
- the pending-scan state already exists and must be reused, not replaced
- dismissing the location modal cancels the pending scan cleanly
- modal-triggered retries now hold `isScanning` for the full retry so the main scan input stays blocked until the retry completes
- loading location selection is restricted to valid driver-loading locations

Important guardrails for `DAK-209`:
- build on the current controller and page contract; do not replace the pending-scan or modal workflow introduced in `DAK-207` and `DAK-208`
- keep post-retry refresh updating both the active drop detail and the union label list together
- preserve scan readiness and current Roll behavior
- keep the page recoverable if a retry fails or a modal is dismissed
- do not broaden scope into unrelated loading or staging refactors

Most relevant files to inspect first:
- `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/loading/+page.svelte`
- `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/loading/loading-page.svelte.spec.ts`
- `/Users/andresdominicci/Projects/dak-barcode/src/lib/components/workflow/staging-location-modal.svelte`
- `/Users/andresdominicci/Projects/dak-barcode/src/lib/workflow/loading-scan-controller.ts`
- `/Users/andresdominicci/Projects/dak-barcode/src/lib/workflow/loading-scan-controller.spec.ts`
- `/Users/andresdominicci/Projects/dak-barcode/src/lib/workflow/loading-lifecycle.ts`
- `/Users/andresdominicci/Projects/dak-barcode/src/lib/load-view.remote.ts`
- `/Users/andresdominicci/Projects/dak-barcode/src/lib/server/load-view.remote.ts`
- `/Users/andresdominicci/Projects/dak-barcode/legacy_flutterflow_fe`

Most relevant recent commits:
- `3c3fab1` — `Loading scan new location modal`
- `61244aa` — `Fix loading modal review follow-ups`
- `b7b33d1` — merge of PR `#20` into `dev`
- `770bfd6` — `dev` promoted into `main`

Recent verification already completed on merged `main`:
- `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`
- `bun run check`

Expected workflow:
1. Inspect `DAK-209` fully in Linear, including notes, comments, and blockers
2. Inspect the current loading route and loading scan controller
3. Cross-check legacy FlutterFlow behavior for edge-case messaging and retry behavior
4. Write a concrete implementation plan
5. Create a new feature branch from local `dev`
6. Follow TDD
7. Verify with focused tests, then broader repo checks
8. Commit, push, and create a PR against `dev`
9. Tag PR comments with:
   - `@greptile review`
   - `@codex review`

When reporting back, include:
- why `DAK-209` is the correct next issue
- exact files changed
- tests added
- verification commands run
- any remaining blockers or follow-on risks after the error-handling pass
