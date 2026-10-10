---
"@braedonsaunders/appkit-scheduling": patch
"@braedonsaunders/appkit-forms": patch
"@braedonsaunders/appkit-ai": patch
"@braedonsaunders/appkit-design-studio": patch
"@braedonsaunders/appkit-remote-sessions": patch
---

Every colour names a real token, and every scheduling control is reachable and visible from the keyboard.

- **Colours that rendered nothing.** Utilities naming colours the tokens do not define (`surface-muted`, `surface-subtle`, `surface-raised`, `fg-muted-subtle`, `accent`, `accent-subtle`) drew no fill or fell back to the inherited colour. They now use defined tokens: recessed panels, chips and table headers `bg-subtle`, their hovers `surface-hover`, the assistant's request card `elevated`, the design studio's labels `fg-muted`, the forms runtime's accent, purple and indigo section tones `accent-violet` / `accent-indigo` on a 10% tint, and the remote terminal's magenta `accent-violet` (it was printing in the default text colour). The design studio's checkbox accent is `accent-primary` instead of a raw teal shade.
- **Scheduling focus.** Every raw button in the workspace, toolbar menus, management dialog and task editor draws the token focus ring. Phase headers in the Gantt and list are buttons with `aria-expanded`, and task names in the Gantt, list and board are buttons that open the task, so collapsing a phase and opening a task work from the keyboard.
