# Decisions

Use this file as the append-only ADR-style log for durable repo decisions. Add new entries at the top and keep older entries intact.

## 2026-04-01 - Make Memory Impact Analysis mandatory

- Tags: process, freshness, docs
- Decision: After any repo-tracked change or issue-scope change, run Memory Impact Analysis before considering the task complete.
- Rationale: The repo's weakest failure mode is silent staleness after small changes that never make it into the retrieval bundle.
- Impacted areas: `AGENTS.md`, `README.md`, `docs/project-state.yaml`, `docs/current-context.md`, `docs/decisions.md`
- Supersedes: ad hoc doc refreshes performed only at ticket or PR boundaries
- `project-state.yaml` updated: yes
- Folded into long-lived docs: yes; the standing rule is recorded in `AGENTS.md`

## 2026-04-01 - Use a hybrid retrieval model

- Tags: process, retrieval, git, linear
- Decision: Treat versioned repo docs as canonical memory, while Git and Linear act as freshness sensors rather than co-equal truth stores.
- Rationale: Fresh contexts need a stable center of gravity, but they also need a way to detect when repo memory no longer reflects the branch or issue reality.
- Impacted areas: `docs/project-state.yaml`, `docs/current-context.md`, `docs/decisions.md`
- Supersedes: relying on conversation history or dated handoff prompts as the primary source of current context
- `project-state.yaml` updated: yes
- Folded into long-lived docs: partial; captured in the new memory bundle and README catch-up order

## 2026-04-01 - Adopt a structured retrieval memory bundle

- Tags: process, retrieval, docs
- Decision: Use `docs/project-state.yaml` as the canonical fast-reload record, `docs/current-context.md` as the rolling handoff, and `docs/decisions.md` as the durable decision log.
- Rationale: Current project truth was previously split across AGENTS, narrative docs, dated handoffs, Linear, and Git, which made fresh-session catch-up too expensive and too easy to get wrong.
- Impacted areas: `AGENTS.md`, `README.md`, `docs/project-state.yaml`, `docs/current-context.md`, `docs/decisions.md`
- Supersedes: `docs/handoffs/*.md` as the default reload surface
- `project-state.yaml` updated: yes
- Folded into long-lived docs: partial; `AGENTS.md` and `README.md` were updated while product and architecture docs remain unchanged because runtime behavior did not change
