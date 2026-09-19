# FocusList

A fast, focused daily to-do app. Frontend-only — everything lives in your browser's Local Storage.

## Features

**Core (per the brief)**
- Add tasks with a title and High / Medium / Low priority — priority is the only colour in the UI, so it's always visible
- Mark done, edit inline (title, priority, due date, tags, notes), delete, clear completed
- Search by title, notes or tag; filter by All / Active / Completed, by priority, and by tag — all combine live
- Live statistics: Total, Completed, Pending and Overdue, an animated progress ring, and a headline that sums up the day
- Persistence across refresh (Local Storage, with schema validation and v1 → v2 migration)

**Beyond the brief**
- **Quick-add syntax** — `Ship the demo !high #work tomorrow` sets priority, tag and due date as you type, with live chips
- **Due dates** with Overdue / Today / Tomorrow / weekday badges
- **Tags** with suggestions, and **notes** that expand in place
- **Board view** — Kanban columns by priority; drag a card between columns to change its priority
- **Drag-and-drop reordering** in "My order" sort, plus Smart / Due date / Newest / A–Z sorts
- **Focus mode** — full-screen Pomodoro timer (15 / 25 / 45 min) for a single task, with a live countdown in the tab title
- **Multi-select** (Ctrl + click) with a bulk bar: complete, re-prioritise or delete many at once
- **Undo** for every destructive action via toast
- **Command palette** (⌘K / Ctrl+K) and keyboard shortcuts (`N` new, `/` search, `V` view, `T` theme, `?` help)
- **Export / import** tasks as JSON
- **Confetti** when the last task is done
- Light and dark themes (system-aware, manual toggle, no flash on load)

**Motion** — aurora background, staggered headline reveal, count-up stats, spring list enter/exit/reorder, animated checkbox with completion burst, animated segmented controls, modal transitions. Everything respects `prefers-reduced-motion`.

**Accessibility** — labelled controls, full keyboard operation, visible focus, live-region stats, dialog semantics for overlays, WCAG AA contrast; 0 axe-core violations in both themes.

## Stack

React 19 · TypeScript · Vite · [motion](https://motion.dev) · [dnd-kit](https://dndkit.com) · canvas-confetti.

```
src/
  App.tsx                     composition, commands, hotkeys, undo, confetti
  components/
    Header.tsx                animated headline, progress ring, stats
    Composer.tsx              quick-add input with parsed chips, date / tag / notes panels
    Toolbar.tsx               search, view switch, status / priority / sort / tag filters
    TaskList.tsx, TaskItem.tsx  sortable list, inline edit, notes, selection
    BoardView.tsx             priority Kanban with drag-between-columns
    FocusMode.tsx             Pomodoro overlay
    CommandPalette.tsx, ShortcutsHelp.tsx, BulkBar.tsx, Toast.tsx, EmptyState.tsx, Aurora.tsx
  hooks/
    useTasks.ts               reducer-based task state + persistence
    useTheme.ts, usePersistentState.ts, useHotkeys.ts, useCountUp.ts
  lib/
    filter.ts                 search / filter / sort / counts (pure)
    quickAdd.ts               "!high #tag tomorrow" parser
    dates.ts                  local-date helpers and natural date words
    storage.ts                validated Local Storage read / write, export / import
  index.css                   design tokens and all styles
```

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build
```

## Deploy

The build is static with relative asset paths, so it works on any static host.

- **Vercel** — import the repo; the Vite preset is detected (`vercel.json` included).
- **Netlify** — import the repo; `netlify.toml` sets the build command and publish folder.
- **GitHub Pages** — enable Pages → "GitHub Actions"; `.github/workflows/deploy.yml` publishes `dist/` on every push to `main`.
- Anything else — `npm run build` and upload `dist/`.
