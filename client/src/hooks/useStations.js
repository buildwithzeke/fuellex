import { useCallback, useEffect, useRef, useState } from 'react'
import { getStations } from '../services/stations'

/**
 * Fetch stations whenever the filter object changes identity.
 * Returns { stations, loading, error, refetch }.
 */
export function useStations(params) {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  const paramsRef = useRef(params)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    paramsRef.current = params
    let active = true

    const timer = setTimeout(() => {
      setLoading(true)
      setError('')
    }, 0)

    const run = async () => {
      try {
        const data = await getStations(params)
        if (!active) return
        setStations(data)
        setError('')
      } catch (err) {
        if (!active) return
        setError(err.message || 'Failed to load stations')
        setStations([])
      } finally {
        if (active) setLoading(false)
      }
    }

    run()

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [params, tick])

  return { stations, loading, error, refetch }
}
