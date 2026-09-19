import type { PriorityFilter, SortMode, StatusFilter, Task } from '../types'

export interface Filters {
  query: string
  status: StatusFilter
  priority: PriorityFilter
  tag: string | null
  sort: SortMode
}

export const DEFAULT_FILTERS: Filters = {
  query: '',
  status: 'all',
  priority: 'all',
  tag: null,
  sort: 'smart',
}

const RANK = { high: 0, medium: 1, low: 2 } as const

export function isFiltered(f: Filters): boolean {
  return f.query.trim() !== '' || f.status !== 'all' || f.priority !== 'all' || f.tag !== null
}

export function matches(t: Task, { query, status, priority, tag }: Filters): boolean {
  const q = query.trim().toLowerCase()
  if (status === 'active' && t.completed) return false
  if (status === 'completed' && !t.completed) return false
  if (priority !== 'all' && t.priority !== priority) return false
  if (tag && !t.tags.includes(tag)) return false
  if (q) {
    const hay = `${t.title} ${t.notes} ${t.tags.map((x) => '#' + x).join(' ')}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}

function compare(a: Task, b: Task, sort: SortMode): number {
  switch (sort) {
    case 'manual':
      return a.order - b.order
    case 'due':
      if (a.dueDate === b.dueDate) return b.createdAt - a.createdAt
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate < b.dueDate ? -1 : 1
    case 'created':
      return b.createdAt - a.createdAt
    case 'alpha':
      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
    case 'smart':
    default: {
      if (RANK[a.priority] !== RANK[b.priority]) return RANK[a.priority] - RANK[b.priority]
      if (a.dueDate !== b.dueDate) {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate < b.dueDate ? -1 : 1
      }
      return b.createdAt - a.createdAt
    }
  }
}

/** Applies filters then sorts; active tasks always come before completed ones. */
export function filterTasks(tasks: Task[], filters: Filters): Task[] {
  return tasks
    .filter((t) => matches(t, filters))
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return compare(a, b, filters.sort)
    })
}

export interface Counts {
  total: number
  completed: number
  pending: number
  overdue: number
  dueToday: number
}

export function countTasks(tasks: Task[], today: string): Counts {
  let completed = 0
  let overdue = 0
  let dueToday = 0
  for (const t of tasks) {
    if (t.completed) {
      completed++
      continue
    }
    if (t.dueDate) {
      if (t.dueDate < today) overdue++
      else if (t.dueDate === today) dueToday++
    }
  }
  return { total: tasks.length, completed, pending: tasks.length - completed, overdue, dueToday }
}

export function allTags(tasks: Task[]): string[] {
  const set = new Map<string, number>()
  for (const t of tasks) for (const tag of t.tags) set.set(tag, (set.get(tag) ?? 0) + 1)
  return Array.from(set.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag)
}
