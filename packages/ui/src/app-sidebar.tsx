'use client'

import * as React from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { SidebarNav, type SidebarNavGroup } from './sidebar-nav'
import type { LinkRender } from './settings-layout'
import { SIDEBAR_COLLAPSED_COOKIE, readSidebarCollapsed } from './sidebar-state'
import { cn } from './utils'

/**
 * The desktop nav rail: brand + collapse toggle, the grouped nav, and a footer
 * slot (theme toggle, version, etc.). Hidden below `lg` — pair with AppShell's
 * built-in mobile nav.
 *
 * The collapse toggle persists to the `SIDEBAR_COLLAPSED_COOKIE` cookie. Pass
 * `defaultCollapsed={readSidebarCollapsed(cookieHeaderOrStore)}` from the
 * server to render the remembered width on first paint; when it is omitted the
 * rail restores the remembered state from the cookie after mount.
 */
export function AppSidebar({
  groups,
  pathname,
  brand,
  footer,
  collapsedFooter,
  defaultCollapsed,
  collapsible = true,
  linkRender,
  expandLabel = 'Expand sidebar',
  collapseLabel = 'Collapse sidebar',
}: {
  groups: SidebarNavGroup[]
  pathname: string
  brand?: React.ReactNode
  footer?: React.ReactNode
  collapsedFooter?: React.ReactNode
  /** Initial collapsed state. Omit to restore the person's last choice from the cookie after mount. */
  defaultCollapsed?: boolean
  collapsible?: boolean
  linkRender?: LinkRender
  expandLabel?: string
  collapseLabel?: string
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed ?? false)
  React.useEffect(() => {
    if (defaultCollapsed !== undefined || !collapsible) return
    if (readSidebarCollapsed(document.cookie)) setCollapsed(true)
  }, [defaultCollapsed, collapsible])
  const toggle = React.useCallback(() => {
    setCollapsed((c) => {
      const next = !c
      try {
        document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${next ? '1' : '0'};path=/;max-age=31536000;samesite=lax`
      } catch {
        // Cookie persistence can be unavailable; local interaction still works.
      }
      return next
    })
  }, [])

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ease-out lg:flex',
        collapsed ? 'w-[4.25rem]' : 'w-60',
      )}
    >
      <div className={cn('flex h-14 items-center border-b border-border px-3', collapsed ? 'justify-center' : 'gap-2')}>
        {collapsed ? null : <div className="min-w-0 flex-1 truncate">{brand}</div>}
        {collapsible ? (
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? expandLabel : collapseLabel}
            title={collapsed ? expandLabel : collapseLabel}
            className={cn(
              'grid size-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
              collapsed ? '' : 'ml-auto',
            )}
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        ) : null}
      </div>

      <SidebarNav groups={groups} pathname={pathname} collapsed={collapsed} linkRender={linkRender} />

      {footer || collapsedFooter ? (
        <div className="border-t border-border p-3">{collapsed ? collapsedFooter : footer}</div>
      ) : null}
    </aside>
  )
}
