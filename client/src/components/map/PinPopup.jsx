import { Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { ArrowRight, Navigation } from 'lucide-react'
import { latestReport, latestPrice, AVAILABILITY } from '../../lib/fuel'
import { formatNaira, formatDistance } from '../../lib/format'

/** .popup from the mockup — mini station card inside a map popup. */
export default function PinPopup({ station, fuelType = 'PMS' }) {
  const report = latestReport(station, fuelType)
  const price = latestPrice(station, fuelType)
  const availability = report ? AVAILABILITY[report.available] : null

  const directionsUrl = `https://www.google.com/maps?q=${station.latitude},${station.longitude}`

  return (
    <Popup closeButton={false} maxWidth={230} minWidth={210}>
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-text">
          <span>{station.name}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xl font-extrabold tracking-tight text-text">
          <span>
            {formatNaira(price)}
            <span className="text-xs font-semibold text-text-2">/L</span>
          </span>
          {price != null && <span className="text-[11px] font-bold text-success">▼</span>}
        </div>
        <div className="mt-0.5 text-[11.5px] font-semibold text-success">
          {availability ? `● ${availability.label}` : 'No recent reports'}
          {station.distance != null && (
            <span className="ml-1 font-medium text-text-2">· {formatDistance(station.distance)}</span>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1 rounded-[10px] bg-primary px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-strong dark:bg-primary-strong dark:hover:bg-primary"
          >
            <Navigation size={12} />
            Directions
          </a>
          <Link
            to={`/report?station=${station.id}`}
            className="flex flex-1 items-center justify-center gap-1 rounded-[10px] bg-surface px-2 py-1.5 text-xs font-semibold text-text-2 ring-1 ring-inset ring-border transition-colors hover:text-text"
          >
            Report
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </Popup>
  )
}
