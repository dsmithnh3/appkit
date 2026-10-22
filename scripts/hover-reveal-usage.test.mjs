import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { findHoverOnlyReveals } from './hover-reveal-usage.mjs'

function check(source) {
  const root = mkdtempSync(join(tmpdir(), 'hover-reveal-'))
  try {
    mkdirSync(join(root, 'src'))
    writeFileSync(join(root, 'src', 'view.tsx'), source)
    return findHoverOnlyReveals({ root, roots: [join(root, 'src')] })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('a control shown only on hover is reported with its line', () => {
  const violations = check(`export const Row = () => (\n  <button className="opacity-0 transition group-hover:opacity-100">x</button>\n)\n`)
  assert.equal(violations.length, 1)
  assert.match(violations[0], /^src\/view\.tsx:2 is hidden until hover/)
})

test('named groups and variants are caught too', () => {
  assert.equal(check('<button className="opacity-0 group-hover/cell:opacity-100 hover:bg-x" />\n').length, 1)
  assert.equal(check('<div className="md:opacity-0 group-hover:opacity-100" />\n').length, 0, 'md:opacity-0 is not the base state')
})

test('a decorative sibling on the same line does not excuse the control', () => {
  const source = '<div><i className="pointer-events-none absolute" /><button className="opacity-0 group-hover:opacity-100" /></div>\n'
  assert.equal(check(source).length, 1)
})

test('a focus reveal, or a decorative element, passes', () => {
  const source = [
    '<button className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100" />',
    '<div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100" />',
    '<div className="opacity-0 group-hover/cell:opacity-100 group-focus-within/cell:opacity-100" />',
    '<span className="pointer-events-none opacity-0 group-hover:opacity-100" />',
    '<span className="opacity-0">never shown</span>',
    "<div className={cn('pointer-events-none absolute',\n 'opacity-0 group-hover:opacity-100')} />",
  ].join('\n')
  assert.deepEqual(check(source), [])
})

test('the guard is registered with the other source guards', () => {
  const root = new URL('..', import.meta.url).pathname
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  assert.ok(manifest.scripts['test:colour-tokens'].includes('hover-reveal-usage.test.mjs'))
  assert.match(readFileSync(join(root, 'scripts', 'check-production-quality.mjs'), 'utf8'), /findHoverOnlyReveals\(/)
})
