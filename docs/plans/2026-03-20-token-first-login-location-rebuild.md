# Token-First Login And Location Rebuild Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild `app.css`, the login page, and the location page to match the new `docs/ui-reference/` token system and sample screen direction.

**Architecture:** Replace the leftover auth-specific gradient and serif token choices with a shared white-and-blue operational token system in `src/app.css`. Then rebuild the login and location screens on top of those tokens so both pages align with the new reference package instead of the earlier experimental auth styling.

**Tech Stack:** SvelteKit 5, Tailwind CSS 4, shadcn-svelte, shared CSS theme variables in `src/app.css`

---

### Task 1: Normalize global UI tokens in `src/app.css`

**Files:**
- Modify: `src/app.css`
- Reference: `docs/ui-reference/tokens.md`
- Reference: `docs/ui-reference/screen-map.md`

**Step 1: Remove auth-specific gradient-first styling**

Replace:
- auth page background gradients
- auth-only shadow/radius naming

With:
- white base background
- soft cool surface layers
- blue primary/secondary emphasis tokens
- shared radius tokens for control/card/panel

**Step 2: Add reusable operational UI component classes**

Create shared classes for:
- page canvas
- panel surface
- card surface
- control surface
- primary CTA
- muted pill/chip

**Step 3: Run verification**

Run: `bun run check`

Expected: `svelte-check found 0 errors and 0 warnings`

### Task 2: Rebuild the login screen

**Files:**
- Modify: `src/routes/(auth)/+layout.svelte`
- Modify: `src/routes/(auth)/login/+page.svelte`

**Step 1: Remove the old auth hero styling**

Keep:
- Dakota branding
- centered composition

Change:
- no page background gradient
- white page with blue accents
- calmer whitespace and card proportions

**Step 2: Rebuild the login form card with shared tokens**

Use:
- white card
- sans heading
- filled controls
- blue CTA
- muted links and notices

**Step 3: Run Svelte autofixer**

Run:
- `npx @sveltejs/mcp svelte-autofixer 'src/routes/(auth)/+layout.svelte' --svelte-version 5`
- `npx @sveltejs/mcp svelte-autofixer 'src/routes/(auth)/login/+page.svelte' --svelte-version 5`

Expected: no issues or required follow-up fixes

### Task 3: Rebuild the location page

**Files:**
- Modify: `src/routes/(app)/location/+page.svelte`
- Reference: `docs/ui-reference/screens/module-selector-two-column.html`
- Reference: `docs/ui-reference/screens/category-selection-strict-v4.html`

**Step 1: Replace the current auth-like panel styling**

Shift to:
- white/light surfaces
- softer grouped layout
- stronger operational hierarchy

**Step 2: Build target cards that feel like real module/category selectors**

Use:
- large white cards for inactive targets
- blue filled card for selected target
- cleaner supporting copy
- clear current session summary

**Step 3: Run Svelte autofixer**

Run:
- `npx @sveltejs/mcp svelte-autofixer 'src/routes/(app)/location/+page.svelte' --svelte-version 5`

Expected: no issues or required follow-up fixes

### Task 4: Final verification

**Files:**
- Verify: `src/app.css`
- Verify: `src/routes/(auth)/+layout.svelte`
- Verify: `src/routes/(auth)/login/+page.svelte`
- Verify: `src/routes/(app)/location/+page.svelte`

**Step 1: Run type/style verification**

Run: `bun run check`

Expected: `svelte-check found 0 errors and 0 warnings`

**Step 2: Run focused auth shell browser verification**

Run: `bun run test:e2e -- src/routes/app-shell.e2e.ts`

Expected: all targeted auth-shell tests pass
