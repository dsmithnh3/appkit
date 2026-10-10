import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

// Tailwind generates nothing for a colour utility whose name is not a theme
// colour, so `bg-surface-muted` renders no fill and nothing reports it. This
// reads the colours `tokens.css` defines and rejects any colour utility that
// names one of their families (`surface-…`, `fg-…`, `accent-…`) without naming
// a real one, or that borrows another design system's vocabulary (`bg-muted`).

const PREFIX = String.raw`(?:bg|text|border(?:-[xytrbl])?|ring-offset|ring|outline|divide|fill|stroke|from|via|to|shadow|decoration|caret|accent|placeholder)`
const UTILITY = new RegExp(String.raw`(?<![\w-])(?:[\w[\]=&-]+:)*(${PREFIX})-([a-z][a-z0-9-]*)(?:\/(?:\d+|\[[^\]]+\]))?(?![\w-])`, 'g')
// Colour names from design systems this kit does not use; none is a token here.
const FOREIGN = new Set([
  'muted', 'muted-foreground', 'foreground', 'background', 'card', 'card-foreground', 'popover',
  'popover-foreground', 'secondary', 'secondary-foreground', 'destructive', 'destructive-foreground',
])
const sourceExtensions = new Set(['.ts', '.tsx', '.css'])

/** The colour names `@theme` defines in tokens.css, from its `--color-*` properties. */
export function definedColours(tokensCss) {
  return new Set([...tokensCss.matchAll(/--color-([a-z0-9-]+)\s*:/g)].map((match) => match[1]))
}

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (['dist', 'node_modules', '.next', '.turbo'].includes(entry.name)) return []
      return sourceFiles(path)
    }
    if (!sourceExtensions.has(extname(entry.name))) return []
    if (/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(entry.name) || entry.name.endsWith('.d.ts')) return []
    return [path]
  })
}

/** Every colour utility under `roots` that names a colour `defined` does not have. */
export function findUndefinedColourTokens({ root, roots, defined }) {
  const families = new Set([...defined].map((name) => name.split('-')[0]))
  const violations = []
  for (const path of roots.flatMap(sourceFiles)) {
    const file = relative(root, path)
    readFileSync(path, 'utf8').split('\n').forEach((line, index) => {
      for (const match of line.matchAll(UTILITY)) {
        const name = match[2]
        if (defined.has(name)) continue
        if (!families.has(name.split('-')[0]) && !FOREIGN.has(name)) continue
        violations.push(`${file}:${index + 1} uses ${match[0]}, but "${name}" is not a colour token, so it renders nothing; use one tokens.css defines`)
      }
    })
  }
  return violations
}
