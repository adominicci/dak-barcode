## 1. Regression Coverage

- [x] 1.1 Add a Select Category component regression that opens the Loading loader modal with mixed active/inactive loader records and confirms inactive names are not rendered.
- [x] 1.2 Add a Select Category component regression that opens the loader modal with only inactive loader records and confirms the active-loader empty state is shown with no selectable inactive options.
- [x] 1.3 Add focused helper or route coverage proving Dropsheets and Select Category derive identical active loader picker options from the same mixed loader list.

## 2. Implementation

- [x] 2.1 Add a shared active-loader picker option helper that filters to `isActive === true` and maps to selection modal option shape.
- [x] 2.2 Update Dropsheets to use the shared active-loader option helper while preserving existing trailer picker behavior.
- [x] 2.3 Update Select Category to use the shared active-loader option helper for the Loading entry loader modal.
- [x] 2.4 Keep loader session creation and Loading navigation unchanged after an active loader is picked.

## 3. Verification and Memory

- [x] 3.1 Run the focused Select Category and Dropsheets tests for loader picker behavior.
- [x] 3.2 Run `bun run check` and the relevant unit test command before completion.
- [x] 3.3 Run Memory Impact Analysis and update `docs/current-context.md`, `docs/project-state.yaml`, or `docs/decisions.md` only if implementation changes durable project facts.
