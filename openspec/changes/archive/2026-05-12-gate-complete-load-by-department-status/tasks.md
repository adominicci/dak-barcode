## 1. Regression Coverage

- [x] 1.1 Add a Select Category component regression where `allLoaded=true` and all departments are `NA` or `DONE`, confirming `Complete Load` is displayed.
- [x] 1.2 Add a Select Category component regression where `allLoaded=true` but one department is `DUE`, confirming `Complete Load` is not rendered.
- [x] 1.3 Add a Select Category component regression where `allLoaded=true` but one department is another non-closed status such as `READY` or `WAIT`, confirming `Complete Load` is not rendered.
- [x] 1.4 Add a Select Category component regression where `allLoaded=true` but department status data is null, blank, or unavailable, confirming `Complete Load` is not rendered.
- [x] 1.5 Update existing Complete Load flow tests so they provide closed department statuses when the button is expected to be available.

## 2. Implementation

- [x] 2.1 Add a small readiness helper that returns true only when `allLoaded === true` and every dropsheet department status is `NA` or `DONE`.
- [x] 2.2 Replace the Select Category `Complete Load` display gate so it uses the readiness helper instead of `percentCompleted === 1`.
- [x] 2.3 Keep footer grid layout behavior consistent when `Complete Load` is hidden or visible under the new readiness rule.
- [x] 2.4 Preserve the existing Complete Load confirmation, notification, transfer-label export, warning, and return behavior after the action is visible.

## 3. Verification and Memory

- [x] 3.1 Run the focused Select Category unit tests for Complete Load readiness.
- [x] 3.2 Run `bun run check` and the relevant unit test command before completion.
- [x] 3.3 Run Memory Impact Analysis and update `docs/current-context.md`, `docs/project-state.yaml`, and `docs/decisions.md` because this changes durable Loading completion behavior.
