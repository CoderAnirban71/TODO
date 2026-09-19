import { describe, expect, it } from 'vitest'
import { parseQuickAdd } from '../utils/quickAdd'
import { addDays, toISODate } from '../utils/dates'

describe('parseQuickAdd', () => {
  it('extracts priority, tags and due date from inline tokens', () => {
    const r = parseQuickAdd('Ship the demo !high #work tomorrow', 'medium')
    expect(r.title).toBe('Ship the demo')
    expect(r.priority).toBe('high')
    expect(r.tags).toEqual(['work'])
    expect(r.dueDate).toBe(toISODate(addDays(new Date(), 1)))
  })

  it('falls back to the selected priority when no token is present', () => {
    const r = parseQuickAdd('Water plants', 'low')
    expect(r.priority).toBe('low')
    expect(r.matched.priority).toBe(false)
    expect(r.dueDate).toBeNull()
  })

  it('dedupes tags and lowercases them', () => {
    expect(parseQuickAdd('x #Home #home', 'medium').tags).toEqual(['home'])
  })
})
