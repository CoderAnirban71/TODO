import { motion } from 'motion/react'
import { PRIORITIES, PRIORITY_LABEL, type Priority } from '../types'

interface Props {
  value: Priority
  onChange: (p: Priority) => void
  name: string
  label?: string
  compact?: boolean
}

/** Three-way radio group rendered as coloured swatches. The colour is the priority. */
export function PrioritySelect({ value, onChange, name, label = 'Priority', compact = false }: Props) {
  return (
    <fieldset className={`priority-select${compact ? ' priority-select--compact' : ''}`}>
      <legend className="visually-hidden">{label}</legend>
      {PRIORITIES.map((p) => {
        const checked = value === p
        return (
          <label key={p} className={`priority-option priority-option--${p}`} data-checked={checked}>
            <input
              type="radio"
              name={name}
              value={p}
              checked={checked}
              onChange={() => onChange(p)}
              className="visually-hidden"
            />
            {checked && (
              <motion.span
                layoutId={`${name}-pill`}
                className="priority-option-bg"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="priority-dot" aria-hidden="true" />
            <span className="priority-text">{PRIORITY_LABEL[p]}</span>
          </label>
        )
      })}
    </fieldset>
  )
}
