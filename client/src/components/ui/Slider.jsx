import { cx } from '../../lib/format'

/** .slider from the mockup — a branded range input. */
export default function Slider({ min = 0, max = 100, value, onChange, disabled, className }) {
  const fill = ((value - min) / (max - min)) * 100
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cx('fl-slider cursor-pointer', disabled && 'opacity-50', className)}
      style={{ '--fill': `${fill}%` }}
      aria-label="Range slider"
    />
  )
}
