import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Trash2,
} from 'lucide-react'
import type { Dish } from '../../../domain/entities'
import type { ImportDishCostsResult } from '../../../application/use-cases/ImportDishCostsUseCase'
import { importDishCostsUseCase } from '../../../infrastructure/container'
import {
  downloadCostTemplate,
  parseCostFile,
  resolveCostRecipes,
  type ParsedCostFile,
  type ResolvedCostRecipe,
} from '../utils/costFile'
import { CatalogDropzone } from './CatalogDropzone'
import { CostImportPreview } from './CostImportPreview'

interface CostImportPanelProps {
  dishes: Dish[]
  onImported: (
    result: ImportDishCostsResult,
    skippedUnassigned: number,
  ) => void
}

export function CostImportPanel({
  dishes,
  onImported,
}: CostImportPanelProps) {
  const [parsed, setParsed] = useState<ParsedCostFile | null>(null)
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [fileName, setFileName] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const resolvedRows = useMemo(
    () =>
      parsed
        ? resolveCostRecipes(parsed.recipes, dishes, mappings)
        : [],
    [parsed, dishes, mappings],
  )

  const readyRows = resolvedRows.filter(
    (row): row is ResolvedCostRecipe & { dish: Dish } =>
      Boolean(row.dish),
  )
  const unassignedCount = resolvedRows.length - readyRows.length
  const readyIngredientCount = readyRows.reduce(
    (total, row) => total + row.recipe.ingredients.length,
    0,
  )
  const warningCount = parsed
    ? parsed.warnings.length +
      parsed.recipes.reduce(
        (total, recipe) => total + recipe.warnings.length,
        0,
      )
    : 0
  const visibleWarnings = parsed
    ? [
        ...parsed.warnings,
        ...parsed.recipes.flatMap((recipe) =>
          recipe.warnings.map(
            (warning) => `${recipe.dishName}: ${warning}`,
          ),
        ),
      ].slice(0, 6)
    : []

  function resetPreview() {
    setParsed(null)
    setMappings({})
    setFileName(null)
    setParseError(null)
    setImportError(null)
  }

  async function handleFileSelected(file: File) {
    setIsParsing(true)
    setParseError(null)
    setImportError(null)
    setParsed(null)
    setMappings({})
    setFileName(file.name)

    try {
      const result = await parseCostFile(file)
      setParsed(result)
    } catch (error) {
      setParseError(
        error instanceof Error
          ? error.message
          : 'No pudimos leer el archivo. Verifica el formato e inténtalo de nuevo.',
      )
    } finally {
      setIsParsing(false)
    }
  }

  async function handleConfirmImport() {
    if (readyRows.length === 0 || isImporting) return

    setIsImporting(true)
    setImportError(null)

    try {
      const result = await importDishCostsUseCase.execute(
        readyRows.map(({ recipe, dish }) => ({
          dishId: dish.id,
          source: recipe.source,
          ingredients: recipe.ingredients,
        })),
      )
      const skippedUnassigned = unassignedCount
      resetPreview()
      onImported(result, skippedUnassigned)
    } catch {
      setImportError(
        'No se pudieron importar las recetas. Inténtalo de nuevo.',
      )
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <CatalogDropzone
        fileName={fileName}
        isParsing={isParsing}
        error={parseError}
        onFileSelected={(file) => {
          void handleFileSelected(file)
        }}
        onDownloadTemplate={downloadCostTemplate}
        title="Arrastra el archivo de costos y recetas aquí"
        description="Excel con una o varias hojas, o CSV · máximo 10 MB"
        templateLabel="Descargar plantilla de costos"
      />

      <p className="flex items-start gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-xs font-medium text-sky-800 ring-1 ring-inset ring-sky-200">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        El archivo puede contener varias recetas y hojas. Se reconocen las
        columnas <strong>Ingrediente</strong>,{' '}
        <strong>Presentación de compra</strong>, <strong>PVP compra</strong>,{' '}
        <strong>Cantidad de compra-presentación</strong>,{' '}
        <strong>Costo por gr o uni</strong>, <strong>Cantidad en receta</strong>{' '}
        y <strong>Costo en receta</strong>. Los platillos se asignan
        automáticamente por nombre y puedes corregir el mapeo antes de
        importar.
      </p>

      {parsed && (
        <>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Recetas detectadas
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {parsed.recipes.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Líneas de ingredientes
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {parsed.totalIngredientRows}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                Listas para importar
              </p>
              <p className="mt-1 text-lg font-semibold text-emerald-900">
                {readyRows.length}
              </p>
              <p className="text-[11px] text-emerald-700">
                {readyIngredientCount} ingredientes
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                Sin asignar
              </p>
              <p className="mt-1 text-lg font-semibold text-amber-900">
                {unassignedCount}
              </p>
              <p className="text-[11px] text-amber-700">
                {parsed.sheetCount}{' '}
                {parsed.sheetCount === 1 ? 'hoja leída' : 'hojas leídas'}
              </p>
            </div>
          </div>

          {parsed.recipes.length === 0 ? (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-200">
              <p className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="size-4" aria-hidden="true" />
                No se detectaron recetas en el archivo
              </p>
              <p className="mt-1 text-xs">
                Revisa que cada receta tenga un título antes de su tabla de
                ingredientes y que las columnas coincidan con el formato
                indicado.
              </p>
            </div>
          ) : (
            <>
              {warningCount > 0 && (
                <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="size-4" aria-hidden="true" />
                    {warningCount}{' '}
                    {warningCount === 1
                      ? 'advertencia de lectura'
                      : 'advertencias de lectura'}
                  </p>
                  <ul className="mt-1.5 list-inside list-disc space-y-1">
                    {visibleWarnings.map((warning, index) => (
                      <li key={`${index}-${warning}`}>{warning}</li>
                    ))}
                  </ul>
                  {warningCount > visibleWarnings.length && (
                    <p className="mt-1 font-medium">
                      Hay {warningCount - visibleWarnings.length} avisos más.
                    </p>
                  )}
                </div>
              )}

              <CostImportPreview
                rows={resolvedRows}
                dishes={dishes}
                mappings={mappings}
                onMap={(recipeKey, dishId) => {
                  setMappings((current) => ({
                    ...current,
                    [recipeKey]: dishId,
                  }))
                }}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">
                    {readyRows.length} de {resolvedRows.length} recetas listas
                  </p>
                  <p className="text-xs text-slate-500">
                    {unassignedCount > 0
                      ? `${unassignedCount} recetas sin asignar se omitirán.`
                      : 'Las recetas existentes de estos platillos se reemplazarán.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={resetPreview}
                    disabled={isImporting}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Descartar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleConfirmImport()
                    }}
                    disabled={readyRows.length === 0 || isImporting}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isImporting ? (
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <CheckCircle2
                        className="size-4"
                        aria-hidden="true"
                      />
                    )}
                    {isImporting
                      ? 'Importando…'
                      : `Importar recetas (${readyRows.length})`}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {importError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          {importError}
        </p>
      )}
    </div>
  )
}
