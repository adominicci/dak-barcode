# Product Requirements Document: Stage & Load Barcode Module Frontend

**Version**: 1.3
**Date**: 2026-04-16
**Author**: Sarah (Product Owner), aligned with project discovery notes

---

## Executive Summary

The Stage & Load Barcode Module is a warehouse operations tool used by DST floor staff to stage freight and load delivery trucks by scanning labels and pallets. The current production app is a FlutterFlow mobile app backed by Firebase auth and two Heroku-hosted FastAPI services.

This project rebuilds the frontend as a SvelteKit 5 web application optimized for shared iPads with hardware barcode scanners. The new frontend uses Supabase Auth, Supabase profile metadata, and server-side remote functions that proxy all warehouse API traffic to the existing Heroku backends. Business logic consolidation in `dak-web` remains part of the overall program, but this repository owns the frontend only.

The rebuild started MVP-first, but the live frontend now covers the main operator surface: login and access control, admin target selection, Home navigation, Add Loader, Staging, Dropsheets, Select Category, Loading, Will Call lookup and signature capture, Order Status, and Move Orders. The repository still does not own backend consolidation work inside `dak-web`; it consumes those services through same-origin proxy helpers.

---

## Problem Statement

The current FlutterFlow app works operationally, but it has several long-term problems:

- Authentication and accountability are weak. The legacy app still reflects stale Firebase-era assumptions while the backend has already moved toward Supabase JWT validation.
- Critical scan orchestration lives in the frontend as chained actions, which makes the workflow brittle and difficult to reason about.
- The app is used on shared iPads, but the current state model is not designed around safe handoff and predictable re-entry.
- Environment and warehouse routing need to support both locked operator behavior and developer/admin testing behavior without exposing backend details to the browser.

The rebuild addresses those issues by moving to a same-origin SvelteKit architecture, enforcing profile-based access control, keeping workflow state intentionally ephemeral, and making the scan UI fast and stable for keyboard-wedge barcode scanners.

---

## Product Goals

### Primary goals

- Rebuild the Stage and Load frontend in SvelteKit 5 with feature parity for the MVP workflows.
- Support shared iPad use safely, with predictable session behavior and minimal stale local state.
- Enforce access using Supabase Auth plus active profile checks.
- Resolve warehouse/environment server-side so the browser never talks directly to Heroku services.
- Keep scan interactions fast: minimal success feedback, immediate list refresh, and immediate readiness for the next scan.

### Non-goals for this repository

- Rebuilding `dak-web` inside this repository
- Replacing SQL Server operational data with Supabase Postgres
- Replatforming every remaining DST-backed support read model in the same milestone as the frontend rebuild
- Offline queueing or sync

---

## Success Metrics

- Scan-to-feedback latency remains under 2 seconds in normal warehouse conditions.
- Staging and Loading workflows work for Roll, Wrap, and Parts.
- Shared-device behavior is safe: successful sessions reopen to Home, not into an in-progress workflow.
- Non-admin users cannot switch warehouses manually.
- Admin users can test against `Canton`, `Freeport`, and `Sandbox`.

---

## Personas

### Warehouse operator

- Uses shared iPads on the warehouse floor
- Scans via a hardware scanner that types into a focused input and submits on Enter
- Needs rapid, repetitive scanning with minimal UI interruptions
- May use desktop occasionally only for troubleshooting or testing

### Admin / developer

- Uses the same frontend, but requires access to a manual environment selector
- Needs to switch between `Canton`, `Freeport`, and `Sandbox`
- Uses Home as the stable testing entry point

---

## Access Control and Environment Resolution

### Authentication

- Accounts are provisioned manually in Supabase with temporary passwords.
- Users must be able to change their password after onboarding.
- Forgot-password uses the Supabase code-based reset flow:
  1. User enters email
  2. Supabase sends a one-time verification code
  3. User enters the code in the app
  4. User sets a new password

### Profile gate

- Successful Supabase authentication is not enough by itself.
- The frontend must load the linked profile and confirm the user is active before granting access.
- If the profile is inactive, the user sees a blocked screen with:
  - `Your account is inactive. Contact an administrator.`

### Warehouse and environment rules

- Non-`admin` users do not choose their warehouse manually.
- Their warehouse is resolved from:
  - `profiles.warehouse_id -> warehouses.alias`
