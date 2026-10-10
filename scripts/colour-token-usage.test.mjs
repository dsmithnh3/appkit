import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { definedColours, findUndefinedColourTokens } from './colour-token-usage.mjs'

const defined = new Set(['bg', 'bg-subtle', 'surface', 'surface-hover', 'fg', 'fg-muted', 'accent-violet', 'ring'])

function check(source) {
  const root = mkdtempSync(join(tmpdir(), 'colour-tokens-'))
  try {
    mkdirSync(join(root, 'src'))
    writeFileSync(join(root, 'src', 'view.tsx'), source)
    return findUndefinedColourTokens({ root, roots: [join(root, 'src')], defined })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('reads the colours tokens.css defines', () => {
  const colours = definedColours(readFileSync(new URL('../packages/tokens/src/tokens.css', import.meta.url), 'utf8'))
  for (const name of ['surface', 'surface-hover', 'fg-muted', 'bg-subtle', 'accent-violet', 'ring']) assert.ok(colours.has(name), name)
  assert.ok(!colours.has('surface-muted'))
})

test('a colour that names a token family without naming a token is reported with its line', () => {
  const violations = check(`export const Chip = () => (\n  <span className="rounded bg-surface-muted px-2 text-fg-muted">x</span>\n)\n`)
  assert.equal(violations.length, 1)
  assert.match(violations[0], /^src\/view\.tsx:2 uses bg-surface-muted, but "surface-muted" is not a colour token/)
})

test('variants, opacity and every colour prefix are caught; so is borrowed vocabulary', () => {
  const source = [
    '<a className="hover:bg-surface-subtle" />',
    '<a className="text-fg-muted-subtle/60" />',
    "<a className={swatch('text-accent')} />",
    '<a className="ring-ring-strong focus:outline-surface-raised" />',
    '<a className="bg-muted text-muted-foreground" />',
  ].join('\n')
  assert.equal(check(source).length, 7)
})

test('defined tokens, opacity on them and non-colour utilities pass', () => {
  const source = '<a className="bg-surface-hover/80 text-fg-muted text-sm border-t-2 ring-2 ring-ring ring-offset-2 shadow-sm text-accent-violet/[0.06] bg-bg-subtle" />\n'
  assert.deepEqual(check(source), [])
})

test('ordinary words that share a prefix are not utilities', () => {
  assert.deepEqual(check("import { useUiText } from './text-context'\n// opens the shared text-input modal\n"), [])
})
