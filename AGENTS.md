## Project Configuration

- **Language**: TypeScript
- **Package Manager**: Bun
- **Add-ons**: Tailwind CSS 4, Vitest, Playwright, shadcn-svelte

---

# AGENTS.md

## Repo Purpose

This repository is the new **frontend-only** SvelteKit rebuild of the DST Stage & Load barcode module.

Important folders:

- `docs/` — product and architecture source of truth for this repo
- `agile_plan/` — implementation sequencing and milestone planning
- `legacy_flutterflow_fe/` — read-only reference for the old FlutterFlow app; use it to confirm workflow edge cases and exact legacy behavior

This repo does **not** own the new `dak-web` scan endpoints. Backend work happens in a separate FastAPI repository and is tracked here only as an external dependency.

---

## Working Agreements

### TDD is mandatory

For implementation work in this repo, always use test-driven development:

1. Write the failing test first
2. Run it and confirm the failure
3. Implement the smallest change that makes it pass
4. Refactor safely
5. Re-run the relevant tests before claiming completion

### Keep planning artifacts aligned

When project discovery changes the scope or architecture:

- update `docs/prd.md`
- update `docs/architecture.md`
- update `agile_plan/stage-load-implementation-plan.md`
- update the related Linear project/issues

Do not let docs, Linear, and the implementation drift apart.

### Verify framework examples

If you add or modify framework-specific code examples in docs, verify them against current official documentation first. Use Context7 for SvelteKit and Supabase examples when needed.

### Package manager standard

- Use `bun` for dependency installation and script execution in this repo
- Prefer `bun install`, `bun run <script>`, and `bunx <tool>`
- Keep `bun.lock` committed and do not introduce `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`
- Vercel deployments should rely on Bun package-manager detection via `bun.lock`

---

## Product Rules

### Primary runtime target

- Primary device: **shared iPad A16**
- Secondary device: desktop browser for testing/debugging
- Barcode input is **hardware scanner text input** into a focused field
- No camera scanning requirement in MVP
- No offline queueing; this is an always-online app

### Scan UX

- Keep scan input ready at all times
- Submit on Enter
- Clear and refocus immediately after each attempt
- Success feedback should be minimal:
  - toast/banner
  - refresh affected data
  - immediately ready for next scan

### Session behavior

- Users stay signed in until manual logout
- Reopening or refreshing the app should always return to **Home**
- Do not persist operational workflow state in long-lived browser storage on shared iPads

---

## Auth and Access Rules

### Supabase accounts

- Users are created manually in Supabase with temporary passwords
- Users need:
  - login
  - logout
  - change password
  - forgot-password flow

### Forgot-password flow

Use the Supabase **code-based** reset flow:

1. User enters email
2. Supabase sends a verification code
3. User enters the code in the app
4. User sets a new password

### Profile gate

Successful Supabase authentication is not sufficient by itself.

The app must load the linked profile and enforce:

- active profile required
- inactive users are blocked with a simple message:
  - `Your account is inactive. Contact an administrator.`

### Roles

- Only `profiles.user_role = admin` may access the Location/Environment selector
- No other role gets access to that page

### Warehouse resolution

For non-admin users:

- resolve `profiles.warehouse_id -> warehouses.alias`
- current known aliases:
  - `Canton`
  - `Freeport`
- if missing or invalid, fall back to `Canton` for now
- warehouse is locked; non-admin users do not switch it manually

### Admin target selector

Admin users can select:

- `Canton`
- `Freeport`
- `Sandbox`

Behavior:

- show after login for each new session
- allow reopening later from Home
- keep the selection available to server-side proxy helpers during the session

---

## Operational Workflow Rules

### Home page

Home should expose:

- `Staging`
- `Loading`
- `Add Loader`
- `Will Call`

Rules:

- `Will Call` is visible but disabled as coming soon
- `Add Loader` is a separate utility flow
- Home is the stable landing page for active sessions

### Add Loader

- show active loaders only
- allow creating a new loader from the app
- new loader becomes active immediately
- refresh the selectable list after creation

### Staging

- staging does **not** require loader selection
- require department selection on entry
- numeric scans are location codes
- staging accepts **any valid drop area**
- non-numeric scans go through pallet/single-label processing
- Roll resets the current location after each successful scan

### Loading

Loading flow:

1. Dropsheet list
2. Select Category
3. Loader selection
4. Create loader session
5. Enter Loading page

Rules:

- loader selection happens before entering Loading
- Loading validates numeric scans as **driver locations only**
- Roll resets the current location after each successful scan
- leaving Loading should record loader end time

Legacy department/location mapping:

- Roll -> `locationId = 1`
- Wrap -> `locationId = 2`
- Parts -> `locationId = 3`

---

## Backend Contract Notes

Two backends exist and the frontend must normalize targets differently for each.

### dst-customer-portal

Use title-case query parameter values:

- `db=Canton`
- `db=Freeport`
- `db=Sandbox`

### dak-web

Use uppercase header values:

- `X-Db: CANTON`
- `X-Db: FREEPORT`
- `X-Db: SANDBOX`

This distinction is important and should be centralized in shared proxy helpers.

Required external backend endpoints:

- `POST /v1/scan/process-staging`
- `POST /v1/scan/process-loading`
- `GET /v1/scan/department-status`

---

## Engineering Notes

- Treat `legacy_flutterflow_fe/` as behavioral reference, not reusable source code
- If the legacy code and older docs disagree, trust the confirmed legacy behavior plus the latest project decisions
- Update Linear when scope or architecture changes during discovery

---

## Git and PR Rules

These rules come from the project owner and should be preserved:

- All PRs must base on `dev` when working from a feature branch, if `dev` exists
- All git comments must be in English
- Never close:
  - `origin/main`
  - `origin/dev`
  - local `main`
  - local `dev`

### Before creating a PR

- Merge `origin/main` into local `main`
- Merge `origin/dev` into local `dev`
- Review conflicts before creating the PR
- Always tag `@greptile review` on PR comments

### After PR merged

- Merge `origin/main` into local `main`
- Merge `origin/dev` into local `dev`
