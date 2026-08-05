export const FUEL_TYPES = [
  { value: 'PMS', label: 'PMS', full: 'Petrol' },
  { value: 'AGO', label: 'AGO', full: 'Diesel' },
  { value: 'DPK', label: 'DPK', full: 'Kerosene' },
  { value: 'LPG', label: 'LPG', full: 'Gas' },
]

export const fuelLabel = (type) => {
  const fuel = FUEL_TYPES.find((f) => f.value === type)
  return fuel ? fuel.label : type
}

/**
 * Latest report for a station and fuel type.
 * Station reports come back sorted newest-first from the API.
 */
export function latestReport(station, fuelType = 'PMS') {
  const reports = station?.reports || []
  if (!reports.length) return null
  const match = reports.find((r) => r.fuelType === fuelType)
  if (match) return match
  // No report for the requested type yet — fall back to newest overall.
  return reports[0]
}

/** Latest price (number) or null when the station has no reports. */
export function latestPrice(station, fuelType = 'PMS') {
  const report = latestReport(station, fuelType)
  return report ? report.price : null
}

export const AVAILABILITY = {
  true: { label: 'Available', tone: 'success' },
  false: { label: 'Out of stock', tone: 'danger' },
}

/**
 * Pin color used on the map, mirroring the mockup legend:
 *  red    — out of stock
 *  green  — cheapest (below average by >= 2%)
 *  orange — expensive (above average by >= 2%)
 *  blue   — normal
 */
export function pinTone(price, average) {
  if (price == null) return 'blue'
  if (average == null) return 'blue'
  const diff = (price - average) / average
  if (diff <= -0.02) return 'green'
  if (diff >= 0.02) return 'orange'
  return 'blue'
}

export function pinColor(tone) {
  return { green: '#10B981', blue: '#2563EB', orange: '#F59E0B', red: '#EF4444' }[tone] || '#2563EB'
}

/** Price trend vs a reference price; returns { direction, label }. */
export function priceTrend(price, reference) {
  if (price == null || reference == null) return null
  const diff = price - reference
  if (Math.abs(diff) < 1) return null
  return {
    direction: diff < 0 ? 'down' : 'up',
    amount: Math.abs(diff),
  }
}
