import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/** Animates a number from its previous value to `target` over `duration` ms. */
export function useCountUp(target: number, duration = 600): number {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)

  useEffect(() => {
    if (reduce) {
      setValue(target)
      fromRef.current = target
      return
    }
    const from = fromRef.current
    if (from === target) return
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, reduce])

  return value
}
