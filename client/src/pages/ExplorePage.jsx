import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Settings2, MapPinPlus } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import MobileBottomNav from '../components/layout/MobileBottomNav'
import Fab from '../components/layout/Fab'
import StationMap from '../components/map/StationMap'
import StationList from '../components/station/StationList'
import StationCard from '../components/station/StationCard'
import FilterPanel from '../components/station/FilterPanel'
import FilterChips from '../components/station/FilterChips'
import AddStationForm from '../components/station/AddStationForm'
import IconButton from '../components/ui/IconButton'
import Badge from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { useStations } from '../hooks/useStations'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { createStation } from '../services/stations'
import { resolveLocation, LAGOS_CENTER } from '../lib/geo'
import { latestReport, latestPrice } from '../lib/fuel'

const DEFAULT_FILTERS = {
  fuelType: 'PMS',
  inStockOnly: false,
  maxPrice: 1200,
  radius: 15,
}

/** Map-first home screen — desktop sidebar + live map, mobile map + bottom sheet. */
export default function ExplorePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const isDesktop = useIsDesktop()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [location, setLocation] = useState({ ...LAGOS_CENTER, located: false })
  const [activeId, setActiveId] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const isAddRequested = searchParams.get('add') === 'true'
  const [addOpen, setAddOpen] = useState(isAddRequested)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  const showAddModal = isAddRequested || addOpen

  useEffect(() => {
    if (isAddRequested && !isAuthenticated) {
      navigate('/login', { state: { from: '/explore?add=true' } })
    }
  }, [isAddRequested, isAuthenticated, navigate])

  const serverParams = useMemo(
    () => ({
      search: search || undefined,
      lat: location.lat,
      lng: location.lng,
      radius: filters.radius,
    }),
    [search, location.lat, location.lng, filters.radius]
  )

  const { stations, loading, error, refetch } = useStations(serverParams)

  // Client-side filtering for fuel type / stock / price cap.
  const visible = useMemo(() => {
    return stations.filter((station) => {
      const report = latestReport(station, filters.fuelType)
      if (filters.inStockOnly && (!report || !report.available)) return false
      const price = latestPrice(station, filters.fuelType)
      if (price != null && filters.maxPrice < 1200 && price > filters.maxPrice) return false
      return true
    })
  }, [stations, filters])

  const average = useMemo(() => {
    const prices = visible.map((s) => latestPrice(s, filters.fuelType)).filter((p) => p != null)
    if (!prices.length) return null
    return prices.reduce((a, b) => a + b, 0) / prices.length
  }, [visible, filters.fuelType])

  const activeStation = visible.find((s) => s.id === activeId) || null

  const reLocate = () => {
    setLocation({ ...LAGOS_CENTER, located: false })
    resolveLocation().then(setLocation)
  }

  const openAddStation = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/explore' } })
      return
    }
    setAddError('')
    setAddOpen(true)
  }

  const handleAddStation = async (payload) => {
    setAdding(true)
    setAddError('')
    try {
      await createStation(payload)
      setAddOpen(false)
      toast.success(`${payload.name} added — report its first price!`)
      refetch()
    } catch (err) {
      setAddError(err.message || 'Could not add the station')
    } finally {
      setAdding(false)
    }
  }

  const sidebar = (
    <>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[16px] font-extrabold tracking-tight text-text">
          Nearby Stations
          <Badge>{visible.length}</Badge>
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={MapPinPlus} onClick={openAddStation}>
            Add Station
          </Button>
          <IconButton label="Filters" size={34} onClick={() => setFilterOpen(true)}>
            <Settings2 size={16} />
          </IconButton>
        </div>
      </div>

      <FilterChips filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="space-y-3.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[16px] border border-border bg-surface p-5 shadow-sm">
              <div className="flex gap-3">
                <Skeleton className="h-11 w-11" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="mt-4 h-6 w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <StationList
          stations={visible}
          loading={false}
          error={error}
          average={average}
          fuelType={filters.fuelType}
          onRetry={() => refetch()}
        />
      )}
    </>
  )

  const mapCenter = useMemo(() => {
    if (visible.length > 0 && search) {
      return { lat: visible[0].latitude, lng: visible[0].longitude }
    }
    return location
  }, [visible, search, location])

  return (
    <div className="flex h-dvh flex-col">
      <Navbar />

      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Desktop sidebar */}
        <aside className="hidden w-[340px] xl:w-[380px] shrink-0 flex-col gap-3.5 overflow-y-auto border-r border-border bg-surface p-[18px] md:flex">
          {sidebar}
        </aside>

        {/* Map */}
        <div className="relative min-h-0 flex-1">
          <StationMap
            stations={visible}
            center={mapCenter}
            fuelType={filters.fuelType}
            activeStationId={activeId}
            flyToTarget={activeStation ? { lat: activeStation.latitude, lng: activeStation.longitude } : null}
            onSelect={(station) => setActiveId(station.id)}
            located={location.located}
            onLocate={reLocate}
            className="absolute inset-0"
          />

          {/* Mobile filter trigger + chips */}
          <div className="absolute top-3 left-3 z-[520] flex max-w-[calc(100%-24px)] flex-col gap-2 sm:hidden">
            <div className="flex items-center gap-2">
              <IconButton label="Filters" size={38} onClick={() => setFilterOpen(true)}>
                <Settings2 size={17} />
              </IconButton>
              <div className="overflow-hidden">
                <FilterChips filters={filters} onChange={setFilters} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet — list above the tab bar */}
      <div className="fixed inset-x-0 bottom-[64px] z-[500] max-h-[42dvh] rounded-t-[24px] border-t border-border bg-surface px-4 pt-2.5 pb-4 shadow-[0_-8px_30px_rgba(15,23,42,.15)] md:hidden">
        <div className="mx-auto mb-2.5 h-[5px] w-11 rounded-full bg-border" />
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h4 className="flex items-center gap-2 text-sm font-bold text-text">
            Nearby Stations
            <Badge className="px-2 py-0.5 text-[10.5px]">{visible.length}</Badge>
          </h4>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold text-text-3 sm:inline">
              {visible.length} within {filters.radius} km
            </span>
            <Button size="sm" icon={MapPinPlus} onClick={openAddStation}>
              Add
            </Button>
          </div>
        </div>
        <div className="fl-scrollbar-none flex gap-3 overflow-x-auto pb-1">
          {loading ? (
            <Skeleton className="h-40 w-[78%] shrink-0" />
          ) : (
            visible.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                fuelType={filters.fuelType}
                average={average}
                className="w-[78%] min-w-[260px] shrink-0"
              />
            ))
          )}
        </div>
      </div>

      <Fab />
      <MobileBottomNav />

      {/* Filter panel — mobile bottom sheet / desktop modal */}
      {filterOpen &&
        (isDesktop ? (
          <Modal open onClose={() => setFilterOpen(false)} title="Filters">
            <FilterPanel
              value={filters}
              onApply={(next) => {
                setFilters(next)
                setFilterOpen(false)
              }}
              onReset={() => {
                setFilters(DEFAULT_FILTERS)
                setFilterOpen(false)
              }}
              resultCount={visible.length}
            />
          </Modal>
        ) : (
          <div className="fixed inset-x-0 bottom-0 z-[600] max-h-[85dvh] overflow-y-auto rounded-t-[24px] border-t border-border bg-surface p-4 pb-8 sm:hidden">
            <div className="mx-auto mb-3 h-[5px] w-11 rounded-full bg-border" />
            <FilterPanel
              value={filters}
              onApply={(next) => {
                setFilters(next)
                setFilterOpen(false)
              }}
              onReset={() => {
                setFilters(DEFAULT_FILTERS)
                setFilterOpen(false)
              }}
              onClose={() => setFilterOpen(false)}
              resultCount={visible.length}
            />
          </div>
        ))}

      {/* Add station */}
      <Modal
        open={showAddModal}
        onClose={() => {
          if (!adding) {
            setAddOpen(false)
            if (searchParams.get('add') === 'true') {
              const nextParams = new URLSearchParams(searchParams)
              nextParams.delete('add')
              setSearchParams(nextParams, { replace: true })
            }
          }
        }}
        title="Add a station"
      >
        <AddStationForm
          initialLocation={location}
          onSubmit={handleAddStation}
          submitting={adding}
          error={addError}
          onCancel={() => {
            setAddOpen(false)
            if (searchParams.get('add') === 'true') {
              const nextParams = new URLSearchParams(searchParams)
              nextParams.delete('add')
              setSearchParams(nextParams, { replace: true })
            }
          }}
        />
      </Modal>
    </div>
  )
}
