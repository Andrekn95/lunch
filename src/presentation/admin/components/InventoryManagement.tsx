import { useEffect, useState } from 'react'
import {
  Boxes,
  CheckCircle2,
  Database,
  Upload,
  X,
} from 'lucide-react'
import type { Ingredient } from '../../../domain/entities'
import { ingredientRepository } from '../../../infrastructure/container'
import { InventoryImportPanel } from './InventoryImportPanel'
import { InventoryTable } from './InventoryTable'

type InventorySection = 'import' | 'current'

const SECTIONS = [
  {
    id: 'import',
    label: 'Importar catálogo',
    icon: Upload,
  },
  {
    id: 'current',
    label: 'Inventario actual',
    icon: Boxes,
  },
] as const

export function InventoryManagement() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(() =>
    ingredientRepository.listSnapshot(),
  )
  const [activeSection, setActiveSection] =
    useState<InventorySection>('import')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return

    const timeout = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  function handleImported(count: number) {
    setIngredients(ingredientRepository.listSnapshot())
    setToast(
      `Se ${count === 1 ? 'importó 1 producto' : `importaron ${count} productos`} correctamente.`,
    )
    setActiveSection('current')
  }

  const activeCount = ingredients.filter(
    (ingredient) => ingredient.status === 'ACTIVO',
  ).length
  const categoryCount = new Set(
    ingredients.map((ingredient) => ingredient.category),
  ).size

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100">
            <Boxes className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Inventario y catálogo de costeo
            </h2>
            <p className="text-xs text-slate-500">
              Importa tus productos desde CSV o Excel y mantén tus costos al
              día.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
            <Database className="size-3.5" aria-hidden="true" />
            {ingredients.length} productos
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            {activeCount} activos
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
            {categoryCount}{' '}
            {categoryCount === 1 ? 'bodega' : 'bodegas'}
          </span>
        </div>
      </header>

      {toast && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200"
        >
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <p className="flex-1">{toast}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Cerrar aviso"
            className="rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <div
        role="tablist"
        aria-label="Secciones de inventario"
        className="grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm"
      >
        {SECTIONS.map((section) => {
          const Icon = section.icon
          const isActive = section.id === activeSection

          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {section.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel">
        {activeSection === 'import' ? (
          <InventoryImportPanel
            ingredients={ingredients}
            onImported={handleImported}
          />
        ) : (
          <InventoryTable ingredients={ingredients} />
        )}
      </div>
    </div>
  )
}
