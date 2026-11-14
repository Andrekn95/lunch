import type { DishCategory } from './dish'
import { DISH_CATEGORIES } from './dish'
import type { WeekDay } from './menu'

export const MENU_CATEGORY_SLOTS: Record<DishCategory, number> = {
  Sopa: 1,
  Proteína: 2,
  Guarnición: 2,
  Ensalada: 0,
  'Bebida Fría': 2,
  Postre: 1,
  Fruta: 1,
}

export interface MenuSlotRow {
  category: DishCategory
  slot: number
}

export const MENU_SLOT_ROWS: MenuSlotRow[] = DISH_CATEGORIES.flatMap(
  (category) =>
    Array.from({ length: MENU_CATEGORY_SLOTS[category] }, (_, slot) => ({
      category,
      slot,
    })),
)

export interface MenuPlanCell {
  weekStartDate: string
  day: WeekDay
  category: DishCategory
  slot: number
  dishId: string
}
