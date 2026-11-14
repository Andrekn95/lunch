import type { DishCategory } from '../entities'

export function normalizeDishName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function getDishKey(
  category: DishCategory,
  name: string,
): string {
  return `${category}|${normalizeDishName(name)}`
}
