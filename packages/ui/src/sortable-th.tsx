'use client'

import * as React from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { TableHead } from './table'
import { mergeHref, type ListSearchParams } from './list-params'
import { useListNavClick } from './list-nav'
import { cn } from './utils'

type SortLinkProps = {
  basePath: string
  currentParams: ListSearchParams
  column: string
  active: boolean
  dir: 'asc' | 'desc'
  align?: 'left' | 'right'
  sortParamKey?: string
  dirParamKey?: string
  pageParamKey?: string
  children: React.ReactNode
}

/**
 * The clickable header label: column name + sort caret, linking to the toggled
 * sort URL. Clicking an inactive column sorts ascending; clicking the active
 * column flips direction. Page resets to 1.
 */
function SortLink({
  basePath,
  currentParams,
  column,
  active,
  dir,
  align = 'left',
  sortParamKey = 'sort',
  dirParamKey = 'dir',
  pageParamKey = 'page',
  children,
}: SortLinkProps) {
  const nextDir: 'asc' | 'desc' = active && dir === 'asc' ? 'desc' : 'asc'
  const href = mergeHref(basePath, currentParams, {
    [sortParamKey]: column,
    [dirParamKey]: nextDir,
    [pageParamKey]: 1,
  })
  const navClick = useListNavClick(href)
  return (
    <a
      href={href}
      onClick={navClick}
      className={cn('inline-flex items-center gap-1.5 rounded-sm hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg', align === 'right' && 'flex-row-reverse')}
    >
      {children}
      {active ? (
        dir === 'asc' ? (
          <ArrowUp size={12} className="text-fg" />
        ) : (
          <ArrowDown size={12} className="text-fg" />
        )
      ) : (
        <ArrowUpDown size={12} className="text-fg-subtle/60" />
      )}
    </a>
  )
}

/** Native header-cell attributes a sortable header passes through to its `<th>`. */
type SortHeaderCellProps = Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'children' | 'align' | 'aria-sort'>

/**
 * Separate the sort-link props from the `<th>` attributes, and derive the
 * cell's `aria-sort` so assistive technology hears which column sorts the
 * table and in which direction (the caret alone is visual only).
 */
function splitSortHeaderProps<P extends SortLinkProps & SortHeaderCellProps>(props: P) {
  const {
    basePath,
    currentParams,
    column,
    active,
    dir,
    align,
    sortParamKey,
    dirParamKey,
    pageParamKey,
    children,
    ...cell
  } = props
  const link: SortLinkProps = {
    basePath,
    currentParams,
    column,
    active,
    dir,
    align,
    sortParamKey,
    dirParamKey,
    pageParamKey,
    children,
  }
  const ariaSort: React.AriaAttributes['aria-sort'] = active
    ? dir === 'asc'
      ? 'ascending'
      : 'descending'
    : undefined
  return { link, cell, ariaSort }
}

export type SortableThProps = SortLinkProps & SortHeaderCellProps

/** Sortable header for tables built from the <Table> primitives. */
export function SortableTh(props: SortableThProps) {
  const { link, cell, ariaSort } = splitSortHeaderProps(props)
  return (
    <TableHead {...cell} aria-sort={ariaSort}>
      <SortLink {...link} />
    </TableHead>
  )
}

export type SortThProps = Omit<SortLinkProps, 'active'> & SortHeaderCellProps & { sort: string }

/**
 * Sortable header for raw `<table>` lists — renders a plain
 * `<th className="px-3 py-2">` and derives `active` from the current `sort`.
 */
export function SortTh({ sort, ...props }: SortThProps) {
  const { link, cell, ariaSort } = splitSortHeaderProps({ ...props, active: sort === props.column })
  return (
    <th {...cell} className={cn('px-3 py-2', cell.className)} aria-sort={ariaSort}>
      <SortLink {...link} />
    </th>
  )
}
