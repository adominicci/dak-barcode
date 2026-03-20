# DAK-192 Shared Types Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a shared TypeScript contract for auth context, targets, operational records, and scan I/O that future proxy and remote-function tickets can consume without leaking backend wire shapes into app code.

**Architecture:** Make `src/lib/types/index.ts` the canonical frontend/domain contract, then isolate exact DST and DAK payload shapes in raw type modules plus server-only mappers. Keep all backend casing and normalization at the server boundary so UI, stores, and remote wrappers speak one stable camelCase contract.

**Tech Stack:** SvelteKit 5, TypeScript strict mode, Vitest, Supabase Auth types

---

### Task 1: Establish the canonical shared type barrel and auth bridge

**Files:**
- Create: `src/lib/types/index.ts`
- Modify: `src/lib/auth/types.ts`
- Modify: `src/lib/server/auth-context.ts`
- Modify: `src/lib/server/auth-context.spec.ts`

**Step 1: Add failing assertions for target categories and auth-context compatibility**

Run: `bun run test:unit -- --run src/lib/types/index.spec.ts`
Expected: FAIL because `$lib/types` and its exports do not exist yet

**Step 2: Move canonical auth and target contracts into the shared barrel**

Define:
- `WarehouseAlias`
- `FrontendTarget`
- `DstTarget`
- `DakTarget`
- `AccessState`
- `UserRole`
- `Warehouse`
- `Profile`
- `AuthContext`

**Step 3: Keep the current auth import surface stable**

Make `src/lib/auth/types.ts` a compatibility re-export layer so existing auth code can continue to import the same names.

**Step 4: Verify the first target/type slice**

Run:
- `bun run test:unit -- --run src/lib/types/index.spec.ts`
- `bun run test:unit -- --run src/lib/server/auth-context.spec.ts`

Expected: both pass

### Task 2: Add raw backend types and server-only mappers

**Files:**
- Create: `src/lib/types/raw-dst.ts`
- Create: `src/lib/types/raw-dak.ts`
- Create: `src/lib/server/type-mappers.ts`
- Create: `src/lib/server/type-mappers.spec.ts`

**Step 1: Write failing mapper tests with representative fixtures**

Cover:
- loaders
- dropsheets
- drop areas
- load view detail
- load view union
- loader info
- department status

**Step 2: Define exact raw DST and DAK interfaces**

Keep original backend field names and casing in the raw type files only.

**Step 3: Implement pure raw-to-domain mappers**

Normalize backend payloads into canonical camelCase shared types at the server boundary only.

**Step 4: Verify mapper behavior**

Run: `bun run test:unit -- --run src/lib/server/type-mappers.spec.ts`
Expected: PASS

### Task 3: Lock the operational and scan contracts

**Files:**
- Modify: `src/lib/types/index.ts`
- Modify: `src/lib/server/type-mappers.ts`
- Modify: `src/lib/server/type-mappers.spec.ts`

**Step 1: Add canonical operational models**

Define:
- `Loader`
- `DropSheet`
- `DropArea`
- `LoadViewDetail`
- `LoadViewUnion`
- `LoaderSession`
- `LoaderInfo`
- `DepartmentStatus`

**Step 2: Add scan contracts**

Define:
- `StagingScanRequest`
- `LoadingScanRequest`
- `ScanResult`

`ScanResult` should be a discriminated union with:
- `success`
- `needs-location`
- `invalid-location`
- `does-not-belong`
- `incomplete-drop`
- `no-match`
- `api-error`

**Step 3: Verify the normalized scan and status contract**

Run: `bun run test:unit -- --run src/lib/server/type-mappers.spec.ts`
Expected: PASS with scan/status fixtures and narrowing coverage

### Task 4: Align architecture docs

**Files:**
- Modify: `docs/architecture.md`

**Step 1: Correct the remote-function placement note**

Document that `.remote.ts` files must live outside `$lib/server`, and that shared canonical types now live in `$lib/types`.

**Step 2: Final verification**

Run:
- `bun run test:unit -- --run src/lib/types/index.spec.ts src/lib/server/auth-context.spec.ts src/lib/server/type-mappers.spec.ts`
- `bun run check`

Expected:
- all targeted unit tests pass
- `svelte-check found 0 errors and 0 warnings`
