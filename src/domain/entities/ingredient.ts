export type IngredientStatus = 'ACTIVO' | 'INACTIVO'

export interface Ingredient {
  id: string
  code: string
  category: string
  product: string
  presentation: string
  cost: number
  status: IngredientStatus
}
