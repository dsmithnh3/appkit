# @braedonsaunders/appkit-ai

## 3.0.0

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

- a1a7996: Every colour names a real token, and every scheduling control is reachable and visible from the keyboard.

  - **Colours that rendered nothing.** Utilities naming colours the tokens do not define (`surface-muted`, `surface-subtle`, `surface-raised`, `fg-muted-subtle`, `accent`, `accent-subtle`) drew no fill or fell back to the inherited colour. They now use defined tokens: recessed panels, chips and table headers `bg-subtle`, their hovers `surface-hover`, the assistant's request card `elevated`, the design studio's labels `fg-muted`, the forms runtime's accent, purple and indigo section tones `accent-violet` / `accent-indigo` on a 10% tint, and the remote terminal's magenta `accent-violet` (it was printing in the default text colour). The design studio's checkbox accent is `accent-primary` instead of a raw teal shade.
  - **Scheduling focus.** Every raw button in the workspace, toolbar menus, management dialog and task editor draws the token focus ring. Phase headers in the Gantt and list are buttons with `aria-expanded`, and task names in the Gantt, list and board are buttons that open the task, so collapsing a phase and opening a task work from the keyboard.

- 6a1f901: Readable text reaches WCAG AA across the kit, every interactive control draws the token focus ring, and modal layers stack in the order they open.

  - **Readable text.** Labels, headings, hints, counts, metadata, empty-state and status messages, and icon-only controls that used `text-fg-subtle` (2.56:1 on white) now use `text-fg-muted` in every package, as `ui` already did. Exported PDFs print their page counters and empty-table messages in `fg-muted`, and dashboard chart axis labels use it too. `fg-subtle` stays on placeholders, disabled items and decorative icons, and `pnpm check:quality` now rejects it anywhere else unless `scripts/fg-subtle-allowlist.json` records a reason.
  - **Focus styles.** `ContextMenu` items, `Toast` buttons, `Pagination` links, the `SortableTh` / `SortTh` link, `FilterChips` triggers and options, `MultiSelect` rows, the `LineGrid` gutter button, the `SearchInput` and `GlobalSearch` clear buttons, and `FileUploader`'s drop zone and Dismiss button draw the token focus ring. `SidebarNav`'s split subgroup header puts its ring on the chevron button and the link, which take focus, instead of their wrapper, and its chevron's hover fill uses `surface-hover` (the `surface-active` token it named does not exist).
  - **Modal layers.** Escape now closes only the top modal layer: a `Dialog` opened over a `Drawer` closes on its own, and the drawer stays open. A `Drawer` opened from a `Dialog` opens at the Dialog's layer and, coming later, paints above it instead of underneath, where it took keyboard focus while hidden.

- Updated dependencies [6c1b18a]
- Updated dependencies [2da1e53]
- Updated dependencies [0f6e203]
- Updated dependencies [6a1f901]
  - @braedonsaunders/appkit-ui@0.4.0

## 2.2.0

### Minor Changes

- 798946c: Keep long conversation content within the panel width and add anchored older-message pagination to `AgentPanel`.

## 2.1.0

### Minor Changes

- ee93dc0: Add optional, accessible timestamps to completed assistant messages in `AgentPanel`.

  Make sandboxed app frontends inherit the host application theme automatically and announce live theme changes through the `appkit:themechange` browser event.

## 2.0.2

### Patch Changes

- 742dd90: Keep a completed streamed assistant response visible while the host transcript is briefly behind persistence, then reconcile to the durable messages once they arrive.

## 2.0.1

### Patch Changes

- d754d2d: `AgentPanel` no longer prints a sent message twice while its turn streams.

  A submit appends the message optimistically under a `user-<stamp>` id, and the host persists the same sentence under its durable id moments later. Reconciliation matched turns by id alone, so the persisted twin read as a second, steered turn and joined the optimistic one — one enter key, two bubbles — until the run ended and the whole transcript was adopted. An optimistic turn whose exact text the host now carries is adopted in place instead: the durable turn takes the optimistic seat. Genuinely new text still appends as before, and a repeated sentence still lands twice.

  Also in this patch: streamed output stops yanking the reader. New arrivals auto-scroll only while the reader is already pinned to the live edge; someone scrolled up reading history stays where they are. A fresh submit and the initial open still go straight to the bottom.

## 2.0.0

### Patch Changes

- Updated dependencies [22722ea]
  - @braedonsaunders/appkit-ui@0.3.0

## 1.4.2

### Patch Changes

