# Implementation Plan: Stage & Load Barcode Module Frontend

**Version**: 1.1
**Date**: 2026-03-19
**Companion docs**: `docs/prd.md`, `docs/architecture.md`

---

## Overview

This plan covers the frontend rebuild in this repository. It assumes backend endpoint work will happen separately in the FastAPI codebase and be integrated here as an external dependency.

The frontend critical path is:

**Scaffold -> Auth/Profile Gate -> Target Resolution -> Proxy Layer -> Core Pages -> Staging -> Loading**

---

## Delivery Rules

These rules apply to every milestone:

1. **TDD is mandatory.**
   - Write the failing test first
   - Run it to verify the failure
   - Implement the smallest change that makes it pass
   - Refactor safely
   - Re-run the relevant test suite before moving on

2. **Legacy behavior wins when docs and assumptions disagree.**
   - Use `legacy_flutterflow_fe/` to confirm edge cases
   - Keep local docs and Linear synchronized when discoveries change scope

3. **Framework examples must stay current.**
   - Validate documentation snippets against current docs before preserving them in plans or architecture notes

4. **Bun is the package-manager standard.**
   - Use `bun install` for dependencies
   - Use `bun run` for project scripts
   - Use `bunx` for one-off CLIs
   - Keep `bun.lock` committed as the package-manager source of truth

---

## Milestone 1: Project Scaffolding + Supabase Auth + Profile Gate

**Goal**: A user can authenticate, pass the active-profile check, resolve their target, and land on Home or the blocked screen.

**Duration estimate**: 3–4 days

### Tasks

**1.1 — Initialize the SvelteKit app**
- Create the SvelteKit 5 project with TypeScript
- Install Tailwind CSS 4
- Initialize shadcn-svelte
- Install `@lucide/svelte`
- Install `svelte-sonner`
- Establish the initial route groups:
  - `(auth)`
  - `(app)`

**1.2 — Set up Supabase browser/server clients**
- Install `@supabase/ssr`
- Install `@supabase/supabase-js`
- Create reusable browser/server client helpers
- Configure `hooks.server.ts` for authenticated requests

**1.3 — Add profile and warehouse resolution**
- Load the linked profile after auth
- Enforce active-profile gating
- Resolve warehouse for non-admin users from `profiles.warehouse_id -> warehouses.alias`
- Fall back to `Canton` for missing/unknown aliases
- Add admin-role handling for manual environment selection

**1.4 — Add auth flows**
- Login
- Logout
- Forgot password (email -> code)
- Reset password (code verification -> new password)
- Change password

**1.5 — Re-entry behavior**
- Keep auth session alive until logout
- Force valid sessions to return to Home on reopen/refresh
- Add inactive-account screen

### Definition of Done

- Active users can log in and reach Home
- Inactive users are blocked with the correct message
- Non-admin users resolve to a locked warehouse target
- Admin users are routed into the selector flow
- Forgot/reset password code flow is wired in the frontend

---

## Milestone 2: Proxy Layer + Remote Functions + Shared Types

**Goal**: The frontend can call existing backend APIs safely through normalized server-side helpers.

**Duration estimate**: 3–4 days

### Tasks

**2.1 — Build target normalization helpers**
- Create `getAuthContext()` for:
  - verified user
  - profile
  - resolved target
  - JWT
- Normalize targets for both backends:
  - dst: `Canton | Freeport | Sandbox`
  - dak: `CANTON | FREEPORT | SANDBOX`

**2.2 — Build proxy helpers**
- `fetchDst(path, options?)`
- `fetchDak(path, options?)`
- Centralize auth header injection
- Centralize db/query/header formatting

**2.3 — Create remote queries for existing APIs**
- loaders
- dropsheets
- drop areas
- load view detail
- load view union
- staging data
- loader-session reads

**2.4 — Create scan endpoint wrappers**
- `processStagingScan`
- `processLoadingScan`
- `getDepartmentStatus`
- `getOnLoadStatusAllDepts`

Use shared remote-function wrappers that can start as stubs and then switch to the live backend contract once the external endpoints are available.

**2.5 — Define shared types**
- auth/profile types
- target types
- loader types
- dropsheet types
- drop area types
- load view types
- scan request/response types

### Definition of Done

- All remote functions execute server-side through shared helpers
- Target formatting is correct for `Canton`, `Freeport`, and `Sandbox`
- Types are shared and stable across route/server/component usage
- Missing session or target resolution fails clearly

---

## Milestone 3: External Backend Dependency Tracking

**Goal**: Track and integrate the FastAPI dependency without pretending this repo owns it.

**Duration estimate**: parallel dependency

### External dependency items

- `POST /v1/scan/process-staging`
- `POST /api/barcode-update/process-loading-scan-v2`
- `GET /v1/scan/department-status`

### Frontend tasks in this repository

- Keep request/response types ready
- Keep remote wrappers aligned with the contract
- Replace stubs with live integrations as each endpoint ships
- Add integration verification as soon as the backend is ready

### Definition of Done

- Frontend wrappers are ready before backend delivery and updated once the live endpoints ship
- Integration points are documented and testable
- Backend contract includes `Sandbox` support and case-sensitive target handling

---

## Milestone 4: Core Pages — Home, Admin Target Selector, Dropsheets, Category

