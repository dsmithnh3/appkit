/** Cookie that `AppSidebar` writes whenever a person collapses or expands it. */
export const SIDEBAR_COLLAPSED_COOKIE = 'appkit_sidebar_collapsed'

/** A cookie store with Next's `cookies()` shape: `get(name)?.value`. */
export type SidebarCookieStore = { get(name: string): { value: string } | undefined }

/**
 * Read the sidebar's persisted collapsed state for `defaultCollapsed`.
 *
 * Pass a `Cookie` request header, `document.cookie`, or a cookie store such as
 * Next's `await cookies()`. Server-render with the result so the rail paints
 * at the width the person last chose, with no shift after hydration.
 */
export function readSidebarCollapsed(source: string | SidebarCookieStore | null | undefined): boolean {
  if (!source) return false
  if (typeof source !== 'string') return source.get(SIDEBAR_COLLAPSED_COOKIE)?.value === '1'
  for (const part of source.split(';')) {
    const [name, ...value] = part.trim().split('=')
    if (name === SIDEBAR_COLLAPSED_COOKIE) return value.join('=') === '1'
  }
  return false
}
