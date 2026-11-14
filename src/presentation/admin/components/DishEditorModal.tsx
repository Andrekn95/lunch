import { useState } from 'react'
import type { FormEvent } from 'react'
import { ChefHat, Loader2, X } from 'lucide-react'
import type { Dish, DishCategory } from '../../../domain/entities'
import { DISH_CATEGORIES } from '../../../domain/entities'
import type { DishInput } from '../../../application/ports/DishRepository'
import { getDishKey } from '../../../domain/value-objects/dish'
import { Modal } from '../../shared/Modal'

interface DishEditorModalProps {
  dish: Dish | null
  dishes: Dish[]
  onClose: () => void
  onSave: (input: DishInput) => Promise<void>
}

export function DishEditorModal({
  dish,
  dishes,
  onClose,
  onSave,
}: DishEditorModalProps) {
  const [name, setName] = useState(dish?.name ?? '')
  const [category, setCategory] = useState<DishCategory>(
    dish?.category ?? 'Sopa',
  )
  const [description, setDescription] = useState(dish?.description ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('El nombre del platillo es obligatorio.')
      return
    }

    const duplicated = dishes.some(
      (item) =>
        item.id !== dish?.id &&
        getDishKey(item.category, item.name) ===
          getDishKey(category, trimmedName),
    )

    if (duplicated) {
      setError('Ya existe un platillo con ese nombre en esta categoría.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await onSave({
        id: dish?.id,
        name: trimmedName,
        category,
        description: description.trim(),
      })
    } catch {
      setError('No se pudo guardar el platillo. Inténtalo de nuevo.')
      setIsSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      titleId="dish-editor-title"
      maxWidthClassName="max-w-lg"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100">
            <ChefHat className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
              Catálogo de platillos
            </p>
            <h2
              id="dish-editor-title"
              className="mt-0.5 text-xl font-semibold text-slate-900"
            >
              {dish ? 'Editar platillo' : 'Nuevo platillo'}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar editor de platillo"
          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="dish-name"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
          >
            Nombre del platillo <span className="text-rose-500">*</span>
          </label>
          <input
            id="dish-name"
            type="text"
            value={name}
            autoFocus
            placeholder="Ej. Sopa de chifles"
            onChange={(event) => {
              setName(event.target.value)
              if (error) setError(null)
            }}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="dish-category"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
          >
            Categoría <span className="text-rose-500">*</span>
          </label>
          <select
            id="dish-category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value as DishCategory)
              if (error) setError(null)
            }}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {DISH_CATEGORIES.map((dishCategory) => (
              <option key={dishCategory} value={dishCategory}>
                {dishCategory}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="dish-description"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
          >
            Descripción <span className="font-normal normal-case">(opcional)</span>
          </label>
          <textarea
            id="dish-description"
            value={description}
            rows={3}
            placeholder="Ingredientes o notas de preparación"
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200"
          >
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {isSaving ? 'Guardando…' : 'Guardar platillo'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
