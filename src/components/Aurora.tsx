/**
 * Ambient background: three slow-drifting blurred blobs in the priority hues.
 * Pure CSS animation; frozen under prefers-reduced-motion.
 */
export function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora-blob aurora-blob--a" />
      <div className="aurora-blob aurora-blob--b" />
      <div className="aurora-blob aurora-blob--c" />
      <div className="aurora-grain" />
    </div>
  )
}
