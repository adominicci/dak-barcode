# Loading Label Chip Readability Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make loading label chips easier to read without changing the existing three-column grid or footer structure.

**Architecture:** Adjust only the loading route presentation layer: enlarge the label-chip text and bubble padding, and optionally tighten surrounding container padding to protect vertical space. Validate the visual contract first with the loading page browser test, then update the Svelte classes minimally.

**Tech Stack:** SvelteKit 5, TypeScript, Vitest browser tests, Tailwind CSS 4

---

### Task 1: Add a failing loading-page expectation for larger label chips

**Files:**
- Modify: `src/routes/(app)/loading/loading-page.svelte.spec.ts`
- Reference: `src/routes/(app)/loading/+page.svelte`

**Step 1: Write the failing test**

Extend the existing loading page spec so it proves:

- the label list still renders as a three-column grid
- the visible label chip text uses a larger class than the current compact style
- the chip container uses roomier padding

**Step 2: Run test to verify it fails**

Run: `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`

Expected: FAIL because the current chip still uses the smaller text and tighter padding.

### Task 2: Implement the loading label readability update

**Files:**
- Modify: `src/routes/(app)/loading/+page.svelte`

**Step 1: Enlarge the chip text and bubble**

Update the label chip classes so the text is easier to read and the bubble padding fits the new type size.

**Step 2: Tighten surrounding workspace padding only if needed**

Reduce top-area or list-container padding slightly, but keep the overall loading silhouette and the three-column grid intact.

**Step 3: Run the loading page spec**

Run: `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`

Expected: PASS

**Step 4: Run Svelte autofixer**

Run: `npx @sveltejs/mcp svelte-autofixer "src/routes/(app)/loading/+page.svelte" --svelte-version 5`

Expected: no new blocking issues related to the touched code.

### Task 3: Verify scope and close

**Files:**
- Verify: `src/routes/(app)/loading/+page.svelte`
- Verify: `src/routes/(app)/loading/loading-page.svelte.spec.ts`

**Step 1: Re-run the focused loading page spec**

Run: `bun run test:unit -- --run 'src/routes/(app)/loading/loading-page.svelte.spec.ts'`

Expected: PASS

**Step 2: Confirm the final UI contract**

Verify:

- larger label text
- slightly larger label bubble
- three columns preserved
- footer unchanged

**Step 3: Memory Impact Analysis**

This is a presentation-only tweak, so retrieval memory docs likely do not need updates unless the change becomes a durable UI rule.
