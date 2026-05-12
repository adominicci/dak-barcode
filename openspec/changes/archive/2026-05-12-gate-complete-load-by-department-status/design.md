## Context

Select Category currently derives `canCompleteLoad` from `data.percentCompleted === 1`. The page also reads `categoryAvailability.allLoaded` and dropsheet-level department statuses, but those are not the visibility gate for the `Complete Load` action. This lets the UI show the button when the summary says 100% while a department card or the status strip still shows `DUE`.

The corrected business rule is that `Complete Load` may be displayed only when the current dropsheet is fully loaded and every department status is closed out. Closed-out statuses are exactly `NA` and `DONE`.

## Goals / Non-Goals

**Goals:**

- Hide `Complete Load` unless `categoryAvailability.allLoaded === true`.
- Hide `Complete Load` unless every department status in the dropsheet status payload is `NA` or `DONE`.
- Treat any `DUE` status as a hard block for showing `Complete Load`.
- Treat unknown, blank, null, or loading/unavailable department status data as not ready.
- Preserve the current Complete Load modal, notification, transfer-label export, partial-warning, and return navigation behavior once the action is legitimately visible.

**Non-Goals:**

- Change dak-web or DST backend status calculations.
- Change how department status pills are displayed.
- Change loader selection, loading scans, or complete-load request payloads.
- Introduce a disabled Complete Load state; this change hides the action when the load is not complete-ready.

## Decisions

- Use `allLoaded` plus department status closure as the only display gate.
  - Rationale: Percent complete can be 100 while a department still reports `DUE`; the operator-facing completion action must follow the authoritative readiness flags, not just percentage.
  - Alternative considered: keep `percentCompleted === 1` and disable the button when a department is not closed. The user explicitly requested that the button not be displayed under those conditions.

- Define closed department statuses as exactly `NA` and `DONE`.
  - Rationale: This matches the clarified requirement. Other values, including `READY`, are not completion states.
  - Alternative considered: allow `READY` because it sounds positive. The screenshot shows a department can be actionable/visible while not complete; only `NA` and `DONE` should allow completion.

- Require all six status fields to be present and closed before showing the button.
  - Rationale: If status data is missing or still loading, the frontend cannot prove the load is safe to complete.
  - Alternative considered: ignore null statuses. That would allow hidden backend uncertainty to surface as an unsafe completion action.

## Risks / Trade-offs

- A backend status outage will hide `Complete Load` even when percent is 100 -> this is safer than allowing premature completion.
- If the backend emits a new closed status in the future, it will be blocked until explicitly added -> this keeps completion rules auditable.
- Existing tests that assumed `percentCompleted === 1` is enough will need to be updated -> this is expected because the business rule changed.
