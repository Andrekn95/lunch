import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Trash2,
} from 'lucide-react'
import type { Dish } from '../../../domain/entities'
import type { ImportMenuMatrixResult } from '../../../application/use-cases/ImportMenuMatrixUseCase'
import { importMenuMatrixUseCase } from '../../../infrastructure/container'
import { getDishKey } from '../../../domain/value-objects/dish'
import {
  downloadMenuMatrixTemplate,
  parseMenuMatrixFile,
  type ParsedMenuMatrix,
} from '../utils/menuMatrixFile'
import { CatalogDropzone } from './CatalogDropzone'
import { MenuMatrixPreview } from './MenuMatrixPreview'

interface MenuMatrixImportPanelProps {
  dishes: Dish[]
  onImported: (result: ImportMenuMatrixResult) => void
}

export function MenuMatrixImportPanel({
  dishes,
  onImported,
}: MenuMatrixImportPanelProps) {
  const [parsed, setParsed] = useState<ParsedMenuMatrix | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const existingDishKeys = useMemo(
    () =>
      new Set(
        dishes.map((dish) => getDishKey(dish.category, dish.name)),
      ),
    [dishes],
  )

  const dishStats = useMemo(() => {
    if (!parsed) return { total: 0, existing: 0, created: 0 }

    const keys = new Set(
      parsed.entries.map((entry) =>
        getDishKey(entry.category, entry.dishName),
      ),
    )
    let existing = 0

    for (const key of keys) {
      if (existingDishKeys.has(key)) existing += 1
    }

    return {
      total: keys.size,
      existing,
      created: keys.size - existing,
    }
  }, [parsed, existingDishKeys])

  function resetPreview() {
    setParsed(null)
    setFileName(null)
    setParseError(null)
    setImportError(null)
  }

  async function handleFileSelected(file: File) {
    setIsParsing(true)
    setParseError(null)
    setImportError(null)
    setParsed(null)
    setFileName(file.name)

    try {
      setParsed(await parseMenuMatrixFile(file))
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
    if (!parsed || parsed.entries.length === 0 || isImporting) return

    setIsImporting(true)
    setImportError(null)

    try {
      const result = await importMenuMatrixUseCase.execute(parsed.entries)
      resetPreview()
      onImported(result)
    } catch {
      setImportError(
        'No se pudo completar la importación. Inténtalo de nuevo.',
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
        onDownloadTemplate={downloadMenuMatrixTemplate}
        title="Arrastra el menú semanal aquí"
        description="Categorías a la izquierda y fechas en las columnas · CSV o Excel (.xlsx)"
        templateLabel="Descargar plantilla matricial"
      />

      <p className="flex items-start gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-xs font-medium text-sky-800 ring-1 ring-inset ring-sky-200">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        La primera fila debe tener las fechas (por ejemplo 24/08/2026) y la
        primera columna las categorías. Cada día admite 1 sopa, 2 proteínas, 2
        guarniciones, 2 bebidas frías, 1 postre y 1 fruta. Los platillos se
        crean si aún no existen y las semanas aparecen en el constructor.
      </p>

      {parsed && (
        <>
          <MenuMatrixPreview parsed={parsed} />

          {parsed.warnings.length > 0 && (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
              <p className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="size-4" aria-hidden="true" />
                Revisa estos avisos
              </p>
              <ul className="mt-1.5 list-inside list-disc space-y-1">
                {parsed.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm">
              <p className="font-semibold text-slate-900">
                {parsed.entries.length} asignaciones en {parsed.weeks.length}{' '}
                {parsed.weeks.length === 1 ? 'semana' : 'semanas'}
              </p>
              <p className="text-xs text-slate-500">
                {dishStats.total} platillos únicos · {dishStats.existing} ya
                existen · {dishStats.created} se crearán
              </p>
              {parsed.entries.length === 0 && (
                <p className="mt-1 text-xs font-medium text-rose-700">
                  No hay celdas válidas para importar. Corrige las categorías
                  del archivo y vuelve a cargarlo.
                </p>
              )}
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
                disabled={parsed.entries.length === 0 || isImporting}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isImporting ? (
                  <Loader2
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                )}
                {isImporting
                  ? 'Importando…'
                  : `Confirmar e importar (${parsed.entries.length})`}
              </button>
            </div>
          </div>
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
