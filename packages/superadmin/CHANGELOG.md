# @braedonsaunders/appkit-superadmin

## 3.0.0

### Patch Changes

- 6a1f901: Readable text reaches WCAG AA across the kit, every interactive control draws the token focus ring, and modal layers stack in the order they open.

  - **Readable text.** Labels, headings, hints, counts, metadata, empty-state and status messages, and icon-only controls that used `text-fg-subtle` (2.56:1 on white) now use `text-fg-muted` in every package, as `ui` already did. Exported PDFs print their page counters and empty-table messages in `fg-muted`, and dashboard chart axis labels use it too. `fg-subtle` stays on placeholders, disabled items and decorative icons, and `pnpm check:quality` now rejects it anywhere else unless `scripts/fg-subtle-allowlist.json` records a reason.
  - **Focus styles.** `ContextMenu` items, `Toast` buttons, `Pagination` links, the `SortableTh` / `SortTh` link, `FilterChips` triggers and options, `MultiSelect` rows, the `LineGrid` gutter button, the `SearchInput` and `GlobalSearch` clear buttons, and `FileUploader`'s drop zone and Dismiss button draw the token focus ring. `SidebarNav`'s split subgroup header puts its ring on the chevron button and the link, which take focus, instead of their wrapper, and its chevron's hover fill uses `surface-hover` (the `surface-active` token it named does not exist).
  - **Modal layers.** Escape now closes only the top modal layer: a `Dialog` opened over a `Drawer` closes on its own, and the drawer stays open. A `Drawer` opened from a `Dialog` opens at the Dialog's layer and, coming later, paints above it instead of underneath, where it took keyboard focus while hidden.

- Updated dependencies [6c1b18a]
- Updated dependencies [6a1f901]
  - @braedonsaunders/appkit-ui@0.4.0

## 2.1.0

### Minor Changes

- Expand the operator console: platform nav/hub/menu, provider settings, delivery logs, database maintenance, and optional identity-list extras so host applications can share one /platform UI.

## 2.0.0

### Patch Changes

- Updated dependencies [22722ea]
  - @braedonsaunders/appkit-ui@0.3.0

## 1.0.0

### Patch Changes

- Updated dependencies [22e968a]
- Updated dependencies [9f04661]
  - @braedonsaunders/appkit-ui@0.2.0
