import { cx } from '../../lib/format'
import Logo from '../ui/Logo'
import Card from '../ui/Card'

/** Centered auth card shell shared by login / register. */
export default function AuthShell({ title, subtitle, children, footer, className }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 py-10">
      <Logo markSize={40} className="mb-6" />
      <Card className={cx('w-full max-w-[420px] p-6 shadow-md sm:p-8', className)}>
        <h1 className="text-xl font-extrabold tracking-tight text-text">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-text-2">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </Card>
      {footer && <div className="mt-4 text-[13px] text-text-2">{footer}</div>}
    </div>
  )
}
