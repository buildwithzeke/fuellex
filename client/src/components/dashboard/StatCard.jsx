import { cx } from '../../lib/format'
import Card from '../ui/Card'

const ICON_TONES = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning-ink',
  danger: 'bg-danger-soft text-danger',
}

/** .stat-card from the mockup — icon, big value, label, delta. */
export default function StatCard({ icon: Icon, value, label, delta, deltaTone = 'success', className }) {
  const tone = ICON_TONES[deltaTone] || ICON_TONES.primary
  return (
    <Card className={cx('flex flex-col gap-2 p-[18px]', className)}>
      <span className={cx('grid h-10 w-10 place-items-center rounded-[12px]', tone)}>
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <div className="text-[26px] font-extrabold tracking-tight text-text">{value}</div>
      <div className="text-[12.5px] text-text-2">{label}</div>
      {delta && (
        <div className={cx('text-xs font-bold', deltaTone === 'danger' ? 'text-danger' : deltaTone === 'muted' ? 'text-text-2' : 'text-success')}>
          {delta}
        </div>
      )}
    </Card>
  )
}
