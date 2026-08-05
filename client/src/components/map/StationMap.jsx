import { useEffect } from 'react'
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import { LocateFixed } from 'lucide-react'
import { cx } from '../../lib/format'
import { useTheme } from '../../context/ThemeContext'
import { latestReport, latestPrice, pinTone } from '../../lib/fuel'
import MapPin from './MapPin'
import MapLegend from './MapLegend'

const TILES = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
}

/** Reacts to center / fly-to-target changes without remounting the map. */
function MapController({ center, flyToTarget }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, Math.max(map.getZoom(), 11), { duration: 0.8 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.lat, center?.lng])
  useEffect(() => {
    if (flyToTarget) map.flyTo(flyToTarget, 14, { duration: 0.9 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyToTarget?.lat, flyToTarget?.lng])
  return null
}

/**
 * Map-first view (.map from the mockup) built on Leaflet.
 * Stations render as color-coded teardrop pins; the legend + GPS chip float above.
 */
export default function StationMap({
  stations = [],
  center,
  initialZoom = 12,
  activeStationId,
  fuelType = 'PMS',
  onSelect,
  flyToTarget,
  located,
  onLocate,
  className,
}) {
  const { theme } = useTheme()
  const tiles = TILES[theme] || TILES.light

  // Average price across visible stations drives the pin color tiers.
  const prices = stations
    .map((s) => latestPrice(s, fuelType))
    .filter((p) => p != null)
  const average = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null

  return (
    <div className={cx('relative h-full w-full overflow-hidden', className)}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={initialZoom}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer key={tiles.url} url={tiles.url} attribution={tiles.attribution} />
        <MapController center={center} flyToTarget={flyToTarget} />
        <ZoomControl position="topright" />
        {stations.map((station) => {
          const report = latestReport(station, fuelType)
          const price = latestPrice(station, fuelType)
          const tone = report && report.available === false ? 'red' : pinTone(price, average)
          return (
            <MapPin
              key={station.id}
              station={station}
              fuelType={fuelType}
              tone={tone}
              active={station.id === activeStationId}
              onSelect={onSelect}
            />
          )
        })}
      </MapContainer>

      <MapLegend className="absolute top-3.5 left-3.5 z-[500]" />

      {onLocate && (
        <button
          type="button"
          onClick={onLocate}
          className={cx(
            'absolute bottom-4 left-1/2 z-[500] flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-primary transition-transform hover:scale-[1.03] active:scale-95 dark:bg-primary-strong',
            located && 'bottom-auto top-1/2 -translate-x-1/2 -translate-y-1/2'
          )}
        >
          <LocateFixed size={14} />
          {located ? 'Using your location' : 'Near me'}
        </button>
      )}
    </div>
  )
}
