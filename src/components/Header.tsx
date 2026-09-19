import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { Counts } from '../lib/filter'
import { useCountUp } from '../hooks/useCountUp'
import { IconCommand, IconMoon, IconSun } from './Icons'

interface Props {
  counts: Counts
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onOpenPalette: () => void
}

function greeting(hour = new Date().getHours()) {
  if (hour < 5) return 'Still up'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function headline({ total, completed, pending, overdue }: Counts) {
  if (total === 0) return 'A clean slate.'
  if (pending === 0) return `All ${total} done. Take a bow.`
  if (overdue > 0) return `${pending} to do, ${overdue} overdue.`
  if (completed === 0) return `${pending} ${pending === 1 ? 'thing' : 'things'} to do.`
  return `${pending} to do, ${completed} done.`
}

/** Splits a sentence into word spans that stagger in whenever the sentence changes. */
function AnimatedSentence({ text }: { text: string }) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={text} className="headline-line">
        <span className="visually-hidden">{text}</span>
        {words.map((w, i) => (
          <motion.span
            key={`${w}-${i}`}
            className="headline-word"
            aria-hidden="true"
            initial={reduce ? false : { y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: '-60%', opacity: 0, transition: { duration: 0.18, delay: 0 } }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1], delay: i * 0.04 }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'high' }) {
  const shown = useCountUp(value)
  return (
    <div className="stat" data-tone={tone}>
      <span className="stat-value">{shown}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

const R = 34
const C = 2 * Math.PI * R

export function Header({ counts, theme, onToggleTheme, onOpenPalette }: Props) {
  const pct = counts.total ? counts.completed / counts.total : 0
  const pctShown = useCountUp(Math.round(pct * 100))

  return (
    <header className="header">
      <div className="brand-row">
        <span className="brand">
          <span className="brand-mark" aria-hidden="true" />
          FocusList
        </span>
        <div className="brand-actions">
          <button type="button" className="chip-button" onClick={onOpenPalette} aria-label="Open command palette">
            <IconCommand size={14} />
            <span className="chip-button-text">Commands</span>
            <kbd>⌘K</kbd>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                className="icon-swap"
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.25 }}
              >
                {theme === 'dark' ? <IconSun /> : <IconMoon />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <div className="hero">
        <h1 className="headline">
          <span className="headline-line">
            <span className="headline-word">{greeting()}.</span>
          </span>
          <AnimatedSentence text={headline(counts)} />
        </h1>

        <div className="ring" role="img" aria-label={`${pctShown}% of tasks complete`}>
          <svg viewBox="0 0 80 80" width="88" height="88">
            <circle className="ring-track" cx="40" cy="40" r={R} />
            <motion.circle
              className="ring-fill"
              cx="40"
              cy="40"
              r={R}
              strokeDasharray={C}
              initial={false}
              animate={{ strokeDashoffset: C * (1 - pct) }}
              transition={{ type: 'spring', stiffness: 60, damping: 18 }}
            />
          </svg>
          <span className="ring-label">
            {pctShown}
            <small>%</small>
          </span>
        </div>
      </div>

      <div className="stats" role="status" aria-live="polite" aria-atomic="true">
        <Stat label="Total Tasks" value={counts.total} />
        <Stat label="Completed Tasks" value={counts.completed} />
        <Stat label="Pending Tasks" value={counts.pending} />
        <Stat label="Overdue" value={counts.overdue} tone={counts.overdue ? 'high' : undefined} />
      </div>
    </header>
  )
}
