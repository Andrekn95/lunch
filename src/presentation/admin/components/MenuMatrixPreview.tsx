import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import {
  MENU_CATEGORY_SLOTS,
  MENU_SLOT_ROWS,
} from '../../../domain/entities'
import { getWeekStartIsoDate } from '../../../domain/value-objects/calendar'
import { getMenuWeek } from '../data/menuWeeks'
import { getDishCategoryBadgeClass } from '../utils/dishCategories'
import {
  getMenuMatrixDateLabel,
  type ParsedMenuMatrix,
} from '../utils/menuMatrixFile'

interface MenuMatrixPreviewProps {
  parsed: ParsedMenuMatrix
}

export function MenuMatrixPreview({ parsed }: MenuMatrixPreviewProps) {
  const validCells = parsed.cells.filter(
    (cell) => cell.category && cell.errors.length === 0,
  )
  const rejectedCells = parsed.cells.filter(
    (cell) => cell.errors.length > 0,
  )
  const cellMap = new Map<string, string[]>()

  for (const cell of validCells) {
    const key = `${cell.date}|${cell.category}`
    const dishNames = cellMap.get(key) ?? []
    dishNames.push(cell.dishName)
    cellMap.set(key, dishNames)
  }
  const weekStarts = Array.from(
    new Set(parsed.dates.map((date) => getWeekStartIsoDate(date))),
  ).sort()

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Previsualización del menú
          </h3>
          <p className="text-xs text-slate-500">
            Cada fecha se convertirá en una semana del constructor.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            {validCells.length} asignaciones
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
              rejectedCells.length > 0
                ? 'bg-rose-50 text-rose-700 ring-rose-200'
                : 'bg-slate-100 text-slate-500 ring-slate-200'
            }`}
          >
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            {rejectedCells.length} con errores
          </span>
        </div>
      </header>

      <div className="divide-y divide-slate-100">
        {weekStarts.map((weekStartDate) => {
          const week = getMenuWeek(weekStartDate)
          const datesInWeek = week.days.filter((day) =>
            parsed.dates.includes(day.isoDate),
          )

          return (
            <div key={week.id} className="px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-900">
                  {week.label} · {week.rangeLabel}
                </h4>
                <span className="text-[11px] font-medium text-slate-400">
                  {week.monthLabel}
                </span>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-500">
                      <th scope="col" className="w-32 px-2 py-2 font-semibold">
                        Categoría
                      </th>
                      {datesInWeek.map((day) => (
                        <th
                          key={day.isoDate}
                          scope="col"
                          className="px-2 py-2 font-semibold"
                        >
                          <span className="block">{day.dayLabel}</span>
                          <span className="block text-[10px] font-normal text-slate-400">
                            {day.dateLabel}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {MENU_SLOT_ROWS.map(({ category, slot }) => (
                      <tr key={`${category}-${slot}`}>
                        <th scope="row" className="px-2 py-2.5 text-left">
                          <span className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${getDishCategoryBadgeClass(category)}`}
                            >
                              {category}
                            </span>
                            {MENU_CATEGORY_SLOTS[category] > 1 && (
                              <span className="text-[10px] font-medium text-slate-400">
                                {slot + 1}
                              </span>
                            )}
                          </span>
                        </th>
                        {datesInWeek.map((day) => {
                          const dishName = cellMap.get(
                            `${day.isoDate}|${category}`,
                          )?.[slot]

                          return (
                            <td
                              key={`${day.isoDate}-${category}-${slot}`}
                              className={`px-2 py-2.5 ${
                                dishName
                                  ? 'font-medium text-slate-700'
                                  : 'text-slate-300'
                              }`}
                            >
                              {dishName ?? '—'}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      {rejectedCells.length > 0 && (
        <div className="border-t border-rose-100 bg-rose-50/50 px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-800">
            <AlertTriangle className="size-4" aria-hidden="true" />
            Celdas que no se importarán
          </p>
          <ul className="mt-2 space-y-1.5">
            {rejectedCells.map((cell) => (
              <li
                key={`${cell.rowNumber}-${cell.date}-${cell.dishName}`}
                className="text-[11px] text-rose-700"
              >
                Fila #{cell.rowNumber} ·{' '}
                {getMenuMatrixDateLabel(cell.date)} ·{' '}
                {cell.rawCategory || 'Sin categoría'} · "{cell.dishName}" —{' '}
                {cell.errors[0]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
