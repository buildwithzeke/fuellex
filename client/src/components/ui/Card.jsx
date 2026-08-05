import { cx } from '../../lib/format'

/** .card from the mockup, with an optional .hoverable lift. */
export default function Card({ hoverable = false, className, children, ...rest }) {
  return (
    <div
      className={cx(
        'rounded-[16px] border border-border bg-surface p-5 shadow-sm transition-all duration-200',
        hoverable && 'hover:-translate-y-[3px] hover:border-border-strong hover:shadow-lg',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
