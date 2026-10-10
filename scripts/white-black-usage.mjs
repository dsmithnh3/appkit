import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

// `white` and `black` are not theme tokens: they stay put when the theme flips,
// so `bg-white` under `text-fg` becomes light text on a white card in dark mode.
// The raw-palette check matches numbered shades only (`slate-500`), so these two
// need their own. A deliberate use (illustration art, a switch knob, paper) is
// recorded in `white-black-allowlist.json` with its reason.

const UTILITY =
  /(?<![\w-])(?:[\w[\]=&-]+:)*(?:bg|text|border(?:-[xytrbl])?|ring|ring-offset|outline|divide|fill|stroke|from|via|to|shadow|decoration|caret|accent)-(?:white|black)(?:\/\d+)?(?![\w-])/g
const sourceExtensions = new Set(['.ts', '.tsx', '.css'])

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
 * Every `white` / `black` colour utility under `roots` that no allowlist entry
 * excuses, plus every entry that is malformed or no longer matches anything.
 * An entry with `match` excuses the lines that contain it; an entry without one
 * excuses its whole file.
 */
export function findWhiteBlackViolations({ root, roots, allowlist, skip = () => false }) {
  const violations = []
  const used = new Set()
  for (const path of roots.flatMap(sourceFiles)) {
    const file = relative(root, path)
    if (skip(file)) continue
    const source = readFileSync(path, 'utf8')
    if (!/white|black/.test(source)) continue
    source.split('\n').forEach((line, index) => {
      for (const match of line.matchAll(UTILITY)) {
        const text = line.replace(/\s+/g, ' ')
        const entry = allowlist.findIndex((e) => e.file === file && (e.match === undefined || text.includes(e.match)))
        if (entry !== -1) {
          used.add(entry)
          continue
        }
        violations.push(`${file}:${index + 1} uses ${match[0]}, which ignores the theme; use a semantic token (bg-surface, text-fg, …), or allowlist it with a reason`)
      }
    })
  }
  allowlist.forEach((entry, index) => {
    if (!entry.reason || (entry.match !== undefined && (!/-(?:white|black)\b/.test(entry.match) || entry.match.length < 32))) {
      violations.push(`white/black allowlist entry must give a reason, and a match must quote at least 32 characters around the utility: ${entry.file} "${entry.match ?? '(whole file)'}"`)
    } else if (!used.has(index)) violations.push(`white/black allowlist entry matches nothing: ${entry.file} "${entry.match ?? '(whole file)'}"`)
  })
  return violations
}
