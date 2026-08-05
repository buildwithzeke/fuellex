import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  LocateFixed,
  BarChart3,
  Fuel,
  MapPin,
  Zap,
  ArrowRight,
  MessageCircle,
  AtSign,
  GitBranch,
  Briefcase,
  Camera,
  BadgeCheck,
  BookOpen,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'

const FEATURES = [
  {
    icon: Fuel,
    title: '4 fuel types',
    text: 'Live prices for PMS, AGO, DPK and LPG at stations across Lagos.',
  },
  {
    icon: MapPin,
    title: 'Price-coded pins',
    text: 'Green, blue, orange and red pins tell you cheap vs expensive at a glance.',
  },
  {
    icon: Zap,
    title: 'Fresh updates',
    text: 'Community reports refresh prices every few minutes — no stale data.',
  },
]

const SOCIALS = [
  { label: 'X (Twitter)', href: 'https://x.com/buildwithzeke', icon: AtSign },
  { label: 'GitHub', href: 'https://github.com/buildwithzeke', icon: GitBranch },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/buildwithzeke', icon: Briefcase },
  { label: 'Instagram', href: 'https://www.instagram.com/buildwithzeke', icon: Camera },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const submit = (e) => {
    e.preventDefault()
    navigate(`/explore${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ''}`)
  }

  return (
    <AppShell>
      {/* Hero — .hero from the mockup */}
      <section
        className="relative overflow-hidden px-5 pt-12 pb-16 sm:px-10 sm:pt-16 sm:pb-24"
        style={{
          background:
            'radial-gradient(700px 300px at 85% -10%, rgba(96,165,250,.35), transparent 60%), radial-gradient(600px 260px at -10% 110%, rgba(52,211,153,.18), transparent 60%), linear-gradient(180deg, var(--color-bg) 0%, var(--color-primary-soft) 100%)',
        }}
      >
        <div className="mx-auto max-w-[1200px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-text-2 shadow-sm">
            <span className="animate-fl-pulse h-2 w-2 rounded-full bg-success" />
            1,240 live price reports across Lagos
          </span>

          <h1 className="mt-6 max-w-[640px] text-4xl leading-[1.08] font-extrabold tracking-tight text-text sm:text-[42px]">
            Never queue for <em className="text-primary not-italic">affordable fuel</em> again.
          </h1>
          <p className="mt-2 max-w-[460px] text-base text-text-2">
            Community-reported pump prices, live availability and nearby stations — all on one map.
          </p>

          {/* .hero-search */}
          <form
            onSubmit={submit}
            className="mt-7 flex max-w-[560px] items-center gap-3 rounded-[18px] border border-border bg-surface p-2.5 pl-5 shadow-lg"
          >
            <Search size={17} className="shrink-0 text-text-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Where do you need fuel?"
              className="min-w-0 flex-1 bg-transparent font-sans text-[15px] text-text outline-none placeholder:text-text-3"
            />
            <Button type="submit" className="hidden sm:inline-flex">
              Find Fuel
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              size="lg"
              variant="secondary"
              icon={LocateFixed}
              onClick={() => navigate('/explore')}
            >
              Find Nearby
            </Button>
            <Button size="lg" variant="success" icon={BarChart3} onClick={() => navigate('/report')}>
              Report Price
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-6">
            <span className="inline-flex items-center gap-2 rounded-[10px] border border-dashed border-border bg-surface px-3 py-2 text-xs text-text-3">
              <Fuel size={13} /> 4 fuel types · PMS, AGO, DPK, LPG
            </span>
            <span className="inline-flex items-center gap-2 rounded-[10px] border border-dashed border-border bg-surface px-3 py-2 text-xs text-text-3">
              <span className="flex gap-1">
                <i className="h-2 w-2 rounded-full bg-success" />
                <i className="h-2 w-2 rounded-full bg-warning" />
                <i className="h-2 w-2 rounded-full bg-danger" />
              </span>
              Price-based pin colors
            </span>
            <span className="inline-flex items-center gap-2 rounded-[10px] border border-dashed border-border bg-surface px-3 py-2 text-xs text-text-3">
              <Zap size={13} /> Updates every few minutes
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-[1200px] px-5 py-14 sm:px-10">
        <div className="mb-8 max-w-[480px]">
          <h2 className="text-[22px] font-extrabold tracking-tight text-text">
            Fuel intelligence, crowdsourced
          </h2>
          <p className="mt-1 text-[13px] text-text-2">
            Every report makes the map sharper for the next driver.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <Card key={title} hoverable>
              <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-primary-soft text-primary">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 text-[15px] font-bold text-text">{title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-text-2">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-[1200px] px-5 pb-16 sm:px-10">
        <div className="flex flex-col items-start gap-4 rounded-[24px] bg-primary p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Know the price before you drive
            </h2>
            <p className="mt-1 text-[13.5px] text-white/80">
              Report the last price you paid and help your community save.
            </p>
          </div>
          <Button
            size="lg"
            variant="secondary"
            icon={ArrowRight}
            onClick={() => navigate('/report')}
          >
            Report a price
          </Button>
        </div>
      </section>

      {/* Developer — built by */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Big image */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar name="Ezekiel Ayebidun" size={300} className="text-6xl" />
              <span className="absolute -right-2 -bottom-2 grid h-11 w-11 place-items-center rounded-full bg-success text-white ring-4 ring-surface">
                <BadgeCheck size={24} />
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-text-2 shadow-sm">
              Built by a developer
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
              Ezekiel Ayebidun
            </h2>
            <p className="mt-1 text-[15px] font-semibold text-primary">
              Full Stack · Software Engineer
            </p>
            <p className="mt-4 max-w-[480px] text-[14px] leading-relaxed text-text-2">
              I built FuelLex from the ground up — the design system, the live Lagos
              fuel-price API and this map. Prices are community-reported, so the data
              stays honest and fresh.
            </p>

            <div className="mt-7 flex items-center justify-center gap-2.5 lg:justify-start">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="grid h-11 w-11 place-items-center rounded-[12px] border border-border bg-surface text-text-2 transition-all duration-200 hover:border-primary hover:bg-primary-soft hover:text-primary active:scale-95"
                >
                  <Icon size={19} />
                </a>
              ))}
            </div>

            <a
              href={`https://wa.me/2348100196214?text=${encodeURIComponent(
                'Hi Ezekiel! I found FuelLex and would love to talk.'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-block"
            >
              <Button size="lg" icon={MessageCircle}>
                Chat with me on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface px-5 py-8 sm:px-10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <span className="text-[12.5px] text-text-3">
            <b className="text-text-2">FuelLex</b> — community fuel prices for Nigeria.
            <span className="ml-2">Prices are community-reported and may vary. {new Date().getFullYear()}</span>
          </span>
          <Link
            to="/docs"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-3.5 py-1.5 text-[12.5px] font-semibold text-text-2 transition-all hover:border-primary hover:bg-primary-soft hover:text-primary"
          >
            <BookOpen size={13} />
            Read the docs
          </Link>
        </div>
      </footer>
    </AppShell>
  )
}