- Current known warehouse aliases are:
  - `Canton`
  - `Freeport`
- If a non-admin profile is missing a warehouse or resolves to an unknown alias, the frontend falls back to `Canton` for now.
- Only `profiles.user_role = admin` users can access the Location/Environment selector.
- Admin users can choose:
  - `Canton`
  - `Freeport`
  - `Sandbox`
- Admins should see the selector after login on each new session and also be able to reopen it later from Home.

### Session behavior

- Users remain signed in until they log out manually.
- The app is always-online only. If connectivity fails, scanning stops and the UI shows a clear error.
- Even when the session is still valid, reopening or refreshing the app should return the user to Home.

---

## User Stories and Acceptance Criteria

### Story 1: Sign in and access gate

**As a** warehouse user  
**I want to** sign in with my email and password  
**So that** the app can identify me, validate my profile, and route me safely

**Acceptance Criteria**
- [ ] Login page supports email + password
- [ ] Forgot-password supports the Supabase one-time code flow
- [ ] User can change their password after login
- [ ] Inactive profiles are blocked with a dedicated screen
- [ ] Successful sign-in routes users into the app only after profile resolution
- [ ] Reopen/refresh returns to Home when the session is still valid

### Story 2: Admin-only environment selection

**As an** admin/developer  
**I want to** choose the active testing target  
**So that** I can validate the app against different databases

**Acceptance Criteria**
- [ ] Only `admin` users can open the selector
- [ ] Selector offers `Canton`, `Freeport`, and `Sandbox`
- [ ] Selector appears after login for admins
- [ ] Selector can be reopened from Home
- [ ] Non-admin users never see the selector

### Story 3: Home page

**As a** signed-in user  
**I want to** start the correct workflow from a stable Home page  
**So that** shared iPads always return to a safe operational entry point

**Acceptance Criteria**
- [ ] Home displays the active warehouse or admin-selected target
- [ ] Home shows actions for:
  - `Staging`
  - `Loading`
  - `Add Loader`
  - `Will Call`
- [ ] `Will Call` launches the lookup modal and can hand off into Select Category
- [ ] Home is the first page after re-entry for active sessions

### Story 4: Add Loader utility

**As a** signed-in user  
**I want to** see the loader list and add a new loader when needed  
**So that** loading operations can continue without leaving the app

**Acceptance Criteria**
- [ ] Loader list shows active loaders by default
- [ ] Loader list can be toggled to show inactive loaders too
- [ ] Clicking a loader opens an editor for name and active status
- [ ] Add Loader is a separate utility flow, not part of Staging entry
- [ ] New loaders become active immediately
- [ ] Loader list can be manually refreshed when backend data changes

### Story 5: Staging workflow

**As a** warehouse operator  
**I want to** select a department and stage items by scanning  
**So that** items are marked as staged in the system

**Acceptance Criteria**
- [ ] Staging does not require loader selection
- [ ] Department selection is required on page entry
- [ ] Scan input is always ready for hardware-scanner text input
- [ ] Numeric scans are treated as location codes
- [ ] In Staging, any valid drop area is accepted
- [ ] Non-numeric scans are processed as pallet or single-label scans
- [ ] Minimal success feedback is shown, then the input is immediately ready again
- [ ] Department-specific lists refresh after successful scans
- [ ] The drop-area picker can be manually refreshed when backend data changes
- [ ] Roll resets the selected drop area after each successful scan

### Story 6: Loading entry flow

**As a** warehouse operator  
**I want to** choose a dropsheet, then a department, then a loader  
**So that** loading starts with the correct operational context

**Acceptance Criteria**
- [ ] Dropsheet list defaults to today
- [ ] Selecting a dropsheet navigates to Select Category
- [ ] Select Category shows Roll, Wrap, and Parts with department status indicators
- [ ] Loading requires explicit loader selection before the Loading page begins
- [ ] Loader start time is recorded before entering the Loading page
- [ ] Trailer and loader pickers can be manually refreshed when backend data changes
- [ ] Department-to-location mapping matches the legacy workflow:
  - Roll -> `locationId = 1`
  - Wrap -> `locationId = 2`
  - Parts -> `locationId = 3`

### Story 7: Loading workflow

**As a** warehouse operator  
**I want to** load items by scanning locations, labels, and pallets  
**So that** the system records completed truck loading accurately

