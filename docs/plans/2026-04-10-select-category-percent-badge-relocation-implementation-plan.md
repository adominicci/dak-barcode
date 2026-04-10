# Select-Category Percent Badge Relocation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the percent-complete badge on select-category department cards into the department heading row so loaders can see completion immediately.

**Architecture:** Keep the current select-category department card structure and styling language, but shift the existing blue percent chip from the lower metadata row into the title row next to the department name. Update the page spec first so the layout change is captured before the Svelte markup changes.

**Tech Stack:** SvelteKit 5, TypeScript, Vitest browser tests, Tailwind CSS 4

---

### Task 1: Capture the new department-card layout in a failing browser test

**Files:**
- Modify: `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
- Reference: `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`

**Step 1: Write the failing test**

Update the select-category page spec so it proves:

- the `Wrap` card still shows the current progress value
- the percentage badge is rendered in the heading region next to `Wrap`
- the badge still uses the existing blue chip styling family
- the lower metadata row no longer contains the percentage chip and only shows the loader chip

Use the existing `select-category-department-Wrap` card target so the assertions stay scoped to the card.

**Step 2: Run test to verify it fails**

Run: `bun run test:unit -- --run 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'`

Expected: FAIL because the current page still renders the percentage in the lower chip row.

**Step 3: Refine the assertions if needed**

If the failure is ambiguous, add tighter assertions around the card header and lower row so the failure clearly reflects placement rather than text presence alone.

**Step 4: Re-run the test to confirm the same failure**

Run: `bun run test:unit -- --run 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'`

Expected: FAIL with the same badge-placement mismatch.

**Step 5: Commit**

Do not commit yet.

### Task 2: Implement the badge move with the smallest Svelte change

**Files:**
- Modify: `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`

**Step 1: Move the percentage badge into the heading row**

Adjust the department card markup so:

- the department name and percent badge sit together in the left side of the header
- the status pill remains right-aligned
- the badge uses the current blue chip class family with slightly larger type/padding for better visibility

**Step 2: Remove the duplicate lower-row percent chip**

Keep the lower row focused on the loader chip while preserving the current card spacing and progress bar.

**Step 3: Run the browser spec to verify it passes**

Run: `bun run test:unit -- --run 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'`

Expected: PASS

**Step 4: Run Svelte autofixer**

Run: `npx @sveltejs/mcp svelte-autofixer "src/routes/(app)/select-category/[dropsheetId]/+page.svelte" --svelte-version 5`

Expected: no blocking issues.

**Step 5: Commit**

```bash
git add src/routes/\(app\)/select-category/[dropsheetId]/+page.svelte src/routes/\(app\)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts
git commit -m "feat: move select-category progress badge into header"
```

Only commit if the user asks for one.

### Task 3: Verify scope and update repo memory if needed

**Files:**
- Possibly modify: `docs/current-context.md`
- Possibly modify: `docs/decisions.md`
- Possibly modify: `docs/project-state.yaml`

**Step 1: Run Memory Impact Analysis**

Check whether this change alters durable workflow behavior or only card presentation. This is most likely presentation-only, so memory docs may not need an update unless the placement becomes a durable UI convention worth recording.

**Step 2: Re-run focused verification after any follow-up edits**

Run: `bun run test:unit -- --run 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'`

Expected: PASS

**Step 3: Confirm the finished UI matches the approved design**

Verify:

- percent badge is next to the department name
- status pill still aligns on the right
- lower row keeps only the loader chip

**Step 4: If memory docs are updated, review for contradictions**

Only document the change if it rises above a local presentation tweak.

**Step 5: Commit**

Do not create an additional commit unless the user asks for one.
