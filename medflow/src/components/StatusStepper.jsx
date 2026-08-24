// Signature element: a "chain of custody" manifest stepper.
// Shows an order's route from placement to delivery, stamped like a
// cold-chain / custody log rather than a generic progress bar.

const STAGES = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
]

export default function StatusStepper({ status, timestamps = {} }) {
  const currentIndex = STAGES.findIndex((s) => s.key === status)
  const activeIndex = status === 'cancelled' ? -1 : currentIndex === -1 ? 0 : currentIndex

  return (
    <div className="stepper">
      {STAGES.map((stage, i) => {
        const done = i < activeIndex || (i === activeIndex && status === 'delivered')
        const current = i === activeIndex && status !== 'delivered'
        return (
          <div key={stage.key} className={`step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
            <div className="line" />
            <div className="mark">{done ? '✓' : i + 1}</div>
            <div className="st-label">{stage.label}</div>
            {timestamps[stage.key] && (
              <div className="st-time">{new Date(timestamps[stage.key]).toLocaleDateString()}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
