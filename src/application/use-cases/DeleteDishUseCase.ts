import type { DishRepository } from '../ports/DishRepository'
import type { MenuPlanRepository } from '../ports/MenuPlanRepository'

export class DeleteDishUseCase {
  private readonly dishRepository: DishRepository
  private readonly menuPlanRepository: MenuPlanRepository

  constructor(
    dishRepository: DishRepository,
    menuPlanRepository: MenuPlanRepository,
  ) {
    this.dishRepository = dishRepository
    this.menuPlanRepository = menuPlanRepository
  }

  async execute(dishId: string): Promise<void> {
    await this.menuPlanRepository.removeByDishId(dishId)
    await this.dishRepository.remove(dishId)
  }
}
