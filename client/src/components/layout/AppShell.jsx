import { cx } from '../../lib/format'
import Navbar from './Navbar'
import MobileBottomNav from './MobileBottomNav'

/**
 * Standard page shell: sticky navbar + bottom padding on mobile
 * so content clears the fixed tab bar.
 */
export default function AppShell({ children, className, withBottomNav = true }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className={cx('flex-1 pb-20 md:pb-8', className)}>{children}</main>
      {withBottomNav && <MobileBottomNav />}
    </div>
  )
}
