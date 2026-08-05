import { useCallback, useEffect, useState } from 'react'
import { getReports, getReportsByStation } from '../services/reports'

/** Fetch the latest reports (optionally filtered / per station). */
export function useReports({ fuelType, available, stationId } = {}) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let active = true

    const timer = setTimeout(() => {
      setLoading(true)
      setError('')
    }, 0)

    const run = async () => {
      try {
        const params = {}
        if (fuelType) params.fuelType = fuelType
        if (available != null) params.available = String(available)
        const data = stationId ? await getReportsByStation(stationId) : await getReports(params)
        if (!active) return
        setReports(data)
        setError('')
      } catch (err) {
        if (!active) return
        setError(err.message || 'Failed to load reports')
        setReports([])
      } finally {
        if (active) setLoading(false)
      }
    }

    run()

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [fuelType, available, stationId, tick])

  return { reports, loading, error, refetch }
}
