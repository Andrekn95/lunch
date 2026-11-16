export interface RecipeIngredient {
  id: string
  name: string
  purchasePresentation: string
  purchasePrice: number
  purchaseQuantity: number
  recipeQuantity: number
}

export interface DishRecipe {
  dishId: string
  source: string
  ingredients: RecipeIngredient[]
  updatedAt: string
}

export function getIngredientUnitCost(
  ingredient: RecipeIngredient,
): number {
  if (
    !Number.isFinite(ingredient.purchasePrice) ||
    !Number.isFinite(ingredient.purchaseQuantity) ||
    ingredient.purchaseQuantity <= 0
  ) {
    return 0
  }

  return ingredient.purchasePrice / ingredient.purchaseQuantity
}

export function getIngredientRecipeCost(
  ingredient: RecipeIngredient,
): number {
  if (
    !Number.isFinite(ingredient.recipeQuantity) ||
    ingredient.recipeQuantity < 0
  ) {
    return 0
  }

  return getIngredientUnitCost(ingredient) * ingredient.recipeQuantity
}

export function getRecipeIngredientsTotalCost(
  ingredients: RecipeIngredient[],
): number {
  return ingredients.reduce(
    (total, ingredient) => total + getIngredientRecipeCost(ingredient),
    0,
  )
}

export function getDishRecipeTotalCost(recipe: DishRecipe): number {
  return getRecipeIngredientsTotalCost(recipe.ingredients)
}
