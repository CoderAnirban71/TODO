import type { Task } from '../types'

export const STORAGE_KEY = 'focuslist.tasks.v2'
const LEGACY_KEY = 'focuslist.tasks.v1'

/** Reads tasks from Local Storage; migrates v1 data; returns [] if empty or malformed. */
export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalise).filter((t): t is Task => t !== null)
  } catch {
    return []
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // Storage may be unavailable (private mode, quota); the app still works in-memory.
  }
}

export function exportTasks(tasks: Task[]): string {
  return JSON.stringify({ app: 'FocusList', version: 2, exportedAt: new Date().toISOString(), tasks }, null, 2)
}

export function importTasks(json: string): Task[] {
  const parsed: unknown = JSON.parse(json)
  const list = Array.isArray(parsed) ? parsed : (parsed as { tasks?: unknown })?.tasks
  if (!Array.isArray(list)) throw new Error('File does not contain a task list')
  return list.map(normalise).filter((t): t is Task => t !== null)
}

/** Accepts v1 or v2 shapes and fills in defaults for missing fields. */
function normalise(value: unknown, index = 0): Task | null {
  if (typeof value !== 'object' || value === null) return null
  const t = value as Record<string, unknown>
  if (typeof t.id !== 'string' || typeof t.title !== 'string') return null
  const priority = t.priority === 'high' || t.priority === 'medium' || t.priority === 'low' ? t.priority : 'medium'
  return {
    id: t.id,
    title: t.title,
    notes: typeof t.notes === 'string' ? t.notes : '',
    priority,
    completed: Boolean(t.completed),
    createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
    completedAt: typeof t.completedAt === 'number' ? t.completedAt : null,
    dueDate: typeof t.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate) ? t.dueDate : null,
    tags: Array.isArray(t.tags) ? t.tags.filter((x): x is string => typeof x === 'string') : [],
    order: typeof t.order === 'number' ? t.order : index,
  }
}
