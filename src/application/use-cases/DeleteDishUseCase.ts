import type { DishRecipeRepository } from '../ports/DishRecipeRepository'
import type { DishRepository } from '../ports/DishRepository'
import type { MenuPlanRepository } from '../ports/MenuPlanRepository'

export class DeleteDishUseCase {
  private readonly dishRepository: DishRepository
  private readonly menuPlanRepository: MenuPlanRepository
  private readonly recipeRepository: DishRecipeRepository

  constructor(
    dishRepository: DishRepository,
    menuPlanRepository: MenuPlanRepository,
    recipeRepository: DishRecipeRepository,
  ) {
    this.dishRepository = dishRepository
    this.menuPlanRepository = menuPlanRepository
    this.recipeRepository = recipeRepository
  }

  async execute(dishId: string): Promise<void> {
    await this.menuPlanRepository.removeByDishId(dishId)
    await this.recipeRepository.removeByDishId(dishId)
    await this.dishRepository.remove(dishId)
  }
}
