import { useNavigate } from 'react-router-dom'
import { Fuel, MapPin, Navigation, BarChart3, Clock, Star } from 'lucide-react'
import { cx } from '../../lib/format'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Tag from '../ui/Tag'
import { latestReport, latestPrice, priceTrend, AVAILABILITY, fuelLabel } from '../../lib/fuel'
import { formatNaira, formatNairaNumber, formatDistance, timeAgo } from '../../lib/format'

/** .station-card from the mockup — full card anatomy. */
export default function StationCard({
  station,
  fuelType = 'PMS',
  average,
  onSelect,
  showActions = true,
  className,
}) {
  const navigate = useNavigate()
  const report = latestReport(station, fuelType)
  const price = latestPrice(station, fuelType)
  const availability = report ? AVAILABILITY[report.available] : null
  const trend = priceTrend(price, average)
  const updatedAt = report?.createdAt || station.updatedAt

  const openDirections = (e) => {
    e.stopPropagation()
    window.open(`https://www.google.com/maps?q=${station.latitude},${station.longitude}`, '_blank')
  }
  const openReport = (e) => {
    e.stopPropagation()
    navigate(`/report?station=${station.id}`)
  }

  return (
    <Card
      hoverable
      onClick={() => (onSelect ? onSelect(station) : navigate(`/station/${station.id}`))}
      className={cx('flex cursor-pointer flex-col gap-3', className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] bg-primary-soft text-[22px]">
            <Fuel size={22} className="text-primary" />
          </span>
          <div>
            <h3 className="text-[15px] font-bold text-text">{station.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-text-2">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{station.address}</span>
            </p>
          </div>
        </div>
        <span className="text-[15px] text-text-3" title={station.isVerified ? 'Verified station' : 'Community listed'}>
          <Star size={15} fill={station.isVerified ? 'currentColor' : 'none'} className={station.isVerified ? 'text-warning' : ''} />
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="text-2xl font-extrabold tracking-tight text-text">
          {formatNaira(price)}
          <span className="text-[13px] font-semibold text-text-2">/L</span>
        </div>
        <div className="flex items-center gap-1 text-[12.5px] text-text-2">
          <MapPin size={12} />
          {formatDistance(station.distance)}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Tag tone="fuel">{fuelLabel(fuelType)}</Tag>
        {availability && (
          <Tag tone={report.available ? 'avail' : 'oos'} dot>
            {availability.label}
          </Tag>
        )}
        {trend && (
          <Tag tone="price">
            {trend.direction === 'down' ? '▼' : '▲'} {formatNairaNumber(trend.amount)}{' '}
            {trend.direction === 'down' ? 'below' : 'above'} avg
          </Tag>
        )}
        {!trend && price != null && average != null && (
          <Tag tone="price">≈ avg price</Tag>
        )}
      </div>

      <p className="flex items-center gap-1 text-xs text-text-3">
        <Clock size={12} />
        Updated {timeAgo(updatedAt)}
      </p>

      {showActions && (
        <div className="mt-auto flex gap-2.5">
          <Button size="sm" icon={Navigation} block onClick={openDirections}>
            Directions
          </Button>
          <Button size="sm" variant="ghost" icon={BarChart3} block onClick={openReport}>
            Report Price
          </Button>
        </div>
      )}
    </Card>
  )
}
