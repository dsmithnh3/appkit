/** Elements a keyboard user can reach with Tab inside an overlay panel. */
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Keep Tab and Shift+Tab cycling inside an overlay panel. Call it from the
 * overlay's document `keydown` listener; it ignores every key but Tab. Focus
 * that has escaped the panel is pulled back in, and a panel with nothing
 * focusable keeps focus on itself, so give the panel `tabIndex={-1}`.
 */
export function trapTabKey(event: KeyboardEvent, panel: HTMLElement): void {
  if (event.key !== 'Tab') return
  const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  )
  if (items.length === 0) {
    event.preventDefault()
    panel.focus()
    return
  }
  const first = items[0]!
  const last = items[items.length - 1]!
  const active = document.activeElement
  const outside = !panel.contains(active)
  if (event.shiftKey) {
    if (outside || active === first || active === panel) {
      event.preventDefault()
      last.focus()
    }
  } else if (outside || active === last) {
    event.preventDefault()
    first.focus()
  }
}
