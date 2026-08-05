import { cx } from '../../lib/format'
import Card from '../ui/Card'

/** .chart-bars from the mockup — a lightweight 7-day bar chart (no chart lib). */
export default function PriceChart({ data, labels, title, badge, className }) {
  const values = data.map((d) => (typeof d === 'number' ? d : d.value))
  const max = Math.max(...values, 1)

  return (
    <Card className={cx('p-[18px]', className)}>
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-sm font-extrabold text-text">{title}</h3>
        {badge && <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-bold text-primary">{badge}</span>}
      </div>
      <div className="flex h-[90px] items-end gap-2">
        {data.map((d, i) => {
          const bad = typeof d === 'object' && d.bad
          const height = ((typeof d === 'number' ? d : d.value) / max) * 100
          return (
            <span
              key={i}
              className={cx(
                'flex-1 rounded-t-md transition-opacity hover:opacity-100',
                bad ? 'bg-gradient-to-t from-danger to-[#FCA5A5]' : 'bg-gradient-to-t from-primary to-[#93C5FD]',
                bad ? 'opacity-85' : 'opacity-85'
              )}
              style={{ height: `${Math.max(height, 6)}%` }}
              title={typeof d === 'object' ? d.tooltip : String(d)}
            />
          )
        })}
      </div>
      {labels && (
        <div className="mt-1.5 flex gap-2 text-[10.5px] text-text-3">
          {labels.map((label, i) => (
            <span key={i} className="flex-1 text-center">
              {label}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}
