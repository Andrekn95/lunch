import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Trash2 } from 'lucide-react'
import type { Ingredient } from '../../../domain/entities'
import { importIngredientsUseCase } from '../../../infrastructure/container'
import {
  downloadCatalogTemplate,
  parseCatalogFile,
  toNewIngredient,
  type ParsedIngredientRow,
} from '../utils/catalogFile'
import { CatalogDropzone } from './CatalogDropzone'
import { InventoryPreviewTable } from './InventoryPreviewTable'

interface InventoryImportPanelProps {
  ingredients: Ingredient[]
  onImported: (count: number) => void
}

export function InventoryImportPanel({
  ingredients,
  onImported,
}: InventoryImportPanelProps) {
  const [rows, setRows] = useState<ParsedIngredientRow[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const existingCodes = useMemo(
    () => new Set(ingredients.map((ingredient) => ingredient.code.toUpperCase())),
    [ingredients],
  )

  const validRows = rows.filter((row) => row.errors.length === 0)

  function resetPreview() {
    setRows([])
    setFileName(null)
    setParseError(null)
    setImportError(null)
  }

  async function handleFileSelected(file: File) {
    setIsParsing(true)
    setParseError(null)
    setImportError(null)
    setRows([])
    setFileName(file.name)

    try {
      const parsedRows = await parseCatalogFile(file, existingCodes)

      if (parsedRows.length === 0) {
        setParseError('El archivo no contiene productos para importar.')
        return
      }

      setRows(parsedRows)
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
    if (validRows.length === 0 || isImporting) return

    setIsImporting(true)
    setImportError(null)

    try {
      await importIngredientsUseCase.execute(validRows.map(toNewIngredient))
      const importedCount = validRows.length
      resetPreview()
      onImported(importedCount)
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
        onDownloadTemplate={downloadCatalogTemplate}
      />

      {rows.length > 0 && (
        <>
          <InventoryPreviewTable rows={rows} />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm">
              <p className="font-semibold text-slate-900">
                {validRows.length} de {rows.length} productos listos para
                importar
              </p>
              <p className="text-xs text-slate-500">
                {rows.length - validRows.length > 0
                  ? 'Las filas con errores se omitirán. Corrige el archivo y vuelve a cargarlo si deseas incluirlas.'
                  : 'Los datos se guardan en esta sesión de demostración.'}
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
                disabled={validRows.length === 0 || isImporting}
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
                  : `Confirmar e importar (${validRows.length})`}
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
