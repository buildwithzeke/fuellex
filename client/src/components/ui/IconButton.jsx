import { cx } from '../../lib/format'

/** .icon-btn from the mockup — square ghost icon action. */
export default function IconButton({ label, size = 40, className, ...rest }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx(
        'grid place-items-center rounded-[12px] border border-border bg-surface text-text-2 transition-all duration-200 hover:border-primary hover:bg-primary-soft hover:text-primary active:scale-95',
        className
      )}
      style={{ width: size, height: size }}
      {...rest}
    />
  )
}
