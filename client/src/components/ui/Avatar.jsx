import { cx } from '../../lib/format'
import { initials } from '../../lib/format'

/** .avatar from the mockup — gradient circle with the user's initials. */
export default function Avatar({ name, size = 40, className }) {
  return (
    <span
      className={cx(
        'grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-[#9333EA] font-bold text-white ring-2 ring-surface shadow-sm',
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
