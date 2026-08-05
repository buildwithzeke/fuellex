import { forwardRef, useId } from 'react'
import { cx } from '../../lib/format'
import { ChevronDown } from 'lucide-react'

/** .select from the mockup — native select with a custom chevron. */
const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, className, id: idProp, ...rest },
  ref
) {
  const generated = useId()
  const id = idProp || generated

  return (
    <div className={cx('mb-4', className)}>
      {label && (
        <label htmlFor={id} className="mb-[7px] block text-[12.5px] font-bold text-text-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cx(
            'w-full appearance-none rounded-[12px] border-[1.5px] border-border bg-surface py-[13px] pr-10 pl-4 font-sans text-sm text-text transition-all outline-none focus:border-primary focus:ring-4 focus:ring-primary/15',
            error && 'border-danger focus:border-danger focus:ring-danger/10'
          )}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value
            const labelText = typeof option === 'string' ? option : option.label
            return (
              <option key={value} value={value}>
                {labelText}
              </option>
            )
          })}
        </select>
        <ChevronDown
          size={15}
          strokeWidth={2.5}
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-text-2"
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </div>
  )
})

export default Select
