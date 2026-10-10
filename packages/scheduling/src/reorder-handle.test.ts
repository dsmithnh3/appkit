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
  'getComputedStyle',
]) {
  if (globals[key] === undefined) globals[key] = domWindow[key]
}
globals['IS_REACT_ACT_ENVIRONMENT'] = true
// A browser drops focus to <body> when it moves a focused element (Chromium
// does for insertBefore and appendChild alike); jsdom keeps it. React reorders
// keyed rows with those two calls and re-focuses the moved element after the
// commit, which only works while the row keeps its key. Without this the focus
// checks below would pass even if a move remounted the row.
for (const method of ['insertBefore', 'appendChild'] as const) {
  const original = dom.window.Node.prototype[method] as (this: Node, ...args: Node[]) => Node
  Object.defineProperty(dom.window.Node.prototype, method, {
    configurable: true,
    value(this: Node, node: Node, ...rest: Node[]) {
      const active = dom.window.document.activeElement as HTMLElement | null
      if (node.isConnected && active && active !== dom.window.document.body && node.contains(active)) active.blur()
      return original.call(this, node, ...rest)
    },
  })
}

const React = await import('react')
// tsx compiles imported JSX in classic mode from the repo root, so React must be global.
Object.assign(globalThis, { React })
const { act } = React
const { createRoot } = await import('react-dom/client')
const { ScheduleWorkspace } = await import('./react/schedule-workspace')
const { ListView } = await import('./react/list-view')
const { reorderActionForKey } = await import('./react/task-reorder-handle')
const { buildScheduleInsights } = await import('./insights')
const { emptySchedule } = await import('./types')
type ScheduleData = import('./types').ScheduleData
type ScheduleTask = import('./types').ScheduleTask
type ScheduleAdapter = import('./react/schedule-workspace').ScheduleAdapter

function task(id: string, name: string, order: number): ScheduleTask {
  return {
    id,
    phaseId: null,
    calendarId: null,
    parentTaskId: null,
    outlineLevel: 0,
    name,
    description: '',
    taskType: 'task',
    status: 'not_started',
    startDate: '2026-03-02',
    endDate: '2026-03-06',
    duration: 5,
    progress: 0,
    assignee: '',
    order,
    constraintType: 'asap',
    constraintDate: null,
    deadlineDate: null,
    actualStart: null,
    actualEnd: null,
    baselineStart: null,
    baselineEnd: null,
  }
}

const seed: ScheduleData = {
  ...emptySchedule,
  tasks: [task('a', 'Excavate', 1), task('b', 'Pour footings', 2), task('c', 'Frame walls', 3)],
}

/** The workspace over in-memory state, as the playground runs it. */
function Harness({ calls }: { calls: Array<Array<{ id: string } & Partial<ScheduleTask>>> }) {
  const [data, setData] = React.useState(seed)
  const adapter = React.useMemo<ScheduleAdapter>(
    () => ({
      createTask: async () => true,
      updateTask: async () => true,
      async batchUpdateTasks(updates) {
        calls.push(updates as Array<{ id: string } & Partial<ScheduleTask>>)
        const byId = new Map(updates.map((update) => [update.id, update]))
        setData((current) => ({
          ...current,
          tasks: current.tasks.map((t) => {
            const update = byId.get(t.id)
            if (!update) return t
            const patch = Object.fromEntries(Object.entries(update).filter(([, value]) => value !== undefined))
            return { ...t, ...patch } as ScheduleTask
          }),
        }))
        return true
      },
      deleteTask: async () => true,
      createDependency: async () => true,
      deleteDependency: async () => true,
    }),
    [calls],
  )
  return React.createElement(ScheduleWorkspace, { data, adapter })
}

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

function handle(container: HTMLElement, taskId: string) {
  const button = container.querySelector<HTMLButtonElement>(`[data-reorder-handle="${taskId}"]`)
  assert.ok(button, `a reorder handle for ${taskId}`)
  return button
}

async function press(target: HTMLElement, key: string, init: KeyboardEventInit = {}) {
  await act(async () => {
    target.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }))
  })
  // Let the move's promise settle and the focus check's animation frame run.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40))
  })
}

function rowOrder(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>('[data-reorder-handle]')].map((el) => el.dataset.reorderHandle)
}

test('arrow keys map to the outline moves the drag hint describes', () => {
  assert.equal(reorderActionForKey('ArrowUp'), 'up')
  assert.equal(reorderActionForKey('ArrowDown'), 'down')
  assert.equal(reorderActionForKey('ArrowRight'), 'indent')
  assert.equal(reorderActionForKey('ArrowLeft'), 'outdent')
  assert.equal(reorderActionForKey('Enter'), null)
})

test('the Gantt handle is named for reordering and describes its keys', async (t) => {
  const container = await render(t, React.createElement(Harness, { calls: [] }))
  const button = handle(container, 'b')
  assert.equal(button.getAttribute('aria-label'), 'Reorder: Pour footings')
  assert.match(button.title, /^Drag to reorder\./)
  assert.match(button.title, /Up and Down move the task, Right nests it and Left pulls it back out\./)
  assert.equal(button.getAttribute('aria-keyshortcuts'), 'ArrowUp ArrowDown ArrowRight ArrowLeft')
  assert.equal(button.getAttribute('aria-disabled'), null)
  assert.match(button.className, /focus-visible:ring-2/)
  assert.match(button.className, /focus-visible:ring-ring/)
})

