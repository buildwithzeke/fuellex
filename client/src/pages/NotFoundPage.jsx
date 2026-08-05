import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center gap-3 px-6 py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-primary-soft text-primary">
          <Compass size={30} strokeWidth={1.8} />
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-text">404</h1>
        <p className="max-w-[360px] text-sm text-text-2">
          This road doesn't exist on our map. The page you're looking for was moved or never was.
        </p>
        <Link to="/" className="mt-2">
          <Button>Back to FuelLex</Button>
        </Link>
      </div>
    </AppShell>
  )
}
