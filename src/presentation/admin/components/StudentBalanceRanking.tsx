import { useMemo } from 'react'
import { AlertTriangle, ListOrdered } from 'lucide-react'
import type { BalanceStatus } from '../../../domain/value-objects/balance'
import { getBalanceStatus } from '../../../domain/value-objects/balance'
import type { AdminStudent } from '../data/adminDashboardData'
import { formatCurrency } from '../../shared/utils/formatCurrency'
import { getInitials } from '../../shared/utils/getInitials'

const STATUS_STYLES: Record<
  BalanceStatus,
  { label: string; badge: string; dot: string; row: string }
> = {
  empty: {
    label: 'Sin saldo',
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    dot: 'bg-rose-500',
    row: 'bg-rose-50/40',
  },
  low: {
    label: 'Saldo bajo',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
    row: 'bg-amber-50/30',
  },
  healthy: {
    label: 'Saldo saludable',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
    row: '',
  },
}

interface StudentBalanceRankingProps {
  students: AdminStudent[]
}

export function StudentBalanceRanking({
  students,
}: StudentBalanceRankingProps) {
  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => a.balance - b.balance),
    [students],
  )

  const criticalCount = sortedStudents.filter(
    (student) => getBalanceStatus(student.balance) === 'empty',
  ).length

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
            <ListOrdered className="size-4" aria-hidden="true" />
            Ranking de alumnos
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            Saldo de menor a mayor
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Los primeros lugares requieren seguimiento por saldo agotado o bajo.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
          <AlertTriangle className="size-3.5" aria-hidden="true" />
          {criticalCount} en alerta
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 text-center font-semibold sm:px-6">#</th>
              <th className="px-4 py-3 font-semibold">Estudiante</th>
              <th className="px-4 py-3 font-semibold">Padre / Madre</th>
              <th className="px-4 py-3 font-semibold">Saldo actual</th>
              <th className="px-5 py-3 font-semibold sm:px-6">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedStudents.map((student, index) => {
              const status = STATUS_STYLES[getBalanceStatus(student.balance)]

              return (
                <tr
                  key={student.id}
                  className={`transition-colors hover:bg-slate-50/70 ${status.row}`}
                >
                  <td className="px-5 py-3.5 text-center sm:px-6">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-xs font-semibold text-brand-800">
                        {getInitials(student.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500">{student.grade}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {student.parentName}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900">
                    {formatCurrency(student.balance)}
                  </td>
                  <td className="px-5 py-3.5 sm:px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${status.badge}`}
                    >
                      <span className={`size-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
