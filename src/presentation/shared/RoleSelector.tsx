import type { UserRole } from '../../domain/entities'
import { ROLE_OPTIONS } from './roleOptions'

interface RoleSelectorProps {
  activeRole: UserRole
  onChange: (role: UserRole) => void
}

export function RoleSelector({ activeRole, onChange }: RoleSelectorProps) {
  return (
    <nav
      aria-label="Selector de rol de demostración"
      className="fixed inset-x-0 bottom-4 z-50 px-4"
    >
      <div className="mx-auto flex max-w-2xl items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-lg shadow-slate-900/5 backdrop-blur-md sm:rounded-full sm:p-2">
        <span className="hidden shrink-0 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:block">
          Demo
        </span>

        {ROLE_OPTIONS.map((option) => {
          const Icon = option.icon
          const isActive = option.id === activeRole

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={isActive}
              className={`group flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:rounded-full ${
                isActive
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`size-4 shrink-0 transition-transform ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">{option.label}</span>
              <span className="sm:hidden">{option.shortLabel}</span>
              {isActive && (
                <span className="ml-1 hidden items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide md:inline-flex">
                  Activo
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
