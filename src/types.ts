export type Priority = 'high' | 'medium' | 'low'

export type StatusFilter = 'all' | 'active' | 'completed'

export type PriorityFilter = Priority | 'all'

export type SortMode = 'smart' | 'manual' | 'due' | 'created' | 'alpha'

export type ViewMode = 'list' | 'board'

export interface Task {
  id: string
  title: string
  notes: string
  priority: Priority
  completed: boolean
  createdAt: number
  completedAt: number | null
  /** ISO date (YYYY-MM-DD) or null */
  dueDate: string | null
  tags: string[]
  /** Manual ordering position; lower comes first */
  order: number
}

export type TaskDraft = Pick<Task, 'title' | 'priority'> &
  Partial<Pick<Task, 'notes' | 'dueDate' | 'tags'>>

export const PRIORITIES: Priority[] = ['high', 'medium', 'low']

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const SORT_LABEL: Record<SortMode, string> = {
  smart: 'Smart order',
  manual: 'My order',
  due: 'Due date',
  created: 'Newest first',
  alpha: 'A to Z',
}
