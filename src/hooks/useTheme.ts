import { useCallback, useEffect } from 'react'
import { usePersistentState } from './usePersistentState'

export type Theme = 'light' | 'dark'

const isTheme = (v: unknown): v is Theme => v === 'light' || v === 'dark'

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = usePersistentState<Theme>('focuslist.theme', systemTheme(), isTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [setTheme])
  return { theme, toggle }
}
