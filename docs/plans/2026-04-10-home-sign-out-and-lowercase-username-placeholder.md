# Home Sign Out And Lowercase Username Placeholder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a header-level sign-out action to Home and normalize the shared auth placeholder to lowercase `username`.

**Architecture:** Reuse the existing `/logout` form post contract already used by the authenticated shell. Keep the Home module grid intact and make the placeholder change in the shared fixed-domain email field so both auth routes inherit the same copy.

**Tech Stack:** SvelteKit 5, Svelte 5 runes, TypeScript, Vitest Browser, Playwright

---

### Task 1: Add regression coverage for the requested UI behavior

**Files:**
- Modify: `src/routes/(app)/home/home-page.svelte.spec.ts`
- Modify: `src/routes/app-shell.e2e.ts`

**Step 1: Write the failing test**

- Add a Home page spec asserting there is a `Sign out` button inside a form posting to `/logout`.
- Change the auth-shell placeholder expectation from `Username` to `username`.

**Step 2: Run test to verify it fails**

Run: `bun run test:unit src/routes/(app)/home/home-page.svelte.spec.ts --run`
Expected: FAIL because Home does not yet render a sign-out form.

Run: `bunx playwright test src/routes/app-shell.e2e.ts --grep "generic username placeholder"`
Expected: FAIL because the placeholder is still uppercase.

**Step 3: Write minimal implementation**

- Add a small header form in `src/routes/(app)/home/+page.svelte` that posts to `/logout`.
- Reuse the existing rose-tinted sign-out button language from the authenticated shell.
- Change the shared fixed-domain email field default placeholder to lowercase `username`.

**Step 4: Run test to verify it passes**

Run: `bun run test:unit src/routes/(app)/home/home-page.svelte.spec.ts --run`
Expected: PASS

Run: `bunx playwright test src/routes/app-shell.e2e.ts --grep "generic username placeholder"`
Expected: PASS

**Step 5: Commit**

```bash
git add src/routes/'(app)'/home/+page.svelte src/routes/'(app)'/home/home-page.svelte.spec.ts src/lib/components/auth/fixed-domain-email-field.svelte src/routes/app-shell.e2e.ts docs/plans/2026-04-10-home-sign-out-and-placeholder-design.md docs/plans/2026-04-10-home-sign-out-and-lowercase-username-placeholder.md
git commit -m "feat: add home sign out action"
```
