/** Date helpers. All due dates are local calendar days stored as YYYY-MM-DD. */

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Whole days from today to the given date (negative = past). */
export function daysFromToday(iso: string): number {
  const a = parseISODate(todayISO()).getTime()
  const b = parseISODate(iso).getTime()
  return Math.round((b - a) / 86_400_000)
}

export type DueStatus = 'overdue' | 'today' | 'soon' | 'later'

export function dueStatus(iso: string): DueStatus {
  const n = daysFromToday(iso)
  if (n < 0) return 'overdue'
  if (n === 0) return 'today'
  if (n <= 3) return 'soon'
  return 'later'
}

export function formatDue(iso: string): string {
  const n = daysFromToday(iso)
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  if (n === -1) return 'Yesterday'
  if (n < 0) return `${-n} days overdue`
  if (n <= 6) return parseISODate(iso).toLocaleDateString(undefined, { weekday: 'long' })
  return parseISODate(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/** Resolves natural words like "today", "tomorrow", "friday", "next week" to an ISO date. */
export function resolveNaturalDate(word: string, now = new Date()): string | null {
  const w = word.toLowerCase()
  if (w === 'today' || w === 'tod') return toISODate(now)
  if (w === 'tomorrow' || w === 'tmr' || w === 'tmrw') return toISODate(addDays(now, 1))
  if (w === 'nextweek') return toISODate(addDays(now, 7))
  const idx = WEEKDAYS.findIndex((d) => d === w || d.slice(0, 3) === w)
  if (idx >= 0) {
    let diff = idx - now.getDay()
    if (diff <= 0) diff += 7
    return toISODate(addDays(now, diff))
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(w)) return w
  return null
}
