import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { Task } from '../types'
import { PRIORITY_LABEL } from '../types'
import { IconCheck, IconClose, IconPause, IconPlay } from './Icons'

interface Props {
  task: Task
  onClose: () => void
  onComplete: (id: string) => void
}

const PRESETS = [
  { label: '15 min', seconds: 15 * 60 },
  { label: '25 min', seconds: 25 * 60 },
  { label: '45 min', seconds: 45 * 60 },
]

const R = 120
const C = 2 * Math.PI * R

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

/** Full-screen Pomodoro timer for a single task. */
export function FocusMode({ task, onClose, onComplete }: Props) {
  const [total, setTotal] = useState(PRESETS[1].seconds)
  const [left, setLeft] = useState(PRESETS[1].seconds)
  const [running, setRunning] = useState(true)
  const [finished, setFinished] = useState(false)
  const endAt = useRef<number>(Date.now() + total * 1000)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const prev = document.title
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    if (!running || finished) return
    endAt.current = Date.now() + left * 1000
    const id = window.setInterval(() => {
      const remaining = Math.max(0, Math.round((endAt.current - Date.now()) / 1000))
      setLeft(remaining)
      document.title = `${fmt(remaining)} · ${task.title}`
      if (remaining === 0) {
        setRunning(false)
        setFinished(true)
        document.title = `Done · ${task.title}`
      }
    }, 250)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, finished])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault()
        setRunning((r) => !r && !finished)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, finished])

  function choose(seconds: number) {
    setTotal(seconds)
    setLeft(seconds)
    setFinished(false)
    setRunning(true)
  }

  const remaining = left / total

  return (
    <motion.div
      className="focus"
      data-priority={task.priority}
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="focus-inner"
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        <button ref={closeRef} type="button" className="icon-button focus-close" onClick={onClose} aria-label="Leave focus mode">
          <IconClose />
        </button>

        <p className="focus-kicker">
          <span className="priority-dot" aria-hidden="true" /> {PRIORITY_LABEL[task.priority]} priority
        </p>
        <h2 id="focus-title" className="focus-title">
          {task.title}
        </h2>

        <div className="focus-dial" data-running={running} data-finished={finished}>
          <svg viewBox="0 0 280 280" width="280" height="280" aria-hidden="true">
            <circle className="focus-track" cx="140" cy="140" r={R} />
            <motion.circle
              className="focus-fill"
              cx="140"
              cy="140"
              r={R}
              strokeDasharray={C}
              animate={{ strokeDashoffset: C * (1 - remaining) }}
              transition={{ duration: 0.3, ease: 'linear' }}
            />
          </svg>
          <div className="focus-time" aria-live="off">
            <span className="focus-clock">{finished ? 'Done' : fmt(left)}</span>
            <span className="focus-sub">{finished ? 'Session complete' : running ? 'Stay with it' : 'Paused'}</span>
          </div>
        </div>
        <p className="visually-hidden" aria-live="polite">
          {finished ? 'Focus session complete' : running ? 'Timer running' : 'Timer paused'}
        </p>

        <div className="focus-presets" role="group" aria-label="Session length">
          {PRESETS.map((p) => (
            <button key={p.seconds} type="button" className="chip-button" aria-pressed={total === p.seconds} onClick={() => choose(p.seconds)}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="focus-actions">
          {!finished && (
            <button type="button" className="button button--ghost button--lg" onClick={() => setRunning((r) => !r)}>
              {running ? <IconPause /> : <IconPlay />}
              {running ? 'Pause' : 'Resume'}
            </button>
          )}
          <button
            type="button"
            className="button button--primary button--lg"
            onClick={() => {
              onComplete(task.id)
              onClose()
            }}
          >
            <IconCheck /> Mark done
          </button>
        </div>
        <p className="focus-hint">Space to pause · Esc to leave</p>
      </motion.div>
    </motion.div>
  )
}
