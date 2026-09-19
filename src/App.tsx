import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, useReducedMotion } from 'motion/react'
import { Aurora } from './components/Aurora'
import { BulkBar } from './components/BulkBar'
import type { Command } from './components/CommandPalette'
import { Composer, type ComposerHandle } from './components/Composer'
import { Header } from './components/Header'
import { TaskList } from './components/TaskList'
import { Toast, type ToastData } from './components/Toast'
import { Toolbar } from './components/Toolbar'
import {
  IconBoard,
  IconCheck,
  IconDownload,
  IconKeyboard,
  IconList,
  IconMoon,
  IconSearch,
  IconSparkle,
  IconSun,
  IconTrash,
  IconUpload,
} from './components/Icons'
import { useHotkeys, type Hotkey } from './hooks/useHotkeys'
import { usePersistentState } from './hooks/usePersistentState'
import { useTasks } from './hooks/useTasks'
import { useTheme } from './hooks/useTheme'
import { todayISO } from './utils/dates'
import { DEFAULT_FILTERS, allTags, countTasks, filterTasks, isFiltered, type Filters } from './utils/filter'
import { exportTasks, importTasks } from './services/storage'
import type { Priority, ViewMode } from './types'

const isView = (v: unknown): v is ViewMode => v === 'list' || v === 'board'

// Rarely-visited surfaces load on demand to keep the first paint light.
const BoardView = lazy(() => import('./components/BoardView').then((m) => ({ default: m.BoardView })))
const CommandPalette = lazy(() => import('./components/CommandPalette').then((m) => ({ default: m.CommandPalette })))
const FocusMode = lazy(() => import('./components/FocusMode').then((m) => ({ default: m.FocusMode })))
const ShortcutsHelp = lazy(() => import('./components/ShortcutsHelp').then((m) => ({ default: m.ShortcutsHelp })))

