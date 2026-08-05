/** Haversine distance between two coordinates in km. */
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Lagos center — used as the default map view when geolocation is unavailable. */
export const LAGOS_CENTER = { lat: 6.5244, lng: 3.3792 }

/**
 * Resolve the user's location with a short timeout, falling back to Lagos.
 * Returns { lat, lng, located: boolean }.
 */
export function resolveLocation() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve({ ...LAGOS_CENTER, located: false })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          located: true,
        }),
      () => resolve({ ...LAGOS_CENTER, located: false }),
      { timeout: 6000, maximumAge: 5 * 60 * 1000 }
    )
  })
}
