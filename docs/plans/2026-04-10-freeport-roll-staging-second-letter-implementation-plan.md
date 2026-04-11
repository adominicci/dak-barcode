# Freeport Roll Staging Second-Letter Filter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a second tab row to the staging location selector only for Freeport Roll so large location sets can be narrowed by the next alphabetic segment after the first letter.

**Architecture:** Keep the existing first-letter grouping as the primary structure in `staging-location-modal.svelte`. Add a second derived grouping only when `mode === 'staging'`, `target === 'Freeport'`, and `department === 'Roll'`, with `All` as the default second-level tab and dash-insensitive second-letter extraction.

**Tech Stack:** SvelteKit 5, Svelte 5 runes, TypeScript, Vitest Browser

---

### Task 1: Add component-level regression coverage for the new filtering rules

**Files:**
- Modify: `src/lib/components/workflow/staging-location-modal.svelte.spec.ts`

**Step 1: Write the failing test**

- Add a Freeport Roll test that seeds locations like `A-R-1`, `A-D-2`, `A-M-1`, `A-12`, `B-R-1`.
- Assert:
  - first-level tabs still show `A`, `B`
  - selecting `A` shows second-level tabs `All`, `D`, `M`, `R`
  - `All` includes every `A-*` entry, including entries with no second letter
  - selecting `R` shows only `A-R-*`
- Add a separate test proving the second-level row does not render for Canton Roll or Freeport Wrap.

**Step 2: Run test to verify it fails**

Run: `bun run test:unit src/lib/components/workflow/staging-location-modal.svelte.spec.ts --run`
Expected: FAIL because the modal currently only supports one tab row.

**Step 3: Write minimal implementation**

- Add helper logic in `src/lib/components/workflow/staging-location-modal.svelte` to:
  - detect whether nested filtering is enabled
  - derive second-letter keys from the active first-letter group
  - default the second-level selection to `All`
  - reset second-level selection when the first-level tab changes
- Render a second tab row only in the Freeport Roll staging case.

**Step 4: Run test to verify it passes**

Run: `bun run test:unit src/lib/components/workflow/staging-location-modal.svelte.spec.ts --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/components/workflow/staging-location-modal.svelte src/lib/components/workflow/staging-location-modal.svelte.spec.ts
git commit -m "feat: add Freeport Roll second-letter staging filters"
```

### Task 2: Add staging-page integration coverage for the Freeport-only behavior

**Files:**
- Modify: `src/routes/(app)/staging/staging-page.svelte.spec.ts`

**Step 1: Write the failing test**

- Add a staging page test that opens the location modal in a Freeport Roll scenario and asserts the second-level tab row appears.
- Add or adjust a nearby test to confirm the existing single-row behavior remains for non-Freeport or non-Roll cases.

**Step 2: Run test to verify it fails**

Run: `bun run test:unit src/routes/(app)/staging/staging-page.svelte.spec.ts --run`
Expected: FAIL because the integration surface does not yet expose the second-level tabs.

**Step 3: Write minimal implementation**

- Ensure the existing `target={activeTarget}` path from `src/routes/(app)/staging/+page.svelte` continues to drive the modal behavior without adding new route contracts.
- If needed, add only the smallest accessibility/test identifiers required for the integration assertions.

**Step 4: Run test to verify it passes**

Run: `bun run test:unit src/routes/(app)/staging/staging-page.svelte.spec.ts --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/routes/'(app)'/staging/staging-page.svelte.spec.ts
git commit -m "test: cover Freeport Roll nested staging filters"
```

### Task 3: Run focused verification and Svelte validation

**Files:**
- Modify: none

**Step 1: Run focused suites**

Run: `bun run test:unit src/lib/components/workflow/staging-location-modal.svelte.spec.ts --run`
Expected: PASS

Run: `bun run test:unit src/routes/(app)/staging/staging-page.svelte.spec.ts --run`
Expected: PASS

**Step 2: Run Svelte validation**

Run Svelte autofixer on:
- `src/lib/components/workflow/staging-location-modal.svelte`

Expected: no blocking issues; if suggestions appear, resolve them if they are introduced by the change.

**Step 3: Perform Memory Impact Analysis**

- If this ships as a runtime change, update:
  - `docs/project-state.yaml`
  - `docs/current-context.md`
- Add a `docs/decisions.md` entry only if the nested Freeport Roll rule is considered a durable product decision rather than a ticket-local tweak.

**Step 4: Commit verification/docs updates if needed**

```bash
git add docs/project-state.yaml docs/current-context.md docs/decisions.md
git commit -m "docs: refresh memory for Freeport Roll staging filters"
```
