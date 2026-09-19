import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export interface ToastData {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
}

interface Props {
  toast: ToastData | null
  onDismiss: () => void
}

export function Toast({ toast, onDismiss }: Props) {
  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(onDismiss, 6000)
    return () => window.clearTimeout(id)
  }, [toast, onDismiss])

  return (
    <div className="toast-region" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          >
            <span className="toast-text">{toast.message}</span>
            {toast.actionLabel && toast.onAction && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  toast.onAction?.()
                  onDismiss()
                }}
              >
                {toast.actionLabel}
              </button>
            )}
            <motion.span
              className="toast-timer"
              aria-hidden="true"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 6, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
