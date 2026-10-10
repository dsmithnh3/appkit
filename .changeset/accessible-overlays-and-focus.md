---
"@braedonsaunders/appkit-ui": minor
"@braedonsaunders/appkit-tokens": patch
"@braedonsaunders/appkit-ai": patch
"@braedonsaunders/appkit-dashboard": patch
"@braedonsaunders/appkit-editor": patch
"@braedonsaunders/appkit-forms": patch
"@braedonsaunders/appkit-notifications": patch
"@braedonsaunders/appkit-scene": patch
---

Make overlays, navigation and status colours usable from the keyboard and readable at WCAG AA.

- **Layering.** `Dialog` moves from `z-[65]` to `z-[58]`, between stacked drawers and floating UI, so a `SearchSelect` menu, `Popover`, `confirmDialog()` or `promptDialog()` opened from inside a Dialog now paints above it instead of behind it. The z-index scale in `drawer.tsx` lists the Dialog, context-menu and toast layers as they actually are.
- **ConfirmDialog.** Enter no longer confirms from anywhere on the page: focus starts on the confirm button and Enter activates the focused button, so Enter on Cancel cancels a destructive confirmation. Tab is trapped inside the dialog and focus returns to the trigger on close.
- **PromptDialog.** The Tab trap now targets the panel instead of the `aria-hidden` scrim, so Tab and Shift+Tab cycle through the field, Cancel and Save.
- **One focus trap.** `Dialog`, `Drawer`, `ConfirmRoot` and `PromptRoot` share one internal Tab trap, which also pulls escaped focus back into the panel.
- **Accessible names.** `Dialog` and `Drawer` set `aria-labelledby` and `aria-describedby` from their title and description. A `Drawer` always renders its header, so one opened without a title still has a close button.
- **Tables.** A selected `TableRow` (and `RecordList`'s active row) uses `bg-primary-subtle`, distinct from hover in light and visible on a surface in dark. `SortableTh` and `SortTh` set `aria-sort` on the active column and pass ordinary `<th>` attributes through; `SortableThProps` and `SortThProps` are exported. `RecordList` marks every sortable column with `aria-sort`.
- **Sidebar persistence.** `SIDEBAR_COLLAPSED_COOKIE` and `readSidebarCollapsed()` are exported so a server can render the remembered sidebar width. When `defaultCollapsed` is omitted, `AppSidebar` restores the remembered state after mount; `AppShell` no longer forces it to `false`.
- **Focus styles.** Navigation and menu controls in `SubtabNav`, `ThemeToggle`, `TopNav`, `MobileTabBar`, `AppShell`, `AppSidebar`, `AccountMenu`, `NotificationsBell`, `NavigationConfigEditor`, `SettingsNav` and `AdminHub` draw the token focus ring, as do the close and fullscreen buttons of `Dialog` and `Drawer` and the sort and reference controls of `RecordList` and `PagedTable`. `OrgChart` cards no longer remove the outline without a replacement. Focus rings across the packages draw `ring-ring` at full strength instead of 20–60% opacity.
- **Contrast.** In the light theme `--ch-ring` becomes teal-600 (3.7:1 on `bg`), and `--ch-danger`, `--ch-warning` and `--ch-success` become their 700 shades, so status text on its `-subtle` tint and `-fg` text on the solid fill both reach 4.5:1. Readable text that used `text-fg-subtle` (group labels, hints, metadata, counts, status messages) now uses `text-fg-muted`; `fg-subtle` remains for placeholders, disabled items and decorative icons. A token test enforces these contrast pairs in both themes.
