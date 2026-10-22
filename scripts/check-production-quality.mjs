import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { findFgSubtleViolations } from './fg-subtle-usage.mjs'
import { findWhiteBlackViolations } from './white-black-usage.mjs'
import { definedColours, findUndefinedColourTokens } from './colour-token-usage.mjs'
import { findHoverOnlyReveals } from './hover-reveal-usage.mjs'

const root = resolve(import.meta.dirname, '..')
const roots = [
  join(root, 'packages'),
  join(root, 'apps', 'playground', 'app'),
  join(root, 'apps', 'playground', 'components'),
  join(root, 'apps', 'playground', 'lib'),
]
const sourceExtensions = new Set(['.ts', '.tsx', '.mjs', '.css'])
const rawTailwindPalette = /\b(?:bg|text|border|ring|ring-offset|outline|divide|fill|stroke|from|via|to|shadow|decoration|caret|accent|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]/g
const errors = []

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (['dist', 'node_modules', '.next', '.turbo'].includes(entry.name)) return []
      return files(path)
    }
    return sourceExtensions.has(extname(entry.name)) ? [path] : []
  })
}

function lineFor(source, index) {
  return source.slice(0, index).split('\n').length
}

function report(path, source, match, message) {
  errors.push(`${relative(root, path)}:${lineFor(source, match.index)} ${message}`)
}

for (const path of roots.flatMap(files)) {
  const source = readFileSync(path, 'utf8')
  const isTest = /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path)

  for (const match of source.matchAll(/(?:@ts-ignore|@ts-nocheck|eslint-disable|\bTODO\b|\bFIXME\b|\bHACK\b|\bXXX\b)/g)) {
    report(path, source, match, 'contains a forbidden suppression or unfinished-work marker')
  }
  if (!isTest && !path.includes('/email-render/')) {
    for (const match of source.matchAll(rawTailwindPalette)) {
      report(path, source, match, `uses raw palette utility ${match[0]} instead of a semantic token`)
    }
  }
  if (!isTest) {
    for (const match of source.matchAll(/on(?:Change|Click|Submit)\s*=\s*\{\s*\(.*?\)\s*=>\s*\{\s*\}\s*\}/gs)) {
      report(path, source, match, 'contains an interactive handler that intentionally does nothing')
    }
    for (const match of source.matchAll(/async\s+(?:pull|deliver)\s*\([^)]*\)\s*\{\s*return\s+(?:\[\]|\{\s*ok:\s*true\s*\})\s*;?\s*\}/gs)) {
      report(path, source, match, 'contains a fake-success connector or destination')
    }
    for (const match of source.matchAll(/async\s+[A-Za-z_$][\w$]*\s*\([^)]*\)\s*\{\s*\}/gs)) {
      report(path, source, match, 'contains an empty async implementation')
    }
    for (const match of source.matchAll(/\.catch\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)/g)) {
      report(path, source, match, 'silently discards a rejected promise')
    }
  }
}

const fgSubtleAllowlist = JSON.parse(readFileSync(join(import.meta.dirname, 'fg-subtle-allowlist.json'), 'utf8'))
errors.push(...findFgSubtleViolations({ root, roots, allowlist: fgSubtleAllowlist.entries }))
const whiteBlackAllowlist = JSON.parse(readFileSync(join(import.meta.dirname, 'white-black-allowlist.json'), 'utf8'))
errors.push(
  ...findWhiteBlackViolations({
    root,
    roots,
    allowlist: whiteBlackAllowlist.entries,
    // Email markup is rendered by mail clients, not themed; the palette check skips it too.
    skip: (file) => file.includes('/email-render/'),
  }),
)

const tokensCss = readFileSync(join(root, 'packages', 'tokens', 'src', 'tokens.css'), 'utf8')
errors.push(...findUndefinedColourTokens({ root, roots, defined: definedColours(tokensCss) }))
errors.push(...findHoverOnlyReveals({ root, roots }))

if (errors.length) {
  console.error(`Production-quality check failed:\n${errors.map((error) => `- ${error}`).join('\n')}`)
  process.exit(1)
}

console.log('Production source contains no suppressions, unfinished markers, raw UI palettes, white/black or undefined colour utilities, hover-only controls, fg-subtle on readable text, empty handlers, fake-success adapters, or silently discarded promises.')
