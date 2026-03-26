# Select Category Load Number And Status Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `/select-category/[dropsheetId]` show the real carried load number, route its back button to the dropsheet list for the loading flow, and use the real `dak-web` department-status data for department card badges instead of inferred label-count state.

**Architecture:** Keep the legacy DST responsibilities and the newer `dak-web` responsibilities separate. The dropsheet list and top summary strip continue to use DST-backed dropsheet data, while the per-department card badge is driven by the real `DAK-195` `dak-web` department-status endpoint. Back navigation is fixed by making the authenticated app header route-aware instead of hardcoded to `/home`.

**Correction (2026-03-26):** Live validation against the legacy FlutterFlow app and the current backend responses showed that Select Category cannot safely depend on `GET /v1/scan/department-status` yet. The legacy page reads DST `check-onload-statusDS-departments` for its visible department state, while loader-session start only relies on the returned `loader_id`. Until `DAK-195` is verified end-to-end for this route, Select Category should stay on the DST status payload and treat the DAK session-start response as a minimal id handoff.

**Tech Stack:** SvelteKit 5, Svelte runes, TypeScript, Bun, Vitest, Tailwind 4, remote functions, `dak-web` proxy helpers, DST proxy helpers.

---

### Task 1: Lock The Regressions With Failing Tests

**Files:**
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/select-category/[dropsheetId]/select-category-page.server.spec.ts`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/loading/loading-page.svelte.spec.ts` only if a shared header/navigation change affects loading flow expectations

**Step 1: Write the failing test**

Add coverage for:
- Select Category shows the carried `loadNumber` and never falls back to raw `dropSheetId` when the query string contains `loadNumber`
- Select Category back link resolves to `/dropsheets` for this flow
- Department cards use a dedicated `dak-web` department-status query result, not the DST label-count availability payload
- The top strip may still render DST dropsheet status independently from card status

**Step 2: Run test to verify it fails**

Run:

```bash
bun run test:unit -- --run src/routes/\(app\)/select-category/\[dropsheetId\]/select-category-page.svelte.spec.ts src/routes/\(app\)/select-category/\[dropsheetId\]/select-category-page.server.spec.ts src/routes/\(app\)/dropsheets/dropsheets-page.svelte.spec.ts
```

Expected:
- failures showing current fallback-to-dropsheet-id behavior
- failures showing back link still points to `/home`
- failures showing card badge still comes from the wrong source

**Step 3: Commit the failing expectations mentally, not in git**

Do not implement yet. Confirm the failures match the three reported user-facing bugs.

### Task 2: Implement The Real `dak-web` Department Status Contract

