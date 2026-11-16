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

const SERVING_PATTERN =
  /\b\d+(?:[.,]\d+)?\s*(?:onzas?|oz|gramos?|gr|g|kilos?|kg|mililitros?|ml|litros?|lt|l|porciones?|porc|unidades?|uni|und)\b/g

export function getDishMatchKey(name: string): string {
  return normalizeDishName(name)
    .replace(/[/|].*$/, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(SERVING_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
