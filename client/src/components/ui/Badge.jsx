import { cx } from '../../lib/format'

/** .count-badge — small brand pill next to a section title. */
export default function Badge({ children, className }) {
  return (
    <span
      className={cx(
        'rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-bold text-primary',
        className
      )}
    >
      {children}
    </span>
  )
}
