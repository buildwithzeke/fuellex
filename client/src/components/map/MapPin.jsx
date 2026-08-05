import { useMemo } from 'react'
import L from 'leaflet'
import { Marker } from 'react-leaflet'
import { latestPrice } from '../../lib/fuel'
import { formatNairaNumber } from '../../lib/format'
import PinPopup from './PinPopup'

function escapeHtml(text = '') {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

function buildIcon({ tone, active, price, label }) {
  const html = `
    <div class="fl-pin fl-pin--${tone}${active ? ' fl-pin--active' : ''}">
      <span class="fl-pin__tip" data-mark="${price != null ? escapeHtml('₦') : ''}"></span>
      <span class="fl-pin__label">${escapeHtml(label)}</span>
    </div>
  `
  return L.divIcon({
    html,
    className: '',
    iconSize: [30, 48],
    iconAnchor: [15, 34],
    popupAnchor: [0, -38],
  })
}

/**
 * .map-pin from the mockup — a color-coded teardrop marker.
 * tone: green (cheapest) | blue (normal) | orange (expensive) | red (out of stock)
 */
export default function MapPin({ station, tone = 'blue', active = false, fuelType, onSelect }) {
  const price = latestPrice(station, fuelType)
  const label = `${station.name}${price != null ? ` · ${formatNairaNumber(price)}` : ''}`

  const icon = useMemo(
    () => buildIcon({ tone, active, price, label }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tone, active, price, station.id]
  )

  return (
    <Marker
      position={[station.latitude, station.longitude]}
      icon={icon}
      eventHandlers={{ click: () => onSelect?.(station) }}
    >
      <PinPopup station={station} fuelType={fuelType} />
    </Marker>
  )
}
