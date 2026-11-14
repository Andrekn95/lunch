import type { Dish } from '../../domain/entities'
import type { DishRepository, NewDish } from '../ports/DishRepository'

export class ImportDishesUseCase {
  private readonly repository: DishRepository

  constructor(repository: DishRepository) {
    this.repository = repository
  }

  async execute(dishes: NewDish[]): Promise<Dish[]> {
    return this.repository.importMany(
      dishes.map((dish) => ({
        ...dish,
        name: dish.name.trim(),
        description: dish.description.trim(),
      })),
    )
  }
}
