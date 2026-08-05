import { Loader2 } from 'lucide-react'
import { cx } from '../../lib/format'

export default function Spinner({ size = 22, className, label }) {
  return (
    <span className={cx('inline-flex items-center gap-2 text-text-2', className)} role="status">
      <Loader2 size={size} className="animate-spin text-primary" aria-hidden="true" />
      {label && <span className="text-sm font-medium">{label}</span>}
    </span>
  )
}
