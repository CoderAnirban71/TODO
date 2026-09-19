import { motion, useReducedMotion } from 'motion/react'

interface Props {
  kind: 'empty' | 'no-match'
  onClear?: () => void
}

/** Three floating "task rows" that assemble on mount — the list drawing itself. */
function Illustration() {
  const reduce = useReducedMotion()
  const rows: { w: number; p: 'high' | 'medium' | 'low' }[] = [
    { w: 68, p: 'high' },
    { w: 52, p: 'medium' },
    { w: 60, p: 'low' },
  ]
  return (
    <div className="empty-art" aria-hidden="true">
      {rows.map((r, i) => (
        <motion.div
          key={i}
          className="empty-art-row"
          data-priority={r.p}
          initial={reduce ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <motion.span
            className="empty-art-check"
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.12, type: 'spring', stiffness: 400, damping: 20 }}
          />
          <span className="empty-art-bar" style={{ width: `${r.w}%` }} />
        </motion.div>
      ))}
    </div>
  )
}

export function EmptyState({ kind, onClear }: Props) {
  return (
    <motion.div
      className="empty"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {kind === 'empty' ? (
        <>
          <Illustration />
          <p className="empty-title">Your list is empty.</p>
          <p className="empty-text">
            Type a task above and press Enter. Add <code>!high</code>, <code>#tag</code> or <code>tomorrow</code> inline to
            set details as you type.
          </p>
        </>
      ) : (
        <>
          <p className="empty-title">No tasks match.</p>
          <p className="empty-text">Try a different search, or clear the filters.</p>
          {onClear && (
            <button type="button" className="button button--ghost" onClick={onClear}>
              Clear filters
            </button>
          )}
        </>
      )}
    </motion.div>
  )
}