test('Right nests a task under the one above and Left pulls it back out, keeping focus', async (t) => {
  const calls: Array<Array<{ id: string } & Partial<ScheduleTask>>> = []
  const container = await render(t, React.createElement(Harness, { calls }))

  handle(container, 'b').focus()
  await press(handle(container, 'b'), 'ArrowRight')
  assert.equal(calls.length, 1, 'one outline update')
  assert.equal(calls[0]!.find((update) => update.id === 'b')?.parentTaskId, 'a')
  assert.ok(document.activeElement === handle(container, 'b'), 'focus stays on the moved handle')

  await press(handle(container, 'b'), 'ArrowLeft')
  assert.equal(calls.length, 2)
  assert.equal(calls[1]!.find((update) => update.id === 'b')?.parentTaskId, null)
  assert.ok(document.activeElement === handle(container, 'b'), 'focus stays on the moved handle')
})

test('Up and Down move a task past its neighbour, keeping focus', async (t) => {
  const calls: Array<Array<{ id: string } & Partial<ScheduleTask>>> = []
  const container = await render(t, React.createElement(Harness, { calls }))
  assert.deepEqual(rowOrder(container), ['a', 'b', 'c'])

  handle(container, 'c').focus()
  await press(handle(container, 'c'), 'ArrowUp')
  assert.deepEqual(rowOrder(container), ['a', 'c', 'b'])
  assert.ok(document.activeElement === handle(container, 'c'), 'focus stays on the moved handle')

  await press(handle(container, 'c'), 'ArrowDown')
  assert.deepEqual(rowOrder(container), ['a', 'b', 'c'])
  assert.ok(document.activeElement === handle(container, 'c'), 'focus stays on the moved handle')
})

test('the workspace list view takes the same keys', async (t) => {
  const calls: Array<Array<{ id: string } & Partial<ScheduleTask>>> = []
  const container = await render(t, React.createElement(Harness, { calls }))
  const viewMenu = container.querySelector<HTMLElement>('[data-testid="schedule-view-menu"]')
  assert.ok(viewMenu, 'the view menu')
  await act(async () => viewMenu.click())
  const listItem = document.querySelector<HTMLElement>('[data-testid="schedule-view-list"]')
  assert.ok(listItem, 'the List view item')
  await act(async () => listItem.click())
  assert.ok(container.querySelector('[data-testid="schedule-list-row-b"]'), 'the list view is showing')

  handle(container, 'b').focus()
  await press(handle(container, 'b'), 'ArrowRight')
  assert.equal(calls.length, 1)
  assert.equal(calls[0]!.find((update) => update.id === 'b')?.parentTaskId, 'a')
  assert.ok(document.activeElement === handle(container, 'b'), 'focus stays on the moved handle')
})

test('modified arrows and other keys are left to the browser', async (t) => {
  const calls: Array<Array<{ id: string } & Partial<ScheduleTask>>> = []
  const container = await render(t, React.createElement(Harness, { calls }))
  const button = handle(container, 'b')
  for (const init of [{ shiftKey: true }, { altKey: true }, { ctrlKey: true }, { metaKey: true }]) {
    await press(button, 'ArrowUp', init)
  }
  await press(button, 'Enter')
  assert.equal(calls.length, 0)
})

test('a list sorted by another column disables the handle and says why', async (t) => {
  const tasks = seed.tasks
  const moves: string[] = []
  const container = await render(
    t,
    React.createElement(ListView, {
      tasks,
      insights: buildScheduleInsights(tasks, []),
      phases: [],
      resources: [],
      taskAssignmentsByTaskId: new Map(),
      onUpdateTask: () => true,
      onBatchUpdateTasks: () => true,
      onDeleteTask: () => true,
      onReorderTask: () => true,
      onClickTask: () => {},
      onMoveTask: (taskId, direction) => void moves.push(`${taskId}:${direction}`),
      onIndentTask: (taskId) => void moves.push(`${taskId}:indent`),
      onOutdentTask: (taskId) => void moves.push(`${taskId}:outdent`),
    }),
  )

  const button = handle(container, 'b')
  assert.equal(button.getAttribute('aria-label'), 'Reorder: Pour footings')
  assert.equal(button.getAttribute('draggable'), 'true')
  await press(button, 'ArrowDown')
  assert.deepEqual(moves, ['b:down'], 'WBS order: the arrows move the task')

  const nameHeader = [...container.querySelectorAll('th')].find((th) => th.textContent?.trim() === 'Task')
  const sortButton = nameHeader?.querySelector('button')
  assert.ok(sortButton, 'the Task column sorts from a button')
  sortButton.focus()
  assert.ok(document.activeElement === sortButton, 'the sort control takes keyboard focus')
  await act(async () => {
    sortButton.click()
  })
  assert.equal(nameHeader?.getAttribute('aria-sort'), 'ascending')
  assert.ok(sortButton.isConnected, 'sorting keeps the header, not a remounted copy')
  assert.ok(document.activeElement === sortButton, 'focus stays on the sort control')

  const sorted = handle(container, 'b')
  assert.equal(sorted.getAttribute('aria-disabled'), 'true')
  assert.equal(sorted.getAttribute('draggable'), 'false')
  assert.equal(sorted.title, 'Switch back to WBS sort to reorder tasks')
  assert.equal(sorted.getAttribute('aria-keyshortcuts'), null)
  await press(sorted, 'ArrowDown')
  assert.deepEqual(moves, ['b:down'], 'sorted by name: the arrows do nothing')
})
