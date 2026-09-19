import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS, countTasks, filterTasks } from '../lib/filter'
import type { Task } from '../types'

const make = (over: Partial<Task>): Task => ({
  id: Math.random().toString(36).slice(2),
  title: 'Task',
  notes: '',
  priority: 'medium',
  completed: false,
  createdAt: 1,
  completedAt: null,
  dueDate: null,
  tags: [],
  order: 0,
  ...over,
})

const tasks = [
  make({ title: 'Pay rent', priority: 'high', dueDate: '2020-01-01' }),
  make({ title: 'Buy milk', priority: 'low', tags: ['home'] }),
  make({ title: 'Call mum', completed: true }),
]

describe('filterTasks', () => {
  it('filters by status', () => {
    expect(filterTasks(tasks, { ...DEFAULT_FILTERS, status: 'active' })).toHaveLength(2)
    expect(filterTasks(tasks, { ...DEFAULT_FILTERS, status: 'completed' })).toHaveLength(1)
  })
  it('filters by priority, tag and search', () => {
    expect(filterTasks(tasks, { ...DEFAULT_FILTERS, priority: 'high' })[0].title).toBe('Pay rent')
    expect(filterTasks(tasks, { ...DEFAULT_FILTERS, tag: 'home' })[0].title).toBe('Buy milk')
    expect(filterTasks(tasks, { ...DEFAULT_FILTERS, query: 'MUM' })[0].title).toBe('Call mum')
  })
  it('puts active tasks before completed and high priority first', () => {
    const titles = filterTasks(tasks, DEFAULT_FILTERS).map((t) => t.title)
    expect(titles).toEqual(['Pay rent', 'Buy milk', 'Call mum'])
  })
})

describe('countTasks', () => {
  it('reports totals, pending and overdue', () => {
    expect(countTasks(tasks, '2026-09-19')).toEqual({ total: 3, completed: 1, pending: 2, overdue: 1, dueToday: 0 })
  })
})