**Files:**
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/lib/types/raw-dak.ts`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/lib/types/index.ts`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/lib/server/type-mappers.ts`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/lib/server/type-mappers.spec.ts`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/lib/server/dak-department-status.ts`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/lib/server/dak-department-status.spec.ts`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/lib/department-status.remote.ts`

**Step 1: Write the failing test**

Add server tests for:
- `getDakOnLoadStatusAllDepts(dropSheetId)` calling `fetchDak('/v1/scan/department-status?...')`
- parsing the real `dak-web` payload into the shared `DepartmentStatus` shape
- preserving legacy blocking/status values exactly

If the endpoint returns an `is_blocked` shape in addition to status fields, ignore it for now unless the page needs it immediately.

**Step 2: Run test to verify it fails**

Run:

```bash
bun run test:unit -- --run src/lib/server/dak-department-status.spec.ts src/lib/server/type-mappers.spec.ts
```

Expected:
- failure because `dak-department-status.ts` still returns placeholder null data

**Step 3: Write minimal implementation**

Implement:
- a raw `dak-web` department status payload type in [`raw-dak.ts`](/Users/andresdominicci/Projects/dak-barcode/src/lib/types/raw-dak.ts)
- a mapper that converts the `dak-web` payload into the shared `DepartmentStatus`
- `getDakOnLoadStatusAllDepts(dropSheetId)` using `fetchDak`
- remote wrapper stays in [`department-status.remote.ts`](/Users/andresdominicci/Projects/dak-barcode/src/lib/department-status.remote.ts)

Use the real route constant already present:
- `DAK_DEPARTMENT_STATUS_ROUTE = '/v1/scan/department-status'`

**Step 4: Run test to verify it passes**

Run:

```bash
bun run test:unit -- --run src/lib/server/dak-department-status.spec.ts src/lib/server/type-mappers.spec.ts
```

Expected:
- pass with real `dak-web` query behavior

### Task 3: Separate Department Availability From Department Status In Select Category

**Files:**
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/select-category/[dropsheetId]/+page.svelte`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`

**Step 1: Write the failing test**

Ensure the component test distinguishes:
- DST label-count data controls which department cards are visible
- `dak-web` department-status data controls the badge text/tone for the visible cards

Example expectation:
- `rollHasLabels > 0` can make Roll visible
- Roll card badge must come from `getOnLoadStatusAllDepts()` result, not from `rollScannedPercent`

**Step 2: Run test to verify it fails**

Run:

```bash
bun run test:unit -- --run src/routes/\(app\)/select-category/\[dropsheetId\]/select-category-page.svelte.spec.ts
```

Expected:
- failure because the page currently reads card status from DST strip data

**Step 3: Write minimal implementation**

In [`+page.svelte`](/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/select-category/[dropsheetId]/+page.svelte):
- restore `getOnLoadStatusAllDepts(data.dropSheetId)` for the department card badge source
- keep `getDropsheetCategoryAvailability(data.dropSheetId)` for filtering only
- if needed, keep the top strip on `getDropsheetStatus(data.dropSheetId)` only if that matches the legacy strip behavior and does not conflict with the newly restored card status source

This task should leave the page with three separate concerns:
- carried page identity data
- DST label-count availability filter
- `dak-web` department-status badge state

**Step 4: Run test to verify it passes**

Run:

```bash
bun run test:unit -- --run src/routes/\(app\)/select-category/\[dropsheetId\]/select-category-page.svelte.spec.ts
```

Expected:
- pass with the correct separation of responsibilities

### Task 4: Fix Load Number Handoff End-To-End

**Files:**
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/dropsheets/+page.svelte`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/select-category/[dropsheetId]/+page.server.ts`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/dropsheets/dropsheets-page.svelte.spec.ts`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/select-category/[dropsheetId]/select-category-page.server.spec.ts`

**Step 1: Write the failing test**

Assert:
- clicking a dropsheet row navigates to `/select-category/:dropsheetId?loadNumber=<exact-load-number>`
- Select Category server load exposes that exact `loadNumber`
- Select Category UI renders the exact carried value from the list

**Step 2: Run test to verify it fails**

Run:

```bash
bun run test:unit -- --run src/routes/\(app\)/dropsheets/dropsheets-page.svelte.spec.ts src/routes/\(app\)/select-category/\[dropsheetId\]/select-category-page.server.spec.ts src/routes/\(app\)/select-category/\[dropsheetId\]/select-category-page.svelte.spec.ts
```

Expected:
- failure if any fallback still shows `dropSheetId`

**Step 3: Write minimal implementation**

Make sure:
- dropsheet row click passes `dropsheet.loadNumber`
- Select Category reads `url.searchParams.get('loadNumber')`
- only use `String(dropSheetId)` as a defensive fallback when query string is genuinely absent
- no component should prefer `dropSheetId` when `loadNumber` exists

**Step 4: Run test to verify it passes**

Run the same command again and confirm all load-number assertions pass.

### Task 5: Make The Select Category Back Arrow Return To Dropsheets

**Files:**
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/+layout.svelte`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
- Modify: `/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/loading/loading-page.svelte.spec.ts` only if shared-header behavior needs regression coverage

