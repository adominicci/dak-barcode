# Home Sign Out And Lowercase Placeholder Design

## Goal

Add a `Sign out` action to the Home screen without changing the module-grid structure, and normalize the fixed-domain auth field placeholder to lowercase `username` on login and forgot-password.

## Chosen Approach

- Reuse the existing `POST /logout` flow that already powers the authenticated shell and account page.
- Place the `Sign out` control in the Home header near the avatar so it reads as a session action rather than a workflow module.
- Keep the Home card grid unchanged to stay aligned with the module-selector reference.
- Move the auth placeholder convention into the shared fixed-domain email field so login and forgot-password stay consistent by default.

## Why This Option

- It uses an existing logout contract instead of adding new auth logic.
- It matches the app’s current header-action language and keeps the Home surface focused on work modules.
- It avoids repeated placeholder literals across auth routes.

## Affected Files

- `src/routes/(app)/home/+page.svelte`
- `src/routes/(app)/home/home-page.svelte.spec.ts`
- `src/lib/components/auth/fixed-domain-email-field.svelte`
- `src/routes/app-shell.e2e.ts`

## Verification Plan

- Add a failing Home page test for the header `Sign out` control and its `/logout` form action.
- Update the existing auth placeholder regression to require lowercase `username`.
- Run the targeted Vitest browser spec and Playwright auth-shell slice.
