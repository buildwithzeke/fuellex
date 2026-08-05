/** Join class names, skipping falsy values. */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

/** ₦915 */
export function formatNaira(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return naira.format(Number(value))
}

/** "915" — numeric part without the symbol, used inside price/unit layouts. */
export function formatNairaNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toLocaleString('en-NG')
}

/** 0.8 km / 1.2 km / 350 m */
export function formatDistance(km) {
  if (km == null || Number.isNaN(Number(km))) return '—'
  const value = Number(km)
  if (value < 1) return `${Math.round(value * 1000)} m`
  return `${value.toFixed(1)} km`
}

/** 3 mins ago / 2 hrs ago / 5d ago */
export function timeAgo(date) {
  if (!date) return '—'
  const then = new Date(date).getTime()
  if (Number.isNaN(then)) return '—'
  const seconds = Math.floor((Date.now() - then) / 1000)
  if (seconds < 45) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/** "Mon 12 Jan" */
export function formatDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** "14:05" */
export function formatTime(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?'
}
