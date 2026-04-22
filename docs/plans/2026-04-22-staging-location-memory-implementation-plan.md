# Staging Location Memory Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make staging open the location selector automatically after a valid label scan without a location, keep selected locations sticky for `Wrap` and `Parts`, and enforce single-use locations for `Roll`.

**Architecture:** Keep the existing staging controller/page split. The controller should report when a missing-location scan must open the modal, while the page continues owning modal visibility, pending-scan retries, and workflow store updates. Preserve the current Roll location-clearing rule after successful non-location scans.

**Tech Stack:** SvelteKit 5, Svelte 5 runes, TypeScript, Vitest browser tests

---

### Task 1: Lock the controller contract

**Files:**
- Modify: `src/lib/workflow/staging-scan-controller.spec.ts`
- Modify: `src/lib/workflow/staging-scan-controller.ts`

**Step 1: Write the failing test**

Add a spec asserting that a `needs-location` result returns `openLocationModal: true` while keeping the pending scan intact.

**Step 2: Run test to verify it fails**

Run: `bun run test:unit -- --run src/lib/workflow/staging-scan-controller.spec.ts`
Expected: FAIL because the controller still returns `openLocationModal: false`.

**Step 3: Write minimal implementation**

Update the `needs-location` action in `createStagingScanController` to request automatic modal opening.

**Step 4: Run test to verify it passes**

Run: `bun run test:unit -- --run src/lib/workflow/staging-scan-controller.spec.ts`
Expected: PASS

### Task 2: Prove sticky Wrap and Parts behavior through the page

**Files:**
- Modify: `src/routes/(app)/staging/staging-page.svelte.spec.ts`
- Modify: `src/routes/(app)/staging/+page.svelte`

**Step 1: Write the failing test**

Add a page spec where a `Parts` label without a location automatically opens the location modal, the modal lookup selects a location, the pending label retries successfully, and the selected location remains visible afterward.

**Step 2: Run test to verify it fails**

Run: `bun run test:unit -- --run src/routes/'(app)'/staging/staging-page.svelte.spec.ts`
Expected: FAIL because the page currently leaves the modal closed after `needs-location`.

**Step 3: Write minimal implementation**

Wire the page to honor the controller’s auto-open modal action and keep the selected location for non-Roll departments.

**Step 4: Run test to verify it passes**

Run: `bun run test:unit -- --run src/routes/'(app)'/staging/staging-page.svelte.spec.ts`
Expected: PASS for the new Parts flow.

### Task 3: Prove Roll single-use behavior

**Files:**
- Modify: `src/routes/(app)/staging/staging-page.svelte.spec.ts`
- Modify: `src/routes/(app)/staging/+page.svelte` if needed

**Step 1: Write the failing tests**

Add one spec for the auto-open Roll missing-location cycle and one spec for manually preselecting a Roll location before a label scan. Both should assert that the location clears after the next successful non-location scan.

**Step 2: Run tests to verify they fail**

Run: `bun run test:unit -- --run src/routes/'(app)'/staging/staging-page.svelte.spec.ts`
Expected: FAIL until the page/controller contract matches the new flow.

**Step 3: Write minimal implementation**

Adjust the staging page only if the existing Roll clear-on-success path is not enough once the modal opens automatically.

**Step 4: Run tests to verify they pass**

Run: `bun run test:unit -- --run src/routes/'(app)'/staging/staging-page.svelte.spec.ts`
Expected: PASS

### Task 4: Verify Svelte correctness and repo impact

**Files:**
- Modify: `docs/current-context.md` if the Memory Impact Analysis shows a current-context update is needed
- Modify: `docs/decisions.md` only if a durable product rule changed
- Modify: `docs/project-state.yaml` only if canonical status needs updating

**Step 1: Run focused validation**

Run:
- `bun run test:unit -- --run src/lib/workflow/staging-scan-controller.spec.ts src/routes/'(app)'/staging/staging-page.svelte.spec.ts`
- `npx @sveltejs/mcp svelte-autofixer ./src/routes/'(app)'/staging/+page.svelte --svelte-version 5`

Expected: PASS with no autofixer-reported issues that require code changes.

**Step 2: Run Memory Impact Analysis**

Inspect `docs/project-state.yaml`, `docs/current-context.md`, and `docs/decisions.md`, then update only the files that genuinely changed because of this new staging behavior.

**Step 3: Final verification**

Run: `bun run check`
Expected: PASS
