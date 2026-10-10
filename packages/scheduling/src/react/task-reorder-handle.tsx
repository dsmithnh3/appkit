'use client'

/**
 * The grip at the start of a task row, shared by the Gantt and list views.
 *
 * Dragging it reorders and re-parents the task; the view reads the drop depth
 * from the pointer. With keyboard focus the arrow keys take the same steps one
 * at a time, through the same actions as the row's context menu: Up and Down
 * move the task past its neighbour, Right nests it under the task above, Left
 * pulls it back out — the directions the drag hint already teaches.
 */

import type { DragEvent, KeyboardEvent } from 'react'
import { GripVertical } from 'lucide-react'
import { cn } from '@braedonsaunders/appkit-ui'
import type { ScheduleTask } from '../types'
import { useSchedulingLabels } from './context'

type ActionResult = void | boolean | Promise<boolean | void>

/** The outline moves a row can take one step at a time. */
export interface TaskOutlineActions {
  /** Move a task past its neighbour in display order. */
  onMoveTask?: (taskId: string, direction: 'up' | 'down') => ActionResult
  /** Nest a task under the task above it. */
  onIndentTask?: (taskId: string) => ActionResult
  /** Pull a task out to its parent's level. */
  onOutdentTask?: (taskId: string) => ActionResult
}

export type TaskReorderAction = 'up' | 'down' | 'indent' | 'outdent'

/** The outline move an unmodified arrow key stands for on a focused handle. */
export function reorderActionForKey(key: string): TaskReorderAction | null {
  if (key === 'ArrowUp') return 'up'
  if (key === 'ArrowDown') return 'down'
  if (key === 'ArrowRight') return 'indent'
  if (key === 'ArrowLeft') return 'outdent'
  return null
}

function actionFor(task: ScheduleTask, action: TaskReorderAction, actions: TaskOutlineActions) {
  if (action === 'up' || action === 'down') {
    const { onMoveTask } = actions
    return onMoveTask ? () => onMoveTask(task.id, action) : null
  }
  const run = action === 'indent' ? actions.onIndentTask : actions.onOutdentTask
  return run ? () => run(task.id) : null
}

export interface TaskReorderHandleProps extends TaskOutlineActions {
  task: ScheduleTask
  /** False while the view cannot reorder, e.g. a list sorted by another column. */
  enabled?: boolean
  /** Why the handle cannot reorder right now; read as its description. */
  disabledHint?: string
  onDragStart: (event: DragEvent<HTMLButtonElement>) => void
  onDragEnd: () => void
  className?: string
}

export function TaskReorderHandle({
  task,
  enabled = true,
  disabledHint,
  onDragStart,
  onDragEnd,
  onMoveTask,
  onIndentTask,
  onOutdentTask,
  className,
}: TaskReorderHandleProps) {
  const labels = useSchedulingLabels()
  const actions = { onMoveTask, onIndentTask, onOutdentTask }
  const keyboard = enabled && Boolean(onMoveTask || onIndentTask || onOutdentTask)

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!keyboard || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const action = reorderActionForKey(event.key)
    const run = action ? actionFor(task, action, actions) : null
    if (!run) return
    event.preventDefault()
    event.stopPropagation()
    // The row keeps its key, so React moves the same button and gives it
    // focus back after the commit.
    void run()
  }

  const hint = enabled
    ? keyboard
      ? `${labels.badges.reorderHint} ${labels.badges.reorderKeysHint}`
      : labels.badges.reorderHint
    : disabledHint

  return (
    <button
      type="button"
      data-reorder-handle={task.id}
      draggable={enabled}
      aria-label={`${labels.badges.reorder}: ${task.name || labels.badges.untitled}`}
      aria-disabled={enabled ? undefined : true}
      aria-keyshortcuts={keyboard ? 'ArrowUp ArrowDown ArrowRight ArrowLeft' : undefined}
      title={hint}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={handleKeyDown}
      onDragStart={enabled ? onDragStart : undefined}
      onDragEnd={enabled ? onDragEnd : undefined}
      className={cn(
        'shrink-0 rounded-sm text-fg-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        !enabled && 'cursor-not-allowed',
        className,
      )}
    >
      <GripVertical className="h-3.5 w-3.5" aria-hidden />
    </button>
  )
}
