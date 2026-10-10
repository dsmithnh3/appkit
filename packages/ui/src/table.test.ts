import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Table, TableRow } from './table'

test('Table keeps its standalone card treatment by default', () => {
  const markup = renderToStaticMarkup(React.createElement(Table))

  assert.match(markup, /rounded-lg/)
  assert.match(markup, /border-border/)
  assert.match(markup, /shadow-sm/)
})

test('Table containerClassName supports embedded workspace tables', () => {
  const markup = renderToStaticMarkup(
    React.createElement(Table, {
      containerClassName: 'h-full rounded-none border-0 shadow-none',
    }),
  )

  assert.match(markup, /h-full/)
  assert.match(markup, /rounded-none/)
  assert.match(markup, /border-0/)
  assert.match(markup, /shadow-none/)
})

test('a selected TableRow is distinguishable from a hovered row and from its container in both themes', async () => {
  const { readFileSync } = await import('node:fs')
  const css = readFileSync(new URL('../../tokens/src/tokens.css', import.meta.url), 'utf8')
  const block = (selector: string) => {
    const start = css.indexOf(`${selector} {`)
    assert.ok(start >= 0, `tokens.css has a ${selector} block`)
    return css.slice(start, css.indexOf('}', start))
  }
  const channel = (scope: string, token: string) => {
    const match = new RegExp(`--ch-${token}:\\s*([0-9 ]+);`).exec(scope)
    assert.ok(match, `--ch-${token} is defined`)
    return match[1]!.trim()
  }
  const markup = renderToStaticMarkup(
    React.createElement('table', null, React.createElement('tbody', null, React.createElement(TableRow, { 'data-state': 'selected' } as never))),
  )
  const selected = /data-\[state=selected\]:bg-([a-z-]+)/.exec(markup)?.[1]
  const hover = /hover:bg-([a-z-]+)/.exec(markup)?.[1]
  assert.ok(selected && hover, 'TableRow styles both hover and selection')
  for (const [theme, scope] of [['light', block(':root')], ['dark', block('.dark')]] as const) {
    const fill = channel(scope, selected)
    assert.notEqual(fill, channel(scope, hover), `${theme}: selected must not look like hover`)
    assert.notEqual(fill, channel(scope, 'surface'), `${theme}: selected must show on a surface card`)
    assert.notEqual(fill, channel(scope, 'bg'), `${theme}: selected must show on the page canvas`)
  }
})
