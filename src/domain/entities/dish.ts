export const DISH_CATEGORIES = [
  'Sopa',
  'Proteína',
  'Guarnición',
  'Ensalada',
  'Bebida Fría',
  'Postre',
  'Fruta',
] as const

export type DishCategory = (typeof DISH_CATEGORIES)[number]

export interface Dish {
  id: string
  name: string
  category: DishCategory
  description: string
}
