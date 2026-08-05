import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Sun, Moon, BarChart3, MapPinPlus, X, BookOpen } from 'lucide-react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import IconButton from '../ui/IconButton'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

/** Frosted sticky navbar with expanded mobile search & responsive quick action pills. */
export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { theme, toggle } = useTheme()
  const [query, setQuery] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!query.trim()) {
      navigate('/explore')
      return
    }
    const target = `/explore?search=${encodeURIComponent(query.trim())}`
    navigate(target)
  }

  const handleAddStation = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/explore?add=true' } })
    } else {
      navigate('/explore?add=true')
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2.5 px-3.5 py-2.5 sm:px-6 md:flex-row md:items-center md:gap-4 md:py-3">
        {/* Main top bar container */}
        <div className="flex items-center justify-between gap-2.5 md:flex-1 md:justify-start">
          {/* Mobile brand mark */}
          <div className="shrink-0 md:hidden">
            <Logo markSize={34} />
          </div>

          {/* Desktop full logo */}
          <div className="hidden shrink-0 md:block">
            <Logo />
          </div>

          {/* Prominent, touch-friendly Search Input */}
          <form onSubmit={submit} className="flex-1 min-w-0 md:max-w-[520px]">
            <label className="relative flex h-11 w-full items-center gap-2.5 rounded-[14px] border border-border bg-bg px-3.5 text-text-3 transition-all focus-within:border-primary focus-within:bg-surface focus-within:ring-4 focus-within:ring-primary/15 sm:h-10 sm:rounded-[12px] sm:px-3">
              <Search size={18} strokeWidth={2.2} className="shrink-0 text-text-3" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search station, area, or address…"
                className="w-full bg-transparent font-sans text-[15px] text-text outline-none placeholder:text-text-3 sm:text-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-text-3 hover:bg-border hover:text-text"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </label>
          </form>

          {/* Mobile Right Controls: Theme Toggle + Profile / Sign In */}
          <div className="flex items-center gap-1.5 shrink-0 md:hidden">
            <IconButton label={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={toggle} size={38}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
            {isAuthenticated && user ? (
              <Link to="/profile" aria-label="Profile">
                <Avatar name={user.name} size="sm" />
              </Link>
            ) : (
              <Button size="xs" onClick={() => navigate('/login')}>
                Sign in
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Navigation Actions */}
        <div className="hidden items-center gap-2.5 shrink-0 md:flex">
          <Button
            variant="secondary"
            size="sm"
            icon={MapPinPlus}
            onClick={handleAddStation}
          >
            Add Station
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={BarChart3}
            onClick={() => navigate('/report')}
          >
            Report Price
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={BookOpen}
            onClick={() => navigate('/docs')}
          >
            Docs
          </Button>

          <IconButton label={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={toggle}>
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </IconButton>

          {isAuthenticated && user ? (
            <Link to="/profile" aria-label="Profile">
              <Avatar name={user.name} />
            </Link>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>
              Sign in
            </Button>
          )}
        </div>

        {/* Mobile Row 2 Quick Actions */}
        <div className="flex items-center gap-2 pt-0.5 md:hidden">
          <Button
            variant="secondary"
            size="sm"
            icon={MapPinPlus}
            block
            onClick={handleAddStation}
            className="text-xs font-bold py-2"
          >
            Add Station
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={BarChart3}
            block
            onClick={() => navigate('/report')}
            className="text-xs font-bold py-2"
          >
            Report Price
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={BookOpen}
            block
            onClick={() => navigate('/docs')}
            className="text-xs font-bold py-2"
          >
            Docs
          </Button>
        </div>
      </div>
    </header>
  )
}
