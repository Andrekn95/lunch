import type { Ingredient } from '../../domain/entities'
import type {
  IngredientRepository,
  NewIngredient,
} from '../ports/IngredientRepository'

export class ImportIngredientsUseCase {
  private readonly repository: IngredientRepository

  constructor(repository: IngredientRepository) {
    this.repository = repository
  }

  async execute(ingredients: NewIngredient[]): Promise<Ingredient[]> {
    return this.repository.importMany(ingredients)
  }
}
