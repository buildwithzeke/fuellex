import { useState } from 'react'
import { Check } from 'lucide-react'
import { cx } from '../../lib/format'
import Button from '../ui/Button'
import Slider from '../ui/Slider'
import { FUEL_TYPES } from '../../lib/fuel'
import { formatNairaNumber } from '../../lib/format'

const PRICE_MIN = 600
const PRICE_MAX = 1200
const DIST_MIN = 1
const DIST_MAX = 20

/** .radio-pill from the mockup. */
function Pill({ active, children, ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-[7px] text-[13px] font-semibold transition-all',
        active
          ? 'border-primary bg-primary-soft text-primary'
          : 'border-border bg-surface text-text-2 hover:border-primary'
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

function CheckRow({ checked, onChange, children }) {
  return (
    <label
      onClick={(e) => {
        e.preventDefault()
        onChange?.(!checked)
      }}
      className="flex cursor-pointer items-center gap-2.5 text-[13.5px] font-medium text-text"
    >
      <span
        className={cx(
          'grid h-5 w-5 place-items-center rounded-lg border-[1.5px] transition-all',
          checked ? 'border-success bg-success text-white' : 'border-border bg-surface'
        )}
      >
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      {children}
    </label>
  )
}

const GroupTitle = ({ children }) => (
  <h4 className="mb-2.5 text-xs font-bold tracking-wider text-text-3 uppercase">{children}</h4>
)

/**
 * .filters from the mockup — fuel type, availability, max price, radius.
 * Edits are staged locally and committed on Apply.
 */
export default function FilterPanel({ value, onApply, onReset, onClose, resultCount }) {
  const [fuelType, setFuelType] = useState(value.fuelType)
  const [inStockOnly, setInStockOnly] = useState(value.inStockOnly)
  const [maxPrice, setMaxPrice] = useState(value.maxPrice)
  const [radius, setRadius] = useState(value.radius)

  const apply = () => {
    onApply({ fuelType, inStockOnly, maxPrice, radius })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold tracking-tight text-text">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer border-none bg-transparent text-[12.5px] font-semibold text-primary"
        >
          Reset
        </button>
      </div>

      <div>
        <GroupTitle>Fuel Type</GroupTitle>
        <div className="flex flex-wrap gap-2">
          {FUEL_TYPES.map((fuel) => (
            <Pill key={fuel.value} active={fuelType === fuel.value} onClick={() => setFuelType(fuel.value)}>
              {fuel.label}
              {fuelType === fuel.value && ' ✓'}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <GroupTitle>Availability</GroupTitle>
        <CheckRow checked={inStockOnly} onChange={() => setInStockOnly((v) => !v)}>
          In-stock stations only
        </CheckRow>
      </div>

      <div>
        <GroupTitle>Max Price</GroupTitle>
        <div className="mb-2 flex justify-between text-[13px] text-text-2">
          {fuelType} per litre <b className="text-text">≤ ₦{formatNairaNumber(maxPrice)}</b>
        </div>
        <Slider min={PRICE_MIN} max={PRICE_MAX} value={maxPrice} onChange={setMaxPrice} />
      </div>

      <div>
        <GroupTitle>Distance</GroupTitle>
        <div className="mb-2 flex justify-between text-[13px] text-text-2">
          Within <b className="text-text">{radius} km</b>
        </div>
        <Slider min={DIST_MIN} max={DIST_MAX} value={radius} onChange={setRadius} />
      </div>

      <div className="mt-1 flex gap-2.5">
        {onClose && (
          <Button variant="ghost" block onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button block onClick={apply}>
          Apply{resultCount != null ? ` (${resultCount})` : ''}
        </Button>
      </div>
    </div>
  )
}
