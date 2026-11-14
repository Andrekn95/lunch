import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import {
  Download,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
} from 'lucide-react'

interface CatalogDropzoneProps {
  fileName: string | null
  isParsing: boolean
  error: string | null
  onFileSelected: (file: File) => void
  onDownloadTemplate: () => void
  title?: string
  description?: string
  templateLabel?: string
}

export function CatalogDropzone({
  fileName,
  isParsing,
  error,
  onFileSelected,
  onDownloadTemplate,
  title = 'Arrastra tu catálogo de costeo aquí',
  description = 'Archivo CSV o Excel (.xlsx) · máximo 10 MB',
  templateLabel = 'Descargar plantilla de ejemplo',
}: CatalogDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]
    if (file) onFileSelected(file)
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`rounded-3xl border-2 border-dashed p-6 text-center transition-colors ${
        isDragging
          ? 'border-brand-500 bg-brand-50'
          : 'border-slate-200 bg-slate-50/60'
      }`}
    >
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm ring-1 ring-inset ring-slate-200">
        <UploadCloud className="size-7" aria-hidden="true" />
      </span>

      <p className="mt-3 text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isParsing}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isParsing ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <FileSpreadsheet className="size-4" aria-hidden="true" />
          )}
          {isParsing ? 'Procesando…' : 'Seleccionar archivo'}
        </button>

        <button
          type="button"
          onClick={onDownloadTemplate}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Download className="size-4" aria-hidden="true" />
          {templateLabel}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) onFileSelected(file)
        }}
        className="sr-only"
      />

      {fileName && !error && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
          <FileSpreadsheet className="size-3.5" aria-hidden="true" />
          {fileName}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200"
        >
          {error}
        </p>
      )}
    </div>
  )
}
