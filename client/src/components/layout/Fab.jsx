import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cx } from '../../lib/format'

/** .fab from the mockup — floating action button that opens the report flow. */
export default function Fab({ to = '/report', className, label = 'Report price' }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      aria-label={label}
      title={label}
      className={cx(
        'fixed right-[18px] bottom-[92px] z-[55] grid h-[58px] w-[58px] cursor-pointer place-items-center rounded-[20px] border-none bg-gradient-to-br from-primary-strong to-primary text-white shadow-[0_10px_26px_rgba(37,99,235,.45)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.04] active:scale-95 md:hidden',
        className
      )}
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  )
}
