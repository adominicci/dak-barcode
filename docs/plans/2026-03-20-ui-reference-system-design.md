# UI Reference System Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a repo-local UI reference system under `docs/` that preserves the provided sample screens and extracts practical styling guidance for future app UI work.

**Architecture:** Store the original sample HTML files as raw references in a dedicated `docs/ui-reference/screens/` folder, then layer concise repo-owned guidance documents on top of them. Update `AGENTS.md` so future UI work explicitly consults this package alongside the existing design docs.

**Tech Stack:** Markdown documentation, static HTML references, repo guidance in `AGENTS.md`

---

### Task 1: Create the UI reference folder structure

**Files:**
- Create: `docs/ui-reference/README.md`
- Create: `docs/ui-reference/tokens.md`
- Create: `docs/ui-reference/screen-map.md`
- Create: `docs/ui-reference/screens/`

**Step 1: Create the docs folder structure**

Create:
- `docs/ui-reference/`
- `docs/ui-reference/screens/`

**Step 2: Add a package README**

Document:
- purpose of the reference system
- how to use the raw HTML samples
- how to use the token guide and screen map

**Step 3: Add a token extraction doc**

Summarize:
- colors
- typography
- radius
- spacing
- shadows
- recurring component patterns

**Step 4: Add a screen map doc**

Map:
- sample home/module selector
- sample category selection
- sample staging screen

**Step 5: Verify file organization**

Run: `find docs/ui-reference -maxdepth 2 -type f | sort`

Expected: the new doc files and screen files appear in the output

### Task 2: Preserve the raw sample screens

**Files:**
- Create: `docs/ui-reference/screens/module-selector-two-column.html`
- Create: `docs/ui-reference/screens/category-selection-strict-v4.html`
- Create: `docs/ui-reference/screens/staging-strict-v4.html`

**Step 1: Copy the provided HTML sources into repo-local reference files**

Source files:
- `/Users/andresdominicci/Downloads/stitch 2/module_selector_two_column/code.html`
- `/Users/andresdominicci/Downloads/stitch 2/category_selection_strict_v4/code.html`
- `/Users/andresdominicci/Downloads/stitch 2/staging_strict_v4/code.html`

**Step 2: Use stable descriptive filenames**

Target files:
- `docs/ui-reference/screens/module-selector-two-column.html`
- `docs/ui-reference/screens/category-selection-strict-v4.html`
- `docs/ui-reference/screens/staging-strict-v4.html`

**Step 3: Verify the files are readable**

Run:
- `sed -n '1,40p' docs/ui-reference/screens/module-selector-two-column.html`
- `sed -n '1,40p' docs/ui-reference/screens/category-selection-strict-v4.html`
- `sed -n '1,40p' docs/ui-reference/screens/staging-strict-v4.html`

Expected: each file opens with the copied HTML source

### Task 3: Update agent guidance

**Files:**
- Modify: `AGENTS.md`

**Step 1: Update the important folders guidance**

Add `docs/ui-reference/` as a first-class reference location inside the `docs/` guidance.

**Step 2: Update the UI implementation guidance**

Explicitly direct future UI work to consult:
- `docs/design.md`
- `docs/ui-reference/tokens.md`
- `docs/ui-reference/screen-map.md`
- `docs/ui-reference/screens/`

**Step 3: Verify the wording**

Run: `sed -n '1,120p' AGENTS.md`

Expected: the new UI reference guidance is visible near the top-level instructions

### Task 4: Final verification

**Files:**
- Verify: `docs/ui-reference/*`
- Verify: `AGENTS.md`

**Step 1: Review the new docs package**

Run: `find docs/ui-reference -maxdepth 2 -type f | sort`

Expected: the complete reference package is present

**Step 2: Re-read the new docs for clarity**

Open:
- `docs/ui-reference/README.md`
- `docs/ui-reference/tokens.md`
- `docs/ui-reference/screen-map.md`

**Step 3: Confirm no unrelated code paths changed**

Run: `git status --short`

Expected: only docs and existing in-progress files are modified
