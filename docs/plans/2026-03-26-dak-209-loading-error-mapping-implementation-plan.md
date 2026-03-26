# DAK-209 Loading Error Mapping Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Map all loading scan error states to the correct legacy meaning, add scanner-safe recovery for transport failures, and keep the existing loading pending-scan/location-modal workflow intact.

**Architecture:** Keep the loading page responsible for scanner lifecycle and retry UI, but move scan-result meaning into a normalized loading-specific controller contract so `+page.svelte` does not branch on raw backend statuses. Preserve the existing `needs-location` pending-scan bridge from `DAK-207`/`DAK-208`, and only layer richer error metadata plus explicit retry-dismiss handling for transport and API failures.

**Tech Stack:** SvelteKit 5, Svelte 5 runes, TypeScript, Bun, Vitest browser tests, vitest-browser-svelte

---

### Task 1: Capture the new loading error contract in tests

**Files:**
- Modify: `src/lib/workflow/loading-scan-controller.spec.ts`
- Modify: `src/routes/(app)/loading/loading-page.svelte.spec.ts`

**Step 1: Write the failing controller tests**

Add focused tests for:
- `does-not-belong` returning a structured loading error with `Not Found` meaning
- `no-match` returning a structured loading error with `No Match` meaning
- `department-blocked` returning a structured loading error with `Not Completed` meaning
- `api-error` returning a diagnosable error state instead of a generic string-only error

**Step 2: Run the controller spec to verify RED**

Run: `bun run test:unit -- --run 'src/lib/workflow/loading-scan-controller.spec.ts'`

Expected: FAIL because the current controller only returns `{ kind: 'error', message }`.

**Step 3: Write the failing page tests**

Add focused tests for:
- rendering the correct error title and message for `does-not-belong`, `no-match`, `invalid-location`, and `department-blocked`
- showing retry/dismiss controls for thrown network or command failures
- keeping the scan field ready after dismissing an error
- reusing the stored failed scan request when retry is clicked
- showing diagnosable API context without leaving the page unusable

**Step 4: Run the page spec to verify RED**

Run: `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`

Expected: FAIL because the current page only renders inline text and has no retry-dismiss state.

### Task 2: Normalize loading scan outcomes in the controller

**Files:**
- Modify: `src/lib/workflow/loading-scan-controller.ts`
- Modify: `src/lib/workflow/loading-scan-controller.spec.ts`

**Step 1: Add the smallest loading-specific error metadata**

Extend `LoadingScanAction` so the error branch carries normalized metadata such as:
- stable error title
- user-facing message
- status/diagnostic kind
- whether the error is retryable in the page shell

Keep existing success, location update, and `needs-location` behavior unchanged.

**Step 2: Map backend business statuses**

Normalize the loading-only business outcomes:
- `invalid-location` -> title `Invalid Location`, message `Location is not valid.`
- `does-not-belong` -> title `Not Found`, message aligned to legacy loading meaning
- `no-match` -> title `No Match`, message `Label is not valid!`
- `department-blocked` and `incomplete-drop` -> title `Not Completed`, message `This drop is not completed!`
- `api-error` -> title `API Error`, preserve backend diagnostic message

**Step 3: Keep the pending-scan contract intact**

Do not change:
- how `needs-location` stores the pending scan
- how `retryPendingScan` works
- how successful non-location scans refresh the active drop detail and union labels together

**Step 4: Re-run the controller spec to verify GREEN**

Run: `bun run test:unit -- --run 'src/lib/workflow/loading-scan-controller.spec.ts'`

Expected: PASS

### Task 3: Add loading-page recovery UX without broadening scope

**Files:**
- Modify: `src/routes/(app)/loading/+page.svelte`
- Modify: `src/routes/(app)/loading/loading-page.svelte.spec.ts`
- Review only: `docs/design.md`
- Review only: `docs/ui-reference/tokens.md`
- Review only: `docs/ui-reference/screen-map.md`

**Step 1: Add a scanner-safe page error state**

Track a focused page-level failure object for thrown transport failures and retryable command failures:
- store the last failed scan request with its mode (`submit` or `pending retry`)
- render dismiss and retry controls
- clear the state on successful scans, location retry success, drop changes, and modal close

**Step 2: Render structured business errors**

Update the inline feedback panel to show:
- title + message for business-result errors
- diagnostic copy for `api-error`
- retry affordance only for thrown transport failures, not for normal backend business states

Keep the visual treatment aligned to the existing operational loading surface.

**Step 3: Preserve current scanner lifecycle**

Ensure:
- timeouts still use the existing timeout message and late-settlement monitor
- non-timeout thrown failures stop scanning, expose retry, and refocus cleanly
- dismissing a business or transport error returns the field to ready state
- Roll still clears the current drop area after successful non-location scans

**Step 4: Re-run the page spec to verify GREEN**

Run: `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`

Expected: PASS

### Task 4: Verify broader regression safety

**Files:**
- No new files expected

**Step 1: Re-run focused loading specs**

Run:
- `bun run test:unit -- --run 'src/lib/workflow/loading-scan-controller.spec.ts'`
- `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`

Expected: PASS

**Step 2: Run shared type/server checks touched by the contract**

Run:
- `bun run test:unit -- --run 'src/lib/server/type-mappers.spec.ts'`
- `bun run test:unit -- --run 'src/lib/server/dak-scan.spec.ts'`

Expected: PASS

**Step 3: Run repo-level verification**

Run:
- `bun run check`

Expected: PASS

### Task 5: Finish the branch and PR

**Files:**
- Review: `git diff --stat`

**Step 1: Create the feature branch from local dev**

Run: `git checkout -b features/dak-209-loading-error-mapping`

**Step 2: Commit the scoped work**

Run:
```bash
git add src/lib/workflow/loading-scan-controller.ts \
  src/lib/workflow/loading-scan-controller.spec.ts \
  src/routes/\(app\)/loading/+page.svelte \
  src/routes/\(app\)/loading/loading-page.svelte.spec.ts \
  docs/plans/2026-03-26-dak-209-loading-error-mapping-implementation-plan.md
git commit -m "feat: map loading scan error states"
```

**Step 3: Push and open the PR against `dev`**

Run:
```bash
git push -u origin features/dak-209-loading-error-mapping
gh pr create --base dev --head features/dak-209-loading-error-mapping --fill
```

**Step 4: Add required PR review comments**

Comment on the PR with:
```text
@greptile review
@codex review
```
