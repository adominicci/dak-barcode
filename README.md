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
- `Will Call` stays visible but disabled in MVP
- only `admin` users may access the location/environment selector
- non-admin warehouse selection is resolved from the Supabase profile

## Current repo state

The project is scaffolded and ready for feature work.

What is already in place:

- SvelteKit 5 + Svelte 5 + TypeScript
- Tailwind CSS 4
- shadcn-svelte
- Playwright + Vitest test setup
- initial auth/app shell routes
- Bun as the package-manager standard

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
- runtime baseline remains Node.js 24 unless a future ticket explicitly opts into the Bun runtime

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
- `docs/` — product and architecture source of truth
- `agile_plan/` — milestone sequencing and implementation planning
- `legacy_flutterflow_fe/` — read-only reference for the legacy FlutterFlow app

## Source of truth

Use these files first when catching up:

- `AGENTS.md`
- `docs/prd.md`
- `docs/architecture.md`
- `agile_plan/stage-load-implementation-plan.md`

## Implementation guidance

- Use Bun commands for installs and scripts
- Keep `bun.lock` committed
- Treat `legacy_flutterflow_fe/` as behavioral reference only
- Keep docs, Linear, and implementation assumptions aligned when scope changes
- Follow TDD for implementation work
