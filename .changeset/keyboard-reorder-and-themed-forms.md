---
"@braedonsaunders/appkit-scheduling": minor
"@braedonsaunders/appkit-forms": patch
---

Schedule rows reorder from the keyboard, and the form canvas draws its fields in both themes.

- **Scheduling.** A task row's drag handle is named for what it does (`Reorder: <task>`, from the new `badges.reorder` label) instead of borrowing the Indent label, and it takes the arrow keys: Up and Down move the task past its neighbour, Right nests it under the task above and Left pulls it back out, keeping focus on the handle. `GanttView` and `ListView` accept `onMoveTask`, `onIndentTask` and `onOutdentTask` for this; `ScheduleWorkspace` passes the same moves its context menu uses. The handle's description adds `badges.reorderKeysHint`, it draws the token focus ring, and in a list sorted by another column it reports itself unavailable with the existing "switch back to WBS sort" hint. The list's column headers sort from a focusable button and keep focus while sorting. `SchedulingLabels` gains the `badges.reorder` and `badges.reorderKeysHint` keys; overrides passed to `SchedulingProvider` need no change.
- **Forms.** The canvas layout draws its field cards again: they were wrapped in an element the grid could not place, so a section switched to Canvas showed an empty grid. The cards, their hover toolbar, the empty-canvas message, the element previews and the formula builder sit on `surface` instead of literal white, so their text stays readable in the dark theme, and both sample markers in the annotated-photo preview match the live renderer.
