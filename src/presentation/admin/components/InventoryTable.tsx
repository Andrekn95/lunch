import { useMemo, useState } from 'react'
import { Boxes, Search, SearchX } from 'lucide-react'
import type { Ingredient } from '../../../domain/entities'
import { formatCurrency } from '../../shared/utils/formatCurrency'
import { getCategoryBadgeClass } from '../utils/categoryStyles'

interface InventoryTableProps {
  ingredients: Ingredient[]
}

export function InventoryTable({ ingredients }: InventoryTableProps) {
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const categories = useMemo(
    () =>
      Array.from(
        new Set(ingredients.map((ingredient) => ingredient.category)),
      ).sort((left, right) => left.localeCompare(right, 'es')),
    [ingredients],
  )

  const filteredIngredients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return ingredients.filter((ingredient) => {
      const matchesCategory =
        categoryFilter === 'all' || ingredient.category === categoryFilter
      const matchesQuery =
        !normalizedQuery ||
        [ingredient.code, ingredient.product, ingredient.presentation, ingredient.category]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })
  }, [ingredients, query, categoryFilter])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Inventario actual
          </h3>
          <p className="text-xs text-slate-500">
            {ingredients.length} productos registrados en el catálogo de
            costeo.
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <label className="relative flex-1 sm:flex-none">
            <span className="sr-only">Buscar en inventario</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar producto o código…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-shadow placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-64"
            />
          </label>

          <label className="relative">
            <span className="sr-only">Filtrar por bodega</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-48"
            >
              <option value="all">Todas las bodegas</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {ingredients.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Boxes className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-900">
            Tu inventario está vacío
          </p>
          <p className="mt-1 max-w-xs text-xs text-slate-500">
            Importa un catálogo de costeo para empezar a controlar tus
            productos.
          </p>
        </div>
      ) : filteredIngredients.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <SearchX className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-900">
            Sin coincidencias
          </p>
          <p className="mt-1 max-w-xs text-xs text-slate-500">
            Prueba con otro producto, código o cambia la bodega seleccionada.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-5 py-2.5 font-semibold">
                  Código
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Producto
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Bodega
                </th>
                <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                  Costo
                </th>
                <th scope="col" className="px-5 py-2.5 font-semibold">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIngredients.map((ingredient) => (
                <tr key={ingredient.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-600">
                    {ingredient.code}
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-800">
                      {ingredient.product}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ingredient.presentation}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${getCategoryBadgeClass(ingredient.category)}`}
                    >
                      {ingredient.category}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-800">
                    {formatCurrency(ingredient.cost)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                        ingredient.status === 'ACTIVO'
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                          : 'bg-slate-100 text-slate-500 ring-slate-200'
                      }`}
                    >
                      {ingredient.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredIngredients.length > 0 && (
        <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span>
            Mostrando {filteredIngredients.length} de {ingredients.length}
          </span>
          <span>
            {filteredIngredients.filter((item) => item.status === 'ACTIVO').length}{' '}
            activos
          </span>
        </footer>
      )}
    </section>
  )
}
