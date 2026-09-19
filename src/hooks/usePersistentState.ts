import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

/** useState that mirrors to Local Storage. `validate` guards against stale or malformed values. */
export function usePersistentState<T>(
  key: string,
  initial: T,
  validate: (v: unknown) => v is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw)
        if (validate(parsed)) return parsed
      }
    } catch {
      // ignore and use the default
    }
    return initial
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable
    }
  }, [key, value])

  return [value, setValue]
}
