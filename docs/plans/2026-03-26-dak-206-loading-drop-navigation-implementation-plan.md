# DAK-206 Loading Drop Navigation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add drop-by-drop navigation to `/loading`, show the active drop detail and union label list, and keep NeedPick plus scanned/unscanned state accurate without implementing live scan submission yet.

**Architecture:** Reuse the existing DST load-view queries instead of inventing a new loading API layer. Load all drop summaries once for the active dropsheet/location, derive the selected drop detail from that batched payload, and refresh only the per-drop union-label query when navigation changes. Keep navigation math in a small workflow helper so bounds behavior is unit-testable outside the Svelte route.

**Tech Stack:** SvelteKit 5, Svelte 5 runes, TypeScript, Bun, Vitest Browser Mode, existing remote query helpers in `src/lib/load-view.remote.ts`

---

### Task 1: Navigation State Helper

**Files:**
- Create: `src/lib/workflow/loading-drop-navigation.ts`
- Create: `src/lib/workflow/loading-drop-navigation.spec.ts`

**Step 1: Write the failing test**

Cover:
- initial selection from a drop count
- previous/next transitions
- first/last bounds clamping
- derived `Drop N of M` presentation values

**Step 2: Run test to verify it fails**

Run: `bun run vitest src/lib/workflow/loading-drop-navigation.spec.ts`

Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Export a small set of pure helpers for:
- creating the initial selected drop index
- moving backward/forward with bounds
- deriving booleans for previous/next button enabled state

**Step 4: Run test to verify it passes**

Run: `bun run vitest src/lib/workflow/loading-drop-navigation.spec.ts`

Expected: PASS

### Task 2: Loading Page Red Tests

**Files:**
- Modify: `src/routes/(app)/loading/loading-page.svelte.spec.ts`

**Step 1: Write the failing test**

Add coverage for:
- rendering `Drop N of M`
- rendering customer, load number, driver, weight/total detail for the selected drop
- rendering scanned vs unscanned label rows
- disabling prev/next at the edges
- switching selected drop and refreshing the visible union list

**Step 2: Run test to verify it fails**

Run: `bun run vitest src/routes/'(app)'/loading/loading-page.svelte.spec.ts`

Expected: FAIL because the current page is still the `DAK-205` shell.

### Task 3: Loading Page Implementation

**Files:**
- Modify: `src/routes/(app)/loading/+page.svelte`
- Modify: `src/lib/load-view.remote.ts` only if a query export needs adjustment
- Modify: `src/lib/types/index.ts` only if missing presentation-safe fields block the UI

**Step 1: Implement the smallest route changes**

Add:
- batched drop summary query for all drops
- selected drop state and derived navigation labels
- per-selected-drop union-label query
- cards/panels for current drop detail and label state

Keep:
- existing loader-session lifecycle behavior from `DAK-205`
- scanner section reserved for later issues

**Step 2: Re-run the route tests**

Run: `bun run vitest src/routes/'(app)'/loading/loading-page.svelte.spec.ts`

Expected: PASS

**Step 3: Refactor only if needed**

Keep the route DRY by pushing any repeated formatting or navigation math into helpers, not inline markup.

### Task 4: Svelte Validation And Focused Verification

**Files:**
- Modify only the files touched above if autofixer reveals required changes

**Step 1: Run the Svelte autofixer**

Run: `npx @sveltejs/mcp svelte-autofixer src/routes/'(app)'/loading/+page.svelte --svelte-version 5`

Expected: no blocking Svelte issues

**Step 2: Run focused tests**

Run:
- `bun run vitest src/lib/workflow/loading-drop-navigation.spec.ts`
- `bun run vitest src/routes/'(app)'/loading/loading-page.svelte.spec.ts`

Expected: PASS

### Task 5: Broader Verification, Commit, And PR

**Files:**
- No new source files expected beyond the implementation above

**Step 1: Run broader verification**

Run:
- `bun run vitest src/lib/server/dst-queries.spec.ts`
- `bun run vitest src/lib/workflow/loading-lifecycle.spec.ts src/routes/'(app)'/select-category/[dropsheetId]/select-category-page.svelte.spec.ts src/routes/'(app)'/loading/loading-page.svelte.spec.ts`

**Step 2: Commit**

```bash
git add docs/plans/2026-03-26-dak-206-loading-drop-navigation-implementation-plan.md src/lib/workflow/loading-drop-navigation.ts src/lib/workflow/loading-drop-navigation.spec.ts src/routes/'(app)'/loading/+page.svelte src/routes/'(app)'/loading/loading-page.svelte.spec.ts
git commit -m "feat: add loading drop navigation and load detail view"
```

**Step 3: Push and create PR**

Push the feature branch and open a PR targeting `dev`. Post a PR comment containing:

```text
@greptile review
@codex review
```
