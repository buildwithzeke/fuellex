import { cx } from '../../lib/format'

const TONES = {
  // .tag-fuel
  fuel: 'bg-primary-soft text-primary',
  // .tag-avail
  avail: 'bg-success-soft text-success',
  // .tag-oos
  oos: 'bg-danger-soft text-danger',
  // .tag-price
  price: 'bg-warning-soft text-warning-ink',
  // .tag (neutral)
  neutral: 'bg-surface text-text-2 ring-1 ring-inset ring-border',
  // .tag (brand outline, e.g. active filter chip)
  brand: 'bg-primary-soft text-primary ring-1 ring-inset ring-primary/40',
}

const DOT = { avail: 'bg-success', oos: 'bg-danger', fuel: 'bg-primary' }

/** .tag from the mockup — tiny pill for fuel type / availability / price. */
export default function Tag({ tone = 'neutral', dot = false, className, children, ...rest }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold',
        TONES[tone],
        className
      )}
      {...rest}
    >
      {dot && DOT[tone] && <span className={cx('h-1.5 w-1.5 rounded-full', DOT[tone])} />}
      {children}
    </span>
  )
}
