import type { MenuPlanRepository } from '../ports/MenuPlanRepository'
import type { MenuCellTarget } from '../ports/MenuPlanRepository'

export interface SetMenuCellInput extends MenuCellTarget {
  dishId: string | null
}

export class SetMenuCellUseCase {
  private readonly repository: MenuPlanRepository

  constructor(repository: MenuPlanRepository) {
    this.repository = repository
  }

  async execute(input: SetMenuCellInput): Promise<void> {
    if (input.dishId) {
      await this.repository.setCell({
        weekStartDate: input.weekStartDate,
        day: input.day,
        category: input.category,
        slot: input.slot,
        dishId: input.dishId,
      })
      return
    }

    await this.repository.clearCell({
      weekStartDate: input.weekStartDate,
      day: input.day,
      category: input.category,
      slot: input.slot,
    })
  }
}
