import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { SortableTh, SortTh } from './sortable-th'

const base = { basePath: '/invoices', currentParams: {}, column: 'total', children: 'Total' }

function header(markup: string): string {
  const match = /<th\b[^>]*>/.exec(markup)
  assert.ok(match, 'renders a <th>')
  return match[0]
}

test('SortableTh announces the sorted column and its direction with aria-sort', () => {
  const asc = header(renderToStaticMarkup(React.createElement(SortableTh, { ...base, active: true, dir: 'asc' })))
  const desc = header(renderToStaticMarkup(React.createElement(SortableTh, { ...base, active: true, dir: 'desc' })))
  const idle = header(renderToStaticMarkup(React.createElement(SortableTh, { ...base, active: false, dir: 'asc' })))
  assert.match(asc, /aria-sort="ascending"/)
  assert.match(desc, /aria-sort="descending"/)
  assert.doesNotMatch(idle, /aria-sort/, 'an unsorted column carries no aria-sort')
})

test('SortTh derives aria-sort from the current sort', () => {
  const active = header(renderToStaticMarkup(React.createElement(SortTh, { ...base, sort: 'total', dir: 'desc' })))
  const other = header(renderToStaticMarkup(React.createElement(SortTh, { ...base, sort: 'client', dir: 'desc' })))
  assert.match(active, /aria-sort="descending"/)
  assert.doesNotMatch(other, /aria-sort/)
})

test('sortable headers pass ordinary <th> attributes through to the cell', () => {
  const sortable = header(
    renderToStaticMarkup(
      React.createElement(SortableTh, { ...base, active: false, dir: 'asc', scope: 'col', id: 'total-col', className: 'w-32' }),
    ),
  )
  const raw = header(
    renderToStaticMarkup(React.createElement(SortTh, { ...base, sort: 'total', dir: 'asc', scope: 'col', className: 'w-32' })),
  )
  for (const cell of [sortable, raw]) {
    assert.match(cell, /scope="col"/)
    assert.match(cell, /w-32/)
  }
  assert.match(sortable, /id="total-col"/)
  assert.match(raw, /px-3 py-2/, 'SortTh keeps its default padding alongside a caller className')
})
