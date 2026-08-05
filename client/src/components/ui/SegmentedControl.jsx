import { cx } from '../../lib/format'

const ACTIVE = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
}

/** .seg from the mockup — a segmented control for single-choice options. */
export default function SegmentedControl({
  options,
  value,
  onChange,
  activeTone = 'primary',
  className,
  size = 'md',
}) {
  return (
    <div className={cx('flex overflow-hidden rounded-[12px] border-[1.5px] border-border bg-surface', className)}>
      {options.map((option, index) => {
        const label = typeof option === 'string' ? option : option.label
        const optionValue = typeof option === 'string' ? option : option.value
        const isActive = optionValue === value
        return (
          <button
            key={optionValue}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(optionValue)}
            className={cx(
              'flex-1 cursor-pointer border-border font-sans font-semibold text-text-2 transition-all duration-150',
              size === 'lg' ? 'px-2 py-3 text-sm' : 'px-2 py-[10px] text-[13.5px]',
              index > 0 && 'border-l-[1px]',
              isActive && ACTIVE[activeTone],
              !isActive && 'hover:bg-bg'
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
