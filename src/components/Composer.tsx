import { forwardRef, useImperativeHandle, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Priority, TaskDraft } from '../types'
import { parseQuickAdd } from '../utils/quickAdd'
import { addDays, formatDue, toISODate, todayISO } from '../utils/dates'
import { PrioritySelect } from './PrioritySelect'
import { IconCalendar, IconClose, IconNotes, IconTag } from './Icons'

interface Props {
  onAdd: (draft: TaskDraft) => void
  knownTags: string[]
}

export interface ComposerHandle {
  focus: () => void
}

export const Composer = forwardRef<ComposerHandle, Props>(function Composer({ onAdd, knownTags }, ref) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [notes, setNotes] = useState('')
  const [open, setOpen] = useState<null | 'date' | 'tags' | 'notes'>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), [])

  const parsed = useMemo(() => parseQuickAdd(text, priority), [text, priority])
  const effectivePriority = parsed.matched.priority ? parsed.priority : priority
  const effectiveDue = parsed.dueDate ?? (dueDate || null)
  const effectiveTags = Array.from(new Set([...tags, ...(parsed.tags ?? [])]))
  const canSubmit = parsed.title.length > 0

  function reset() {
    setText('')
    setPriority('medium')
    setDueDate('')
    setTags([])
    setTagInput('')
    setNotes('')
    setOpen(null)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onAdd({
      title: parsed.title,
      priority: effectivePriority,
      dueDate: effectiveDue,
      tags: effectiveTags,
      notes: notes.trim(),
    })
    reset()
    inputRef.current?.focus()
  }

  function commitTag() {
    const t = tagInput.trim().replace(/^#/, '').toLowerCase()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  function onTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitTag()
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1))
    }
  }

  const suggestions = knownTags.filter((t) => !tags.includes(t) && t.startsWith(tagInput.toLowerCase())).slice(0, 6)

  return (
    <motion.form
      layout
      className="composer"
      data-priority={effectivePriority}
      onSubmit={handleSubmit}
      aria-label="Add a task"
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
    >
      <div className="composer-rail" aria-hidden="true" />
      <label htmlFor="new-task" className="visually-hidden">
        Task title. Tip: type !high, #tag, or tomorrow to set priority, tags and due date.
      </label>
      <input
        ref={inputRef}
        id="new-task"
        className="composer-input"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs doing?"
        autoComplete="off"
        maxLength={200}
      />

      <AnimatePresence initial={false}>
        {(parsed.matched.priority || effectiveDue || effectiveTags.length > 0) && (
          <motion.div
            key="chips"
            className="composer-chips"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {parsed.matched.priority && (
              <span className="badge" data-priority={effectivePriority}>
                <span className="priority-dot" /> {effectivePriority} priority
              </span>
            )}
            {effectiveDue && (
              <span className="badge badge--due" data-status="soon">
                <IconCalendar size={13} /> {formatDue(effectiveDue)}
              </span>
            )}
            {effectiveTags.map((t) => (
              <span key={t} className="badge badge--tag">
                #{t}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={open}
            className="composer-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {open === 'date' && (
              <div className="panel-row">
                <label className="field">
                  <span className="field-label">Due date</span>
                  <input
                    type="date"
                    className="input"
                    value={dueDate}
                    min={todayISO()}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </label>
                <div className="quick-dates">
                  {[
                    ['Today', 0],
                    ['Tomorrow', 1],
                    ['Next week', 7],
                  ].map(([label, n]) => {
                    const iso = toISODate(addDays(new Date(), n as number))
                    return (
                      <button
                        key={label}
                        type="button"
                        className="chip-button"
                        aria-pressed={dueDate === iso}
                        onClick={() => setDueDate(iso)}
                      >
                        {label}
                      </button>
                    )
                  })}
                  {dueDate && (
                    <button type="button" className="chip-button" onClick={() => setDueDate('')}>
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
            {open === 'tags' && (
              <div className="field">
                <span className="field-label">Tags</span>
                <div className="tag-editor">
                  {tags.map((t) => (
                    <span key={t} className="badge badge--tag">
                      #{t}
                      <button
                        type="button"
                        className="badge-remove"
                        onClick={() => setTags(tags.filter((x) => x !== t))}
                        aria-label={`Remove tag ${t}`}
                      >
                        <IconClose size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    className="tag-input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={onTagKey}
                    onBlur={commitTag}
                    placeholder={tags.length ? 'Add another' : 'Type a tag and press Enter'}
                    aria-label="Add tag"
                  />
                </div>
                {suggestions.length > 0 && (
                  <div className="tag-suggestions">
                    {suggestions.map((s) => (
                      <button key={s} type="button" className="chip-button" onClick={() => setTags([...tags, s])}>
                        #{s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {open === 'notes' && (
              <label className="field">
                <span className="field-label">Notes</span>
                <textarea
                  className="input textarea"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything worth remembering"
                  maxLength={1000}
                />
              </label>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="composer-controls">
        <PrioritySelect name="new-priority" value={effectivePriority} onChange={setPriority} />
        <div className="composer-extras">
          <button
            type="button"
            className="icon-button"
            aria-pressed={open === 'date'}
            aria-label="Set due date"
            data-active={Boolean(effectiveDue)}
            onClick={() => setOpen(open === 'date' ? null : 'date')}
          >
            <IconCalendar size={18} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-pressed={open === 'tags'}
            aria-label="Add tags"
            data-active={effectiveTags.length > 0}
            onClick={() => setOpen(open === 'tags' ? null : 'tags')}
          >
            <IconTag size={18} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-pressed={open === 'notes'}
            aria-label="Add notes"
            data-active={notes.trim().length > 0}
            onClick={() => setOpen(open === 'notes' ? null : 'notes')}
          >
            <IconNotes size={18} />
          </button>
        </div>
        <motion.button
          type="submit"
          className="button button--primary"
          disabled={!canSubmit}
          whileTap={canSubmit ? { scale: 0.96 } : undefined}
        >
          Add task
        </motion.button>
      </div>
      <p className="composer-hint">
        Try <code>Ship the demo !high #work tomorrow</code>
      </p>
    </motion.form>
  )
})
