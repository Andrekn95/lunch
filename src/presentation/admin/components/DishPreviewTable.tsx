import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { DISH_CATEGORIES } from '../../../domain/entities'
import { getDishCategoryBadgeClass } from '../utils/dishCategories'
import type { ParsedDishRow } from '../utils/dishFile'

interface DishPreviewTableProps {
  rows: ParsedDishRow[]
}

export function DishPreviewTable({ rows }: DishPreviewTableProps) {
  const validCount = rows.filter((row) => row.errors.length === 0).length
  const errorCount = rows.length - validCount

  const categorySummary = rows.reduce<Record<string, number>>(
    (summary, row) => {
      const key = row.category ?? 'Sin categoría'
      summary[key] = (summary[key] ?? 0) + 1
      return summary
    },
    {},
  )

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Previsualización del catálogo
          </h3>
          <p className="text-xs text-slate-500">
            Revisa la categoría y el nombre de cada platillo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            {validCount} listos
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
              errorCount > 0
                ? 'bg-rose-50 text-rose-700 ring-rose-200'
                : 'bg-slate-100 text-slate-500 ring-slate-200'
            }`}
          >
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            {errorCount} con errores
          </span>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-3">
        {Object.entries(categorySummary).map(([category, count]) => (
          <span
            key={category}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${getDishCategoryBadgeClass(
              DISH_CATEGORIES.find((item) => item === category) ?? null,
            )}`}
          >
            {category}
            <span className="font-semibold">{count}</span>
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-3 py-2.5 font-semibold">
                Fila
              </th>
              <th scope="col" className="px-3 py-2.5 font-semibold">
                Categoría
              </th>
              <th scope="col" className="px-3 py-2.5 font-semibold">
                Platillo
              </th>
              <th scope="col" className="px-3 py-2.5 font-semibold">
                Descripción
              </th>
              <th scope="col" className="px-3 py-2.5 font-semibold">
                Validación
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const hasErrors = row.errors.length > 0

              return (
                <tr
                  key={`${row.rowNumber}-${row.name}`}
                  className={hasErrors ? 'bg-rose-50/40' : undefined}
                >
                  <td className="px-3 py-3 text-xs text-slate-400">
                    #{row.rowNumber}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${getDishCategoryBadgeClass(row.category)}`}
                    >
                      {row.category ?? (row.rawCategory || '—')}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-800">
                    {row.name || '—'}
                  </td>
                  <td className="max-w-64 px-3 py-3 text-xs text-slate-500">
                    <span className="line-clamp-1">
                      {row.description || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {hasErrors ? (
                      <span
                        title={row.errors.join(' · ')}
                        className="inline-flex max-w-72 items-center gap-1 text-xs font-medium text-rose-700"
                      >
                        <XCircle
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{row.errors[0]}</span>
                        {row.errors.length > 1 && (
                          <span className="shrink-0 text-rose-500">
                            +{row.errors.length - 1}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2
                          className="size-3.5"
                          aria-hidden="true"
                        />
                        Listo para importar
                      </span>
                    )}
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
