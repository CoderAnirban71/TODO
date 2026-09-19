import { motion } from 'motion/react'
import { PRIORITIES, PRIORITY_LABEL, type Priority } from '../types'
import { IconCheck, IconClose, IconTrash } from './Icons'

interface Props {
  count: number
  onComplete: () => void
  onDelete: () => void
  onPriority: (p: Priority) => void
  onClear: () => void
}

/** Floating action bar shown while tasks are multi-selected. */
export function BulkBar({ count, onComplete, onDelete, onPriority, onClear }: Props) {
  return (
    <motion.div
      className="bulk"
      role="toolbar"
      aria-label={`${count} tasks selected`}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
    >
      <span className="bulk-count">{count} selected</span>
      <button type="button" className="bulk-button" onClick={onComplete}>
        <IconCheck size={16} /> Done
      </button>
      <span className="bulk-sep" />
      {PRIORITIES.map((p) => (
        <button key={p} type="button" className="bulk-button" data-priority={p} onClick={() => onPriority(p)} aria-label={`Set ${PRIORITY_LABEL[p]} priority`}>
          <span className="priority-dot" aria-hidden="true" /> {PRIORITY_LABEL[p]}
        </button>
      ))}
      <span className="bulk-sep" />
      <button type="button" className="bulk-button bulk-button--danger" onClick={onDelete}>
        <IconTrash size={16} /> Delete
      </button>
      <button type="button" className="icon-button icon-button--sm bulk-close" onClick={onClear} aria-label="Clear selection">
        <IconClose size={16} />
      </button>
    </motion.div>
  )
}
