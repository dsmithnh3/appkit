import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import ts from 'typescript'

// `fg-subtle` is under 4.5:1 on every ground in the light theme (2.56:1 on
// `bg`), so the tokens reserve it for placeholders, disabled items and
// decorative icons. Readable text uses `fg-muted`. This finds every
// `text-fg-subtle` class and accepts it only when one of those three uses can
// be read off the source; anything else must be fixed or carry a reviewed entry
// in `fg-subtle-allowlist.json`.

const TOKEN = /(?:^|\s)((?:[\w[\]=&-]+:)*)text-fg-subtle(?:\/\d+)?(?=\s|$)/g
const ICON_TAGS = new Set(['svg', 'NavIcon'])
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

function iconNames(sourceFile) {
  const names = new Set(ICON_TAGS)
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    if (!ts.isStringLiteral(statement.moduleSpecifier) || statement.moduleSpecifier.text !== 'lucide-react') continue
    const bindings = statement.importClause?.namedBindings
    if (bindings && ts.isNamedImports(bindings)) for (const element of bindings.elements) names.add(element.name.text)
  }
  return names
}

function tagName(element) {
  return element.tagName.getText()
}

/** Why a `text-fg-subtle` in this literal is a sanctioned use, or null. */
function sanctionedBy(literal, prefix, icons) {
  if (/placeholder:/.test(prefix)) return 'placeholder'
  if (/disabled/.test(prefix)) return 'disabled'
  const text = literal.text
  if (/\bcursor-not-allowed\b/.test(text)) return 'disabled'
  for (let child = literal, node = literal.parent; node; child = node, node = node.parent) {
    // `disabled ? 'text-fg-subtle' : …`, `isPlaceholder && 'text-fg-subtle'`
    const condition = ts.isConditionalExpression(node) && node.whenTrue === child ? node.condition
      : ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && node.right === child ? node.left
        : null
    const state = condition ? /disabled|placeholder/i.exec(condition.getText())?.[0].toLowerCase() : undefined
    if (state) return state
    if (ts.isJsxAttribute(node)) {
      const owner = node.parent.parent
      if ((ts.isJsxOpeningElement(owner) || ts.isJsxSelfClosingElement(owner)) && /className$/.test(node.name.getText())) {
        const tag = tagName(owner)
        if (icons.has(tag) || /Icon$/.test(tag)) return 'icon'
      }
      return null
    }
    if (ts.isStatement(node)) return null
  }
  return null
}

/** The class's surroundings an allowlist entry is matched against: its JSX attribute, property or variable. */
function contextOf(literal) {
  for (let node = literal.parent; node; node = node.parent) {
    if (ts.isJsxAttribute(node) || ts.isPropertyAssignment(node) || ts.isVariableDeclaration(node)) return node.getText().replace(/\s+/g, ' ')
    if (ts.isStatement(node)) break
  }
  return literal.getText().replace(/\s+/g, ' ')
}

/**
 * Every `text-fg-subtle` under `roots` that is neither a placeholder, a
 * disabled state nor an icon class, minus the allowlisted ones; plus every
 * allowlist entry that no longer matches anything.
 */
export function findFgSubtleViolations({ root, roots, allowlist }) {
  const violations = []
  const used = new Set()
  for (const path of roots.flatMap(sourceFiles)) {
    const source = readFileSync(path, 'utf8')
    if (!source.includes('text-fg-subtle')) continue
    const file = relative(root, path)
    const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const icons = iconNames(sourceFile)
    const visit = (node) => {
      if (ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
        for (const match of node.text.matchAll(TOKEN)) {
          if (sanctionedBy(node, match[1], icons)) continue
          const context = contextOf(node)
          const index = allowlist.findIndex((entry) => entry.file === file && context.includes(entry.match))
          if (index !== -1) {
            used.add(index)
            continue
          }
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
          violations.push(`${file}:${line + 1} uses text-fg-subtle on readable text ("${node.text.trim().slice(0, 80)}"); use text-fg-muted, or allowlist it with a reason`)
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
  }
  allowlist.forEach((entry, index) => {
    // A bare token would excuse every future use in the file, so an entry names its surroundings.
    if (!entry.match.includes('text-fg-subtle') || entry.match.length < 32 || !entry.reason) {
      violations.push(`fg-subtle allowlist entry must quote at least 32 characters around text-fg-subtle and give a reason: ${entry.file} "${entry.match}"`)
    } else if (!used.has(index)) violations.push(`fg-subtle allowlist entry matches nothing: ${entry.file} "${entry.match}"`)
  })
  return violations
}
