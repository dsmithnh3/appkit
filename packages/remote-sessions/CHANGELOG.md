# @braedonsaunders/appkit-remote-sessions

## 0.1.2

### Patch Changes

- a1a7996: Every colour names a real token, and every scheduling control is reachable and visible from the keyboard.

  - **Colours that rendered nothing.** Utilities naming colours the tokens do not define (`surface-muted`, `surface-subtle`, `surface-raised`, `fg-muted-subtle`, `accent`, `accent-subtle`) drew no fill or fell back to the inherited colour. They now use defined tokens: recessed panels, chips and table headers `bg-subtle`, their hovers `surface-hover`, the assistant's request card `elevated`, the design studio's labels `fg-muted`, the forms runtime's accent, purple and indigo section tones `accent-violet` / `accent-indigo` on a 10% tint, and the remote terminal's magenta `accent-violet` (it was printing in the default text colour). The design studio's checkbox accent is `accent-primary` instead of a raw teal shade.
  - **Scheduling focus.** Every raw button in the workspace, toolbar menus, management dialog and task editor draws the token focus ring. Phase headers in the Gantt and list are buttons with `aria-expanded`, and task names in the Gantt, list and board are buttons that open the task, so collapsing a phase and opening a task work from the keyboard.

- 6a1f901: Readable text reaches WCAG AA across the kit, every interactive control draws the token focus ring, and modal layers stack in the order they open.

  - **Readable text.** Labels, headings, hints, counts, metadata, empty-state and status messages, and icon-only controls that used `text-fg-subtle` (2.56:1 on white) now use `text-fg-muted` in every package, as `ui` already did. Exported PDFs print their page counters and empty-table messages in `fg-muted`, and dashboard chart axis labels use it too. `fg-subtle` stays on placeholders, disabled items and decorative icons, and `pnpm check:quality` now rejects it anywhere else unless `scripts/fg-subtle-allowlist.json` records a reason.
  - **Focus styles.** `ContextMenu` items, `Toast` buttons, `Pagination` links, the `SortableTh` / `SortTh` link, `FilterChips` triggers and options, `MultiSelect` rows, the `LineGrid` gutter button, the `SearchInput` and `GlobalSearch` clear buttons, and `FileUploader`'s drop zone and Dismiss button draw the token focus ring. `SidebarNav`'s split subgroup header puts its ring on the chevron button and the link, which take focus, instead of their wrapper, and its chevron's hover fill uses `surface-hover` (the `surface-active` token it named does not exist).
  - **Modal layers.** Escape now closes only the top modal layer: a `Dialog` opened over a `Drawer` closes on its own, and the drawer stays open. A `Drawer` opened from a `Dialog` opens at the Dialog's layer and, coming later, paints above it instead of underneath, where it took keyboard focus while hidden.

## 0.1.1

### Patch Changes

- adab5f2: Make durable, non-PTY terminal transcripts visually scannable with semantic ANSI for prompts,
  shell commands, stream kinds, and status while preserving provider-supplied ANSI and reader scroll.

## 0.1.0

### Minor Changes

- ed9b907: Extract provider-neutral remote computer and terminal sessions with fenced leases, append-only events, one-time viewer grants, cancellation, terminal commands, programmatic RDP/VNC control, React remote viewing, and a read-only xterm.js terminal surface with ANSI output, terminal-native scrollback, reader-respecting output follow behavior, host-owned header controls, and provider conformance.

## Unreleased

- Add RDP/VNC remote desktop support, protocol session leasing, and a remote terminal model.
- Adds provider-neutral sessions, fenced leases, immutable events, one-time grants, memory persistence, direct terminal and GUI control, React viewer, and provider conformance.
