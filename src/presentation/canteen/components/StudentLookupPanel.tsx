import { useState } from 'react'
import type { FormEvent } from 'react'
import { ScanLine, Search } from 'lucide-react'
import type { CanteenStudent } from '../data/canteenStudents'
import { formatCurrency } from '../../shared/utils/formatCurrency'
import { StudentPhoto } from './StudentPhoto'

interface StudentLookupPanelProps {
  error: string | null
  demoStudents: CanteenStudent[]
  selectedStudentId: string | null
  onSearch: (query: string) => void
  onOpenScanner: () => void
  onSelectStudent: (student: CanteenStudent) => void
}

export function StudentLookupPanel({
  error,
  demoStudents,
  selectedStudentId,
  onSearch,
  onOpenScanner,
  onSelectStudent,
}: StudentLookupPanelProps) {
  const [query, setQuery] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!query.trim()) return
    onSearch(query)
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
        Identificar alumno
      </p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900">
        Escanea o busca el carnet
      </h2>

      <button
        type="button"
        onClick={onOpenScanner}
        className="mt-4 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-5 text-lg font-bold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40"
      >
        <ScanLine className="size-6" aria-hidden="true" />
        Escanear código QR
      </button>

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          o ingreso manual
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="QR, cédula o nombre"
            autoComplete="off"
            enterKeyHint="search"
            aria-label="Código QR, cédula o nombre del alumno"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <button
          type="submit"
          className="h-12 shrink-0 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50"
          disabled={!query.trim()}
        >
          Buscar
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200"
        >
          {error}
        </p>
      )}

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Acceso rápido · demo
        </p>
        <div className="mt-2 space-y-1.5">
          {demoStudents.map((student) => {
            const isSelected = student.id === selectedStudentId

            return (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelectStudent(student)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? 'border-brand-300 bg-brand-50'
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <StudentPhoto
                  name={student.name}
                  theme={student.photoTheme}
                  className="size-9 rounded-lg"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {student.name}
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    {student.grade} · {student.accessCode}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-slate-700">
                  {formatCurrency(student.balance)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
