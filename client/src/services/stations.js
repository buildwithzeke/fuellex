import api from '../lib/api'

/**
 * GET /api/stations — supports server-side filters.
 * Params: search, city, state, brand, isVerified, lat, lng, radius.
 */
export const getStations = async (params = {}) => {
  const envelope = await api.get('/api/stations', { params })
  return envelope.data
}

/** GET /api/stations/:id — includes the full report history. */
export const getStation = async (id) => {
  const envelope = await api.get(`/api/stations/${id}`)
  return envelope.data
}

export const createStation = async (payload) => {
  const envelope = await api.post('/api/stations', payload)
  return envelope.data
}

export const updateStation = async (id, payload) => {
  const envelope = await api.put(`/api/stations/${id}`, payload)
  return envelope.data
}

export const deleteStation = async (id) => {
  const envelope = await api.delete(`/api/stations/${id}`)
  return envelope.data
}
