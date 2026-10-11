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
  'HTMLButtonElement',
  'Event',
  'KeyboardEvent',
  'self',
  'requestAnimationFrame',
  'cancelAnimationFrame',
]) {
  if (globals[key] === undefined) globals[key] = domWindow[key]
}
globals['IS_REACT_ACT_ENVIRONMENT'] = true
// jsdom does no layout, so offsetParent is always null and every focusable
// would read as hidden. Treat attached elements as visible, as a browser would.
Object.defineProperty(dom.window.HTMLElement.prototype, 'offsetParent', {
  configurable: true,
  get(this: HTMLElement) {
    return this.isConnected ? this.parentElement : null
  },
})


// jsdom has no media queries. SearchSelect asks whether it is on a desktop width;
// reporting no match puts it on the phone-sized bottom sheet.
if (dom.window.matchMedia === undefined) {
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
}

const React = await import('react')
// tsx compiles imported JSX in classic mode from the repo root, so React must be global.
Object.assign(globalThis, { React })
const { act } = React
const { createRoot } = await import('react-dom/client')
const { ContextMenu } = await import('./context-menu')
const { Toaster, toast } = await import('./toast')
const { FilterChips } = await import('./filter-chips')
const { MultiSelect } = await import('./multi-select')
const { GlobalSearch } = await import('./global-search')
const { FileUploader } = await import('./file-uploader')
const { SearchSelect } = await import('./search-select')
const { ApiReference } = await import('./api-reference')

// The same rule focus-visible.test.ts applies to server-rendered surfaces, for
// controls that only exist once something is open, typed or failed.

async function render(t: { after: (fn: () => Promise<void>) => void }, node: React.ReactElement) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => root.render(node))
  t.after(async () => {
    await act(async () => root.unmount())
    container.remove()
  })
  return container
}

function assertFocusRings(name: string, scope: Element, selector: string, expected: number) {
  const controls = Array.from(scope.querySelectorAll<HTMLElement>(selector)).filter((el) => !el.hasAttribute('disabled'))
  assert.ok(controls.length >= expected, `${name}: expected at least ${expected} control(s), found ${controls.length}`)
  for (const control of controls) {
    assert.match(control.className, /focus-visible:ring-2/, `${name}: no focus ring on ${control.outerHTML.slice(0, 140)}`)
    assert.match(control.className, /focus-visible:ring-ring\b/, `${name}: ring is not the full-strength token`)
  }
}

const click = (element: Element) => act(async () => (element as HTMLElement).click())

test('ContextMenu items draw the focus ring', async (t) => {
  await render(
    t,
    React.createElement(ContextMenu, {
      open: true,
      position: { x: 10, y: 10 },
      onClose: () => {},
      items: [
        { key: 'dup', label: 'Duplicate', onSelect: () => {} },
        { key: 'rm', label: 'Remove', danger: true, onSelect: () => {} },
      ],
    }),
  )
  assertFocusRings('ContextMenu', document.body, '[role="menuitem"]', 2)
})

test('Toast action, cancel and Dismiss draw the focus ring', async (t) => {
  await render(t, React.createElement(Toaster, { closeButton: true }))
  await act(async () => {
    toast('Invoice sent', { action: { label: 'Undo', onClick: () => {} }, cancel: { label: 'Keep', onClick: () => {} } })
  })
  const row = document.querySelector('[role="status"]')
  assert.ok(row, 'the toast renders')
  assertFocusRings('Toast', row, 'button', 3)
  await act(async () => toast.dismiss())
})

test('FilterChips options draw the focus ring once the chip is open', async (t) => {
  const container = await render(
    t,
    React.createElement(FilterChips, {
      basePath: '/invoices',
      currentParams: {},
      paramKey: 'status',
      label: 'Status',
      options: [{ value: 'open', label: 'Open' }, { value: 'paid', label: 'Paid' }],
    }),
  )
  await click(container.querySelector('button[aria-haspopup="listbox"]')!)
  const list = document.querySelector('[data-ui-overlay]')
  assert.ok(list, 'the options open')
  assertFocusRings('FilterChips options', list, 'a, button', 3)
})

test('MultiSelect option rows draw the focus ring once open', async (t) => {
  const container = await render(
    t,
    React.createElement(MultiSelect, {
      value: [],
      onChange: () => {},
      options: [{ value: 'read', label: 'Read' }, { value: 'write', label: 'Write' }],
      ariaLabel: 'Permissions',
    }),
  )
  await click(container.querySelector('button')!)
  assertFocusRings('MultiSelect options', document.body, '[role="option"]', 2)
})

test('GlobalSearch Clear draws the focus ring once there is a query', async (t) => {
  const container = await render(
    t,
    React.createElement(GlobalSearch, {
      search: async () => ({ groups: [], total: 0 }),
      onNavigate: () => {},
      debounceMs: 0,
    }),
  )
  const input = container.querySelector('input')!
  await act(async () => {
    const setValue = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value')!.set!
    setValue.call(input, 'pipe')
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
  })
  assertFocusRings('GlobalSearch', container, 'button[aria-label]', 1)
})

test('FileUploader Dismiss draws the focus ring on a failed file', async (t) => {
  const container = await render(
    t,
    React.createElement(FileUploader, {
      requestUploadAction: async () => ({ ok: false, error: 'offline' }),
      finalizeUploadAction: async () => ({ ok: false, error: 'offline' }),
      onUploaded: () => {},
      maxSize: 4,
    } as never),
  )
  const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
  const file = new dom.window.File(['too large for the cap'], 'scan.pdf', { type: 'application/pdf' })
  Object.defineProperty(input, 'files', { configurable: true, value: [file] })
  await act(async () => {
    input.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
    await new Promise((resolve) => setTimeout(resolve, 10))
  })
  assertFocusRings('FileUploader', container, 'button, [tabindex="0"]', 2)
})

test('SearchSelect\'s phone-sized sheet draws the focus ring on its Close button', async (t) => {
  const container = await render(
    t,
    React.createElement(SearchSelect, {
      value: '',
      onChange: () => {},
      options: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }],
      ariaLabel: 'Pick one',
      closeLabel: 'Close list',
    }),
  )
  await click(container.querySelector('button[aria-haspopup="listbox"]')!)
  const sheet = document.querySelector('[data-ui-overlay]')
  assert.ok(sheet, 'the sheet opens on a phone-sized screen')
  assertFocusRings('SearchSelect sheet', sheet, 'button[aria-label="Close list"]', 1)
})

test('ApiReference endpoint toggle says whether it is open and draws the focus ring', async (t) => {
  const container = await render(
    t,
    React.createElement(ApiReference, {
      endpoints: [{ method: 'GET', path: '/v1/invoices', summary: 'List invoices', description: 'Every invoice.' }],
    }),
  )
  const toggle = container.querySelector<HTMLButtonElement>('button[aria-expanded]')
  assert.ok(toggle, 'the endpoint row is a button that reports its state')
  assert.equal(toggle.getAttribute('aria-expanded'), 'false')
  assertFocusRings('ApiReference toggle', container, 'button[aria-expanded]', 1)
  await click(toggle)
  assert.equal(toggle.getAttribute('aria-expanded'), 'true')
})
