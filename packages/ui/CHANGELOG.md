# @braedonsaunders/appkit-ui

## 0.4.0

### Minor Changes

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

### Patch Changes

- 6a1f901: Readable text reaches WCAG AA across the kit, every interactive control draws the token focus ring, and modal layers stack in the order they open.

  - **Readable text.** Labels, headings, hints, counts, metadata, empty-state and status messages, and icon-only controls that used `text-fg-subtle` (2.56:1 on white) now use `text-fg-muted` in every package, as `ui` already did. Exported PDFs print their page counters and empty-table messages in `fg-muted`, and dashboard chart axis labels use it too. `fg-subtle` stays on placeholders, disabled items and decorative icons, and `pnpm check:quality` now rejects it anywhere else unless `scripts/fg-subtle-allowlist.json` records a reason.
  - **Focus styles.** `ContextMenu` items, `Toast` buttons, `Pagination` links, the `SortableTh` / `SortTh` link, `FilterChips` triggers and options, `MultiSelect` rows, the `LineGrid` gutter button, the `SearchInput` and `GlobalSearch` clear buttons, and `FileUploader`'s drop zone and Dismiss button draw the token focus ring. `SidebarNav`'s split subgroup header puts its ring on the chevron button and the link, which take focus, instead of their wrapper, and its chevron's hover fill uses `surface-hover` (the `surface-active` token it named does not exist).
  - **Modal layers.** Escape now closes only the top modal layer: a `Dialog` opened over a `Drawer` closes on its own, and the drawer stays open. A `Drawer` opened from a `Dialog` opens at the Dialog's layer and, coming later, paints above it instead of underneath, where it took keyboard focus while hidden.

- Updated dependencies [6c1b18a]
  - @braedonsaunders/appkit-tokens@0.1.3

## 0.3.0

### Minor Changes

- 22722ea: `SubtabNav` gains a sliding active indicator that glides between tabs on the same spring the `Tabs` segmented control already uses.

  Every detail/drawer subtab bar in the suite previously marked its active tab with a static full-width border that snapped from tab to tab. The indicator is now a shared-layout pill that travels to whichever tab is selected, so switching sections reads as movement rather than a cut. The call surface is unchanged — same props, same roles, same labels — and the indicator renders in the static markup, so server-rendered pages show the selection before hydration. Reduced-motion users get an instant swap instead of the glide.

## 0.2.1

### Patch Changes

- a923c9b: Keep report studio usable while a name is blank, add Save as, keep relation filters on the physical identifier, expose related-table columns, and stop SearchSelect menus from running off the page.

## 0.2.0

### Minor Changes

- 22e968a: Move `useElementSize` out of the scene package and into `@braedonsaunders/appkit-ui`.

  The hook is a bare `ResizeObserver` wrapper — it measures an element and
  re-renders on resize — but it lived beside the walking-character animation loop
  and was reachable only through the `@braedonsaunders/appkit-scene` root entry. Any consumer that
  wanted to measure a div had to import a module graph whose scene artwork is well
  over 150KB of drawn SVG, and `@braedonsaunders/appkit-scene` declared no `sideEffects`, so a
  bundler could not prove the unused stages were safe to drop. Call screens that
  just needed a viewport height were paying for a painted office.

  `useElementSize` now ships from `@braedonsaunders/appkit-ui`, which every app already installs,
  and additionally from the `@braedonsaunders/appkit-ui/use-element-size` entry point for
  consumers that want the hook without the component barrel. `@braedonsaunders/appkit-scene`
  imports it from there like any other primitive.

  `@braedonsaunders/appkit-scene` also declares `sideEffects: ["*.css"]` — its modules are pure
  declarations and the stages tree-shake, while `styles.css` stays listed because
  dropping it would strip the Tailwind `@source` registration that generates the
  arbitrary-value classes the painted props position themselves with.

  Breaking for `@braedonsaunders/appkit-scene`: `useElementSize` is no longer exported. Import it
  from `@braedonsaunders/appkit-ui` instead.

### Patch Changes

- 9f04661: Keep dialog and drawer focus stable while controlled form fields rerender.

  Inline close callbacks no longer restart overlay focus management on every
  keystroke, and explicit `autoFocus` fields take precedence over corner close
  buttons when an overlay first opens.

## 0.1.10

### Patch Changes

- 0c2dde7: Make the navigation primitives honor `UiLinkProvider`. `TopNav`, `SidebarNav`,
  and `MobileTabBar` each carried their own `defaultLink` that rendered a raw
  `<a href>`, so an app that injected a router link at the root still full-reloaded
  the document on every nav click — tearing down the router, discarding client
  state, and skipping the `PageTransition` route animation entirely. Only
  `SettingsLayout` resolved through `UiLink`.

  The four copies are replaced by a single `defaultLinkRender` exported from
  `link-context`, which resolves through `UiLink` and still falls back to a plain
  `<a>` when no provider is present. `LinkRender` now lives beside it and is
  re-exported from `settings-layout`, so the public type path is unchanged. Apps
  passing an explicit `linkRender` are unaffected.

- 0c2dde7: Give the native page transition a real presence. The route handoff was tuned so
  quietly (opacity 0.9 → 1 over a 1px lift) that navigation read as an instant
  swap. It is now a lift-and-settle crossfade: the outgoing canvas clears on the
  fast duration token while the incoming one rises 12px and settles from a 0.99
  scale on `--duration-slow` / `--ease-out`. Exit stays shorter than entrance so
  the snapshots overlap only briefly and text never ghosts against itself.

  Durations and easings remain tokens, `prefers-reduced-motion` is still honored,
  and the `PageTransition` contract is unchanged — consuming apps pick this up
  with no code edits.

- a1d5d50: Add `@braedonsaunders/appkit-scheduling`: critical-path scheduling with working calendars,
  work-breakdown rollups, baselines, resource leveling, and the Gantt / list /
  board authoring surface under `@braedonsaunders/appkit-scheduling/react`.

  `@braedonsaunders/appkit-ui` gains a `calendar` navigation icon key.

- 8a17e9e: Keep URL-backed search input authoritative while overlapping route transitions
  settle. Previously, an older streamed response could restore its query value
  after the user had typed additional characters, visibly deleting newer input.

  `SearchInput` now tracks whether it owns an uncommitted local edit, ignores stale
  URL snapshots until all navigation settles with that exact value, and still
  adopts browser-history or link changes whenever no local edit is pending.

## 0.1.1

### Patch Changes

- 3ab6056: Build every package as compiled ESM with declarations and clean publish
  metadata, verify packed artifacts in fresh Node/React/Next consumers, add the
  `create-appkit` CLI, and automate version PRs and npm publication with
  Changesets.
- 1319bfb: Restore the source `DocumentTitle`, `DetailHeader`, and `BackLinkLike` contracts,
  replace raw settings-card palette classes with semantic AppKit tokens, and make
  hover pause and resume toast dismissal instead of toggling an unused flag.
- Updated dependencies [3ab6056]
  - @braedonsaunders/appkit-tokens@0.1.1
