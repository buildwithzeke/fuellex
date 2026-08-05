import { X } from 'lucide-react'
import { cx } from '../../lib/format'
import Tag from '../ui/Tag'
import { fuelLabel } from '../../lib/fuel'
import { formatNairaNumber } from '../../lib/format'

function chipKey(t) {
  return JSON.stringify(t)
}

/** Row of active filter chips — desktop sidebar + mobile summary. */
export default function FilterChips({ filters, onChange }) {
  const chips = []

  if (filters.fuelType) {
    chips.push({
      key: chipKey({ k: 'fuel', v: filters.fuelType }),
      label: `${fuelLabel(filters.fuelType)} ✓`,
      tone: 'brand',
      clear: () => onChange({ ...filters, fuelType: '' }),
    })
  }
  if (filters.inStockOnly) {
    chips.push({
      key: chipKey({ k: 'stock' }),
      label: 'Available',
      tone: 'avail',
      clear: () => onChange({ ...filters, inStockOnly: false }),
    })
  }
  if (filters.maxPrice < 1200) {
    chips.push({
      key: chipKey({ k: 'price', v: filters.maxPrice }),
      label: `≤ ₦${formatNairaNumber(filters.maxPrice)}`,
      tone: 'price',
      clear: () => onChange({ ...filters, maxPrice: 1200 }),
    })
  }
  if (filters.radius < 20) {
    chips.push({
      key: chipKey({ k: 'radius', v: filters.radius }),
      label: `${filters.radius} km`,
      tone: 'brand',
      clear: () => onChange({ ...filters, radius: 20 }),
    })
  }

  if (!chips.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.clear}
          className="group cursor-pointer"
          aria-label={`Remove ${chip.label} filter`}
        >
          <Tag tone={chip.tone} className={cx('transition-shadow group-hover:ring-2 group-hover:ring-danger/40')}>
            {chip.label}
            <X size={11} strokeWidth={2.5} />
          </Tag>
        </button>
      ))}
    </div>
  )
}
