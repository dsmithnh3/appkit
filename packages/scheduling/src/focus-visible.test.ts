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
  'HTMLOptionElement',
  'HTMLOptGroupElement',
  'Event',
  'MouseEvent',
  'KeyboardEvent',
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

const React = await import('react')
// tsx compiles imported JSX in classic mode from the repo root, so React must be global.
Object.assign(globalThis, { React })
const { act } = React
const { createRoot } = await import('react-dom/client')
const { ScheduleWorkspace } = await import('./react/schedule-workspace')
const { ScheduleManagementDialog } = await import('./react/schedule-management')
const { TaskEditor } = await import('./react/task-editor')
const { buildScheduleInsights } = await import('./insights')
const { emptySchedule } = await import('./types')
type ScheduleData = import('./types').ScheduleData
type ScheduleTask = import('./types').ScheduleTask
type ScheduleAdapter = import('./react/schedule-workspace').ScheduleAdapter

// The rule ui/src/focus-visible.test.ts applies to the kit's primitives, for the
// scheduling surfaces: everything a keyboard user can land on draws the token ring.

function task(id: string, name: string, order: number, extra: Partial<ScheduleTask> = {}): ScheduleTask {
  return {
    id,
    phaseId: 'p1',
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
    ...extra,
  }
}

const calendar = { id: 'cal', name: 'Site week', isDefault: true, workingDays: { mon: true, tue: true, wed: true, thu: true, fri: true } }
const resource = { id: 'res', name: 'Crane crew', kind: 'crew' as const, defaultUnits: 1, capacityPerDay: 8 }
const data: ScheduleData = {
  ...emptySchedule,
  phases: [{ id: 'p1', number: '1', name: 'Structure', order: 1 }],
  tasks: [
    task('a', 'Foundations', 1),
    task('b', 'Pour footings', 2, { parentTaskId: 'a', outlineLevel: 1 }),
    task('c', 'Frame walls', 3),
  ],
  dependencies: [{ id: 'd1', predecessorId: 'b', successorId: 'c', type: 'FS', lagDays: 0 }],
  calendars: [calendar],
  resources: [resource],
  assignments: [{ id: 'as1', taskId: 'c', resourceId: 'res', units: 1 }],
  baselines: [{ id: 'bl', name: 'Contract', kind: 'primary', isPrimary: true }],
}

const ok = async () => true
const adapter: ScheduleAdapter = {
  createTask: ok,
  updateTask: ok,
  batchUpdateTasks: ok,
  deleteTask: ok,
  createDependency: ok,
  deleteDependency: ok,
  createCalendar: ok,
  updateCalendar: ok,
  deleteCalendar: ok,
  createResource: ok,
  updateResource: ok,
  deleteResource: ok,
  createBaseline: ok,
  deleteBaseline: ok,
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

async function click(element: Element | null, what: string) {
  assert.ok(element, what)
  await act(async () => (element as HTMLElement).click())
}

/** Everything a keyboard user can land on in the document, portals included. */
function unringed() {
  const offenders: string[] = []
  for (const element of document.body.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]')) {
    if (element.matches(':disabled') || element.closest('[aria-hidden="true"]')) continue
    const cls = element.getAttribute('class') ?? ''
    // Controls draw focus-visible:; fields (a select trigger) draw focus: with border-primary, as inputs do.
    if (!/\bfocus(?:-visible)?:ring-2\b/.test(cls) || (/focus(?:-visible)?:outline-none/.test(cls) && !/\bfocus(?:-visible)?:ring-ring\b/.test(cls))) {
      offenders.push(`<${element.tagName.toLowerCase()} ${element.getAttribute('aria-label') ?? element.textContent?.trim().slice(0, 40)}> ${cls.slice(0, 100)}`)
    }
  }
  return offenders
}

const view = (container: HTMLElement, name: 'gantt' | 'list' | 'board') => async () => {
  await click(container.querySelector('[data-testid="schedule-view-menu"]'), 'view menu')
  await click(document.querySelector(`[data-testid="schedule-view-${name}"]`), `${name} view`)
}

