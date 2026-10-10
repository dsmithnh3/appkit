import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { AccountMenu } from './account-menu'
import { AppShell } from './app-shell'
import { AppSidebar } from './app-sidebar'
import { FileUploader } from './file-uploader'
import { FilterChips } from './filter-chips'
import { LineGrid } from './line-grid'
import { ListNavProvider } from './list-nav'
import { Pagination } from './list-pagination'
import { SearchInput } from './list-search-input'
import { MobileTabBar } from './mobile-tab-bar'
import { NavigationConfigEditor } from './navigation-config-editor'
import { NotificationsBell } from './notifications-bell'
import { OrgChart } from './org-chart'
import { PagedTable } from './paged-table'
import { RecordList } from './record-list'
import { AdminHub, SettingsShell } from './settings-layout'
import { SidebarNav } from './sidebar-nav'
import { SortableTh, SortTh } from './sortable-th'
import { SubtabNav } from './subtab-nav'
import { ThemeProvider, ThemeToggle } from './theme'
import { TopNav } from './top-nav'

const groups = [
  { label: 'Work', items: [{ href: '/invoices', label: 'Invoices', iconKey: 'file-text' }] },
  {
    label: 'Library',
    items: [
      { href: '/library/rates', label: 'Rates', iconKey: 'book' },
      { href: '/library/assemblies', label: 'Assemblies', iconKey: 'layers' },
    ],
  },
]

const surfaces: Record<string, React.ReactElement> = {
  SubtabNav: React.createElement(SubtabNav, {
    ariaLabel: 'Sections',
    active: 'overview',
    tabs: [
      { key: 'overview', label: 'Overview' },
      { key: 'users', label: 'Users', count: 12 },
    ],
  }),
  ThemeToggle: React.createElement(ThemeProvider, null, React.createElement(ThemeToggle)),
  'ThemeToggle (collapsed)': React.createElement(ThemeProvider, null, React.createElement(ThemeToggle, { collapsed: true })),
  MobileTabBar: React.createElement(MobileTabBar, { groups, pathname: '/invoices', onOpenMenu: () => {} }),
  TopNav: React.createElement(TopNav, { groups, pathname: '/invoices' }),
  AppSidebar: React.createElement(AppSidebar, { groups, pathname: '/invoices' }),
  AppShell: React.createElement(AppShell, { groups, pathname: '/invoices', children: React.createElement('main') }),
  AccountMenu: React.createElement(AccountMenu, { name: 'Alex Rivera', email: 'alex@example.com' }),
  NotificationsBell: React.createElement(NotificationsBell, {
    items: [{ id: 'n1', title: 'Invoice approved', createdAt: new Date().toISOString(), read: false }],
  } as never),
  NavigationConfigEditor: React.createElement(NavigationConfigEditor, {
    registry: [
      { key: 'dashboard', label: 'Dashboard', required: true },
      { key: 'invoices', label: 'Invoices' },
    ],
    onChange: () => {},
  }),
  SettingsShell: React.createElement(SettingsShell, {
    title: 'Settings',
    nav: [{ label: 'Organization', items: [{ key: 'general', label: 'General' }, { key: 'users', label: 'Users' }] }],
    activeKey: 'general',
    onSelect: () => {},
    children: React.createElement('div'),
  }),
  AdminHub: React.createElement(AdminHub, {
    groups: [{ label: 'Platform', cards: [{ href: '/admin/users', title: 'Users' }, { title: 'Brand' }] }],
  }),
  OrgChart: React.createElement(OrgChart, {
    nodes: [
      { id: 'owner', name: 'Rae Okonjo', subtitle: 'Owner' },
      { id: 'ops', parentId: 'owner', name: 'Dana Reyes', subtitle: 'Operations' },
    ],
    onSelect: () => {},
  }),
  RecordList: React.createElement(RecordList<{ id: string; ref: string; total: number }>, {
    columns: [
      { key: 'ref', label: 'Invoice', kind: 'reference', href: (row) => `/invoices/${row.id}`, sortable: true },
      { key: 'total', label: 'Total', kind: 'amount', sortable: true },
    ],
    rows: [{ id: 'q1', ref: 'Q-1001', total: 1200 }],
    getRowId: (row) => row.id,
    sort: { key: 'total', dir: 'desc' },
    onSortChange: () => {},
  }),
  PagedTable: React.createElement(PagedTable<{ id: string; name: string; amount: number }>, {
    rows: [{ id: 'r1', name: 'Record A', amount: 3 }],
    columns: [
      { key: 'name', header: 'Name', cell: (row) => row.name, sortValue: (row) => row.name },
      { key: 'amount', header: 'Amount', cell: (row) => row.amount, sortValue: (row) => row.amount },
    ],
    empty: 'Nothing here',
    rowKey: (row) => row.id,
  }),
  Pagination: React.createElement(Pagination, { basePath: '/invoices', currentParams: {}, total: 60, page: 2, perPage: 20 }),
  SortableTh: React.createElement(SortableTh, { basePath: '/invoices', currentParams: {}, column: 'total', active: true, dir: 'asc', children: 'Total' }),
  SortTh: React.createElement(SortTh, { basePath: '/invoices', currentParams: {}, column: 'total', sort: 'name', dir: 'asc', children: 'Total' }),
  FilterChips: React.createElement(FilterChips, {
    basePath: '/invoices',
    currentParams: {},
    paramKey: 'status',
    label: 'Status',
    options: [{ value: 'open', label: 'Open' }],
  }),
  LineGrid: React.createElement(LineGrid<{ item: string }>, {
    columns: [{ key: 'item', label: 'Item', width: '1fr', type: 'text' }],
    rows: [{ item: 'Pipe' }],
    onRowsChange: () => {},
    emptyRow: () => ({ item: '' }),
  }),
  'SearchInput (with a query, so Clear shows)': React.createElement(ListNavProvider, {
    value: { pathname: '/invoices', search: 'q=pipe', replace: () => {}, push: () => {} },
    children: React.createElement(SearchInput),
  }),
  FileUploader: React.createElement(FileUploader, {
    requestUploadAction: async () => ({ ok: false, error: 'offline' }),
    finalizeUploadAction: async () => ({ ok: false, error: 'offline' }),
    onUploaded: () => {},
  } as never),
  'SidebarNav (a subgroup with its own page)': React.createElement(SidebarNav, {
    groups: [
      {
        // Subgroups render inside a workspace group (one with an id).
        id: 'work',
        label: 'Work',
        items: [
          { href: '/invoices/open', label: 'Open', subgroup: 'Invoices', subgroupHref: '/invoices' },
          { href: '/invoices/paid', label: 'Paid', subgroup: 'Invoices', subgroupHref: '/invoices' },
        ],
      },
    ],
    pathname: '/invoices/open',
  }),
}

