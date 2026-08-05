import { forwardRef, useId } from 'react'
import { cx } from '../../lib/format'

const Field = forwardRef(function Field(
  {
    label,
    error,
    hint,
    prefix,
    suffix,
    className,
    inputClassName,
    id: idProp,
    ...rest
  },
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
        {prefix && (
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm font-bold text-text-2">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={cx(
            'w-full rounded-[12px] border-[1.5px] border-border bg-surface px-4 py-[13px] font-sans text-sm text-text transition-all outline-none placeholder:text-text-3 focus:border-primary focus:ring-4 focus:ring-primary/15',
            prefix && 'pl-10',
            suffix && 'pr-10',
            error && 'border-danger focus:border-danger focus:ring-danger/10',
            inputClassName
          )}
          {...rest}
        />
        {suffix && (
          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-[12.5px] font-semibold text-text-2">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-text-3">{hint}</p>}
    </div>
  )
})

export default Field
