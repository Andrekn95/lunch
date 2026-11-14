import { useState } from 'react'
import { Loader2, Trash2, TriangleAlert } from 'lucide-react'
import type { Dish } from '../../../domain/entities'
import { Modal } from '../../shared/Modal'

interface DeleteDishDialogProps {
  dish: Dish
  onClose: () => void
  onConfirm: (dish: Dish) => Promise<void>
}

export function DeleteDishDialog({
  dish,
  onClose,
  onConfirm,
}: DeleteDishDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      await onConfirm(dish)
    } catch {
      setError('No se pudo eliminar el platillo. Inténtalo de nuevo.')
      setIsDeleting(false)
    }
  }

  return (
    <Modal open onClose={onClose} titleId="delete-dish-title" maxWidthClassName="max-w-md">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100">
          <TriangleAlert className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2
            id="delete-dish-title"
            className="text-lg font-semibold text-slate-900"
          >
            Eliminar platillo
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            ¿Seguro que quieres eliminar <strong>{dish.name}</strong> del
            catálogo? También se quitará de cualquier menú semanal donde esté
            asignado.
          </p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200"
        >
          {error}
        </p>
      )}

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => {
            void handleDelete()
          }}
          disabled={isDeleting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="size-4" aria-hidden="true" />
          )}
          {isDeleting ? 'Eliminando…' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  )
}
