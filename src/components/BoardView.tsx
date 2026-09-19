import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { PRIORITIES, PRIORITY_LABEL, type Priority, type Task } from '../types'
import { DueBadge, TagChip } from './Badges'
import { IconCheck, IconFocus, IconTrash } from './Icons'

interface Props {
  tasks: Task[]
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onFocus: (id: string) => void
  onSetPriority: (id: string, p: Priority) => void
}

function Card({
  task,
  overlay = false,
  onToggle,
  onRemove,
  onFocus,
}: {
  task: Task
  overlay?: boolean
  onToggle?: (id: string) => void
  onRemove?: (id: string) => void
  onFocus?: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id, disabled: overlay })
  const reduce = useReducedMotion()

  return (
    <motion.article
      ref={setNodeRef}
      className="card"
      data-priority={task.priority}
      data-completed={task.completed}
      data-dragging={isDragging}
      data-overlay={overlay}
      layout={reduce || overlay ? false : true}
      initial={reduce || overlay ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: isDragging ? 0.3 : 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
      {...attributes}
      {...listeners}
      aria-roledescription="draggable task"
    >
      <p className="card-title">{task.title}</p>
      {(task.dueDate || task.tags.length > 0) && (
        <div className="card-meta">
          {task.dueDate && <DueBadge date={task.dueDate} completed={task.completed} />}
          {task.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </div>
      )}
      {!overlay && (
        <div className="card-actions">
          <button
            type="button"
            className="icon-button icon-button--sm"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onToggle?.(task.id)}
            aria-label={task.completed ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
            aria-pressed={task.completed}
          >
            <IconCheck size={16} />
          </button>
          {!task.completed && (
            <button
              type="button"
              className="icon-button icon-button--sm"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onFocus?.(task.id)}
              aria-label={`Focus on "${task.title}"`}
            >
              <IconFocus size={16} />
            </button>
          )}
          <button
            type="button"
            className="icon-button icon-button--sm icon-button--danger"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onRemove?.(task.id)}
            aria-label={`Delete "${task.title}"`}
          >
            <IconTrash size={16} />
          </button>
        </div>
      )}
    </motion.article>
  )
}

function Column({ priority, tasks, children }: { priority: Priority; tasks: Task[]; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${priority}` })
  const open = tasks.filter((t) => !t.completed).length
  return (
    <section ref={setNodeRef} className="column" data-priority={priority} data-over={isOver} aria-label={`${PRIORITY_LABEL[priority]} priority`}>
      <header className="column-head">
        <span className="priority-dot" aria-hidden="true" />
        <span className="column-title">{PRIORITY_LABEL[priority]}</span>
        <span className="column-count">{open}</span>
      </header>
      <div className="column-body">{children}</div>
    </section>
  )
}

export function BoardView({ tasks, onToggle, onRemove, onFocus, onSetPriority }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )
  const active = activeId ? tasks.find((t) => t.id === activeId) : null

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }
  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return
    const target = String(over.id).replace('col-', '') as Priority
    const task = tasks.find((t) => t.id === active.id)
    if (task && PRIORITIES.includes(target) && task.priority !== target) onSetPriority(task.id, target)
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
      <div className="board">
        {PRIORITIES.map((p) => {
          const items = tasks.filter((t) => t.priority === p)
          return (
            <Column key={p} priority={p} tasks={items}>
              <AnimatePresence initial={false}>
                {items.map((t) => (
                  <Card key={t.id} task={t} onToggle={onToggle} onRemove={onRemove} onFocus={onFocus} />
                ))}
              </AnimatePresence>
              {items.length === 0 && <p className="column-empty">Drop a task here</p>}
            </Column>
          )
        })}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }}>
        {active ? <Card task={active} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
