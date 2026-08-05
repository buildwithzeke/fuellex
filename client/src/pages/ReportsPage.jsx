import { useState } from 'react'
import { ClipboardList, MapPin, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import Card from '../components/ui/Card'
import Tag from '../components/ui/Tag'
import Badge from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { useReports } from '../hooks/useReports'
import { AVAILABILITY, fuelLabel, FUEL_TYPES } from '../lib/fuel'
import { formatNaira, timeAgo, cx } from '../lib/format'

const FILTERS = ['All', ...FUEL_TYPES.map((f) => f.value)]

export default function ReportsPage() {
  const [fuel, setFuel] = useState('All')
  const { reports, loading, error, refetch } = useReports({ fuelType: fuel === 'All' ? undefined : fuel })

  return (
    <AppShell>
      <div className="mx-auto max-w-[720px] px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-text">
            <ClipboardList size={20} className="text-primary" />
            Recent Reports
            <Badge>{reports.length}</Badge>
          </h1>
        </div>

        {/* Fuel filter pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFuel(f)}
              className={cx(
                'cursor-pointer rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-semibold transition-all',
                fuel === f
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-border bg-surface text-text-2 hover:border-primary'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-[16px]" />
              ))}
            </div>
          ) : error ? (
            <ErrorState title="Couldn't load reports" message={error} onRetry={refetch} />
          ) : !reports.length ? (
            <EmptyState
              icon={ClipboardList}
              title="No reports yet"
              description="Be the first to report a price and help your community."
            />
          ) : (
            <ul className="space-y-3">
              {reports.map((report) => {
                const availability = AVAILABILITY[report.available]
                return (
                  <li key={report.id}>
                    <Card hoverable className="cursor-pointer p-4">
                      <Link to={`/station/${report.stationId}`} className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary">
                          <MapPin size={17} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-text">
                                {report.station?.name}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-text-3">
                                <Clock size={11} /> {timeAgo(report.createdAt)} · by {report.user?.name}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-lg font-extrabold tracking-tight text-text">
                                {formatNaira(report.price)}
                                <span className="text-xs font-semibold text-text-2">/L</span>
                              </p>
                              <div className="mt-0.5 flex items-center justify-end gap-1.5">
                                <Tag tone="fuel" className="px-1.5 py-0.5 text-[10px]">
                                  {fuelLabel(report.fuelType)}
                                </Tag>
                                {availability && (
                                  <Tag
                                    tone={report.available ? 'avail' : 'oos'}
                                    dot
                                    className="px-1.5 py-0.5 text-[10px]"
                                  >
                                    {report.available ? 'In stock' : 'Out'}
                                  </Tag>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  )
}