**Step 1: Write the failing test**

Add a test for the authenticated header/back link resolution:
- `/select-category/*` should back-link to `/dropsheets`
- `/dropsheets` can still back-link to `/home`
- `/loading` should keep its own intended navigation behavior from `DAK-205`

**Step 2: Run test to verify it fails**

Run:

```bash
bun run test:unit -- --run src/routes/\(app\)/select-category/\[dropsheetId\]/select-category-page.svelte.spec.ts src/routes/\(app\)/loading/loading-page.svelte.spec.ts
```

Expected:
- failure because layout currently hardcodes non-home routes to `/home`

**Step 3: Write minimal implementation**

In [`+layout.svelte`](/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/+layout.svelte):
- derive a route-aware back target
- for `page.url.pathname.startsWith('/select-category')`, use `resolve('/dropsheets')`
- keep existing behavior unchanged for unrelated routes

Do not persist new workflow state just to make this work.

**Step 4: Run test to verify it passes**

Run the same command again and confirm the back target is correct.

### Task 6: Run Focused Regression Verification

**Files:**
- No code changes unless regressions appear

**Step 1: Run the full focused suite**

Run:

```bash
bun run test:unit -- --run src/lib/server/dak-department-status.spec.ts src/lib/server/type-mappers.spec.ts src/routes/\(app\)/dropsheets/dropsheets-page.svelte.spec.ts src/routes/\(app\)/select-category/\[dropsheetId\]/select-category-page.server.spec.ts src/routes/\(app\)/select-category/\[dropsheetId\]/select-category-page.svelte.spec.ts src/routes/\(app\)/loading/loading-page.svelte.spec.ts src/lib/workflow/loading-lifecycle.spec.ts src/lib/workflow/stores.spec.ts
```

Expected:
- all pass

**Step 2: Run framework verification**

Run:

```bash
bun run check
```

Expected:
- `svelte-check found 0 errors and 0 warnings`

**Step 3: Run Svelte hygiene tools before claiming success**

Run the Svelte autofixer against edited route files and resolve any issues:
- [`src/routes/(app)/select-category/[dropsheetId]/+page.svelte`](/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/select-category/[dropsheetId]/+page.svelte)
- [`src/routes/(app)/dropsheets/+page.svelte`](/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/dropsheets/+page.svelte)
- [`src/routes/(app)/+layout.svelte`](/Users/andresdominicci/Projects/dak-barcode/src/routes/(app)/+layout.svelte)

### Task 7: Finish The Branch Cleanly

**Files:**
- Review: `git diff --stat`

**Step 1: Inspect the final diff**

Run:

```bash
git diff --stat
git status --short
```

Expected:
- only intended files changed
- no unrelated refactors

**Step 2: Commit**

Use an English git message, for example:

```bash
git add src/lib/department-status.remote.ts src/lib/server/dak-department-status.ts src/lib/server/dak-department-status.spec.ts src/lib/server/type-mappers.ts src/lib/server/type-mappers.spec.ts src/lib/types/index.ts src/lib/types/raw-dak.ts src/routes/\(app\)/+layout.svelte src/routes/\(app\)/dropsheets/+page.svelte src/routes/\(app\)/dropsheets/dropsheets-page.svelte.spec.ts src/routes/\(app\)/select-category/\[dropsheetId\]/+page.server.ts src/routes/\(app\)/select-category/\[dropsheetId\]/+page.svelte src/routes/\(app\)/select-category/\[dropsheetId\]/select-category-page.server.spec.ts src/routes/\(app\)/select-category/\[dropsheetId\]/select-category-page.svelte.spec.ts docs/plans/2026-03-26-select-category-load-number-and-status-fix.md
git commit -m "fix: restore select category load number and real department status"
```

**Step 3: Do not create a worktree**

Execution must stay on the current `features/dak-205` branch in this workspace because the user explicitly requested no worktree.
