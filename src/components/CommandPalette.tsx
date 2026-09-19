import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { IconSearch } from './Icons'

export interface Command {
  id: string
  label: string
  hint?: string
  icon?: ReactNode
  shortcut?: string
  run: () => void
}

interface Props {
  commands: Command[]
  onClose: () => void
}

export function CommandPalette({ commands, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => `${c.label} ${c.hint ?? ''}`.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setIndex(0)
  }, [query])

  useEffect(() => {
    listRef.current?.children[index]?.scrollIntoView?.({ block: 'nearest' })
  }, [index])

  function run(c: Command) {
    onClose()
    c.run()
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex((i) => Math.min(results.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[index]) run(results[index])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKey}
      >
        <div className="palette-search">
          <IconSearch />
          <input
            ref={inputRef}
            className="palette-input"
            placeholder="Type a command"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined}
            aria-autocomplete="list"
          />
          <kbd>Esc</kbd>
        </div>
        <ul id="palette-list" ref={listRef} className="palette-list" role="listbox">
          {results.length === 0 && <li className="palette-empty">No commands match.</li>}
          {results.map((c, i) => (
            <li
              key={c.id}
              id={`cmd-${c.id}`}
              role="option"
              aria-selected={i === index}
              className="palette-item"
              data-active={i === index}
              onMouseEnter={() => setIndex(i)}
              onClick={() => run(c)}
            >
              <span className="palette-icon">{c.icon}</span>
              <span className="palette-label">
                {c.label}
                {c.hint && <span className="palette-hint">{c.hint}</span>}
              </span>
              {c.shortcut && <kbd>{c.shortcut}</kbd>}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  )
}