**Acceptance Criteria**
- [ ] Loading page receives dropsheet, department/locationId, and loader session context
- [ ] Loading opens on the last available drop by default
- [ ] Footer navigation follows reverse numeric order so `Next` moves toward lower-numbered drops
- [ ] Numeric scans are treated as location codes
- [ ] In Loading, only driver locations are valid
- [ ] Non-numeric scans branch into pallet or single-label processing
- [ ] If a loading scan needs a driver location, keep the original scan pending and prompt for the numeric location scan next
- [ ] DUE/STOP department blocking matches the legacy Flutter behavior
- [ ] NeedPick count updates after successful scans
- [ ] Roll resets the selected drop area after each successful scan
- [ ] Leaving the Loading page records loader end time

### Story 8: Scan feedback and reliability

**As a** warehouse operator  
**I want to** scan quickly without interruptions  
**So that** I can work continuously on a shared iPad

**Acceptance Criteria**
- [ ] Success feedback is lightweight: toast/banner plus refreshed data
- [ ] Input is cleared and refocused after every attempt
- [ ] Network interruptions stop scanning and show a clear error
- [ ] Error states match the legacy meaning:
  - Not found / does not belong
  - Invalid location
  - Incomplete drop
  - Unrecognized label

### Story 9: Will Call workflow

**As a** signed-in user  
**I want to** look up a Will Call load and capture the pickup signature inside the app  
**So that** customer pickup handoff stays in the same operational workflow

**Acceptance Criteria**
- [ ] Home exposes Will Call as an active workflow entry
- [ ] A valid Will Call load number can navigate into Select Category with `willcall=true`
- [ ] Select Category can open the Will Call signature modal
- [ ] Signature images are uploaded and persisted for the dropsheet
- [ ] Existing signatures render as view-only previews after upload

### Story 10: Support views from Select Category

**As a** warehouse operator  
**I want to** open Order Status and Move Orders from the active load  
**So that** I can resolve support tasks without losing the current loading context

**Acceptance Criteria**
- [ ] Select Category links to Order Status and Move Orders for the current dropsheet
- [ ] Both support pages preserve the return path back to Select Category
- [ ] Support-page errors are shown with operator-safe copy rather than raw framework/runtime messages

---

## Backend Dependency Contract

This repository depends on backend behavior implemented elsewhere.

### Existing backend services

- `dst-customer-portal` (Heroku FastAPI)
- `dak-web` (Heroku FastAPI)

### Required target formatting

The target format differs by backend and must be treated as a strict contract:

| Backend | Format |
|---|---|
| `dst-customer-portal` | `db=Canton`, `db=Freeport`, `db=Sandbox` |
| `dak-web` | `X-Db: CANTON`, `X-Db: FREEPORT`, `X-Db: SANDBOX` |

### New backend endpoints required by the frontend

- `POST /v1/scan/process-staging`
- `POST /api/barcode-update/process-loading-scan-v2`
- `GET /v1/scan/department-status`
- `POST /v1/logistics/dropsheet-notify`
- `POST /v1/logistics/dropsheet-transfer-label-export`

These endpoints are part of the overall project, but they are not implemented inside this repository.

---

## Current Delivered Scope

- SvelteKit project scaffolding
- Supabase login/logout
- Active profile gate
- Forgot-password code flow
- Role-based environment resolution
- Admin-only location/environment selector
- Home page
- Add Loader utility
- Staging workflow
- Dropsheet list
- Select Category + loader selection
- Loading workflow
- Will Call lookup and signature capture
- Order Status and Move Orders support views
- Loading-complete notifications
- Remote functions and proxy helpers

## Known Intentional Limits

- Some support views still rely on DST-backed read models while the new loading workflow mixes DST and `dak-web` data
- The drop-scoped `dak-web` department-status helper remains a placeholder; only the on-load department-status route is live

---

## Engineering Delivery Rules

These are project-level working agreements, not user-facing features:

- **TDD is mandatory for implementation work.** Use red -> green -> refactor for frontend and test harness changes.
- Validate framework-specific code examples against official/current docs before documenting them.
- Keep local docs, Linear issues, and implementation assumptions synchronized.
- Treat `legacy_flutterflow_fe/` as a reference source, not as code to evolve.
