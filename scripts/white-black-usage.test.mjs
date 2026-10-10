import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { findWhiteBlackViolations } from './white-black-usage.mjs'

function check(source, allowlist = [], options = {}) {
  const root = mkdtempSync(join(tmpdir(), 'white-black-'))
  try {
    mkdirSync(join(root, 'src'))
    writeFileSync(join(root, 'src', 'view.tsx'), source)
    return findWhiteBlackViolations({ root, roots: [join(root, 'src')], allowlist, ...options })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('a white or black colour utility is reported with its line', () => {
  const violations = check(`export const Card = () => (\n  <div className="rounded border bg-white p-2 text-fg">x</div>\n)\n`)
  assert.equal(violations.length, 1)
  assert.match(violations[0], /^src\/view\.tsx:2 uses bg-white, which ignores the theme/)
})

test('variants, opacity and every colour utility family are caught', () => {
  const source = [
    '<a className="hover:bg-white/80" />',
    '<a className="dark:text-black" />',
    '<a className="ring-2 ring-white" />',
    '<a className="border-b-black/10" />',
    '<a className="from-black/40 to-white" />',
  ].join('\n')
  assert.equal(check(source).length, 6)
})

test('tokens and words that merely contain white or black are not', () => {
  const source = '<p className="whitespace-nowrap bg-surface text-fg ring-ring">blackout white</p>\n'
  assert.deepEqual(check(source), [])
})

test('an allowlist entry excuses only the line it quotes, and must still match something', () => {
  const source = `<span className="size-5 rounded-full bg-white shadow-sm transition-transform" />\n<div className="bg-white p-4" />\n`
  const knob = { file: 'src/view.tsx', match: 'size-5 rounded-full bg-white shadow-sm transition-transform', reason: 'switch knob' }
  const violations = check(source, [knob])
  assert.equal(violations.length, 1, 'the second use is still reported')
  assert.match(violations[0], /src\/view\.tsx:2/)

  const stale = { file: 'src/view.tsx', match: 'size-4 rounded-full bg-white shadow-sm transition-colors', reason: 'old knob' }
  assert.ok(check(source, [knob, stale]).some((violation) => /matches nothing/.test(violation)), 'a stale entry fails')
})

test('a whole-file entry covers its file, and fails once the file has no uses', () => {
  const art = { file: 'src/view.tsx', reason: 'illustration art' }
  assert.deepEqual(check('<i className="bg-white" />\n<i className="bg-black/40" />\n', [art]), [])
  assert.ok(check('<i className="bg-surface" />\n', [art]).some((violation) => /matches nothing/.test(violation)))
})

test('an entry without a reason, or quoting too little, is refused', () => {
  const source = '<i className="bg-white" />\n'
  assert.ok(check(source, [{ file: 'src/view.tsx', match: 'bg-white', reason: 'too broad' }]).some((v) => /at least 32 characters/.test(v)))
  assert.ok(check(source, [{ file: 'src/view.tsx' }]).some((v) => /must give a reason/.test(v)))
})

test('skipped paths are not scanned', () => {
  assert.deepEqual(check('<i className="bg-white" />\n', [], { skip: (file) => file.startsWith('src/') }), [])
})
