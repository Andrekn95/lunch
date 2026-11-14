import type { LucideIcon } from 'lucide-react'
import { CheckCircle2 } from 'lucide-react'

type Accent = 'brand' | 'amber' | 'sky'

const ACCENTS: Record<
  Accent,
  { icon: string; badge: string; chip: string; bar: string }
> = {
  brand: {
    icon: 'bg-brand-100 text-brand-700',
    badge: 'bg-brand-50 text-brand-700 ring-brand-200',
    chip: 'bg-brand-50/70 text-brand-800',
    bar: 'bg-brand-600',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-700',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    chip: 'bg-amber-50/70 text-amber-800',
    bar: 'bg-amber-500',
  },
  sky: {
    icon: 'bg-sky-100 text-sky-700',
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    chip: 'bg-sky-50/70 text-sky-800',
    bar: 'bg-sky-500',
  },
}

interface RolePlaceholderProps {
  title: string
  description: string
  features: string[]
  icon: LucideIcon
  accent: Accent
}

export function RolePlaceholder({
  title,
  description,
  features,
  icon: Icon,
  accent,
}: RolePlaceholderProps) {
  const styles = ACCENTS[accent]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className={`h-1.5 w-full ${styles.bar}`} />

        <div className="p-8 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <span
              className={`flex size-14 items-center justify-center rounded-2xl ${styles.icon}`}
            >
              <Icon className="size-7" aria-hidden="true" />
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles.badge}`}
            >
              Módulo en construcción
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            {description}
          </p>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Próximas funcionalidades
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium ${styles.chip}`}
                >
                  <CheckCircle2
                    className="size-4 shrink-0 opacity-70"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
