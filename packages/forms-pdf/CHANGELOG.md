# @braedonsaunders/appkit-forms-pdf

## 12.0.0

### Patch Changes

- 6a1f901: Readable text reaches WCAG AA across the kit, every interactive control draws the token focus ring, and modal layers stack in the order they open.

  - **Readable text.** Labels, headings, hints, counts, metadata, empty-state and status messages, and icon-only controls that used `text-fg-subtle` (2.56:1 on white) now use `text-fg-muted` in every package, as `ui` already did. Exported PDFs print their page counters and empty-table messages in `fg-muted`, and dashboard chart axis labels use it too. `fg-subtle` stays on placeholders, disabled items and decorative icons, and `pnpm check:quality` now rejects it anywhere else unless `scripts/fg-subtle-allowlist.json` records a reason.
  - **Focus styles.** `ContextMenu` items, `Toast` buttons, `Pagination` links, the `SortableTh` / `SortTh` link, `FilterChips` triggers and options, `MultiSelect` rows, the `LineGrid` gutter button, the `SearchInput` and `GlobalSearch` clear buttons, and `FileUploader`'s drop zone and Dismiss button draw the token focus ring. `SidebarNav`'s split subgroup header puts its ring on the chevron button and the link, which take focus, instead of their wrapper, and its chevron's hover fill uses `surface-hover` (the `surface-active` token it named does not exist).
  - **Modal layers.** Escape now closes only the top modal layer: a `Dialog` opened over a `Drawer` closes on its own, and the drawer stays open. A `Drawer` opened from a `Dialog` opens at the Dialog's layer and, coming later, paints above it instead of underneath, where it took keyboard focus while hidden.

- Updated dependencies [6c1b18a]
- Updated dependencies [a1a7996]
- Updated dependencies [6a1f901]
  - @braedonsaunders/appkit-tokens@0.1.3
  - @braedonsaunders/appkit-design-studio@3.0.0
  - @braedonsaunders/appkit-pdf@0.7.1
  - @braedonsaunders/appkit-reports@3.0.0

## 11.0.0

### Patch Changes

- Updated dependencies [8cff487]
  - @braedonsaunders/appkit-pdf@0.7.0

## 10.0.0

### Patch Changes

- Updated dependencies [dbf95c7]
  - @braedonsaunders/appkit-pdf@0.6.0

## 9.0.0

### Patch Changes

- Updated dependencies [9259cc8]
  - @braedonsaunders/appkit-pdf@0.5.0

## 8.0.0

### Patch Changes

- Updated dependencies [40ad102]
  - @braedonsaunders/appkit-pdf@0.4.0

## 7.0.0

### Patch Changes

- Updated dependencies [9246120]
  - @braedonsaunders/appkit-pdf@0.3.0

## 6.0.0

### Patch Changes

- Updated dependencies [6a4d434]
  - @braedonsaunders/appkit-pdf@0.2.0

## 5.0.0

### Patch Changes

- @braedonsaunders/appkit-design-studio@2.0.0
- @braedonsaunders/appkit-reports@2.0.0

## 4.0.0

### Patch Changes

- Updated dependencies [e2307fb]
  - @braedonsaunders/appkit-reports@1.2.0

## 3.0.0

### Patch Changes

- Updated dependencies [a923c9b]
  - @braedonsaunders/appkit-reports@1.1.0
  - @braedonsaunders/appkit-design-studio@1.0.0

## 2.0.1

### Patch Changes

- 0bf3181: Allow cold Chromium starts on contended workers more time and recover cleanly after a transient launch failure.

## 2.0.0

### Patch Changes

- Updated dependencies [0eff9e0]
- Updated dependencies [8342b35]
  - @braedonsaunders/appkit-reports@1.0.0
  - @braedonsaunders/appkit-sync@1.1.0
  - @braedonsaunders/appkit-design-studio@1.0.0

## 1.0.0

### Minor Changes

- 3ae036d: Complete the production builder and runtime extraction pass: full form and print-design authoring, hardened form PDF rendering, dashboard lifecycle composition, report refinement/cadence/run claiming, AI production helpers, transactional event relay, notification digest/push policy, source connector and destination registries, and persisted-query validation.

### Patch Changes

- 3ab6056: Build every package as compiled ESM with declarations and clean publish
  metadata, verify packed artifacts in fresh Node/React/Next consumers, add the
  `create-appkit` CLI, and automate version PRs and npm publication with
  Changesets.
- Updated dependencies [6502bed]
- Updated dependencies [3ae036d]
- Updated dependencies [9260ff0]
- Updated dependencies [3ab6056]
- Updated dependencies [374beb4]
  - @braedonsaunders/appkit-reports@0.2.0
  - @braedonsaunders/appkit-design-studio@0.2.0
  - @braedonsaunders/appkit-sync@1.0.0
  - @braedonsaunders/appkit-pdf@0.1.1
  - @braedonsaunders/appkit-tokens@0.1.1
