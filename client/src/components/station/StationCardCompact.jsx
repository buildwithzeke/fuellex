import { useNavigate } from 'react-router-dom'
import { Fuel, Clock } from 'lucide-react'
import { cx } from '../../lib/format'
import Card from '../ui/Card'
import Tag from '../ui/Tag'
import { latestReport, latestPrice, AVAILABILITY } from '../../lib/fuel'
import { formatNaira, timeAgo } from '../../lib/format'

/** Compact horizontal card used in the desktop sidebar list. */
export default function StationCardCompact({ station, fuelType = 'PMS', className }) {
  const navigate = useNavigate()
  const report = latestReport(station, fuelType)
  const price = latestPrice(station, fuelType)
  const availability = report ? AVAILABILITY[report.available] : null

  return (
    <Card
      hoverable
      onClick={() => navigate(`/station/${station.id}`)}
      className={cx('flex cursor-pointer items-center gap-3 px-4 py-3.5', className)}
    >
      <span
        className={cx(
          'grid h-10 w-10 shrink-0 place-items-center rounded-[12px]',
          report && !report.available ? 'bg-danger-soft text-danger' : 'bg-primary-soft text-primary'
        )}
      >
        <Fuel size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-text">{station.name}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-text-3">
          <Clock size={11} />
          Updated {timeAgo(report?.createdAt || station.updatedAt)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-lg font-extrabold tracking-tight text-text">{formatNaira(price)}</div>
        {availability && (
          <Tag tone={report.available ? 'avail' : 'oos'} className="px-1.5 py-0.5 text-[10px]">
            {report.available ? 'Available' : 'Out of stock'}
          </Tag>
        )}
      </div>
    </Card>
  )
}
