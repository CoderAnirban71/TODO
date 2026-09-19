import { forwardRef } from 'react'
import { motion } from 'motion/react'
import { PRIORITIES, PRIORITY_LABEL, SORT_LABEL, type PriorityFilter, type SortMode, type StatusFilter, type ViewMode } from '../types'
import type { Counts, Filters } from '../lib/filter'
import { TagChip } from './Badges'
import { IconBoard, IconClose, IconList, IconSearch } from './Icons'

interface Props {
  filters: Filters
  onChange: (next: Filters) => void
  counts: Counts
  tags: string[]
  view: ViewMode
  onViewChange: (v: ViewMode) => void
}

const STATUS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export const Toolbar = forwardRef<HTMLInputElement, Props>(function Toolbar(
  { filters, onChange, counts, tags, view, onViewChange },
  searchRef,
) {
  const countFor: Record<StatusFilter, number> = {
    all: counts.total,
    active: counts.pending,
    completed: counts.completed,
  }

  return (
    <div className="toolbar">
      <div className="toolbar-row">
        <div className="search">
          <IconSearch className="search-icon" />
          <label htmlFor="search" className="visually-hidden">
            Search tasks by title, notes or tag
          </label>
          <input
            ref={searchRef}
            id="search"
            type="search"
            className="search-input"
            placeholder="Search tasks"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            autoComplete="off"
          />
          <kbd className="search-kbd" aria-hidden="true">
            /
          </kbd>
          {filters.query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => onChange({ ...filters, query: '' })}
              aria-label="Clear search"
            >
              <IconClose size={16} />
            </button>
          )}
        </div>

        <div className="segmented segmented--icons" role="group" aria-label="View">
          {(
            [
              ['list', 'List view', <IconList key="l" />],
              ['board', 'Board view', <IconBoard key="b" />],
            ] as const
          ).map(([v, label, icon]) => (
            <button
              key={v}
              type="button"
              className="segmented-item"
              aria-pressed={view === v}
              aria-label={label}
              title={label}
              onClick={() => onViewChange(v)}
            >
              {view === v && (
                <motion.span layoutId="view-pill" className="segmented-pill" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
              )}
              <span className="segmented-content">{icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-row toolbar-row--filters">
        <div className="segmented" role="group" aria-label="Filter by status">
          {STATUS.map((s) => (
            <button
              key={s.value}
              type="button"
              className="segmented-item"
              aria-pressed={filters.status === s.value}
              onClick={() => onChange({ ...filters, status: s.value })}
            >
              {filters.status === s.value && (
                <motion.span layoutId="status-pill" className="segmented-pill" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
              )}
              <span className="segmented-content">
                {s.label}
                <span className="segmented-count">{countFor[s.value]}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="toolbar-selects">
          <label className="select-wrap">
            <span className="visually-hidden">Filter by priority</span>
            <select
              className="select"
              value={filters.priority}
              onChange={(e) => onChange({ ...filters, priority: e.target.value as PriorityFilter })}
            >
              <option value="all">Any priority</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]} priority
                </option>
              ))}
            </select>
          </label>
          <label className="select-wrap">
            <span className="visually-hidden">Sort tasks</span>
            <select
              className="select"
              value={filters.sort}
              onChange={(e) => onChange({ ...filters, sort: e.target.value as SortMode })}
            >
              {(Object.keys(SORT_LABEL) as SortMode[]).map((s) => (
                <option key={s} value={s}>
                  {SORT_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="tag-row" role="group" aria-label="Filter by tag">
          {tags.map((t) => (
            <TagChip
              key={t}
              tag={t}
              active={filters.tag === t}
              onClick={() => onChange({ ...filters, tag: filters.tag === t ? null : t })}
            />
          ))}
        </div>
      )}
    </div>
  )
})
