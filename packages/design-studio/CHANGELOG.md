# @braedonsaunders/appkit-design-studio

## 3.0.0

### Patch Changes

- a1a7996: Every colour names a real token, and every scheduling control is reachable and visible from the keyboard.

  - **Colours that rendered nothing.** Utilities naming colours the tokens do not define (`surface-muted`, `surface-subtle`, `surface-raised`, `fg-muted-subtle`, `accent`, `accent-subtle`) drew no fill or fell back to the inherited colour. They now use defined tokens: recessed panels, chips and table headers `bg-subtle`, their hovers `surface-hover`, the assistant's request card `elevated`, the design studio's labels `fg-muted`, the forms runtime's accent, purple and indigo section tones `accent-violet` / `accent-indigo` on a 10% tint, and the remote terminal's magenta `accent-violet` (it was printing in the default text colour). The design studio's checkbox accent is `accent-primary` instead of a raw teal shade.
  - **Scheduling focus.** Every raw button in the workspace, toolbar menus, management dialog and task editor draws the token focus ring. Phase headers in the Gantt and list are buttons with `aria-expanded`, and task names in the Gantt, list and board are buttons that open the task, so collapsing a phase and opening a task work from the keyboard.

- Updated dependencies [6c1b18a]
- Updated dependencies [6a1f901]
  - @braedonsaunders/appkit-ui@0.4.0
  - @braedonsaunders/appkit-tokens@0.1.3

## 2.0.0

### Patch Changes

- Updated dependencies [22722ea]
  - @braedonsaunders/appkit-ui@0.3.0

## 1.0.0

### Patch Changes

- Updated dependencies [22e968a]
- Updated dependencies [9f04661]
  - @braedonsaunders/appkit-ui@0.2.0

## 0.2.0

### Minor Changes

- 3ae036d: Complete the production builder and runtime extraction pass: full form and print-design authoring, hardened form PDF rendering, dashboard lifecycle composition, report refinement/cadence/run claiming, AI production helpers, transactional event relay, notification digest/push policy, source connector and destination registries, and persisted-query validation.
- 9260ff0: Add a controlled, application-agnostic Fabric workspace to the
  optional React entry, including artboards, insertion, layer ordering, selection,
  drag/resize, inline text editing, basic inspectors, zoom/fullscreen, and print
  provider controls. This does not yet claim source API or full inspector parity.

### Patch Changes

- 3ab6056: Build every package as compiled ESM with declarations and clean publish
  metadata, verify packed artifacts in fresh Node/React/Next consumers, add the
  `create-appkit` CLI, and automate version PRs and npm publication with
  Changesets.
- 374beb4: Keep the design workspace header and empty inspector at stable heights when the
  canvas selection changes, and prevent long selection copy from reflowing the
  editor.
- Updated dependencies [3ab6056]
- Updated dependencies [1319bfb]
  - @braedonsaunders/appkit-tokens@0.1.1
  - @braedonsaunders/appkit-ui@0.1.1