- 428dcf6: `AgentPanel` now shows a turn the person adds while it is streaming.

  The host-transcript reconciliation stood down entirely during a stream, because the parts the panel is receiving are richer than anything the host has persisted and replacing them mid-answer loses detail. That is right about the assistant and wrong about the person: a reader can speak into a turn that is already running — steering it, or releasing a queued message into it — and the host appends that to the transcript immediately. Standing down meant their own words appeared nowhere. The message was recorded, the agent was already acting on it, and the screen showed no trace of it.

  A streaming panel now takes `user` turns from the host, inserted before the in-flight assistant message, which is where they sit once the run ends and the whole transcript is adopted — so nothing jumps when it does. Assistant messages are never taken from the host in this path, so a host-side provisional answer cannot duplicate the one being streamed.

  A provisional turn the host later withdraws is dropped rather than left beside its replacement: a queued message is rendered from the queue until it is delivered, at which point it becomes a real turn under a real id, and holding both would print the same sentence twice. Turns the panel owns — the optimistic message a submit appends under its own id, which the host has not persisted yet — were never host ids and are never dropped.

- 95f4e26: Two parts whose fields differ can no longer produce the same transcript signature.

  The signature that decides whether a host transcript has moved joined each part's fields with a space, and a value holding whitespace can absorb that separator: a status of `ok ` beside a tool call id of `c1` spaces-joins to exactly what a status of `ok` beside ` c1` does. Two different parts compared equal, and a real change was read as "the transcript did not move" — the panel sat on a stale snapshot.

  The fields are now joined with a NUL, which no string value can carry, so distinct field tuples always produce distinct signatures.

## 1.4.1

### Patch Changes

- Updated dependencies [e67bb83]
  - @braedonsaunders/appkit-egress-proxy@0.2.1

## 1.4.0

### Minor Changes

- 4b7fba6: AgentPanel shows a turn in flight that it is not streaming itself

  The thinking indicator keyed off `streaming` alone, so a turn running somewhere
  else — in a worker, or one the reader has just reloaded into the middle of — had
  no sign of life in the transcript at all. Hosts were left explaining in a banner
  beside the conversation that something was happening elsewhere, which is not
  where anyone looks and reads as an apology rather than progress.

  `working` says a turn is in flight that this panel is not producing. The
  indicator now rides along with the LAST assistant turn whenever that panel is
  streaming OR the host reports work, and it sits under whatever parts have
  already arrived rather than replacing them — so a turn with three tool cards and
  more coming looks exactly like a turn in progress, because that is what it is.

  `MemoAgentMessageRow` takes `pending` in place of `streaming`: a row only ever
  needed to know whether IT was the one still going, never the panel's transport
  state, and the narrower prop memoizes better.

## 1.3.0

### Minor Changes

- a65fe69: AgentPanel takes newer transcripts from its host, and the queue earns its space

  Three changes, all about a panel whose host can see more than the panel can.

  `initialMessages` is now reconciled, not just seeded. Seeding once was right
  while the only transcript was what had already been recorded — anything newer
  arrived through the stream. It is wrong for a host that can also observe work in
  progress: a turn running in a worker, or the turn a reader has just reloaded into
  the middle of. Without this, the only way a host could show a tool call made a
  second ago was to remount the panel, which throws away whatever the person was
  part-way through typing. The reconciliation is guarded on `streaming` and on
  there being no live request, because while the panel owns the turn its streamed
  parts are richer than anything the host has persisted yet. Comparison is
  structural but shallow — a new message, a new part, a call moving from running to
  returned, or prose growing — because these parts carry whole tool inputs and
  outputs and the host rebuilds the array on every render.

  `AgentMessageQueue` is about half as tall. It sits between the transcript and the
  composer, so every row it spends is a row taken from the conversation being read.
  The standing title line is gone: the `section` still carries it as an accessible
  name, and a numbered row whose own status reads "Queued" does not also need a
  heading to say so. Padding, the position badge and the action buttons each drop a
  notch.

  `onSendQueuedMessageNow` is new, with a `sendQueuedNow` label and a `sendable`
  flag on `AgentQueuedMessage`. A queued message otherwise goes when the
  conversation gets to it, and there was no way to say "go now" without deleting it
  and typing it again. `sendable: false` lets a host suppress the action where it
  knows the send would be refused, rather than offering a button that fails.

## 1.2.2

### Patch Changes

- Updated dependencies [52ac979]
  - @braedonsaunders/appkit-egress-proxy@0.2.0

## 1.2.1

### Patch Changes

- 4474434: Stop typing lag on long threads: the composer draft input now lives in a memoed component that owns its own state, so a keystroke re-renders only the composer instead of every transcript row. Transcript rows are memoed and receive a stable submit callback, so streaming a turn re-renders only the tail row.

## 1.2.0

### Minor Changes

