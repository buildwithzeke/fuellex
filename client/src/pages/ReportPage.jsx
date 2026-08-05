import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import ReportForm from '../components/report/ReportForm'
import Skeleton from '../components/ui/Skeleton'
import ErrorState from '../components/ui/ErrorState'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getStations } from '../services/stations'
import { createReport } from '../services/reports'

export default function ReportPage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const presetStation = searchParams.get('station') || ''

  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    let active = true
    getStations()
      .then((data) => active && setStations(data))
      .catch((err) => active && setLoadError(err.message || 'Failed to load stations'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/report' }} replace />
  }

  const submit = async (payload) => {
    setSubmitting(true)
    setSubmitError('')
    try {
      await createReport(payload)
      toast.success(
        `Price report submitted · ${new Intl.NumberFormat('en-NG').format(payload.price)} for ${payload.fuelType}`
      )
      navigate(isAdmin ? '/dashboard' : '/reports')
    } catch (err) {
      setSubmitError(err.message || 'Could not submit the report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[560px] px-4 py-8 sm:px-6">
        {loading ? (
          <Skeleton className="h-[480px] rounded-[24px]" />
        ) : loadError ? (
          <ErrorState title="Couldn't load stations" message={loadError} />
        ) : (
          <ReportForm
            stations={stations}
            initialStationId={presetStation}
            onSubmit={submit}
            submitting={submitting}
            error={submitError}
          />
        )}
      </div>
    </AppShell>
  )
}
