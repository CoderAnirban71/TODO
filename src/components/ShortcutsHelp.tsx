import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { IconClose } from './Icons'

const GROUPS: { title: string; keys: [string, string][] }[] = [
  {
    title: 'Navigate',
    keys: [
      ['N', 'New task'],
      ['/', 'Search'],
      ['⌘ K', 'Command palette'],
      ['V', 'Switch list / board'],
      ['T', 'Toggle theme'],
      ['?', 'This help'],
    ],
  },
  {
    title: 'Quick-add syntax',
    keys: [
      ['!high  !med  !low', 'Set priority'],
      ['#work', 'Add a tag'],
      ['today  tomorrow', 'Set due date'],
      ['@fri  @2026-10-01', 'Weekday or exact date'],
    ],
  },
  {
    title: 'In the list',
    keys: [
      ['Ctrl + click', 'Select multiple tasks'],
      ['Drag handle', 'Reorder (in "My order")'],
      ['Enter / Esc', 'Save / cancel an edit'],
      ['Space', 'Pause focus timer'],
    ],
  },
]

export function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose}>
      <motion.div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-head">
          <h2 id="help-title" className="sheet-title">
            Keyboard shortcuts
          </h2>
          <button ref={closeRef} type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <div className="help-grid">
          {GROUPS.map((g) => (
            <section key={g.title} className="help-group">
              <h3 className="help-group-title">{g.title}</h3>
              <dl className="help-list">
                {g.keys.map(([k, v]) => (
                  <div key={k} className="help-row">
                    <dt>
                      <kbd>{k}</kbd>
                    </dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
