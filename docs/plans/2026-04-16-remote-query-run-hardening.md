# Remote Query Run Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove remaining production-risk misuse of SvelteKit remote `query(...)` functions in imperative event handlers, and cover each fixed path with focused regression tests.

**Architecture:** Keep reactive `query(...)` usage where the query is anchored in `$derived(...)` or template state, but convert one-off imperative event-handler reads to `query(...).run()` per current SvelteKit remote-functions guidance. Limit the change set to the exact handler sites already identified so behavior stays stable and the fix remains auditable.

**Tech Stack:** SvelteKit 5 remote functions, Svelte 5 runes, Vitest browser tests, Bun, `@sveltejs/mcp` autofixer.

---

### Task 1: Lock in the `select-category` loading handoff fix

**Files:**
- Modify: `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`
- Verify: `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`

**Step 1: Keep the failing test that proves imperative loading uses `.run()`**

Test shape already added in:
- `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`

Assertion to preserve:
```ts
const runNumberOfDrops = vi.fn().mockResolvedValue(14);
getNumberOfDrops.mockReturnValue({ run: runNumberOfDrops });
...
expect(runNumberOfDrops).toHaveBeenCalledOnce();
```

**Step 2: Run the single test to verify it would fail without the fix**

Run:
```bash
bunx vitest run 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts' --testNamePattern 'opens the loader modal on every department tap and persists the chosen loader for the loading handoff'
```

Expected now: PASS

**Step 3: Keep the minimal implementation in place**

Implementation in:
- `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`

Critical line:
```ts
await getNumberOfDrops({
	dropSheetId: data.dropSheetId,
	locationId
}).run();
```

**Step 4: Re-run the focused route test**

Run:
```bash
bunx vitest run 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'
```

Expected: PASS

---

### Task 2: Fix will-call scan modal imperative query usage

**Files:**
- Modify: `src/lib/components/workflow/will-call-scan-modal.svelte`
- Modify: `src/lib/components/workflow/will-call-scan-modal.svelte.spec.ts`
- Optional verification touchpoint: `src/routes/(app)/home/home-page.svelte.spec.ts`

**Step 1: Write the failing test for `.run()`**

In:
- `src/lib/components/workflow/will-call-scan-modal.svelte.spec.ts`

Change the mock to return a query-like object:
```ts
const lookupRequest = createDeferred<{ dropSheetId: number }>();
const runLookup = vi.fn().mockReturnValue(lookupRequest.promise);
lookupWillCallDropsheet.mockReturnValue({ run: runLookup });
```

Add/assert:
```ts
expect(lookupWillCallDropsheet).toHaveBeenCalledWith('WC-042');
expect(runLookup).toHaveBeenCalledOnce();
```

**Step 2: Run the component test to verify RED**

Run:
```bash
bunx vitest run 'src/lib/components/workflow/will-call-scan-modal.svelte.spec.ts'
```

Expected before code change: FAIL because `.run()` is not called.

**Step 3: Implement the minimal fix**

In:
- `src/lib/components/workflow/will-call-scan-modal.svelte`

Change:
```ts
const result = await lookupWillCallDropsheet(loadNumber);
```

To:
```ts
const result = await lookupWillCallDropsheet(loadNumber).run();
```

**Step 4: Re-run the component test**

Run:
```bash
bunx vitest run 'src/lib/components/workflow/will-call-scan-modal.svelte.spec.ts'
```

Expected: PASS

**Step 5: Re-run the home route will-call entry tests**

Run:
```bash
bunx vitest run 'src/routes/(app)/home/home-page.svelte.spec.ts'
```

Expected: PASS

---

### Task 3: Fix staging location modal imperative lookup usage

**Files:**
- Modify: `src/lib/components/workflow/staging-location-modal.svelte`
- Modify: `src/lib/components/workflow/staging-location-modal.svelte.spec.ts`
- Verify through dependent suites:
  - `src/routes/(app)/staging/staging-page.svelte.spec.ts`
  - `src/routes/(app)/loading/loading-page.svelte.spec.ts`
  - `src/routes/(app)/move-orders/[dropsheetId]/move-orders-page.svelte.spec.ts`

