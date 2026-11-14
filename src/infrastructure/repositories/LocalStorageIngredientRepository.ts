import type { Ingredient } from '../../domain/entities'
import type {
  IngredientRepository,
  NewIngredient,
} from '../../application/ports/IngredientRepository'

const STORAGE_KEY = 'lunch.inventory.v1'

function isIngredient(value: unknown): value is Ingredient {
  if (typeof value !== 'object' || value === null) return false

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.code === 'string' &&
    typeof candidate.category === 'string' &&
    typeof candidate.product === 'string' &&
    typeof candidate.presentation === 'string' &&
    typeof candidate.cost === 'number' &&
    (candidate.status === 'ACTIVO' || candidate.status === 'INACTIVO')
  )
}

function readStoredIngredients(): Ingredient[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isIngredient)
  } catch {
    return []
  }
}

export class LocalStorageIngredientRepository implements IngredientRepository {
  private ingredients: Ingredient[] = readStoredIngredients()

  listSnapshot(): Ingredient[] {
    return [...this.ingredients]
  }

  async list(): Promise<Ingredient[]> {
    return this.listSnapshot()
  }

  async importMany(ingredients: NewIngredient[]): Promise<Ingredient[]> {
    const created = ingredients.map((ingredient) => ({
      ...ingredient,
      id: `ingredient-${crypto.randomUUID()}`,
    }))

    this.ingredients = [...this.ingredients, ...created]
    this.persist()

    return created
  }

  private persist() {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(this.ingredients),
      )
    } catch {
      return
    }
  }
}
