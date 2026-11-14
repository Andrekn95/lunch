import { useMemo, useState } from 'react'
import {
  ChefHat,
  Pencil,
  Plus,
  Search,
  SearchX,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import type { Dish, DishCategory } from '../../../domain/entities'
import { DISH_CATEGORIES } from '../../../domain/entities'
import { getDishCategoryBadgeClass } from '../utils/dishCategories'
import { normalizeText } from '../utils/spreadsheet'

interface DishCatalogTableProps {
  dishes: Dish[]
  onEdit: (dish: Dish) => void
  onDelete: (dish: Dish) => void
  onCreate: () => void
  onImport: () => void
  onLoadSamples: () => void
}

export function DishCatalogTable({
  dishes,
  onEdit,
  onDelete,
  onCreate,
  onImport,
  onLoadSamples,
}: DishCatalogTableProps) {
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | DishCategory>(
    'all',
  )

  const categories = useMemo(
    () =>
      DISH_CATEGORIES.filter((category) =>
        dishes.some((dish) => dish.category === category),
      ),
    [dishes],
  )

  const filteredDishes = useMemo(() => {
    const normalizedQuery = normalizeText(query)

    return dishes.filter((dish) => {
      const matchesCategory =
        categoryFilter === 'all' || dish.category === categoryFilter
      const matchesQuery =
        !normalizedQuery ||
        normalizeText(
          `${dish.name} ${dish.category} ${dish.description}`,
        ).includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })
  }, [dishes, query, categoryFilter])

  if (dishes.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100">
            <ChefHat className="size-7" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Tu catálogo de platillos está vacío
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Registra los platillos que sabe preparar el colegio o importa una
            lista desde Excel o CSV. Luego podrás armar los menús semanales.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <Plus className="size-4" aria-hidden="true" />
              Nuevo platillo
            </button>
            <button
              type="button"
              onClick={onImport}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Upload className="size-4" aria-hidden="true" />
              Importar archivo
            </button>
            <button
              type="button"
              onClick={onLoadSamples}
              className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Cargar catálogo de ejemplo
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Catálogo maestro
          </h3>
          <p className="text-xs text-slate-500">
            {dishes.length} platillos en {categories.length} de{' '}
            {DISH_CATEGORIES.length} categorías.
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <label className="relative flex-1 sm:flex-none">
            <span className="sr-only">Buscar platillo</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar platillo…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-shadow placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-60"
            />
          </label>

          <label className="relative">
            <span className="sr-only">Filtrar por categoría</span>
            <select
              value={categoryFilter}
              onChange={(event) => {
                const value = event.target.value
                setCategoryFilter(
                  value === 'all' ? 'all' : (value as DishCategory),
                )
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-44"
            >
              <option value="all">Todas las categorías</option>
              {DISH_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {filteredDishes.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <SearchX className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-900">
            Sin coincidencias
          </p>
          <p className="mt-1 max-w-xs text-xs text-slate-500">
            Prueba con otro nombre o cambia la categoría seleccionada.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setCategoryFilter('all')
            }}
            className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-5 py-2.5 font-semibold">
                  Platillo
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Categoría
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Descripción
                </th>
                <th scope="col" className="px-5 py-2.5 text-right font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDishes.map((dish) => (
                <tr key={dish.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {dish.name}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${getDishCategoryBadgeClass(dish.category)}`}
                    >
                      {dish.category}
                    </span>
                  </td>
                  <td className="max-w-72 px-3 py-3 text-xs text-slate-500">
                    <span className="line-clamp-1">
                      {dish.description || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(dish)}
                        aria-label={`Editar ${dish.name}`}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(dish)}
                        aria-label={`Eliminar ${dish.name}`}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredDishes.length > 0 && (
        <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span>
            Mostrando {filteredDishes.length} de {dishes.length} platillos
          </span>
          <span>
            {categories.length}{' '}
            {categories.length === 1 ? 'categoría activa' : 'categorías activas'}
          </span>
        </footer>
      )}
    </section>
  )
}
