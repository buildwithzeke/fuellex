import { MapPinOff } from 'lucide-react'
import StationCard from './StationCard'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-[16px] border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="h-[46px] w-[46px]" />
            <div className="flex-1">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="mt-4 h-6 w-1/3" />
          <Skeleton className="mt-4 h-9 w-full rounded-[10px]" />
        </div>
      ))}
    </div>
  )
}

/** Desktop sidebar list of station cards with loading / empty / error states. */
export default function StationList({ stations, loading, error, average, fuelType, onRetry }) {
  if (loading) return <ListSkeleton />
  if (error) {
    return <ErrorState title="Couldn't load stations" message={error} onRetry={onRetry} />
  }
  if (!stations.length) {
    return (
      <EmptyState
        icon={MapPinOff}
        title="No stations found"
        description="Try widening your filters or radius — the API returned zero results."
      />
    )
  }
  return (
    <div className="flex flex-col gap-3.5">
      {stations.map((station) => (
        <StationCard key={station.id} station={station} fuelType={fuelType} average={average} />
      ))}
    </div>
  )
}
