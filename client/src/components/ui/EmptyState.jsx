import { cx } from '../../lib/format'

/** Friendly empty state — used when a query returns zero results. */
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cx('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}>
      {Icon && (
        <span className="grid h-14 w-14 place-items-center rounded-[16px] bg-primary-soft text-primary">
          <Icon size={26} strokeWidth={1.8} />
        </span>
      )}
      <div>
        <h3 className="text-[15px] font-bold text-text">{title}</h3>
        {description && <p className="mt-1 text-[13px] text-text-2">{description}</p>}
      </div>
      {action}
    </div>
  )
}
