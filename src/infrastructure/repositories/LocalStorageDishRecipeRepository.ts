import type { DishRecipe, RecipeIngredient } from '../../domain/entities'
import type {
  DishRecipeInput,
  DishRecipeRepository,
} from '../../application/ports/DishRecipeRepository'
import {
  readStoredCollection,
  writeStoredCollection,
} from '../storage/localStorage'

const STORAGE_KEY = 'lunch.dish-recipes.v1'

function isRecipeIngredient(value: unknown): value is RecipeIngredient {
  if (typeof value !== 'object' || value === null) return false

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.purchasePresentation === 'string' &&
    typeof candidate.purchasePrice === 'number' &&
    Number.isFinite(candidate.purchasePrice) &&
    candidate.purchasePrice >= 0 &&
    typeof candidate.purchaseQuantity === 'number' &&
    Number.isFinite(candidate.purchaseQuantity) &&
    candidate.purchaseQuantity > 0 &&
    typeof candidate.recipeQuantity === 'number' &&
    Number.isFinite(candidate.recipeQuantity) &&
    candidate.recipeQuantity >= 0
  )
}

function isDishRecipe(value: unknown): value is DishRecipe {
  if (typeof value !== 'object' || value === null) return false

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.dishId === 'string' &&
    typeof candidate.source === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    Array.isArray(candidate.ingredients) &&
    candidate.ingredients.every(isRecipeIngredient)
  )
}

export class LocalStorageDishRecipeRepository
  implements DishRecipeRepository
{
  private recipes: DishRecipe[] =
    readStoredCollection(STORAGE_KEY, isDishRecipe) ?? []

  listSnapshot(): DishRecipe[] {
    return [...this.recipes]
  }

  async list(): Promise<DishRecipe[]> {
    return this.listSnapshot()
  }

  async getByDishId(dishId: string): Promise<DishRecipe | null> {
    return this.recipes.find((recipe) => recipe.dishId === dishId) ?? null
  }

  async saveMany(recipes: DishRecipeInput[]): Promise<DishRecipe[]> {
    const updatedAt = new Date().toISOString()
    const saved = recipes.map((recipe) => ({
      ...recipe,
      updatedAt,
    }))
    const savedDishIds = new Set(saved.map((recipe) => recipe.dishId))

    this.recipes = [
      ...this.recipes.filter(
        (recipe) => !savedDishIds.has(recipe.dishId),
      ),
      ...saved,
    ]
    this.persist()

    return saved
  }

  async removeByDishId(dishId: string): Promise<void> {
    this.recipes = this.recipes.filter(
      (recipe) => recipe.dishId !== dishId,
    )
    this.persist()
  }

  private persist() {
    writeStoredCollection(STORAGE_KEY, this.recipes)
  }
}
