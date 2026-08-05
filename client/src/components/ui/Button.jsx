import { cx } from '../../lib/format'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-primary text-white shadow-primary hover:bg-primary-strong dark:bg-primary-strong dark:hover:bg-primary',
  secondary: 'bg-surface text-primary ring-1 ring-inset ring-primary hover:bg-primary-soft',
  ghost: 'bg-transparent text-text-2 ring-1 ring-inset ring-border hover:bg-bg hover:text-text',
  success:
    'bg-success text-white shadow-success hover:bg-success-strong dark:bg-success-strong dark:hover:bg-success',
  danger: 'bg-danger text-white hover:bg-danger-strong dark:bg-danger-strong dark:hover:bg-danger',
  'outline-danger': 'bg-surface text-danger ring-1 ring-inset ring-danger hover:bg-danger-soft',
}

const SIZES = {
  sm: 'px-3.5 py-2 text-[13px] rounded-[10px] gap-1.5',
  md: 'px-5 py-3 text-sm rounded-[12px] gap-2',
  lg: 'px-6 py-4 text-[15px] rounded-[12px] gap-2',
}

/**
 * Primary CTA — .btn / .btn-primary / .btn-secondary / .btn-ghost / .btn-success
 * in the mockup design system.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  disabled = false,
  icon: Icon,
  className,
  children,
  ...rest
}) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-200 select-none active:scale-[.97] disabled:pointer-events-none disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 15 : 17} strokeWidth={2.2} aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