**Step 1: Add a failing lookup-submit test**

In:
- `src/lib/components/workflow/staging-location-modal.svelte.spec.ts`

Add a focused test for manual numeric lookup submission:
```ts
it('resolves numeric lookup through getDropArea().run()', async () => {
	const onSelect = vi.fn();
	const runLookup = vi.fn().mockResolvedValue({
		id: 31,
		name: 'C3',
		supportsWrap: true,
		supportsParts: false,
		supportsRoll: false,
		supportsLoading: false,
		supportsDriverLocation: false,
		firstCharacter: 'C'
	});
	getDropArea.mockReturnValue({ run: runLookup });
	getDropAreasByDepartment.mockReturnValue(createQueryState([]));

	render(StagingLocationModal, {
		props: {
			department: 'Wrap',
			mode: 'staging',
			target: 'Canton',
			onClose: vi.fn(),
			onSelect
		}
	});

	await page.getByLabelText('Scan new location').fill('31');
	await page.getByRole('button', { name: 'Set location' }).click();

	expect(getDropArea).toHaveBeenCalledWith(31);
	expect(runLookup).toHaveBeenCalledOnce();
	await vi.waitFor(() => {
		expect(onSelect).toHaveBeenCalledWith({ dropAreaId: 31, dropAreaLabel: 'C3' });
	});
});
```

**Step 2: Run the modal test to verify RED**

Run:
```bash
bunx vitest run 'src/lib/components/workflow/staging-location-modal.svelte.spec.ts'
```

Expected before code change: FAIL because `.run()` is not called.

**Step 3: Implement the minimal fix**

In:
- `src/lib/components/workflow/staging-location-modal.svelte`

Change:
```ts
const dropArea = await getDropArea(parsedDropAreaId);
```

To:
```ts
const dropArea = await getDropArea(parsedDropAreaId).run();
```

**Step 4: Re-run the modal suite**

Run:
```bash
bunx vitest run 'src/lib/components/workflow/staging-location-modal.svelte.spec.ts'
```

Expected: PASS

**Step 5: Re-run dependent route suites that mount this modal**

Run:
```bash
bunx vitest run 'src/routes/(app)/staging/staging-page.svelte.spec.ts' 'src/routes/(app)/loading/loading-page.svelte.spec.ts' 'src/routes/(app)/move-orders/[dropsheetId]/move-orders-page.svelte.spec.ts'
```

Expected: PASS

---

### Task 4: Fix `select-category` will-call signature query usage

**Files:**
- Modify: `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`
- Modify: `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`

**Step 1: Add a failing test for opening the signature modal**

In:
- `src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts`

Add a focused test for the open path:
```ts
it('loads the will call signature through getWillCallSignature().run() before opening the modal', async () => {
	const runSignature = vi.fn().mockResolvedValue({
		dropSheetId: 42,
		receivedBy: 'Alex',
		signaturePath: 'sig.png',
		createdAt: '2026-04-16T12:00:00.000Z'
	});
	getWillCallSignature.mockReturnValue({ run: runSignature });

	render(SelectCategoryPage, {
		params: { dropsheetId: '42' },
		form: null,
		data: {
			...layoutData,
			dropSheetId: 42,
			loadNumber: 'WC-042',
			driverName: 'WILL CALL',
			dropWeight: null,
			percentCompleted: 0,
			returnTo: '/home',
			willCall: true,
			loaders: [{ id: 7, name: 'Alex', isActive: true }]
		}
	});

	await page.getByRole('button', { name: 'Signature' }).click();

	expect(getWillCallSignature).toHaveBeenCalledWith(42);
	expect(runSignature).toHaveBeenCalledOnce();
	await expect.element(page.getByRole('dialog', { name: /Will Call Signature/i })).toBeInTheDocument();
});
```

**Step 2: Add a failing test for refresh after upload**

In the same spec, add a second focused test that triggers `onUploaded` and asserts a second `.run()`-based fetch. If direct child interaction is awkward, mock the modal component boundary or assert through the page state that the refreshed signature content was requested twice.