export default function App() {
  const t = useTasks()
  const { theme, toggle: toggleTheme } = useTheme()
  const reduce = useReducedMotion()

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [view, setView] = usePersistentState<ViewMode>('focuslist.view', 'list', isView)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [focusId, setFocusId] = useState<string | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  const composerRef = useRef<ComposerHandle>(null)
  const confettiRef = useRef<HTMLCanvasElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const today = todayISO()
  const counts = useMemo(() => countTasks(t.tasks, today), [t.tasks, today])
  const visible = useMemo(() => filterTasks(t.tasks, filters), [t.tasks, filters])
  const tags = useMemo(() => allTags(t.tasks), [t.tasks])
  const focusTask = focusId ? t.tasks.find((x) => x.id === focusId) ?? null : null

  const showToast = useCallback((data: Omit<ToastData, 'id'>) => setToast({ id: Date.now(), ...data }), [])
  const dismissToast = useCallback(() => setToast(null), [])

  // Celebrate when the last pending task is completed.
  const prevPending = useRef(counts.pending)
  useEffect(() => {
    if (prevPending.current > 0 && counts.pending === 0 && counts.total > 0 && !reduce) {
      const colors = theme === 'dark' ? ['#f0595d', '#f0a232', '#41a893', '#e8eaee'] : ['#d93a3e', '#e0900f', '#2a8c7a', '#17191f']
      void import('canvas-confetti').then(({ default: confetti }) => {
        const canvas = confettiRef.current
        const fire = canvas ? confetti.create(canvas, { resize: true, useWorker: true }) : confetti
        fire({ particleCount: 90, spread: 70, origin: { y: 0.3 }, colors })
        window.setTimeout(() => fire({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.5 }, colors }), 200)
        window.setTimeout(() => fire({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.5 }, colors }), 350)
      })
    }
    prevPending.current = counts.pending
  }, [counts.pending, counts.total, reduce, theme])

  // Selection is stored as ids; only ids that still exist count.
  const liveSelected = useMemo(() => {
    const ids = new Set(t.tasks.map((x) => x.id))
    return new Set([...selected].filter((id) => ids.has(id)))
  }, [selected, t.tasks])

  const removeWithUndo = useCallback(
    (id: string) => {
      const task = t.tasks.find((x) => x.id === id)
      if (!task) return
      t.removeTask(id)
      showToast({ message: `Deleted "${task.title}"`, actionLabel: 'Undo', onAction: () => t.restoreTask(task) })
    },
    [t, showToast],
  )

  const toggleSelect = useCallback((id: string) => {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const doExport = useCallback(() => {
    const blob = new Blob([exportTasks(t.tasks)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `focuslist-${today}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast({ message: `Exported ${t.tasks.length} tasks` })
  }, [t.tasks, today, showToast])

  const onImportFile = useCallback(
    async (file: File) => {
      try {
        const imported = importTasks(await file.text())
        const existing = new Set(t.tasks.map((x) => x.id))
        const fresh = imported.filter((x) => !existing.has(x.id))
        t.replaceAll([...fresh, ...t.tasks])
        showToast({ message: `Imported ${fresh.length} new ${fresh.length === 1 ? 'task' : 'tasks'}` })
      } catch (err) {
        showToast({ message: err instanceof Error ? err.message : 'Could not read that file' })
      }
    },
    [t, showToast],
  )

  const setPriority = useCallback((id: string, priority: Priority) => t.updateTask(id, { priority }), [t])

  const commands = useMemo<Command[]>(
    () => [
      { id: 'new', label: 'New task', shortcut: 'N', icon: <IconSparkle size={16} />, run: () => composerRef.current?.focus() },
      { id: 'search', label: 'Search tasks', shortcut: '/', icon: <IconSearch size={16} />, run: () => searchRef.current?.focus() },
      {
        id: 'view',
        label: view === 'list' ? 'Switch to board view' : 'Switch to list view',
        shortcut: 'V',
        icon: view === 'list' ? <IconBoard size={16} /> : <IconList size={16} />,
        run: () => setView(view === 'list' ? 'board' : 'list'),
      },
      {
        id: 'theme',
        label: theme === 'dark' ? 'Use light theme' : 'Use dark theme',
        shortcut: 'T',
        icon: theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />,
        run: toggleTheme,
      },
      {
        id: 'complete-all',
        label: 'Mark all visible tasks done',
        hint: `${visible.filter((x) => !x.completed).length} tasks`,
        icon: <IconCheck size={16} />,
        run: () => t.completeMany(visible.filter((x) => !x.completed).map((x) => x.id), true),
      },
      {
        id: 'clear-completed',
        label: 'Clear completed tasks',
        hint: `${counts.completed} tasks`,
        icon: <IconTrash size={16} />,
        run: () => {
          const removed = t.tasks.filter((x) => x.completed)
          t.clearCompleted()
          if (removed.length)
            showToast({
              message: `Cleared ${removed.length} completed`,
              actionLabel: 'Undo',
              onAction: () => removed.forEach(t.restoreTask),
            })
        },
      },
      { id: 'export', label: 'Export tasks as JSON', icon: <IconDownload size={16} />, run: doExport },
      { id: 'import', label: 'Import tasks from JSON', icon: <IconUpload size={16} />, run: () => fileRef.current?.click() },
      { id: 'help', label: 'Keyboard shortcuts', shortcut: '?', icon: <IconKeyboard size={16} />, run: () => setHelpOpen(true) },
    ],
    [view, theme, visible, counts.completed, t, toggleTheme, setView, doExport, showToast],
  )

  const hotkeys = useMemo<Hotkey[]>(
    () => [
      { combo: 'mod+k', global: true, handler: (e) => { e.preventDefault(); setPaletteOpen((o) => !o) } },
      { combo: 'Escape', global: true, handler: () => { setPaletteOpen(false); setHelpOpen(false); setSelected(new Set()) } },
      { combo: 'n', handler: (e) => { e.preventDefault(); composerRef.current?.focus() } },
      { combo: '/', handler: (e) => { e.preventDefault(); searchRef.current?.focus() } },
      { combo: 'v', handler: () => setView((v) => (v === 'list' ? 'board' : 'list')) },
      { combo: 't', handler: toggleTheme },
      { combo: 'shift+?', handler: () => setHelpOpen(true) },
    ],
    [toggleTheme, setView],
  )
  useHotkeys(hotkeys)

  const overlayOpen = paletteOpen || helpOpen || Boolean(focusTask)
  useEffect(() => {
    document.body.style.overflow = overlayOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [overlayOpen])

  return (
    <LayoutGroup>
      <Aurora />
      <main className="app" aria-hidden={overlayOpen || undefined}>
        <Header counts={counts} theme={theme} onToggleTheme={toggleTheme} onOpenPalette={() => setPaletteOpen(true)} />
        <Composer ref={composerRef} onAdd={t.addTask} knownTags={tags} />

        <section className="list-section" aria-labelledby="list-heading">
          <h2 id="list-heading" className="visually-hidden">
            Task list
          </h2>
          <Toolbar ref={searchRef} filters={filters} onChange={setFilters} counts={counts} tags={tags} view={view} onViewChange={setView} />

          {view === 'list' ? (
            <TaskList
              tasks={visible}
              totalCount={counts.total}
              filtered={isFiltered(filters)}
              manualOrder={filters.sort === 'manual'}
              selected={liveSelected}
              onReorder={t.reorderTasks}
              onClearFilters={() => setFilters({ ...DEFAULT_FILTERS, sort: filters.sort })}
              onToggle={t.toggleTask}
              onUpdate={t.updateTask}
              onRemove={removeWithUndo}
              onFocus={setFocusId}
              onSelect={toggleSelect}
              onTagClick={(tag) => setFilters((f) => ({ ...f, tag: f.tag === tag ? null : tag }))}
            />
          ) : (
            <Suspense fallback={<p className="list-footer-hint">Loading board…</p>}>
              <BoardView tasks={visible} onToggle={t.toggleTask} onRemove={removeWithUndo} onFocus={setFocusId} onSetPriority={setPriority} />
            </Suspense>
          )}

          {counts.total > 0 && view === 'list' && (
            <div className="list-footer">
              <p className="list-footer-hint">
                {liveSelected.size === 0 ? 'Ctrl + click a task to select several.' : `${liveSelected.size} selected`}
              </p>
              {counts.completed > 0 && (
                <button type="button" className="button button--ghost" onClick={() => commands.find((c) => c.id === 'clear-completed')?.run()}>
                  Clear {counts.completed} completed
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void onImportFile(f)
          e.target.value = ''
        }}
      />

      <AnimatePresence>
        {liveSelected.size > 0 && (
          <BulkBar
            key="bulk"
            count={liveSelected.size}
            onComplete={() => { t.completeMany([...liveSelected], true); setSelected(new Set()) }}
            onDelete={() => {
              const ids = [...liveSelected]
              const removed = t.tasks.filter((x) => ids.includes(x.id))
              t.removeMany(ids)
              setSelected(new Set())
              showToast({ message: `Deleted ${ids.length} tasks`, actionLabel: 'Undo', onAction: () => removed.forEach(t.restoreTask) })
            }}
            onPriority={(p) => t.setPriorityMany([...liveSelected], p)}
            onClear={() => setSelected(new Set())}
          />
        )}
      </AnimatePresence>

      <Toast toast={toast} onDismiss={dismissToast} />
      <canvas ref={confettiRef} className="confetti-canvas" aria-hidden="true" />

      <Suspense fallback={null}>
        <AnimatePresence>
          {paletteOpen && <CommandPalette key="palette" commands={commands} onClose={() => setPaletteOpen(false)} />}
          {helpOpen && <ShortcutsHelp key="help" onClose={() => setHelpOpen(false)} />}
          {focusTask && (
            <FocusMode key="focus" task={focusTask} onClose={() => setFocusId(null)} onComplete={(id) => t.updateTask(id, { completed: true, completedAt: Date.now() })} />
          )}
        </AnimatePresence>
      </Suspense>
    </LayoutGroup>
  )
}
