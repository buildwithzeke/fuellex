import { Link } from 'react-router-dom'
import {
  BookOpen,
  Layers,
  PlugZap,
  Monitor,
  Database,
  ShieldCheck,
  Palette,
  ArrowUpRight,
  FileText,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import Card from '../components/ui/Card'

const DOCS = [
  {
    icon: BookOpen,
    title: 'README',
    description:
      'Project overview, tech stack, getting started guide, environment variables, and available scripts.',
    href: 'https://github.com/buildwithzeke/fuellex/blob/main/doc/README.md',
    badge: 'Start here',
    badgeTone: 'primary',
  },
  {
    icon: Layers,
    title: 'Architecture',
    description:
      'System design diagram, client and server layer breakdown, full request lifecycle trace, and data flow diagrams.',
    href: 'https://github.com/buildwithzeke/fuellex/blob/main/doc/architecture.md',
  },
  {
    icon: PlugZap,
    title: 'API Reference',
    description:
      'Every HTTP endpoint — method, path, auth requirement, request body, response shape, and error codes.',
    href: 'https://github.com/buildwithzeke/fuellex/blob/main/doc/api-reference.md',
  },
  {
    icon: Monitor,
    title: 'Frontend',
    description:
      'All pages, components, hooks, context providers, services, and utility libraries with props documented.',
    href: 'https://github.com/buildwithzeke/fuellex/blob/main/doc/frontend.md',
  },
  {
    icon: Database,
    title: 'Database',
    description:
      'Prisma schema, all three models column-by-column, enums, relations, cascade rules, and seed data.',
    href: 'https://github.com/buildwithzeke/fuellex/blob/main/doc/database.md',
  },
  {
    icon: ShieldCheck,
    title: 'Authentication',
    description:
      'Registration and login flows, JWT lifecycle, protect middleware, role-based authorization, and security notes.',
    href: 'https://github.com/buildwithzeke/fuellex/blob/main/doc/auth.md',
  },
  {
    icon: Palette,
    title: 'Design System',
    description:
      'Tailwind v4 tokens, colour palette, dark mode, typography scale, UI component props, animations, and custom CSS.',
    href: 'https://github.com/buildwithzeke/fuellex/blob/main/doc/design-system.md',
  },
]

const TONE_CLASSES = {
  primary: 'bg-primary-soft text-primary',
}

export default function DocsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[860px] px-4 py-10 sm:px-8">

        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-primary-soft text-primary">
            <FileText size={22} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-text">Documentation</h1>
            <p className="text-[13px] text-text-2">
              Everything you need to understand, run, and extend FuelLex.
            </p>
          </div>
        </div>

        {/* Intro note */}
        <p className="mt-5 rounded-[14px] border border-border bg-surface px-5 py-4 text-[13.5px] leading-relaxed text-text-2">
          FuelLex is a community-driven fuel price map for Nigeria. These docs cover the full stack —
          from the React frontend and Leaflet map to the Express API, Prisma schema, JWT auth, and
          Tailwind design system. Each document is self-contained so you can jump to the section you
          need without reading everything first.
        </p>

        {/* Doc cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {DOCS.map(({ icon: Icon, title, description, href, badge, badgeTone }) => (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-[16px]"
            >
              <Card hoverable className="h-full flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary">
                    <Icon size={19} />
                  </span>
                  <ArrowUpRight
                    size={15}
                    className="mt-1 shrink-0 text-text-3 transition-colors group-hover:text-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-bold text-text">{title}</h2>
                    {badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                          TONE_CLASSES[badgeTone] ?? TONE_CLASSES.primary
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-2">{description}</p>
                </div>
              </Card>
            </a>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-text-3">
          Documentation files live in{' '}
          <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-[11px] text-text-2">
            /doc
          </code>{' '}
          at the root of the repository.{' '}
          <Link to="/explore" className="font-semibold text-primary hover:underline">
            Back to the map →
          </Link>
        </p>
      </div>
    </AppShell>
  )
}
