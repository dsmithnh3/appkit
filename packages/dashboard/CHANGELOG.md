# @braedonsaunders/appkit-dashboard

## 4.0.0

### Patch Changes

- 6c1b18a: Make overlays, navigation and status colours usable from the keyboard and readable at WCAG AA.

  - **Layering.** `Dialog` moves from `z-[65]` to `z-[58]`, between stacked drawers and floating UI, so a `SearchSelect` menu, `Popover`, `confirmDialog()` or `promptDialog()` opened from inside a Dialog now paints above it instead of behind it. The z-index scale in `drawer.tsx` lists the Dialog, context-menu and toast layers as they actually are.
  - **ConfirmDialog.** Enter no longer confirms from anywhere on the page: focus starts on the confirm button and Enter activates the focused button, so Enter on Cancel cancels a destructive confirmation. Tab is trapped inside the dialog and focus returns to the trigger on close.
  - **PromptDialog.** The Tab trap now targets the panel instead of the `aria-hidden` scrim, so Tab and Shift+Tab cycle through the field, Cancel and Save.
  - **One focus trap.** `Dialog`, `Drawer`, `ConfirmRoot` and `PromptRoot` share one internal Tab trap, which also pulls escaped focus back into the panel. Only the topmost modal layer traps Tab, so a confirm or prompt raised over a Dialog or Drawer cycles its own buttons, and no layer pulls focus out of an open popover or menu. `ConfirmRoot` marks itself as an overlay, as `PromptRoot` does, so Escape on a confirm no longer also closes the Dialog or Drawer under it.
  - **Accessible names.** `Dialog` and `Drawer` set `aria-labelledby` and `aria-describedby` from their title and description. A `Drawer` always renders its header, so one opened without a title still has a close button.
  - **Tables.** A selected `TableRow` (and `RecordList`'s active row) uses `bg-primary-subtle`, the selection tint menus and search results use, instead of `bg-bg-subtle`, which was the hover colour in light and invisible on a surface in dark. `SortableTh` and `SortTh` set `aria-sort` on the active column and pass ordinary `<th>` attributes through; `SortableThProps` and `SortThProps` are exported. `RecordList` marks every sortable column with `aria-sort`.
  - **Sidebar persistence.** `SIDEBAR_COLLAPSED_COOKIE` and `readSidebarCollapsed()` are exported so a server can render the remembered sidebar width. When `defaultCollapsed` is omitted, `AppSidebar` restores the remembered state after mount; `AppShell` no longer forces it to `false`.
  - **Focus styles.** Navigation and menu controls in `SubtabNav`, `ThemeToggle`, `TopNav`, `MobileTabBar`, `AppShell`, `AppSidebar`, `AccountMenu`, `NotificationsBell`, `NavigationConfigEditor`, `SettingsNav` and `AdminHub` draw the token focus ring, as do the close and fullscreen buttons of `Dialog` and `Drawer` and the sort and reference controls of `RecordList` and `PagedTable`. `OrgChart` cards no longer remove the outline without a replacement. Focus rings across the packages draw `ring-ring` at full strength instead of 20–60% opacity, an invalid `Input`, `Textarea`, `SearchSelect` or `LineGrid` amount cell draws a full-strength `ring-danger`, and `WorkspaceLauncher` cards draw `ring-ring` instead of `ring-primary/35`. Rings inside a `Dialog` or `Drawer` are offset on `surface` and those inside `AccountMenu` and `NotificationsBell` popovers on `elevated`, so the dark theme shows no near-black band around them.
  - **Contrast.** In the light theme `--ch-ring` becomes teal-600 (3.7:1 on `bg`), and `--ch-danger`, `--ch-warning` and `--ch-success` become their 700 shades, so status text on its `-subtle` tint and `-fg` text on the solid fill both reach 4.5:1. Readable text that used `text-fg-subtle` (group labels, hints, metadata, counts, status messages) now uses `text-fg-muted`; `fg-subtle` remains for placeholders, disabled items and decorative icons. `SignaturePad`'s "Sign here" hint uses `signature-ink` at 70%, since the pad stays white in both themes. A token test enforces these contrast pairs in both themes.

- 6a1f901: Readable text reaches WCAG AA across the kit, every interactive control draws the token focus ring, and modal layers stack in the order they open.

  - **Readable text.** Labels, headings, hints, counts, metadata, empty-state and status messages, and icon-only controls that used `text-fg-subtle` (2.56:1 on white) now use `text-fg-muted` in every package, as `ui` already did. Exported PDFs print their page counters and empty-table messages in `fg-muted`, and dashboard chart axis labels use it too. `fg-subtle` stays on placeholders, disabled items and decorative icons, and `pnpm check:quality` now rejects it anywhere else unless `scripts/fg-subtle-allowlist.json` records a reason.
  - **Focus styles.** `ContextMenu` items, `Toast` buttons, `Pagination` links, the `SortableTh` / `SortTh` link, `FilterChips` triggers and options, `MultiSelect` rows, the `LineGrid` gutter button, the `SearchInput` and `GlobalSearch` clear buttons, and `FileUploader`'s drop zone and Dismiss button draw the token focus ring. `SidebarNav`'s split subgroup header puts its ring on the chevron button and the link, which take focus, instead of their wrapper, and its chevron's hover fill uses `surface-hover` (the `surface-active` token it named does not exist).
  - **Modal layers.** Escape now closes only the top modal layer: a `Dialog` opened over a `Drawer` closes on its own, and the drawer stays open. A `Drawer` opened from a `Dialog` opens at the Dialog's layer and, coming later, paints above it instead of underneath, where it took keyboard focus while hidden.

- Updated dependencies [6c1b18a]
- Updated dependencies [6a1f901]
  - @braedonsaunders/appkit-ui@0.4.0

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

### Minor Changes

- 3ae036d: Complete the production builder and runtime extraction pass: full form and print-design authoring, hardened form PDF rendering, dashboard lifecycle composition, report refinement/cadence/run claiming, AI production helpers, transactional event relay, notification digest/push policy, source connector and destination registries, and persisted-query validation.

### Patch Changes

- 3ab6056: Build every package as compiled ESM with declarations and clean publish
  metadata, verify packed artifacts in fresh Node/React/Next consumers, add the
  `create-appkit` CLI, and automate version PRs and npm publication with
  Changesets.
- Updated dependencies [3ae036d]
- Updated dependencies [3ab6056]
- Updated dependencies [1319bfb]
- Updated dependencies [1319bfb]
  - @braedonsaunders/appkit-analytics@0.2.0
  - @braedonsaunders/appkit-db@0.2.0
  - @braedonsaunders/appkit-ui@0.1.1
