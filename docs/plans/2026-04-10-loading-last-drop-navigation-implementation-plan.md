# Loading Last-Drop Navigation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the loading workflow open on the final drop and let operators step backward through drops with the `Next` control.

**Architecture:** Keep drop-order math centralized in the shared loading navigation helper and wire the loading page footer to that reversed workflow. Validate the user-visible behavior first at the route level, then tighten the pure helper tests so the page and the helper stay aligned.

**Tech Stack:** SvelteKit 5, TypeScript, Vitest, vitest-browser-svelte, Bun

---

### Task 1: Capture the new loading-page behavior in a failing route test

**Files:**
- Modify: `src/routes/(app)/loading/loading-page.svelte.spec.ts`
- Reference: `src/routes/(app)/loading/+page.svelte`

**Step 1: Write the failing test**

Add a focused test that renders the loading page with multiple drop details and proves:

- the initial footer text is `Drop 2 of 2` for the current fixture
- the initially visible customer and drop summary belong to the last drop
- clicking `Next` changes the footer to `Drop 1 of 2`
- clicking `Previous` from there returns to `Drop 2 of 2`

Use the existing fixture helpers already in the spec so the test asserts real rendered behavior rather than internal state.

**Step 2: Run test to verify it fails**

Run: `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`

Expected: FAIL because the page currently opens on `Drop 1 of 2` and the buttons follow forward numbering.

**Step 3: Keep the failure focused**

If the failure is noisy, tighten selectors or test assertions until the failing expectation clearly points at initial drop order and footer navigation only.

**Step 4: Re-run the test to confirm the same failure**

Run: `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`

Expected: FAIL with the same drop-order mismatch.

**Step 5: Commit**

Do not commit yet; continue into helper coverage first so the behavior is pinned down at both layers.

### Task 2: Capture the helper behavior in a failing unit test

**Files:**
- Modify: `src/lib/workflow/loading-drop-navigation.spec.ts`
- Reference: `src/lib/workflow/loading-drop-navigation.ts`

**Step 1: Write the failing test**

Update or replace the current expectations so the helper spec proves:

- `createLoadingDropNavigationState(3)` defaults to the last index
- the initial state reports `selectedIndex: 2`, `activeDropNumber: 3`, `canGoPrevious: false`, `canGoNext: true`
- moving `next` from the last index decrements to the prior drop
- moving `previous` from the first index increments toward the last drop
- both directions still clamp at the bounds

**Step 2: Run test to verify it fails**

Run: `bun run test:unit -- --run 'src/lib/workflow/loading-drop-navigation.spec.ts'`

Expected: FAIL because the helper still defaults to index `0` and its direction delta assumes ascending navigation.

**Step 3: Keep the assertions minimal**

Prefer explicit object equality and a small number of movement cases so the failure message points directly at the changed navigation rules.

**Step 4: Re-run the test to confirm the failure**

Run: `bun run test:unit -- --run 'src/lib/workflow/loading-drop-navigation.spec.ts'`

Expected: FAIL with the same initial-index or movement-direction mismatch.

**Step 5: Commit**

Do not commit yet; implementation is next.

### Task 3: Implement the reversed drop-order navigation

**Files:**
- Modify: `src/lib/workflow/loading-drop-navigation.ts`
- Modify: `src/routes/(app)/loading/+page.svelte`

**Step 1: Update the helper with the smallest possible change**

Implement the new default and movement rules:

- when `selectedIndex` is omitted, default to `totalDrops - 1`
- preserve empty-state behavior when `totalDrops <= 0`
- reverse the movement delta so:
  - `next` decrements the index
  - `previous` increments the index
- keep `clampLoadingDropIndex()` unchanged unless the new tests prove it needs adjustment

**Step 2: Run helper test to verify it passes**

Run: `bun run test:unit -- --run 'src/lib/workflow/loading-drop-navigation.spec.ts'`

Expected: PASS

**Step 3: Wire the loading page to the new helper semantics**

Make the route-level changes needed for the footer controls to match the new workflow while preserving the existing UI:

- ensure the loading page derives its initial active drop from the helper default instead of a hard-coded `0`
- keep the current button placement and icons
- map the button click handlers so `Next` invokes the helper with `direction: 'next'` and `Previous` with `direction: 'previous'`
- preserve the existing detail/labels refresh behavior by continuing to drive everything from `selectedDropIndex`

**Step 4: Run route test to verify it passes**

Run: `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`

Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/workflow/loading-drop-navigation.ts src/lib/workflow/loading-drop-navigation.spec.ts src/routes/\(app\)/loading/+page.svelte src/routes/\(app\)/loading/loading-page.svelte.spec.ts
git commit -m "feat: start loading on the last drop"
```

Only commit if the user asks for one.

### Task 4: Verify the full loading slice and Svelte validity

**Files:**
- Verify: `src/lib/workflow/loading-drop-navigation.ts`
- Verify: `src/routes/(app)/loading/+page.svelte`

**Step 1: Run the focused loading specs together**

Run: `bun run test:unit -- --run 'src/lib/workflow/loading-drop-navigation.spec.ts|src/routes/(app)/loading/loading-page.svelte.spec.ts'`

Expected: PASS with zero failures.

**Step 2: Run the Svelte autofixer on the touched route**

Run: `npx @sveltejs/mcp svelte-autofixer src/routes/'(app)'/loading/+page.svelte --svelte-version 5`

Expected: no blocking issues; if it suggests meaningful fixes, apply only those relevant to the touched code.

**Step 3: Re-run the route spec if any route code changed after autofixer review**

Run: `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`

Expected: PASS

**Step 4: Review scope against the approved design**

Confirm the finished behavior matches all agreed points:

- opens on the last drop
- `Next` counts down
- `Previous` counts up
- no wraparound

**Step 5: Commit**

Do not add another commit unless verification fixes required code changes.

### Task 5: Record the behavior change in repo memory

**Files:**
- Modify: `docs/project-state.yaml`
- Modify: `docs/current-context.md`
- Modify: `docs/decisions.md`

**Step 1: Run Memory Impact Analysis**

Determine whether this change alters durable workflow behavior. It does: loading now starts on the final drop rather than the first.

**Step 2: Update the canonical memory files**

Record:

- the loading workflow now initializes at the last drop
- footer navigation runs in reverse numeric order to match floor operations
- focused verification commands that prove the change

**Step 3: Re-read the edited memory files for consistency**

Check that the wording does not contradict older notes about current drop behavior.

**Step 4: Re-run the focused loading specs one final time**

Run: `bun run test:unit -- --run 'src/lib/workflow/loading-drop-navigation.spec.ts|src/routes/(app)/loading/loading-page.svelte.spec.ts'`

Expected: PASS

**Step 5: Commit**

```bash
git add docs/project-state.yaml docs/current-context.md docs/decisions.md
git commit -m "docs: record reverse loading drop navigation"
```

Only commit if the user asks for one.
