import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { findFgSubtleViolations } from './fg-subtle-usage.mjs'

function check(source, allowlist = []) {
  const root = mkdtempSync(join(tmpdir(), 'fg-subtle-'))
  try {
    mkdirSync(join(root, 'src'))
    writeFileSync(join(root, 'src', 'view.tsx'), source)
    return findFgSubtleViolations({ root, roots: [join(root, 'src')], allowlist })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('readable text in fg-subtle is reported with its line', () => {
  const violations = check(`export const Hint = () => (\n  <p className="text-xs text-fg-subtle">Saved in this browser.</p>\n)\n`)
  assert.equal(violations.length, 1)
  assert.match(violations[0], /^src\/view\.tsx:2 uses text-fg-subtle on readable text/)
})

test('placeholders, disabled states and icons are accepted', () => {
  const violations = check(`import { ChevronDown } from 'lucide-react'
export const Field = ({ disabled, isPlaceholder }: { disabled: boolean; isPlaceholder: boolean }) => (
  <div>
    <input className="placeholder:text-fg-subtle" />
    <span className={disabled ? 'text-fg-subtle' : 'text-fg'}>a</span>
    <span className={isPlaceholder ? 'text-fg-subtle' : 'text-fg'}>b</span>
    <span className={cn('x', disabled && 'text-fg-subtle')}>c</span>
    <button className="cursor-not-allowed text-fg-subtle" disabled>d</button>
    <ChevronDown className="size-4 text-fg-subtle" />
    <NavIcon className="text-fg-subtle" />
    <svg className="text-fg-subtle" />
    <StatusIcon className="text-fg-subtle" />
  </div>
)
`)
  assert.deepEqual(violations, [])
})

test('a component that is not a known icon is not assumed to be one', () => {
  const violations = check(`export const Row = () => <Label className="text-fg-subtle">Owner</Label>\n`)
  assert.equal(violations.length, 1)
})

test('an allowlist entry excuses only the use it quotes, and must still match something', () => {
  const source = `export const Slot = ({ icon, active }: { icon: React.ReactNode; active: boolean }) => (
  <span className={cn('shrink-0', active ? 'text-primary' : 'text-fg-subtle')}>{icon}</span>
)
export const Count = () => <span className="text-xs text-fg-subtle">3</span>
`
  const slot = { file: 'src/view.tsx', match: "className={cn('shrink-0', active ? 'text-primary' : 'text-fg-subtle')}", reason: 'decorative icon slot' }
  const violations = check(source, [slot])
  assert.equal(violations.length, 1, 'the count is still reported')
  assert.match(violations[0], /src\/view\.tsx:4/)

  const stale = { file: 'src/view.tsx', match: "className={cn('gone', active ? 'text-primary' : 'text-fg-subtle')}", reason: 'old' }
  assert.ok(check(source, [slot, stale]).some((violation) => /matches nothing/.test(violation)), 'a stale entry fails')
})

test('an allowlist entry that quotes only the token is refused', () => {
  const source = `export const Slot = () => <span className="text-fg-subtle">{null}</span>\n`
  const violations = check(source, [{ file: 'src/view.tsx', match: 'text-fg-subtle', reason: 'too broad' }])
  assert.ok(violations.some((violation) => /must quote at least 32 characters/.test(violation)))
})