- 294f01e: Let an inline approval say that carrying the decision out failed.

  `AgentApprovalRequestStatus` gains `failed`, distinct from `rejected`: the
  decision was made and the action was attempted, and it is acting on it that did
  not work. `AgentApprovalRequestPart` gains an optional `failureReason` shown
  verbatim beside it, and the labels gain `carryOutFailed` for the state itself —
  separate from the existing `failed`, which means the decision could not be
  saved and the reader should press again.

  Without this a decided approval whose execution died had nowhere truthful to
  sit: it stayed `approved`, so the card went on promising the agent would
  continue automatically while nothing was happening, and the only reading left
  to the person waiting was that the agent had forgotten. The failed state
  renders as an alert rather than the quiet muted line the other settled states
  use, because it is the one the reader has to act on.

  Additive for every consumer: the labels are taken as `Partial` on both
  `AgentPanel` and `AgentApprovalRequestCard`, and parts that never carry the new
  status are unaffected.

## 1.1.6

### Patch Changes

- 3689232: Vertically center the one-line AgentPanel composer text and allow applications
  to render an employee avatar in the assistant-message marker slot.

## 1.1.5

### Patch Changes

- dea1537: Contain visually hidden credential labels within inline secret cards so long transcripts cannot expand the document scroll area, and add breathing room above the secure-submit actions.

## 1.1.4

### Patch Changes

- 8c15266: Render durable governed-action approval requests inline in agent conversations, with optional exact-action details, operator notes, and approve or decline callbacks.

## 1.1.3

### Patch Changes

- b8f7184: Add an inline, transcript-safe credential request card with accessible pending,
  stored, and expired states, caller-owned submission, and immediate input
  clearing. Harden tool activity counting against duplicated rendered steps.

## 1.1.2

### Patch Changes

- 303b940: Animate the AgentPanel streaming indicator with a subtle tokenized stagger and a static reduced-motion fallback.

## 1.1.1

### Patch Changes

- 857c73f: Let applications add attachment actions and draft content to AgentPanel, send
  file-only drafts, and render file parts on persisted and optimistic user turns.

## 1.1.0

### Minor Changes

- c557f47: Add an application-controlled durable message queue to `AgentPanel`, including ordered status presentation and edit, remove, and retry actions.

## 1.0.3

### Patch Changes

- cfe19a9: Move the DNS-pinned, SSRF-safe HTTPS transport into the shared egress package and remove AI's accidental runtime dependency on the data-sync package. Sync continues to re-export the transport for compatibility.
- Updated dependencies [cfe19a9]
  - @braedonsaunders/appkit-egress-proxy@0.1.1

## 1.0.2

### Patch Changes

- e9d9ad8: Allow applications to replace AgentPanel's stock empty card with a full-height branded stage while retaining the shared header, composer, streaming, and persistence behavior.
- 1db6afd: Allow applications to place contextual controls in `AgentPanel`'s fixed header through the optional `headerActions` prop. Existing conversations now open at their newest message, streaming scroll stays inside the message viewport instead of moving the surrounding page, and consecutive tool calls collapse to a subtle latest-step summary with expandable details.

## 1.0.1

### Patch Changes

- Add bounded visual-context pruning, durable fenced event execution and cursor following, and portable, provider-conformant desk state contracts.

## Unreleased

- Add `pruneVisualToolContext`, which keeps only the newest distinct tool-result
  images without changing tool-call structure or removing user-supplied images.

## 1.0.0

### Minor Changes

- 8342b35: Stop killing model requests that are merely slow.

  Outbound requests through `secureFetch` were capped at two minutes, and
  `@braedonsaunders/appkit-ai` asked for exactly that. Two minutes is a sensible ceiling for the
  webhooks and REST calls the egress guard was written for, and it is inside the
  normal range for the one thing that legitimately takes longer: a reasoning model
  working through a tool-using turn.

  Measured against several hosted models, single steps regularly ran past two
  minutes and the socket was destroyed mid-generation. The failure is worse than a
  slow answer. The provider had streamed nothing and billed nothing, so there was
  no partial result to keep; the caller saw only `Outbound request timed out after
119993 ms`; and for an agent loop the whole run died with it, discarding every
  step that had already completed and been paid for. Two consecutive runs of one
  scheduled task were lost this way with zero tokens spent.

  `MAX_TIMEOUT_MS` in the egress guard rises to fifteen minutes and
  `AI_REQUEST_TIMEOUT_MS` to ten. Neither is a budget — callers still state their
  own timeout and their own loop governs how much work is done — this only stops
  the guard refusing a wait that a caller has good reason to ask for. The ceiling
  remains, because an unbounded wait is how a worker wedges.

### Patch Changes

- Updated dependencies [22e968a]
- Updated dependencies [8342b35]
- Updated dependencies [9f04661]
  - @braedonsaunders/appkit-ui@0.2.0
  - @braedonsaunders/appkit-sync@1.1.0

## 0.2.0

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
  - @braedonsaunders/appkit-sync@1.0.0
  - @braedonsaunders/appkit-ui@0.1.1
