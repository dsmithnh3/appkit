import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

// A control that is `opacity-0` until the mouse hovers its group is invisible
// when a keyboard user tabs onto it. Anything revealed with
// `group-hover:opacity-100` must also be revealed on focus
// (`focus-visible:opacity-100`, or `focus-within:opacity-100` on a container of
// controls). A decorative element that cannot take focus says so with
// `pointer-events-none`.

const HIDDEN = /(?<![\w-:])opacity-0(?![\w-])/
const HOVER_REVEAL = /group-hover(?:\/[\w-]+)?:opacity-100/
const FOCUS_REVEAL = /(?:group-)?focus(?:-visible|-within)?(?:\/[\w-]+)?:opacity-100/
const sourceExtensions = new Set(['.ts', '.tsx'])

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

/**
 * Every class string under `roots` that hides something until hover without
 * also showing it on focus. The element is read from its `className=` (or `cn(`)
 * to the next tag or `className=`, so a decorative sibling on the same line
 * cannot excuse it.
 */
export function findHoverOnlyReveals({ root, roots }) {
  const violations = []
  for (const path of roots.flatMap(sourceFiles)) {
    const file = relative(root, path)
    const source = readFileSync(path, 'utf8')
    if (!/opacity-0/.test(source)) continue
    for (const literal of source.matchAll(/(["'`])((?:(?!\1)[^\\\n])*)\1/g)) {
      if (!HIDDEN.test(literal[2]) || !HOVER_REVEAL.test(literal[2])) continue
      const start = Math.max(source.lastIndexOf('className=', literal.index), source.lastIndexOf('cn(', literal.index))
      const after = literal.index + literal[0].length
      const stop = [source.indexOf('<', after), source.indexOf('className=', after)].filter((i) => i !== -1)
      const element = source.slice(Math.max(start, 0), stop.length ? Math.min(...stop) : source.length)
      if (FOCUS_REVEAL.test(element) || /pointer-events-none/.test(element)) continue
      const line = source.slice(0, literal.index).split('\n').length
      violations.push(`${file}:${line} is hidden until hover, so a keyboard user cannot see it; add focus-visible:opacity-100 (focus-within:opacity-100 on a container), or pointer-events-none if it is decorative`)
    }
  }
  return violations
}
