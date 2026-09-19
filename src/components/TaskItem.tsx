import { memo, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PRIORITY_LABEL, type Priority, type Task } from '../types'
import { todayISO } from '../lib/dates'
import { PrioritySelect } from './PrioritySelect'
import { DueBadge, TagChip } from './Badges'
import { IconEdit, IconFocus, IconGrip, IconNotes, IconTrash } from './Icons'

export interface TaskItemProps {
  task: Task
  selected?: boolean
  selectable?: boolean
  draggable?: boolean
  onToggle: (id: string) => void
  onUpdate: (id: string, patch: Partial<Task>) => void
  onRemove: (id: string) => void
  onFocus: (id: string) => void
  onSelect?: (id: string, additive: boolean) => void
  onTagClick?: (tag: string) => void
}

export const TaskItem = memo(function TaskItem({
  task,
  selected = false,
  selectable = false,
  draggable = false,
  onToggle,
  onUpdate,
  onRemove,
  onFocus,
  onSelect,
  onTagClick,
}: TaskItemProps) {
  const reduce = useReducedMotion()
  const [editing, setEditing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, disabled: !draggable || editing })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  function toggle() {
    if (!task.completed) {
      setJustCompleted(true)
      window.setTimeout(() => setJustCompleted(false), 700)
    }
    onToggle(task.id)
  }

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      className="task"
      data-priority={task.priority}
      data-completed={task.completed}
      data-selected={selected}
      data-dragging={isDragging}
      data-editing={editing}
      layout={reduce ? false : 'position'}
      initial={reduce ? false : { opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24, height: 0, marginTop: 0, transition: { duration: 0.22 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
    >
      {editing ? (
        <EditForm
          task={task}
          inputRef={inputRef}
          onCancel={() => setEditing(false)}
          onSave={(patch) => {
            onUpdate(task.id, patch)
            setEditing(false)
          }}
        />
      ) : (
        <>
          {draggable && (
            <button
              ref={setActivatorNodeRef}
              type="button"
              className="task-grip"
              aria-label={`Drag to reorder "${task.title}"`}
              {...attributes}
              {...listeners}
            >
              <IconGrip />
            </button>
          )}

          <span className="task-check-wrap">
            <input
              type="checkbox"
              id={`done-${task.id}`}
              className="task-check"
              checked={task.completed}
              onChange={toggle}
              aria-label={`Mark "${task.title}" as ${task.completed ? 'not done' : 'done'}`}
            />
            <AnimatePresence>
              {justCompleted && !reduce && (
                <motion.span
                  className="task-check-burst"
                  aria-hidden="true"
                  initial={{ scale: 0.4, opacity: 0.8 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>
          </span>

          <div
            className="task-body"
            onClick={(e) => {
              if (onSelect && (e.metaKey || e.ctrlKey || e.shiftKey)) {
                onSelect(task.id, true)
                return
              }
              if (task.notes) setExpanded((x) => !x)
            }}
          >
            <span className="task-title">{task.title}</span>
            <span className="task-meta">
              <span className="task-priority">
                <span className="priority-dot" aria-hidden="true" />
                {PRIORITY_LABEL[task.priority]}
              </span>
              {task.dueDate && <DueBadge date={task.dueDate} completed={task.completed} />}
              {task.tags.map((t) => (
                <TagChip key={t} tag={t} onClick={onTagClick ? () => onTagClick(t) : undefined} />
              ))}
              {task.notes && (
                <button
                  type="button"
                  className="task-notes-toggle"
                  aria-expanded={expanded}
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpanded((x) => !x)
                  }}
                >
                  <IconNotes size={13} /> Notes
                </button>
              )}
            </span>
            <AnimatePresence initial={false}>
              {expanded && task.notes && (
                <motion.p
                  className="task-notes"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {task.notes}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="task-actions">
            {selectable && (
              <input
                type="checkbox"
                className="task-select"
                checked={selected}
                onChange={() => onSelect?.(task.id, true)}
                aria-label={`Select "${task.title}"`}
              />
            )}
            {!task.completed && (
              <button
                type="button"
                className="icon-button"
                onClick={() => onFocus(task.id)}
                aria-label={`Focus on "${task.title}"`}
                title="Focus timer"
              >
                <IconFocus />
              </button>
            )}
            <button
              type="button"
              className="icon-button"
              onClick={() => setEditing(true)}
              aria-label={`Edit "${task.title}"`}
              title="Edit"
            >
              <IconEdit />
            </button>
            <button
              type="button"
              className="icon-button icon-button--danger"
              onClick={() => onRemove(task.id)}
              aria-label={`Delete "${task.title}"`}
              title="Delete"
            >
              <IconTrash />
            </button>
          </div>
        </>
      )}
    </motion.li>
  )
})

interface EditProps {
  task: Task
  inputRef: React.RefObject<HTMLInputElement | null>
  onCancel: () => void
  onSave: (patch: Partial<Task>) => void
}

function EditForm({ task, inputRef, onCancel, onSave }: EditProps) {
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [dueDate, setDueDate] = useState(task.dueDate ?? '')
  const [tags, setTags] = useState(task.tags.join(', '))
  const [notes, setNotes] = useState(task.notes)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      priority,
      dueDate: dueDate || null,
      tags: Array.from(
        new Set(
          tags
            .split(/[,\s]+/)
            .map((t) => t.replace(/^#/, '').trim().toLowerCase())
            .filter(Boolean),
        ),
      ),
      notes: notes.trim(),
    })
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onCancel()
  }

  return (
    <form className="task-edit" onSubmit={submit} onKeyDown={onKey}>
      <label htmlFor={`edit-${task.id}`} className="visually-hidden">
        Edit task title
      </label>
      <input
        ref={inputRef}
        id={`edit-${task.id}`}
        className="input input--title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        autoFocus
      />
      <div className="task-edit-grid">
        <label className="field">
          <span className="field-label">Due date</span>
          <input type="date" className="input" value={dueDate} min={todayISO()} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Tags</span>
          <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="work, home" />
        </label>
      </div>
      <label className="field">
        <span className="field-label">Notes</span>
        <textarea className="input textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
      </label>
      <div className="task-edit-controls">
        <PrioritySelect name={`priority-${task.id}`} value={priority} onChange={setPriority} compact />
        <div className="task-edit-actions">
          <button type="button" className="button button--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="button button--primary" disabled={!title.trim()}>
            Save
          </button>
        </div>
      </div>
    </form>
  )
}
