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
  'Event',
  'self',
  'requestAnimationFrame',
  'cancelAnimationFrame',
]) {
  if (globals[key] === undefined) globals[key] = domWindow[key]
}
globals['IS_REACT_ACT_ENVIRONMENT'] = true
// SidebarNav scrolls the current page into view after paint; jsdom does no layout and has no scrollIntoView.
dom.window.HTMLElement.prototype.scrollIntoView = () => {}

const React = await import('react')
// tsx compiles imported JSX in classic mode from the repo root, so React must be global.
Object.assign(globalThis, { React })
const { act } = React
const { createRoot } = await import('react-dom/client')
const { AppSidebar } = await import('./app-sidebar')
const { SIDEBAR_COLLAPSED_COOKIE, readSidebarCollapsed } = await import('./sidebar-state')

const groups = [{ label: '', items: [{ href: '/invoices', label: 'Invoices', icon: 'file-text' }] }]

async function mount(t: { after: (fn: () => Promise<void>) => void }, props: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(React.createElement(AppSidebar, { groups, pathname: '/invoices', ...props } as never))
  })
  t.after(async () => {
    await act(async () => root.unmount())
    container.remove()
  })
  const rail = container.querySelector('aside')
  assert.ok(rail, 'renders the rail')
  return rail
}

function setCookie(value: '0' | '1' | null) {
  document.cookie = value === null ? `${SIDEBAR_COLLAPSED_COOKIE}=; max-age=0; path=/` : `${SIDEBAR_COLLAPSED_COOKIE}=${value}; path=/`
}

test('readSidebarCollapsed reads a Cookie header, document.cookie or a cookie store', () => {
  assert.equal(readSidebarCollapsed(`theme=dark; ${SIDEBAR_COLLAPSED_COOKIE}=1; locale=en`), true)
  assert.equal(readSidebarCollapsed(`${SIDEBAR_COLLAPSED_COOKIE}=0`), false)
  assert.equal(readSidebarCollapsed('theme=dark'), false)
  assert.equal(readSidebarCollapsed(''), false)
  assert.equal(readSidebarCollapsed(null), false)
  assert.equal(readSidebarCollapsed(undefined), false)
  const store = (value?: string) => ({
    get: (name: string) => (name === SIDEBAR_COLLAPSED_COOKIE && value !== undefined ? { value } : undefined),
  })
  assert.equal(readSidebarCollapsed(store('1')), true)
  assert.equal(readSidebarCollapsed(store('0')), false)
  assert.equal(readSidebarCollapsed(store()), false)
})

test('AppSidebar restores a collapsed choice from the cookie when the host passes no defaultCollapsed', async (t) => {
  setCookie('1')
  t.after(() => setCookie(null))
  const rail = await mount(t)
  assert.match(rail.className, /w-\[4\.25rem\]/, 'the remembered collapsed width survives a reload')
})

test('an explicit defaultCollapsed wins over the cookie', async (t) => {
  setCookie('1')
  t.after(() => setCookie(null))
  const rail = await mount(t, { defaultCollapsed: false })
  assert.match(rail.className, /\bw-60\b/)
})

test('toggling writes the exported cookie that readSidebarCollapsed reads back', async (t) => {
  setCookie(null)
  const rail = await mount(t)
  assert.match(rail.className, /\bw-60\b/, 'expanded when nothing is remembered')
  const toggle = rail.querySelector<HTMLButtonElement>('button[aria-label="Collapse sidebar"]')
  assert.ok(toggle, 'renders the collapse toggle')
  await act(async () => toggle.click())
  assert.equal(readSidebarCollapsed(document.cookie), true)
  t.after(() => setCookie(null))
})