/** Opening tags of everything a keyboard user can land on. */
function focusables(markup: string): string[] {
  // Buttons, links, and anything else put in the tab order (a drop zone with tabindex="0").
  return [...markup.matchAll(/<(?:(?:button|a)\b|[a-z]+\b(?=[^>]*\btabindex="0"))[^>]*>/g)]
    .map((match) => match[0])
    // React renders the disabled attribute as disabled="" — match that, not the `disabled:` class variant.
    .filter((tag) => !/\sdisabled=""/.test(tag) && !/tabindex="-1"/.test(tag))
}

for (const [name, element] of Object.entries(surfaces)) {
  test(`${name}: every focusable control draws a visible focus ring`, () => {
    const tags = focusables(renderToStaticMarkup(element))
    assert.ok(tags.length > 0, `${name} renders at least one focusable control`)
    for (const tag of tags) {
      assert.match(tag, /focus-visible:ring-2/, `${name}: no focus ring on ${tag.slice(0, 140)}`)
      if (/focus-visible:outline-none/.test(tag)) {
        assert.match(tag, /focus-visible:ring-ring\b/, `${name}: outline removed without a full-strength ring`)
      }
    }
  })
}

test('no focus ring in the package is drawn at partial opacity', () => {
  // A focus ring needs 3:1 against its ground; an opacity modifier on the ring
  // colour (`focus-visible:ring-ring/40`, `focus:ring-danger/30`) drops it below
  // that while every rendered class list still looks like it has a ring.
  const dir = new URL('.', import.meta.url)
  const offenders: string[] = []
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.tsx') || file.includes('.test.')) continue
    const source = readFileSync(new URL(file, dir), 'utf8')
    for (const match of source.matchAll(/\bfocus(?:-visible|-within)?:(?:[\w-]+:)*ring-[\w-]+\/\d+/g)) {
      offenders.push(`${file}: ${match[0]}`)
    }
  }
  assert.deepEqual(offenders, [])
})