test('Gantt, list and board, with each toolbar menu open: every control draws the ring', async (t) => {
  const container = await render(t, React.createElement(ScheduleWorkspace, { data, adapter }))
  const seen = new Set<string>()
  const record = (where: string) => {
    for (const offender of unringed()) seen.add(`${where}: ${offender}`)
  }
  for (const name of ['gantt', 'list', 'board'] as const) {
    await view(container, name)()
    record(name)
    for (const menu of ['schedule-view-menu', 'schedule-timeline-menu', 'schedule-health-menu', 'schedule-baseline-menu', 'schedule-actions-menu']) {
      const trigger = container.querySelector(`[data-testid="${menu}"]`)
      if (!trigger) continue
      await click(trigger, menu)
      record(`${name} ${menu}`)
      await click(trigger, `${menu} closes`)
    }
  }
  assert.ok(container.querySelectorAll('button').length > 10, 'the workspace rendered its controls')
  assert.deepEqual([...seen], [])
})

test('phase headers and task names are buttons, so the keyboard can collapse a phase and open a task', async (t) => {
  const container = await render(t, React.createElement(ScheduleWorkspace, { data, adapter }))
  for (const name of ['gantt', 'list'] as const) {
    await view(container, name)()
    const phase = [...container.querySelectorAll<HTMLButtonElement>('button[aria-expanded]')].find((b) => /Structure/.test(b.textContent ?? ''))
    assert.ok(phase, `${name}: the phase header is a button`)
    assert.equal(phase.getAttribute('aria-expanded'), 'true')
    await click(phase, 'collapse')
    assert.equal(phase.getAttribute('aria-expanded'), 'false', `${name}: the header collapses its phase`)
    await click(phase, 'expand')
    const open = [...container.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Frame walls')
    assert.ok(open, `${name}: the task name is a button`)
    await click(open, 'open the task')
    assert.ok(document.querySelector('[role="dialog"]'), `${name}: the task opens in its editor`)
    await act(async () => {
      document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })
  }
  await view(container, 'board')()
  assert.ok([...container.querySelectorAll('button')].some((b) => b.textContent?.trim() === 'Frame walls'), 'board: the card title is a button')
})

test('the management dialog, on every tab, draws the ring', async (t) => {
  const offenders: string[] = []
  await render(
    t,
    React.createElement(ScheduleManagementDialog, {
      open: true,
      onClose: () => {},
      baselines: data.baselines,
      calendars: data.calendars,
      resources: data.resources,
      taskCount: data.tasks.length,
      onCreateBaseline: ok,
      onDeleteBaseline: ok,
      onCreateCalendar: ok,
      onUpdateCalendar: ok,
      onDeleteCalendar: ok,
      onCreateResource: ok,
      onUpdateResource: ok,
      onDeleteResource: ok,
    }),
  )
  const tabs = [...document.querySelectorAll<HTMLElement>('[role="tab"]')]
  assert.ok(tabs.length >= 3, 'the dialog has its tabs')
  for (const tab of tabs) {
    await click(tab, tab.textContent ?? 'tab')
    offenders.push(...unringed().map((o) => `manage/${tab.textContent}: ${o}`))
  }
  await act(async () => {})
  assert.deepEqual([...new Set(offenders)], [])
})

test('the task editor, on every tab, draws the ring', async (t) => {
  const tasks = data.tasks
  await render(
    t,
    React.createElement(TaskEditor, {
      task: tasks[2]!,
      phases: data.phases,
      allTasks: tasks,
      dependencies: data.dependencies,
      insights: buildScheduleInsights(tasks, data.dependencies),
      calendars: data.calendars,
      resources: data.resources,
      taskAssignments: data.assignments,
      onSave: ok,
      onDelete: ok,
      onCreateDependency: ok,
      onDeleteDependency: ok,
      onClose: () => {},
    }),
  )
  const offenders: string[] = []
  const tabs = [...document.querySelectorAll<HTMLElement>('[role="tab"]')]
  assert.ok(tabs.length >= 2, 'the editor has its tabs')
  for (const tab of tabs) {
    await click(tab, tab.textContent ?? 'tab')
    offenders.push(...unringed().map((o) => `editor/${tab.textContent}: ${o}`))
  }
  assert.deepEqual([...new Set(offenders)], [])
})
