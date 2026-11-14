import type { Ingredient } from '../../domain/entities'

export type NewIngredient = Omit<Ingredient, 'id'>

export interface IngredientRepository {
  list(): Promise<Ingredient[]>
  importMany(ingredients: NewIngredient[]): Promise<Ingredient[]>
}
