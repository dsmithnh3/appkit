---
"@braedonsaunders/appkit-ui": patch
"@braedonsaunders/appkit-ai": patch
"@braedonsaunders/appkit-apps": patch
"@braedonsaunders/appkit-customization": patch
"@braedonsaunders/appkit-dashboard": patch
"@braedonsaunders/appkit-forms": patch
"@braedonsaunders/appkit-forms-pdf": patch
"@braedonsaunders/appkit-iam": patch
"@braedonsaunders/appkit-integrations": patch
"@braedonsaunders/appkit-mailbox": patch
"@braedonsaunders/appkit-notifications": patch
"@braedonsaunders/appkit-pdf": patch
"@braedonsaunders/appkit-query-console": patch
"@braedonsaunders/appkit-remote-sessions": patch
"@braedonsaunders/appkit-reports": patch
"@braedonsaunders/appkit-scene": patch
"@braedonsaunders/appkit-scheduling": patch
"@braedonsaunders/appkit-storage": patch
"@braedonsaunders/appkit-superadmin": patch
"@braedonsaunders/appkit-workflows": patch
---

Readable text reaches WCAG AA across the kit, every interactive control draws the token focus ring, and modal layers stack in the order they open.

- **Readable text.** Labels, headings, hints, counts, metadata, empty-state and status messages, and icon-only controls that used `text-fg-subtle` (2.56:1 on white) now use `text-fg-muted` in every package, as `ui` already did. Exported PDFs print their page counters and empty-table messages in `fg-muted`, and dashboard chart axis labels use it too. `fg-subtle` stays on placeholders, disabled items and decorative icons, and `pnpm check:quality` now rejects it anywhere else unless `scripts/fg-subtle-allowlist.json` records a reason.
- **Focus styles.** `ContextMenu` items, `Toast` buttons, `Pagination` links, the `SortableTh` / `SortTh` link, `FilterChips` triggers and options, `MultiSelect` rows, the `LineGrid` gutter button, the `SearchInput` and `GlobalSearch` clear buttons, and `FileUploader`'s drop zone and Dismiss button draw the token focus ring. `SidebarNav`'s split subgroup header puts its ring on the chevron button and the link, which take focus, instead of their wrapper, and its chevron's hover fill uses `surface-hover` (the `surface-active` token it named does not exist).
- **Modal layers.** Escape now closes only the top modal layer: a `Dialog` opened over a `Drawer` closes on its own, and the drawer stays open. A `Drawer` opened from a `Dialog` opens at the Dialog's layer and, coming later, paints above it instead of underneath, where it took keyboard focus while hidden.
