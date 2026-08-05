import { cx } from '../../lib/format'

const ITEMS = [
  { tone: 'green', label: 'Cheapest nearby', color: 'bg-success' },
  { tone: 'blue', label: 'Normal', color: 'bg-primary' },
  { tone: 'orange', label: 'Expensive', color: 'bg-warning' },
  { tone: 'red', label: 'Out of fuel', color: 'bg-danger' },
]

/** .map-legend from the mockup — floating color key. */
export default function MapLegend({ className, items = ITEMS }) {
  return (
    <div
      className={cx(
        'flex flex-col gap-1.5 rounded-[12px] border border-border bg-surface/95 p-2.5 text-[11.5px] text-text-2 shadow-md backdrop-blur-md',
        className
      )}
    >
      {items.map(({ tone, label, color }) => (
        <span key={tone} className="flex items-center gap-2">
          <span
            className={cx(
              'block rotate-[-45deg] rounded-[50%_50%_50%_0] border-[1.5px] border-white shadow-sm',
              color
            )}
            style={{ width: 12, height: 12 }}
          />
          {label}
        </span>
      ))}
    </div>
  )
}
