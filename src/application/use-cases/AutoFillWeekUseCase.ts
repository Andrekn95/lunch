import type { Dish, DishCategory } from '../../domain/entities'
import { MENU_SLOT_ROWS, WEEK_DAYS } from '../../domain/entities'
import type { DishRepository } from '../ports/DishRepository'
import type { MenuPlanRepository } from '../ports/MenuPlanRepository'

export interface AutoFillShortage {
  category: DishCategory
  missing: number
}

export interface AutoFillWeekResult {
  filled: number
  unfilled: number
  shortages: AutoFillShortage[]
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = current
  }

  return shuffled
}

export class AutoFillWeekUseCase {
  private readonly dishRepository: DishRepository
  private readonly menuPlanRepository: MenuPlanRepository

  constructor(
    dishRepository: DishRepository,
    menuPlanRepository: MenuPlanRepository,
  ) {
    this.dishRepository = dishRepository
    this.menuPlanRepository = menuPlanRepository
  }

  async execute(weekStartDate: string): Promise<AutoFillWeekResult> {
    const [dishes, cells] = await Promise.all([
      this.dishRepository.list(),
      this.menuPlanRepository.list(),
    ])
    const weekCells = cells.filter(
      (cell) => cell.weekStartDate === weekStartDate,
    )
    const usedDishIds = new Set(weekCells.map((cell) => cell.dishId))
    const occupiedCells = new Set(
      weekCells.map(
        (cell) => `${cell.day}|${cell.category}|${cell.slot}`,
      ),
    )
    const candidatesByCategory = new Map<DishCategory, Dish[]>()
    const categories = new Set(
      MENU_SLOT_ROWS.map((row) => row.category),
    )

    for (const category of categories) {
      candidatesByCategory.set(
        category,
        shuffle(dishes.filter((dish) => dish.category === category)),
      )
    }

    let filled = 0
    let unfilled = 0
    const missingByCategory = new Map<DishCategory, number>()

    for (const day of WEEK_DAYS) {
      for (const { category, slot } of MENU_SLOT_ROWS) {
        const cellKey = `${day}|${category}|${slot}`
        if (occupiedCells.has(cellKey)) continue

        const candidates = candidatesByCategory.get(category) ?? []
        const candidateIndex = candidates.findIndex(
          (dish) => !usedDishIds.has(dish.id),
        )

        if (candidateIndex === -1) {
          unfilled += 1
          missingByCategory.set(
            category,
            (missingByCategory.get(category) ?? 0) + 1,
          )
          continue
        }

        const [dish] = candidates.splice(candidateIndex, 1)

        await this.menuPlanRepository.setCell({
          weekStartDate,
          day,
          category,
          slot,
          dishId: dish.id,
        })

        usedDishIds.add(dish.id)
        occupiedCells.add(cellKey)
        filled += 1
      }
    }

    return {
      filled,
      unfilled,
      shortages: Array.from(missingByCategory.entries()).map(
        ([category, missing]) => ({ category, missing }),
      ),
    }
  }
}
