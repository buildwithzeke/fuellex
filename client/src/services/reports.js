import api from '../lib/api'

/** GET /api/reports?fuelType=&available= — newest first, includes station + reporter. */
export const getReports = async (params = {}) => {
  const envelope = await api.get('/api/reports', { params })
  return envelope.data
}

/** GET /api/reports/station/:stationId */
export const getReportsByStation = async (stationId) => {
  const envelope = await api.get(`/api/reports/station/${stationId}`)
  return envelope.data
}

/** POST /api/reports — requires auth. { stationId, fuelType, price, available } */
export const createReport = async (payload) => {
  const envelope = await api.post('/api/reports', payload)
  return envelope.data
}