**Goal**: Users can enter the correct workflow from Home and reach the loading/staging entry points with the right context.

**Duration estimate**: 4–5 days

### Tasks

**4.1 — Admin-only location/environment selector**
- Show after login for admins
- Allow reopening from Home
- Three choices:
  - Canton
  - Freeport
  - Sandbox
- Hide this route/control for non-admin users

**4.2 — Home page**
- Show active warehouse/target
- Actions:
  - Staging
  - Loading
  - Add Loader
  - Will Call
- Keep Home as the stable re-entry page
- Launch Will Call through the lookup modal and hand off into Select Category when a load resolves

**4.3 — Add Loader utility**
- Display active loaders by default with a toggle for inactive loaders
- Allow editing loader name and active state from the list
- Add new loader inline/in-dialog
- New loader becomes active immediately
- Refresh the loader list after create/update
- Keep the active-loader list browser-cached with a manual refresh control

**4.4 — Dropsheet list**
- Date defaults to today
- Show dropsheet table
- Empty state when no dropsheets exist
- Navigate to Select Category

**4.5 — Select Category**
- Show Roll / Wrap / Parts
- Show department status indicators
- Require loader selection here before entering Loading
- Create loader session before navigation
- Pass `dropsheetId`, `locationId`, and `loaderId` to Loading

### Definition of Done

- Admin and non-admin Home behavior differs correctly
- Home matches the agreed current action set, including the live Will Call entry
- Add Loader works as a utility flow
- Loading entry path is Dropsheets -> Select Category -> Loader -> Loading

---

## Milestone 5: Staging Workflow

**Goal**: Warehouse operators can select a department and process staging scans quickly on shared iPads.

**Duration estimate**: 4–5 days

### Tasks

**5.1 — Department gate**
- Force department selection on entry
- Reset temporary staging state on entry

**5.2 — Fast scan input**
- Focused input for hardware scanner text
- Submit on Enter
- Clear and refocus immediately
- Show lightweight success feedback only

**5.3 — Scan handling**
- Numeric -> location lookup
- Accept any valid drop area in staging
- Non-numeric -> pallet or single-label flow through the scan endpoint
- `needs_location` -> keep the scan pending on the page, prompt for a driver-location scan next, and hand the dedicated modal flow to a follow-on issue

**5.4 — Department-specific lists**
- Roll
- Wrap
- Parts
- Refresh after successful scans
- Keep the drop-area list browser-cached with a manual refresh control

**5.5 — Department-specific behavior**
- Roll resets location after successful scan
- Staging never requires loader selection

**5.6 — Error handling**
- invalid location
- label does not belong
- unrecognized label
- network failure
- backend/API failure

### Definition of Done

- Staging is usable end-to-end without loader selection
- Fast repeated scanning works on iPad
- Success feedback stays lightweight
- Error semantics match the legacy app

---

## Milestone 6: Loading Workflow

**Goal**: Warehouse operators can load by navigating drops and scanning labels/pallets with the right loader context.

**Duration estimate**: 5–6 days

### Tasks

**6.1 — Loading page setup**
- Read the incoming loading context
- Load loader session details
- Prepare drop navigation state

**6.2 — Loader lifecycle**
- Start time already created before page entry
- Record end time when leaving Loading
- Handle explicit back navigation first

**6.3 — Drop navigation**
- Previous/Next controls
- Current drop indicator
- Bounds handling
- Batched data refresh when the active drop changes

**6.4 — Load detail + label list**
- Per-drop detail card
- Label list with scanned/unscanned distinction
- NeedPick display

**6.5 — Scan handling**
- Numeric -> driver-location validation
- Non-numeric -> pallet or single-label processing
- Department blocking rules
- `needs_location` pending-scan bridge and retry in `DAK-207`
- dedicated Scan New Location modal in `DAK-208`
- Roll resets location after successful scan

**6.6 — Error handling**
- label does not belong
- invalid location
- incomplete drop
- no-match/unrecognized label
- network/API errors

### Definition of Done

- Loading works end-to-end with explicit loader selection
- NeedPick updates after scans
- Loader end time is captured on exit
- Error behavior matches the legacy workflow

---

## Milestone Summary

| Milestone | Description | Est. Duration | Dependencies |
|---|---|---|---|
| 1 | Scaffolding + auth + profile gate | 3–4 days | None |
| 2 | Proxy layer + remote functions + shared types | 3–4 days | 1 |
| 3 | External backend dependency tracking | Parallel | 2 for integration |
| 4 | Core pages | 4–5 days | 1, 2 |
| 5 | Staging workflow | 4–5 days | 2, 3 |
| 6 | Loading workflow | 5–6 days | 2, 3, 4 |

---

## Testing Strategy

### Mandatory engineering workflow

- TDD for implementation changes
- Focused unit/component tests first
- Integration tests when backend contracts are available

### Frontend verification

- Auth/profile gate tests
- Target resolution tests
- Proxy helper tests for target normalization
- Route access tests by role
- Scanner-input interaction tests
- Shared-iPad re-entry behavior tests

### UAT

- Primary target: iPad A16 with hardware scanner
- Secondary target: desktop browser for debugging
- Validate scan speed and focus retention early, not at the end
