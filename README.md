# dak-barcode

Frontend-only SvelteKit rebuild of the DST Stage & Load barcode module.

## What this repo owns

This repository owns the new web frontend for the warehouse Stage & Load workflows.

It does **not** own the new `dak-web` scan endpoints. Backend scan work happens in a separate FastAPI repository and is treated here as an external dependency.

## Product context

The app is being rebuilt for shared iPad A16 devices used with hardware barcode scanners. Desktop use exists mainly for debugging and implementation support.

Current MVP rules:

- always-online app
- Home is the safe re-entry page for active sessions
- Staging does not require a loader
- Loading requires explicit loader selection before entry
- `Will Call` is part of the migrated app surface
- only `admin` users may access the location/environment selector
- non-admin warehouse selection is resolved from the Supabase profile

## Current repo state

The app has moved beyond the initial scaffold and now covers the main Stage & Load operator flows.

What is already in place:

- authenticated app shell with profile-gated routing, inactive-user blocking, and fixed-domain auth flows
- admin target selection plus operator warehouse resolution
- Home, Location, Account, Add Loader, Dropsheets, Select Category, Staging, and Loading pages
- Order Status and Move Orders support pages connected to the loading flow
- live remote actions and queries for staging scans, loading scans, dropsheet lists, loader sessions, load detail views, and loading-complete notifications
- shared workflow stores/controllers plus route and server test coverage with Vitest and Playwright
- SvelteKit 5 + Svelte 5 + TypeScript, Tailwind CSS 4, shadcn-svelte, and Bun as the package-manager standard

Known intentional limits:

- some legacy support views still depend on DST-backed read models while the new loading flow mixes DST and `dak-web` data sources

## Tech stack

- SvelteKit 5
- Svelte 5
- TypeScript
- Bun
- Tailwind CSS 4
- shadcn-svelte
- Bits UI
- `@lucide/svelte`
- `svelte-sonner`
- Supabase Auth + Postgres metadata

Deployment note:

- Vercel works with Bun as the package manager through `bun.lock`
- deploys are pinned to Node.js `24.x` via `package.json`
- the app uses `@sveltejs/adapter-vercel`
- Bun remains the install/build tool; the deployed runtime stays on Node.js unless a future ticket explicitly opts into the Bun runtime

## Vercel deployment contract

- Vercel environments must define:
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - `DST_PORTAL_URL`
  - `DAK_WEB_URL`
- Missing required environment variables are treated as hard failures. The app no longer falls back to anonymous mode when Supabase config is missing.
- Preview deployments should be validated before any production deploy.
- Supabase Auth redirect URLs must include:
  - the production domain
  - the preview domain pattern used for Vercel testing
- Keep the project on Node.js `24.x` in Vercel project settings. Bun is used for dependency installation and builds because this repo is standardized on `bun.lock`.

## First deploy checklist

- Push the repo to GitHub before importing it into Vercel
- Import the repo as a SvelteKit project with the root directory set to the repository root
- Verify Vercel build settings:
  - Install Command: `bun install`
  - Build Command: `bun run build`
  - Output: framework default
- Add the required environment variables to both `Preview` and `Production`
- Add the Vercel preview and production URLs to Supabase Auth redirect URLs
- Smoke test with one active admin user and one active operator user before the first production deploy

## Local development

Install dependencies:

```sh
bun install
```

Common commands:

```sh
bun run dev
bun run check
bun run test:unit --run
bun run test:e2e src/routes/app-shell.e2e.ts
bun run build
```

## Repo structure

- `src/` — current SvelteKit app
- `docs/` — product, architecture, and retrieval-memory source of truth
- `agile_plan/` — milestone sequencing and implementation planning
- `legacy_flutterflow_fe/` — read-only reference for the legacy FlutterFlow app

## Source of truth

Use these files first when catching up:

- `AGENTS.md`
- `docs/project-state.yaml`
- `docs/current-context.md`
- `docs/decisions.md`
- `docs/prd.md`
- `docs/architecture.md`
- `agile_plan/stage-load-implementation-plan.md`

Treat dated files under `docs/handoffs/` as historical snapshots, not the default reload surface.

## Implementation guidance

- Use Bun commands for installs and scripts
- Keep `bun.lock` committed
- Treat `legacy_flutterflow_fe/` as behavioral reference only
- Keep docs, Linear, and implementation assumptions aligned when scope changes
- Follow TDD for implementation work