Minimum assertion:
```ts
expect(runSignature).toHaveBeenCalledTimes(2);
```

**Step 3: Run the route test to verify RED**

Run:
```bash
bunx vitest run 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts' --testNamePattern 'will call signature'
```

Expected before code change: FAIL because `.run()` is not called.

**Step 4: Implement the minimal fix**

In:
- `src/routes/(app)/select-category/[dropsheetId]/+page.svelte`

Change both imperative reads:
```ts
willCallSignatureRecord = await getWillCallSignature(data.dropSheetId);
```

To:
```ts
willCallSignatureRecord = await getWillCallSignature(data.dropSheetId).run();
```

Call sites currently around:
- `openWillCallSignatureModal()`
- `onUploaded`

**Step 5: Re-run the focused route suite**

Run:
```bash
bunx vitest run 'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts'
```

Expected: PASS

---

### Task 5: Re-scan the repo for remaining imperative `await query(...)` misuse

**Files:**
- Audit only: `src/routes`, `src/lib`

**Step 1: Run the targeted grep**

Run:
```bash
rg -n "await\s+(lookupWillCallDropsheet|getWillCallSignature|getDropArea|getLoaderInfo|getLoadersForDropsheet|getDepartmentStatus|getOnLoadStatusAllDepts|getLoadViewDetail|getLoadViewUnion|getLoadViewDetailAll|getLegacyLoadViewAll|getLegacyOrderStatusRows|getLegacyMoveOrdersRows|getCategoryList|getStagingPartsForDay|getStagingPartsForDayRoll|getDropAreasByDepartment)\(" src/routes src/lib -g '!**/*.spec.ts'
```

**Step 2: Confirm only supported patterns remain**

Allowed after this work:
- reactive state access through `$derived(...)`, template, or stored query instances
- imperative one-off access through `.run()`
- `command(...)` direct awaits

**Step 3: If grep finds more imperative raw query awaits, add them to the same PR before closing the work**

---

### Task 6: Svelte validation and final verification

**Files:**
- Validate all touched Svelte files

**Step 1: Run Svelte autofixer on each touched Svelte file**

Run:
```bash
npx @sveltejs/mcp svelte-autofixer './src/lib/components/workflow/will-call-scan-modal.svelte' --async --svelte-version 5
npx @sveltejs/mcp svelte-autofixer './src/lib/components/workflow/staging-location-modal.svelte' --async --svelte-version 5
npx @sveltejs/mcp svelte-autofixer './src/routes/(app)/select-category/[dropsheetId]/+page.svelte' --async --svelte-version 5
```

Expected: no remaining issues

**Step 2: Run the focused test set**

Run:
```bash
bunx vitest run \
  'src/lib/components/workflow/will-call-scan-modal.svelte.spec.ts' \
  'src/lib/components/workflow/staging-location-modal.svelte.spec.ts' \
  'src/routes/(app)/home/home-page.svelte.spec.ts' \
  'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts' \
  'src/routes/(app)/staging/staging-page.svelte.spec.ts' \
  'src/routes/(app)/loading/loading-page.svelte.spec.ts' \
  'src/routes/(app)/move-orders/[dropsheetId]/move-orders-page.svelte.spec.ts'
```

Expected: PASS

**Step 3: Run the production build**

Run:
```bash
bun run build
```

Expected: PASS

**Step 4: Commit**

```bash
git add \
  'src/lib/components/workflow/will-call-scan-modal.svelte' \
  'src/lib/components/workflow/will-call-scan-modal.svelte.spec.ts' \
  'src/lib/components/workflow/staging-location-modal.svelte' \
  'src/lib/components/workflow/staging-location-modal.svelte.spec.ts' \
  'src/routes/(app)/select-category/[dropsheetId]/+page.svelte' \
  'src/routes/(app)/select-category/[dropsheetId]/select-category-page.svelte.spec.ts' \
  'docs/plans/2026-04-16-remote-query-run-hardening.md'

git commit -m "fix: harden imperative remote query calls"
```

