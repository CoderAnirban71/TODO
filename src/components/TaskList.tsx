import { AnimatePresence, motion } from 'motion/react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from './dndModifiers'
import type { Task } from '../types'
import { TaskItem, type TaskItemProps } from './TaskItem'
import { EmptyState } from './EmptyState'

type ItemHandlers = Pick<TaskItemProps, 'onToggle' | 'onUpdate' | 'onRemove' | 'onFocus' | 'onSelect' | 'onTagClick'>

interface Props extends ItemHandlers {
  tasks: Task[]
  totalCount: number
  filtered: boolean
  manualOrder: boolean
  selected: Set<string>
  onReorder: (activeId: string, overId: string) => void
  onClearFilters: () => void
}

export function TaskList({
  tasks,
  totalCount,
  filtered,
  manualOrder,
  selected,
  onReorder,
  onClearFilters,
  ...handlers
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function onDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) onReorder(String(active.id), String(over.id))
  }

  if (totalCount === 0) return <EmptyState kind="empty" />
  if (tasks.length === 0 && filtered) return <EmptyState kind="no-match" onClear={onClearFilters} />

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <motion.ul className="task-list" aria-label="Tasks" layout>
          <AnimatePresence initial={false}>
            {tasks.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                draggable={manualOrder}
                selectable={selected.size > 0}
                selected={selected.has(t.id)}
                {...handlers}
              />
            ))}
          </AnimatePresence>
        </motion.ul>
      </SortableContext>
    </DndContext>
  )
}
