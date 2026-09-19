import type { Modifier } from '@dnd-kit/core'

/** Keeps a dragged list item on its vertical axis. */
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 })
