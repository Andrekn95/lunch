import { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleHelp,
} from 'lucide-react'
import type { Dish } from '../../../domain/entities'
import { getRecipeIngredientsTotalCost } from '../../../domain/entities'
import type { ResolvedCostRecipe } from '../utils/costFile'
import { formatCostCurrency } from '../utils/costFormat'

interface CostImportPreviewProps {
  rows: ResolvedCostRecipe[]
  dishes: Dish[]
  mappings: Record<string, string>
  onMap: (recipeKey: string, dishId: string) => void
}

const PAGE_SIZE = 12

export function CostImportPreview({
  rows,
  dishes,
  mappings,
  onMap,
}: CostImportPreviewProps) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageRows = rows.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  )
  const sortedDishes = useMemo(
    () =>
      [...dishes].sort((left, right) =>
        left.name.localeCompare(right.name, 'es'),
      ),
    [dishes],
  )

  if (rows.length === 0) return null

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Recetas detectadas
          </h3>
          <p className="text-xs text-slate-500">
            Revisa el mapeo automático y asigna manualmente los platillos que
            no se reconocieron.
          </p>
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
          {rows.length} {rows.length === 1 ? 'receta' : 'recetas'}
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Platillo del archivo
              </th>
              <th scope="col" className="px-3 py-2.5 font-semibold">
                Origen
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                Ingredientes
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                Costo estimado
              </th>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Platillo del sistema
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageRows.map(({ recipe, dish, isManual }) => {
              const selectedId = dish?.id ?? (mappings[recipe.key] || '')

              return (
                <tr key={recipe.key} className="align-top hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">
                      {recipe.dishName}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Fila {recipe.rowNumber}
                    </p>
                  </td>
                  <td className="max-w-40 px-3 py-3 text-xs text-slate-500">
                    <span className="line-clamp-2">{recipe.source}</span>
                  </td>
                  <td className="px-3 py-3 text-right text-xs tabular-nums text-slate-600">
                    {recipe.ingredients.length}
                  </td>
                  <td className="px-3 py-3 text-right text-xs font-semibold tabular-nums text-slate-800">
                    {formatCostCurrency(
                      getRecipeIngredientsTotalCost(recipe.ingredients),
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1.5">
                      <label className="block">
                        <span className="sr-only">
                          Asignar {recipe.dishName} a un platillo
                        </span>
                        <select
                          value={selectedId}
                          onChange={(event) =>
                            onMap(recipe.key, event.target.value)
                          }
                          className={`h-9 w-full rounded-xl border bg-white px-2.5 text-xs font-medium outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
                            dish
                              ? 'border-slate-200 text-slate-700'
                              : 'border-amber-300 text-amber-800'
                          }`}
                        >
                          {!dish && (
                            <option value="">Sin asignar</option>
                          )}
                          {sortedDishes.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name} · {option.category}
                            </option>
                          ))}
                        </select>
                      </label>
                      <p
                        className={`flex items-center gap-1 text-[10px] font-medium ${
                          dish
                            ? isManual
                              ? 'text-brand-700'
                              : 'text-emerald-600'
                            : 'text-amber-700'
                        }`}
                      >
                        {dish ? (
                          <>
                            <CircleCheck
                              className="size-3"
                              aria-hidden="true"
                            />
                            {isManual
                              ? 'Asignación manual'
                              : 'Coincidencia automática'}
                          </>
                        ) : (
                          <>
                            <CircleHelp
                              className="size-3"
                              aria-hidden="true"
                            />
                            Se omitirá si no se asigna
                          </>
                        )}
                      </p>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        <span>
          Mostrando {safePage * PAGE_SIZE + 1}–
          {Math.min((safePage + 1) * PAGE_SIZE, rows.length)} de {rows.length}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, safePage - 1))}
            disabled={safePage === 0}
            aria-label="Página anterior"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span className="min-w-14 text-center font-medium text-slate-600">
            {safePage + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage(Math.min(totalPages - 1, safePage + 1))
            }
            disabled={safePage >= totalPages - 1}
            aria-label="Página siguiente"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </section>
  )
}
