# @braedonsaunders/appkit-apps

## 4.0.0

### Patch Changes

- 6a1f901: Readable text reaches WCAG AA across the kit, every interactive control draws the token focus ring, and modal layers stack in the order they open.

  - **Readable text.** Labels, headings, hints, counts, metadata, empty-state and status messages, and icon-only controls that used `text-fg-subtle` (2.56:1 on white) now use `text-fg-muted` in every package, as `ui` already did. Exported PDFs print their page counters and empty-table messages in `fg-muted`, and dashboard chart axis labels use it too. `fg-subtle` stays on placeholders, disabled items and decorative icons, and `pnpm check:quality` now rejects it anywhere else unless `scripts/fg-subtle-allowlist.json` records a reason.
  - **Focus styles.** `ContextMenu` items, `Toast` buttons, `Pagination` links, the `SortableTh` / `SortTh` link, `FilterChips` triggers and options, `MultiSelect` rows, the `LineGrid` gutter button, the `SearchInput` and `GlobalSearch` clear buttons, and `FileUploader`'s drop zone and Dismiss button draw the token focus ring. `SidebarNav`'s split subgroup header puts its ring on the chevron button and the link, which take focus, instead of their wrapper, and its chevron's hover fill uses `surface-hover` (the `surface-active` token it named does not exist).
  - **Modal layers.** Escape now closes only the top modal layer: a `Dialog` opened over a `Drawer` closes on its own, and the drawer stays open. A `Drawer` opened from a `Dialog` opens at the Dialog's layer and, coming later, paints above it instead of underneath, where it took keyboard focus while hidden.

- Updated dependencies [6c1b18a]
- Updated dependencies [2da1e53]
- Updated dependencies [0f6e203]
- Updated dependencies [6a1f901]
  - @braedonsaunders/appkit-ui@0.4.0

## 3.2.0

### Minor Changes

- 1350d09: Add datasets — a data plane for an application's own working data, at `@braedonsaunders/appkit-apps/datasets`.

  A sandboxed frontend can reach the host's records adapter, its authored backend, and whatever literal it shipped with. Data the app's _author_ produced — a CSV a script wrote, rows a job computed — had nowhere to live, so authors pasted snapshots into source and hand-maintained them.

  A dataset is named, typed rows stored in the app's existing storage namespace, served through `datasetRecords()` as `dataset.<name>` (and `datasets` for the index). The frontend reads it with the `records.list` API it already uses, so this adds no bridge method and no new sandbox surface. `parseDatasetContent` accepts CSV, TSV, JSON, and NDJSON; `putDataset` replaces or appends with key-column correction. A dataset may carry a producer — the command that regenerates it — with `datasetIsStale` and `claimDatasetRefresh` so a host can refresh it without a round trip through the author.

## 3.1.0

### Minor Changes

- ee93dc0: Add optional, accessible timestamps to completed assistant messages in `AgentPanel`.

  Make sandboxed app frontends inherit the host application theme automatically and announce live theme changes through the `appkit:themechange` browser event.

## 3.0.1

### Patch Changes

- 69fbb2a: Resolve standard document-relative frontend asset references when inlining opaque-origin app bundles, and let apps declare exact public data origins for separately granted backend requests.

## 3.0.0

### Patch Changes

- Updated dependencies [22722ea]
  - @braedonsaunders/appkit-ui@0.3.0

## 2.0.0

### Patch Changes

- Updated dependencies [22e968a]
- Updated dependencies [9f04661]
  - @braedonsaunders/appkit-ui@0.2.0

## 1.0.0

### Patch Changes

- Updated dependencies [3ae036d]
- Updated dependencies [3ab6056]
- Updated dependencies [1319bfb]
- Updated dependencies [1319bfb]
  - @braedonsaunders/appkit-db@0.2.0
  - @braedonsaunders/appkit-endpoints@0.1.1
  - @braedonsaunders/appkit-ui@0.1.1
