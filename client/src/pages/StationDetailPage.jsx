import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Navigation, BarChart3, Star, Clock } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Tag from '../components/ui/Tag'
import SegmentedControl from '../components/ui/SegmentedControl'
import Skeleton from '../components/ui/Skeleton'
import ErrorState from '../components/ui/ErrorState'
import ReportsTable from '../components/dashboard/ReportsTable'
import { getStation } from '../services/stations'
import { FUEL_TYPES, latestReport, AVAILABILITY, fuelLabel } from '../lib/fuel'
import { formatNaira, timeAgo } from '../lib/format'

export default function StationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [station, setStation] = useState(null)
  const [fuelType, setFuelType] = useState('PMS')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)

  const refetch = () => setTick((t) => t + 1)

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      setLoading(true)
      setError('')
    }, 0)
    getStation(id)
      .then((data) => active && setStation(data))
      .catch((err) => active && setError(err.message || 'Station not found'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [id, tick])

  const report = useMemo(() => (station ? latestReport(station, fuelType) : null), [station, fuelType])
  const availability = report ? AVAILABILITY[report.available] : null

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[960px] px-4 py-6 sm:px-8">
          <Skeleton className="h-9 w-40" />
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <Skeleton className="h-64 rounded-[16px]" />
            <Skeleton className="h-64 rounded-[16px]" />
          </div>
        </div>
      </AppShell>
    )
  }

  if (error || !station) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[960px] px-4 py-6 sm:px-8">
          <Link
            to="/explore"
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <ChevronLeft size={16} /> Back to map
          </Link>
          <ErrorState title="Station unavailable" message={error} onRetry={refetch} />
        </div>
      </AppShell>
    )
  }

  const directionsUrl = `https://www.google.com/maps?q=${station.latitude},${station.longitude}`

  return (
    <AppShell>
      <div className="mx-auto max-w-[960px] px-4 py-6 sm:px-8">
        <Link
          to="/explore"
          className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <ChevronLeft size={16} /> Back to map
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-primary-soft text-primary">
              <BarChart3 size={22} />
            </span>
            <div>
              <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-text">
                {station.name}
                {station.isVerified && <Star size={15} className="text-warning" fill="currentColor" />}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-[13px] text-text-2">
                <MapPin size={13} /> {station.address}, {station.city}, {station.state}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" icon={Navigation} onClick={() => window.open(directionsUrl, '_blank')}>
            <span className="hidden sm:inline">Directions</span>
          </Button>
        </div>

        {/* Price panel */}
        <Card className="mt-5">
          <SegmentedControl
            options={FUEL_TYPES.map((f) => ({ value: f.value, label: `${f.label} · ${f.full}` }))}
            value={fuelType}
            onChange={setFuelType}
          />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[13px] font-semibold text-text-2">
                {fuelLabel(fuelType)} price per litre
              </div>
              <div className="mt-1 text-[34px] font-extrabold tracking-tight text-text">
                {formatNaira(report?.price)}
                <span className="text-base font-semibold text-text-2">/L</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {availability && (
                <Tag tone={report.available ? 'avail' : 'oos'} dot className="px-3 py-1.5 text-xs">
                  {report.available ? 'Available now' : 'Out of stock'}
                </Tag>
              )}
              {report && (
                <span className="flex items-center gap-1 text-xs text-text-3">
                  <Clock size={12} /> Updated {timeAgo(report.createdAt)}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Map + report history */}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <div className="fl-map-placeholder relative h-[260px] rounded-[16px] border border-border">
              <iframe
                title={`${station.name} map`}
                src={`https://maps.google.com/maps?q=${station.latitude},${station.longitude}&z=14&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
            <div className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-text-2">
                <span>
                  {station.reports?.length ?? 0} reports · avg{' '}
                  {formatNaira(
                    station.reports?.length
                      ? station.reports.reduce((a, r) => a + r.price, 0) / station.reports.length
                      : null
                  )}
                </span>
                <Button size="sm" icon={BarChart3} variant="ghost" onClick={() => navigate(`/report?station=${station.id}`)}>
                  Report Price
                </Button>
              </div>
            </div>
          </Card>

          <div>
            <h2 className="mb-3 text-sm font-extrabold tracking-tight text-text">Recent Reports</h2>
            <ReportsTable reports={station.reports || []} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
