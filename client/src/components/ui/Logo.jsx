import { Fuel } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cx } from '../../lib/format'

/** Brand mark + wordmark — .logo / .logo-mark from the mockup. */
export default function Logo({ to = '/', markSize = 32, className }) {
  return (
    <Link to={to} className={cx('inline-flex items-center gap-2', className)}>
      <span
        className="grid place-items-center rounded-[10px] bg-gradient-to-br from-primary to-[#60A5FA] text-white shadow-primary"
        style={{ width: markSize, height: markSize }}
      >
        <Fuel size={markSize * 0.55} strokeWidth={2.2} />
      </span>
      <span className="text-[17px] font-extrabold tracking-tight text-text">
        Fuel<span className="text-primary">Lex</span>
      </span>
    </Link>
  )
}
