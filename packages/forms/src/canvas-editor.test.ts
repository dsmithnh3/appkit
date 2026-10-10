import assert from 'node:assert/strict'
import test from 'node:test'

// jsdom first: react-dom reads browser globals at render.
const { JSDOM } = await import('jsdom')

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3000/',
  pretendToBeVisual: true,
})
const globals = globalThis as Record<string, unknown>
const domWindow = dom.window as unknown as Record<string, unknown>
for (const key of [
  'window',
  'document',
  'navigator',
  'Node',
  'Element',
  'HTMLElement',
  'HTMLOptionElement',
  'HTMLOptGroupElement',
  'Event',
  'MouseEvent',
  'self',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'getComputedStyle',
]) {
  if (globals[key] === undefined) globals[key] = domWindow[key]
}
globals['IS_REACT_ACT_ENVIRONMENT'] = true
// jsdom has no media queries; SearchSelect asks whether it is on a phone.
dom.window.matchMedia = (media: string) =>
  ({
    matches: false,
    media,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }) as MediaQueryList
// jsdom does no layout, so every width reads 0 and the grid would never mount.
// Give the canvas a width, as a browser would.
Object.defineProperty(dom.window.HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  get() {
    return 960
  },
})

const React = await import('react')
// tsx compiles imported JSX in classic mode from the repo root, so React must be global.
Object.assign(globalThis, { React })
const { act } = React
const { createRoot } = await import('react-dom/client')
const { CanvasEditor } = await import('./canvas-editor')
const { createFormField } = await import('./form-designer')
type FormSection = import('@braedonsaunders/appkit-forms-core').FormSection
type FieldType = import('@braedonsaunders/appkit-forms-core').FieldType

async function renderCanvas(t: { after: (fn: () => Promise<void>) => void }, section: FormSection) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () =>
    root.render(
      React.createElement(CanvasEditor, {
        section,
        locale: 'en',
        defaultLocale: 'en',
        selectedFieldId: null,
        dragTypeRef: { current: null as FieldType | null },
        onLayout: () => {},
        onAddWidget: () => {},
        onSelect: () => {},
        onDelete: () => {},
      }),
    ),
  )
  t.after(async () => {
    await act(async () => root.unmount())
    container.remove()
  })
  return container
}

function sectionWith(types: FieldType[]): FormSection {
  const fields = types.map((type) => createFormField(type))
  return {
    id: 'main',
    title: 'Main',
    fields,
    canvas: { cols: 12, rowHeight: 40, items: fields.map((field, index) => ({ i: field.id, x: 0, y: index * 3, w: 6, h: 3 })) },
  } as FormSection
}

test('the canvas draws a card for every placed field', async (t) => {
  const container = await renderCanvas(t, sectionWith(['text', 'select', 'heading']))
  const cards = container.querySelectorAll('.react-grid-item')
  assert.equal(cards.length, 3, 'one grid item per canvas item')
  assert.match(container.textContent ?? '', /Short text/)
  assert.match(container.textContent ?? '', /Dropdown/)
  assert.match(container.textContent ?? '', /Heading/)
})

test('cards and their overlays sit on theme surfaces, not literal white', async (t) => {
  const container = await renderCanvas(t, sectionWith(['text', 'select', 'heading']))
  const cards = [...container.querySelectorAll<HTMLElement>('.react-grid-item')]
  assert.equal(cards.length, 3)
  for (const card of cards) assert.match(card.className, /\bbg-surface\b/)
  assert.doesNotMatch(container.innerHTML, /\b(?:bg|text|ring)-white\b/)

  const empty = await renderCanvas(t, { id: 'empty', title: 'Empty', fields: [], canvas: { cols: 12, rowHeight: 40, items: [] } } as FormSection)
  const message = empty.querySelector<HTMLElement>('span.rounded-md')
  assert.ok(message, 'the empty-canvas message')
  assert.match(message.className, /\bbg-surface\/80\b/)
})
