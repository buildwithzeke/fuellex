import { TriangleAlert } from 'lucide-react'
import Button from './Button'

/** Error state with a retry action — shown when the live API is unreachable. */
export default function ErrorState({ title = 'Couldn’t load data', message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-[16px] bg-danger-soft text-danger">
        <TriangleAlert size={26} strokeWidth={1.8} />
      </span>
      <div>
        <h3 className="text-[15px] font-bold text-text">{title}</h3>
        {message && <p className="mt-1 text-[13px] text-text-2">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
