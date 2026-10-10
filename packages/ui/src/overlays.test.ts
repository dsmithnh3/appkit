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

const React = await import('react')
// tsx compiles imported JSX in classic mode from the repo root, so React must be global.
Object.assign(globalThis, { React })
const { act } = React
const { createRoot } = await import('react-dom/client')
const { Dialog } = await import('./dialog')
const { Drawer } = await import('./drawer')
const { ConfirmRoot, confirmDialog } = await import('./confirm-dialog')
const { PromptRoot, promptDialog } = await import('./prompt-dialog')
const { trapTabKey } = await import('./focus-trap')

async function render(
  t: { after: (fn: () => Promise<void>) => void },
  node: React.ReactElement,
): Promise<() => Promise<void>> {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(node)
  })
  let disposed = false
  const dispose = async () => {
    if (disposed) return
    disposed = true
    await act(async () => root.unmount())
    container.remove()
  }
  t.after(dispose)
  return dispose
}

function pressTab(shiftKey = false): KeyboardEvent {
  const event = new dom.window.KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true })
  ;(document.activeElement ?? document.body).dispatchEvent(event)
  return event as unknown as KeyboardEvent
}

function zIndexOf(element: Element | null): number {
  const match = /\bz-\[(\d+)\]/.exec(element?.className ?? '')
  assert.ok(match, `expected a z-[n] layer class on ${element?.outerHTML.slice(0, 80)}`)
  return Number(match[1])
}

function dialogPanel(): HTMLElement {
  const panels = document.querySelectorAll<HTMLElement>('[role="dialog"]')
  assert.equal(panels.length, 1, 'expected exactly one open dialog')
  return panels[0]!
}

test('trapTabKey wraps at both ends and pulls escaped focus back into the panel', () => {
  const panel = document.createElement('div')
  panel.tabIndex = -1
  panel.innerHTML = '<button id="a">A</button><button id="b">B</button><button id="c" disabled>C</button>'
  const outside = document.createElement('button')
  document.body.append(panel, outside)
  const a = panel.querySelector<HTMLButtonElement>('#a')!
  const b = panel.querySelector<HTMLButtonElement>('#b')!
  const tab = (shiftKey: boolean) =>
    new dom.window.KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true }) as unknown as KeyboardEvent

  b.focus()
  const forward = tab(false)
  trapTabKey(forward, panel)
  assert.ok(forward.defaultPrevented)
  assert.ok(document.activeElement === a, 'Tab on the last enabled control wraps to the first')

  const backward = tab(true)
  trapTabKey(backward, panel)
  assert.ok(document.activeElement === b, 'Shift+Tab on the first control wraps to the last')

  outside.focus()
  trapTabKey(tab(false), panel)
  assert.ok(document.activeElement === a, 'Tab from outside the panel lands on its first control')

  const other = new dom.window.KeyboardEvent('keydown', { key: 'Enter', cancelable: true }) as unknown as KeyboardEvent
  trapTabKey(other, panel)
  assert.ok(!other.defaultPrevented, 'keys other than Tab are left alone')
  panel.remove()
  outside.remove()
})

test('Dialog is named by its title and description and layers below the floating UI it opens', async (t) => {
  const dispose = await render(
    t,
    React.createElement(
      Dialog,
      { open: true, onClose: () => {}, title: 'Delete rows', description: 'This removes 3 rows.' },
      'Body',
    ),
  )
  const panel = dialogPanel()
  const title = document.getElementById(panel.getAttribute('aria-labelledby') ?? '')
  const description = document.getElementById(panel.getAttribute('aria-describedby') ?? '')
  assert.equal(title?.textContent, 'Delete rows')
  assert.equal(description?.textContent, 'This removes 3 rows.')
  const dialogLayer = zIndexOf(panel.parentElement)
  await dispose()

  const confirmDispose = await render(t, React.createElement(ConfirmRoot))
  let pending!: Promise<boolean>
  await act(async () => {
    pending = confirmDialog('Discard changes?')
  })
  const confirmLayer = zIndexOf(dialogPanel())
  assert.ok(
    dialogLayer < confirmLayer,
    `a confirm raised from a Dialog must paint above it (dialog z-${dialogLayer}, confirm z-${confirmLayer})`,
  )
  const cancel = Array.from(dialogPanel().querySelectorAll('button')).find((b) => b.textContent === 'Cancel')!
  await act(async () => cancel.click())
  assert.equal(await pending, false)
  await confirmDispose()
})

test('Dialog without a title or description carries no dangling aria references', async (t) => {
  const dispose = await render(t, React.createElement(Dialog, { open: true, onClose: () => {} }, 'Body'))
  const panel = dialogPanel()
  assert.equal(panel.getAttribute('aria-labelledby'), null)
  assert.equal(panel.getAttribute('aria-describedby'), null)
  await dispose()
})

