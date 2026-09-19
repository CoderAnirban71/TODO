import type { Priority, TaskDraft } from '../types'
import { resolveNaturalDate } from './dates'

const PRIORITY_TOKENS: Record<string, Priority> = {
  '!high': 'high',
  '!h': 'high',
  '!urgent': 'high',
  '!medium': 'medium',
  '!med': 'medium',
  '!m': 'medium',
  '!low': 'low',
  '!l': 'low',
}

export interface ParsedQuickAdd extends TaskDraft {
  /** Title with the parsed tokens removed */
  title: string
  matched: { priority: boolean; due: boolean; tags: string[] }
}

/**
 * Parses quick-add syntax:
 *   "Ship the demo !high #work tomorrow"
 * -> title "Ship the demo", priority high, tag "work", due tomorrow.
 */
export function parseQuickAdd(input: string, fallbackPriority: Priority): ParsedQuickAdd {
  const words = input.trim().split(/\s+/)
  const kept: string[] = []
  const tags: string[] = []
  let priority: Priority | null = null
  let dueDate: string | null = null

  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    const lower = w.toLowerCase()

    if (lower in PRIORITY_TOKENS) {
      priority = PRIORITY_TOKENS[lower]
      continue
    }
    if (w.startsWith('#') && w.length > 1) {
      tags.push(w.slice(1).toLowerCase())
      continue
    }
    if (lower === 'next' && words[i + 1]?.toLowerCase() === 'week') {
      dueDate = resolveNaturalDate('nextweek')
      i++
      continue
    }
    if (lower.startsWith('@')) {
      const d = resolveNaturalDate(lower.slice(1))
      if (d) {
        dueDate = d
        continue
      }
    }
    const natural = resolveNaturalDate(lower)
    if (natural && (lower === 'today' || lower === 'tomorrow' || /^\d{4}-\d{2}-\d{2}$/.test(lower))) {
      dueDate = natural
      continue
    }
    kept.push(w)
  }

  return {
    title: kept.join(' ').trim(),
    priority: priority ?? fallbackPriority,
    dueDate,
    tags: Array.from(new Set(tags)),
    notes: '',
    matched: { priority: priority !== null, due: dueDate !== null, tags },
  }
}
