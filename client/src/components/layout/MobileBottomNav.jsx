import { NavLink } from 'react-router-dom'
import { Home, Plus, ClipboardList, User } from 'lucide-react'
import { cx } from '../../lib/format'

const ITEMS = [
  { to: '/explore', label: 'Home', icon: Home },
  { to: '/report', label: 'Add', icon: Plus },
  { to: '/reports', label: 'Reports', icon: ClipboardList },
  { to: '/profile', label: 'Profile', icon: User },
]

/** .bottom-nav from the mockup — fixed mobile tab bar. */
export default function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[510] border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4 px-1">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end
            className={({ isActive }) =>
              cx(
                'flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors',
                isActive ? 'text-primary' : 'text-text-3 hover:text-text-2'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