test('Drawer is named by its title, and a headerless Drawer still has a close button', async (t) => {
  let closed = 0
  const titled = await render(
    t,
    React.createElement(Drawer, { open: true, onClose: () => {}, title: 'New contact', children: 'Body' }),
  )
  const panel = dialogPanel()
  assert.equal(document.getElementById(panel.getAttribute('aria-labelledby') ?? '')?.textContent, 'New contact')
  await titled()

  const bare = await render(t, React.createElement(Drawer, { open: true, onClose: () => closed++, children: 'Body' }))
  const close = dialogPanel().querySelector<HTMLButtonElement>('button[aria-label="Close"]')
  assert.ok(close, 'a Drawer opened without title, description or header actions must still offer Close')
  await act(async () => close.click())
  assert.equal(closed, 1)
  await bare()
})

test('ConfirmDialog: Enter on a focused Cancel cancels instead of confirming', async (t) => {
  const dispose = await render(t, React.createElement(ConfirmRoot))
  let pending!: Promise<boolean>
  await act(async () => {
    pending = confirmDialog({ message: 'Delete 3 rows?', tone: 'danger', confirmLabel: 'Delete' })
  })
  const buttons = Array.from(dialogPanel().querySelectorAll('button'))
  const cancel = buttons.find((b) => b.textContent === 'Cancel')!
  cancel.focus()
  // A browser activates the focused button on Enter; jsdom does not, so press
  // Enter and then deliver the click the browser would send to Cancel.
  await act(async () => {
    cancel.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    cancel.click()
  })
  assert.equal(await pending, false, 'the declined destructive action must not run')
  await dispose()
})

test('ConfirmDialog traps Tab inside the panel and restores focus to the trigger on close', async (t) => {
  const trigger = document.createElement('button')
  trigger.textContent = 'Delete rows'
  document.body.appendChild(trigger)
  trigger.focus()
  const dispose = await render(t, React.createElement(ConfirmRoot))
  let pending!: Promise<boolean>
  await act(async () => {
    pending = confirmDialog('Delete 3 rows?')
  })
  const panel = dialogPanel()
  const buttons = Array.from(panel.querySelectorAll('button'))
  const [cancel, confirm] = [buttons.at(-2)!, buttons.at(-1)!]
  confirm.focus()
  const event = pressTab()
  assert.ok(event.defaultPrevented, 'Tab on the last button must not leave the dialog')
  assert.ok(document.activeElement === cancel, 'Tab from the last button wraps to the first')
  await act(async () => confirm.click())
  assert.equal(await pending, true)
  assert.ok(document.activeElement === trigger, 'focus returns to the control that opened the confirmation')
  await dispose()
  trigger.remove()
})

test('PromptDialog: Tab reaches Cancel and Save and never parks on the hidden scrim', async (t) => {
  const dispose = await render(t, React.createElement(PromptRoot))
  let pending!: Promise<string | null>
  await act(async () => {
    pending = promptDialog({ title: 'Rename file', initialValue: 'Q3 report' })
    await new Promise((resolve) => setTimeout(resolve, 30))
  })
  const panel = dialogPanel()
  const input = panel.querySelector('input')!
  const save = Array.from(panel.querySelectorAll('button')).find((b) => b.textContent === 'Save')!
  save.focus()
  const event = pressTab()
  assert.ok(event.defaultPrevented)
  assert.ok(document.activeElement === input, 'Tab from Save wraps to the field')
  input.focus()
  pressTab(true)
  assert.ok(document.activeElement === save, 'Shift+Tab from the field wraps to Save')
  assert.equal(
    (document.activeElement as HTMLElement).closest('[aria-hidden="true"]'),
    null,
    'focus never rests inside an aria-hidden element',
  )
  await act(async () => save.click())
  assert.equal(await pending, 'Q3 report')
  await dispose()
})

test('every button in Dialog and Drawer chrome draws the focus ring', async (t) => {
  for (const element of [
    React.createElement(Dialog, { open: true, onClose: () => {}, title: 'Delete rows', footer: 'Footer' }, 'Body'),
    React.createElement(Drawer, { open: true, onClose: () => {}, title: 'New contact', children: 'Body' }),
  ]) {
    const dispose = await render(t, element)
    const buttons = Array.from(dialogPanel().querySelectorAll('button'))
    assert.ok(buttons.length > 0, 'the panel renders its close control')
    for (const button of buttons) {
      assert.match(button.className, /focus-visible:ring-2/, `no focus ring on ${button.outerHTML.slice(0, 120)}`)
    }
    await dispose()
  }
})
