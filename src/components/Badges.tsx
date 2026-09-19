import { dueStatus, formatDue } from '../lib/dates'
import { IconCalendar } from './Icons'

export function DueBadge({ date, completed = false }: { date: string; completed?: boolean }) {
  const status = completed ? 'done' : dueStatus(date)
  return (
    <span className="badge badge--due" data-status={status}>
      <IconCalendar size={13} />
      {formatDue(date)}
    </span>
  )
}

export function TagChip({
  tag,
  active = false,
  onClick,
}: {
  tag: string
  active?: boolean
  onClick?: () => void
}) {
  if (!onClick) return <span className="badge badge--tag">#{tag}</span>
  return (
    <button
      type="button"
      className="badge badge--tag badge--button"
      aria-pressed={active}
      onClick={onClick}
    >
      #{tag}
    </button>
  )
}
