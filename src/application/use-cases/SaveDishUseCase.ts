import type { Dish } from '../../domain/entities'
import type { DishInput, DishRepository } from '../ports/DishRepository'

export class SaveDishUseCase {
  private readonly repository: DishRepository

  constructor(repository: DishRepository) {
    this.repository = repository
  }

  async execute(input: DishInput): Promise<Dish> {
    const name = input.name.trim()

    if (!name) {
      throw new Error('El nombre del platillo es obligatorio.')
    }

    return this.repository.save({
      ...input,
      name,
      description: input.description.trim(),
    })
  }
}
