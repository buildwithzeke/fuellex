import { useEffect, useMemo, useState } from 'react'
import { Fuel, BarChart3, MapPin, Wallet, ShieldAlert } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import StatCard from '../components/dashboard/StatCard'
import PriceChart from '../components/dashboard/PriceChart'
import DonutChart from '../components/dashboard/DonutChart'
import ReportsTable from '../components/dashboard/ReportsTable'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { getStations } from '../services/stations'
import { getReports } from '../services/reports'
import { latestReport } from '../lib/fuel'
import { formatNaira } from '../lib/format'

function dayKey(date) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export default function DashboardPage() {
  const { isAdmin, isAuthenticated } = useAuth()

  const [stations, setStations] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    let active = true
    Promise.all([getStations({ radius: 200 }), getReports()])
      .then(([stationData, reportData]) => {
        if (!active) return
        setStations(stationData)
        setReports(reportData)
      })
      .catch((err) => active && setError(err.message || 'Failed to load dashboard data'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [isAdmin])

  // ----- Derived stats -----
  const stats = useMemo(() => {
    const now = new Date()
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000

    const stationsWithReports = stations.filter((s) => s.reports?.length)
    const newStationsThisWeek = stations.filter(
      (s) => new Date(s.createdAt).getTime() >= weekAgo
    ).length
    const reportsThisWeek = reports.filter((r) => new Date(r.createdAt).getTime() >= weekAgo).length

    // Latest PMS price per station with a PMS report
    const latestPms = stationsWithReports
      .map((s) => latestReport(s, 'PMS'))
      .filter((r) => r && r.fuelType === 'PMS')
    const avgPms = latestPms.length
      ? latestPms.reduce((a, r) => a + r.price, 0) / latestPms.length
      : null

    // In-stock ratio across latest reports per station
    const stockReports = stationsWithReports.map((s) => latestReport(s)).filter(Boolean)
    const inStock = stockReports.filter((r) => r.available).length
    const inStockPct = stockReports.length ? (inStock / stockReports.length) * 100 : 0

    // Last-7-days average PMS price per day
    const days = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i).getTime()
      const pms = reports.filter(
        (r) => r.fuelType === 'PMS' && dayKey(r.createdAt) === dayStart
      )
      const avg = pms.length ? pms.reduce((a, r) => a + r.price, 0) / pms.length : null
      days.push({
        start: dayStart,
        value: avg,
        label: new Date(dayStart).toLocaleDateString('en-GB', { weekday: 'short' }),
        tooltip: avg != null ? `${formatNaira(avg)} · ${pms.length} reports` : 'No data',
      })
    }
    const maxDay = days.reduce(
      (best, d) => (d.value != null && d.value > (best?.value ?? -1) ? d : best),
      null
    )

    return {
      stationCount: stations.length,
      reportCount: reports.length,
      newStationsThisWeek,
      reportsThisWeek,
      stationsWithReports: stationsWithReports.length,
      avgPms,
      inStockPct,
      days: days.map((d) => ({
        value: d.value,
        bad: maxDay != null && d.value != null && d.start === maxDay.start,
        tooltip: d.tooltip,
      })),
      labels: days.map((d) => d.label),
    }
  }, [stations, reports])

  if (!isAuthenticated) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[720px] px-4 py-16">
          <EmptyState
            icon={ShieldAlert}
            title="Sign in required"
            description="Log in to view the dashboard."
            action={<Button onClick={() => (window.location.href = '/login')}>Sign in</Button>}
          />
        </div>
      </AppShell>
    )
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[720px] px-4 py-16">
          <EmptyState
            icon={ShieldAlert}
            title="Admins only"
            description="You need an ADMIN account to view this page. Public registration creates USER accounts."
          />
        </div>
      </AppShell>
    )
  }

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 rounded-[16px]" />
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-48 rounded-[16px]" />
            <Skeleton className="h-48 rounded-[16px]" />
          </div>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[720px] px-4 py-16">
          <ErrorState title="Couldn't load the dashboard" message={error} />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-8">
        <h1 className="mb-5 flex items-center gap-2 text-[16px] font-extrabold tracking-tight text-text">
          📈 Overview
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-bold text-primary">
            Last 7 days
          </span>
        </h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Fuel}
            value={stats.stationCount}
            label="Stations tracked"
            delta={`▲ ${stats.newStationsThisWeek} this week`}
          />
          <StatCard
            icon={BarChart3}
            value={stats.reportCount}
            label="Price reports"
            delta={`▲ ${stats.reportsThisWeek} this week`}
          />
          <StatCard
            icon={MapPin}
            value={stats.stationsWithReports}
            label="Stations with live data"
            deltaTone="muted"
            delta="reports available"
          />
          <StatCard
            icon={Wallet}
            value={stats.avgPms != null ? formatNaira(stats.avgPms) : '—'}
            label="Avg. PMS price"
            deltaTone="danger"
            delta="community average"
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <PriceChart
            title="PMS Average Price (7 days)"
            data={stats.days}
            labels={stats.labels}
          />
          <DonutChart title="Out-of-stock ratio" inStockPercent={stats.inStockPct} />
        </div>

        <h2 className="mt-6 mb-3 text-sm font-extrabold tracking-tight text-text">Recent Reports</h2>
        <ReportsTable reports={reports.slice(0, 10)} />
      </div>
    </AppShell>
  )
}
