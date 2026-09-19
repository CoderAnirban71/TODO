import { useCallback, useEffect, useReducer } from 'react'
import type { Priority, Task, TaskDraft } from '../types'
import { createId } from '../utils/id'
import { loadTasks, saveTasks } from '../services/storage'

type Patch = Partial<Omit<Task, 'id' | 'createdAt'>>

type Action =
  | { type: 'add'; draft: TaskDraft }
  | { type: 'toggle'; id: string }
  | { type: 'update'; id: string; patch: Patch }
  | { type: 'remove'; id: string }
  | { type: 'restore'; task: Task }
  | { type: 'clearCompleted' }
  | { type: 'reorder'; activeId: string; overId: string }
  | { type: 'replaceAll'; tasks: Task[] }
  | { type: 'completeMany'; ids: string[]; completed: boolean }
  | { type: 'removeMany'; ids: string[] }
  | { type: 'setPriorityMany'; ids: string[]; priority: Priority }

function nextOrder(tasks: Task[]): number {
  return tasks.reduce((min, t) => Math.min(min, t.order), 0) - 1
}

function reducer(tasks: Task[], action: Action): Task[] {
  switch (action.type) {
    case 'add': {
      const { draft } = action
      const task: Task = {
        id: createId(),
        title: draft.title,
        notes: draft.notes ?? '',
        priority: draft.priority,
        completed: false,
        createdAt: Date.now(),
        completedAt: null,
        dueDate: draft.dueDate ?? null,
        tags: draft.tags ?? [],
        order: nextOrder(tasks),
      }
      return [task, ...tasks]
    }
    case 'toggle':
      return tasks.map((t) =>
        t.id === action.id
          ? { ...t, completed: !t.completed, completedAt: t.completed ? null : Date.now() }
          : t,
      )
    case 'update':
      return tasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t))
    case 'remove':
      return tasks.filter((t) => t.id !== action.id)
    case 'restore':
      return tasks.some((t) => t.id === action.task.id) ? tasks : [action.task, ...tasks]
    case 'clearCompleted':
      return tasks.filter((t) => !t.completed)
    case 'reorder': {
      const sorted = [...tasks].sort((a, b) => a.order - b.order)
      const from = sorted.findIndex((t) => t.id === action.activeId)
      const to = sorted.findIndex((t) => t.id === action.overId)
      if (from < 0 || to < 0 || from === to) return tasks
      const [moved] = sorted.splice(from, 1)
      sorted.splice(to, 0, moved)
      const orderById = new Map(sorted.map((t, i) => [t.id, i]))
      return tasks.map((t) => ({ ...t, order: orderById.get(t.id) ?? t.order }))
    }
    case 'replaceAll':
      return action.tasks
    case 'completeMany': {
      const ids = new Set(action.ids)
      return tasks.map((t) =>
        ids.has(t.id)
          ? { ...t, completed: action.completed, completedAt: action.completed ? Date.now() : null }
          : t,
      )
    }
    case 'removeMany': {
      const ids = new Set(action.ids)
      return tasks.filter((t) => !ids.has(t.id))
    }
    case 'setPriorityMany': {
      const ids = new Set(action.ids)
      return tasks.map((t) => (ids.has(t.id) ? { ...t, priority: action.priority } : t))
    }
  }
}

/** Owns the task list: state, persistence, and every action the UI can take. */
export function useTasks() {
  const [tasks, dispatch] = useReducer(reducer, undefined, loadTasks)

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const addTask = useCallback((draft: TaskDraft) => {
    const title = draft.title.trim()
    if (title) dispatch({ type: 'add', draft: { ...draft, title } })
  }, [])
  const toggleTask = useCallback((id: string) => dispatch({ type: 'toggle', id }), [])
  const updateTask = useCallback((id: string, patch: Patch) => {
    if (typeof patch.title === 'string' && !patch.title.trim()) return
    dispatch({ type: 'update', id, patch: patch.title ? { ...patch, title: patch.title.trim() } : patch })
  }, [])
  const removeTask = useCallback((id: string) => dispatch({ type: 'remove', id }), [])
  const restoreTask = useCallback((task: Task) => dispatch({ type: 'restore', task }), [])
  const clearCompleted = useCallback(() => dispatch({ type: 'clearCompleted' }), [])
  const reorderTasks = useCallback(
    (activeId: string, overId: string) => dispatch({ type: 'reorder', activeId, overId }),
    [],
  )
  const replaceAll = useCallback((next: Task[]) => dispatch({ type: 'replaceAll', tasks: next }), [])
  const completeMany = useCallback(
    (ids: string[], completed: boolean) => dispatch({ type: 'completeMany', ids, completed }),
    [],
  )
  const removeMany = useCallback((ids: string[]) => dispatch({ type: 'removeMany', ids }), [])
  const setPriorityMany = useCallback(
    (ids: string[], priority: Priority) => dispatch({ type: 'setPriorityMany', ids, priority }),
    [],
  )

  return {
    tasks,
    addTask,
    toggleTask,
    updateTask,
    removeTask,
    restoreTask,
    clearCompleted,
    reorderTasks,
    replaceAll,
    completeMany,
    removeMany,
    setPriorityMany,
  }
}

export type TaskActions = Omit<ReturnType<typeof useTasks>, 'tasks'>
