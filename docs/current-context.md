# Current Context

## 2026-04-01 DAK-220 Refresh

- Current worktree: `dev`
- Restored the missing `DAK-220` Will Call flow additively from the closed-but-unmerged branch history instead of resetting or overwriting current local changes.
- Runtime truth now matches the intended migrated surface: Home opens a Will Call scan modal, dropsheet handoff preserves the `willcall=true` flag, select-category exposes the signature action for Will Call, and DST helpers now cover will-call lookup/signature persistence.
- Verification completed in this session:
  - targeted unit/browser suite for Will Call and affected surfaces passed
  - `bun run check` passed cleanly after widening the shared DST query helper to accept boolean query params
- Important freshness note: the retrieval-memory rollout notes below remain useful background, but they no longer describe the active product-only focus of this worktree.

## Current Focus

- Establish the retrieval memory system and make it the default reload surface for future contexts.
- Keep this branch limited to memory and documentation workflow changes. Do not mix in product or runtime behavior edits.
- Re-check Linear and Git freshness sensors before resuming feature delivery work; do not trust older handoff files by default.

## Freshness Check

- Last updated: 2026-04-01
- Branch basis: `features/design-context-memory-strategy` from `b1b80d4`
- Linked Linear issue: `None for this branch; resolve the active issue before product work resumes`
- Open diffs already reflected: `Yes. This file assumes the intended working-tree changes are AGENTS.md, README.md, docs/project-state.yaml, docs/current-context.md, and docs/decisions.md.`

## Active Branch Assumptions

- This branch exists to introduce retrieval-memory infrastructure, not to ship warehouse workflow changes.
- `docs/project-state.yaml` is the canonical fast-reload record and should be updated when durable current truth changes.
- `docs/current-context.md` is the rolling handoff and should absorb branch-specific focus, risk, and freshness notes.
- Files under `docs/handoffs/` remain historical snapshots only and should not outrank the current memory bundle.

## Open Risks

- The system will go stale if Memory Impact Analysis is skipped after a meaningful change.
- No automation enforces the freshness loop yet; the guardrail currently lives in repo instructions and reviewer discipline.
- Active Linear issue state still lives outside the repo and must be rechecked before feature work starts or resumes.
- `bun run check` currently fails on a pre-existing type mismatch in `src/lib/server/dst-queries.ts:336`; this branch does not change that file, but the next implementation session should account for the failing baseline.

## Recent Changes That Affect Retrieval

- `69be8b2` updated docs to reflect the current app migration status and is part of the baseline truth for this bundle.
- `b1b80d4` merged the markdown-docs work, which means repo documentation is the freshest baseline available before this branch.
- This branch adds the structured memory bundle and the standing Memory Impact Analysis rule.
- Verification on this branch confirmed the memory files parse cleanly and also surfaced the existing `dst-queries.ts` type-check failure, which is now recorded here for the next fresh context.

## Next Reload Order

1. `AGENTS.md`
2. `docs/project-state.yaml`
3. `docs/current-context.md`
4. Relevant entries in `docs/decisions.md`
5. Active Linear issue and comments
6. `git status`, `git diff`, and recent commits
7. Code inspection for the touched subsystem
