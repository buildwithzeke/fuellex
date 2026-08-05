import { Link, Navigate, useNavigate } from 'react-router-dom'
import { LogOut, BarChart3, CalendarDays, ShieldCheck } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Tag from '../components/ui/Tag'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../lib/format'

export default function ProfilePage() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: '/profile' }} replace />
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[560px] px-4 py-8 sm:px-6">
        <Card className="text-center">
          <div className="flex justify-center">
            <Avatar name={user.name} size={72} className="text-xl" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold tracking-tight text-text">{user.name}</h1>
          <p className="mt-0.5 text-sm text-text-2">{user.email}</p>
          <div className="mt-3 flex justify-center gap-2">
            <Tag tone={isAdmin ? 'brand' : 'fuel'}>
              <ShieldCheck size={11} /> {isAdmin ? 'Administrator' : 'Contributor'}
            </Tag>
          </div>
        </Card>

        <Card className="mt-4 p-5">
          <div className="flex items-center gap-3 text-[13.5px]">
            <CalendarDays size={16} className="text-text-3" />
            <span className="text-text-2">Joined</span>
            <span className="ml-auto font-semibold text-text">{formatDate(user.createdAt)}</span>
          </div>
        </Card>

        <div className="mt-6 flex flex-col gap-2.5">
          {isAdmin && (
            <Link to="/dashboard">
              <Button variant="secondary" block icon={BarChart3}>
                View Dashboard
              </Button>
            </Link>
          )}
          <Button
            variant={isAdmin ? 'ghost' : 'primary'}
            block
            icon={BarChart3}
            onClick={() => navigate('/report')}
          >
            Report a Price
          </Button>
          <Button
            variant="outline-danger"
            block
            icon={LogOut}
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
