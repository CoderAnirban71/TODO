import { useEffect } from 'react'

export interface Hotkey {
  /** e.g. "n", "/", "?", "mod+k", "Escape" */
  combo: string
  handler: (e: KeyboardEvent) => void
  /** Fire even while typing in an input (default false) */
  global?: boolean
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

function matches(e: KeyboardEvent, combo: string): boolean {
  const parts = combo.toLowerCase().split('+')
  const key = parts[parts.length - 1]
  const needMod = parts.includes('mod')
  const needShift = parts.includes('shift')
  const hasMod = e.ctrlKey || e.metaKey
  if (needMod !== hasMod) return false
  if (needShift && !e.shiftKey) return false
  if (e.altKey) return false
  return e.key.toLowerCase() === key
}

/** Registers app-wide keyboard shortcuts. Non-global keys are ignored while typing. */
export function useHotkeys(hotkeys: Hotkey[]) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      for (const hk of hotkeys) {
        if (!matches(e, hk.combo)) continue
        if (!hk.global && isTyping(e.target)) continue
        hk.handler(e)
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hotkeys])
}
