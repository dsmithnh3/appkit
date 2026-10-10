import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { RecordList, type RecordColumn } from './record-list'

type Row = { id: string; name: string }

const columns: RecordColumn<Row>[] = [{ key: 'name', label: 'Name' }]
const rows: Row[] = [{ id: 'row-1', name: 'Embedded record' }]

test('RecordList supports full-height embedded table layouts', () => {
  const markup = renderToStaticMarkup(
    React.createElement(RecordList<Row>, {
      columns,
      rows,
      getRowId: (row) => row.id,
      className: 'flex h-full min-h-0 flex-col',
      tableContainerClassName: 'min-h-0 flex-1 rounded-none border-0 shadow-none',
      tableClassName: 'table-fixed',
    }),
  )

  assert.match(markup, /flex h-full min-h-0 flex-col/)
  assert.match(markup, /min-h-0 flex-1 rounded-none border-0 shadow-none/)
  assert.match(markup, /table-fixed/)
  assert.match(markup, /Embedded record/)
})

test('RecordList announces sortable columns with aria-sort', () => {
  const markup = renderToStaticMarkup(
    React.createElement(RecordList<{ id: string; name: string; total: number }>, {
      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'total', label: 'Total', kind: 'amount', sortable: true },
        { key: 'id', label: 'Id' },
      ],
      rows: [{ id: 'r1', name: 'Record', total: 5 }],
      getRowId: (row) => row.id,
      sort: { key: 'total', dir: 'desc' },
      onSortChange: () => {},
    }),
  )
  const heads = [...markup.matchAll(/<th\b[^>]*>/g)].map((match) => match[0])
  assert.equal(heads.length, 3)
  assert.match(heads[0]!, /aria-sort="none"/, 'a sortable but unsorted column says none')
  assert.match(heads[1]!, /aria-sort="descending"/)
  assert.doesNotMatch(heads[2]!, /aria-sort/, 'a column that cannot sort carries no aria-sort')
})
