import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { palette } from './index'

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8')

function block(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{`, 'm').exec(css)
  assert.ok(match, `missing ${selector}`)
  const open = css.indexOf('{', match.index)
  let depth = 0
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1
    if (css[index] === '}') depth -= 1
    if (depth === 0) return css.slice(open + 1, index)
  }
  throw new Error(`unclosed ${selector}`)
}

function channels(source: string): Record<string, string> {
  return Object.fromEntries([...source.matchAll(/--ch-([\w-]+):\s*([0-9]+\s+[0-9]+\s+[0-9]+)/g)].map((match) => [match[1], match[2]]))
}

test('JavaScript and CSS semantic palettes cannot drift', () => {
  const lightCss = channels(block(':root'))
  const darkCss = channels(block('.dark'))
  for (const [token, values] of Object.entries(palette.light)) assert.equal(lightCss[token], values.join(' '), `light ${token}`)
  for (const [token, values] of Object.entries(palette.dark)) assert.equal(darkCss[token], values.join(' '), `dark ${token}`)
})

test('system dark defaults stay identical to the explicit dark theme', () => {
  assert.deepEqual(channels(block(':root:not(.light):not(.dark)')), channels(block('.dark')))
})

function luminance([r, g, b]: readonly number[]): number {
  const linear = (channel: number) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linear(r!) + 0.7152 * linear(g!) + 0.0722 * linear(b!)
}

function contrast(a: readonly number[], b: readonly number[]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

type Pair = readonly [foreground: keyof typeof palette.light, background: keyof typeof palette.light]

const GROUNDS = ['bg', 'bg-subtle', 'surface', 'elevated'] as const

// WCAG 2.x AA: 4.5:1 for body-size text, 3:1 for focus indicators and other
// meaningful non-text marks. fg-subtle is deliberately absent: it is reserved
// for placeholders and decorative icons, never readable text.
const TEXT_PAIRS: Pair[] = [
  ...GROUNDS.flatMap((ground): Pair[] => [
    ['fg', ground],
    ['fg-muted', ground],
  ]),
  ['primary-fg', 'primary'],
  ['danger-fg', 'danger'],
  ['warning-fg', 'warning'],
  ['success-fg', 'success'],
  ['info-fg', 'info'],
  ['danger', 'danger-subtle'],
  ['warning', 'warning-subtle'],
  ['success', 'success-subtle'],
  ['info', 'info-subtle'],
]
const FOCUS_PAIRS: Pair[] = GROUNDS.map((ground): Pair => ['ring', ground])

test('text tokens meet WCAG AA on the grounds they are drawn on, in both themes', () => {
  for (const mode of ['light', 'dark'] as const) {
    for (const [fg, bg] of TEXT_PAIRS) {
      const ratio = contrast(palette[mode][fg], palette[mode][bg])
      assert.ok(ratio >= 4.5, `${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, under 4.5:1`)
    }
  }
})

test('the focus ring reaches 3:1 against every ground, in both themes', () => {
  for (const mode of ['light', 'dark'] as const) {
    for (const [ring, ground] of FOCUS_PAIRS) {
      const ratio = contrast(palette[mode][ring], palette[mode][ground])
      assert.ok(ratio >= 3, `${mode}: ${ring} on ${ground} is ${ratio.toFixed(2)}:1, under 3:1`)
    }
  }
})
