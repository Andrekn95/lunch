import type { MenuPlanCell } from '../entities'

export function findDuplicateDishIds(
  selections: Pick<MenuPlanCell, 'dishId'>[],
): Set<string> {
  const counts = new Map<string, number>()

  for (const selection of selections) {
    if (!selection.dishId) continue

    counts.set(selection.dishId, (counts.get(selection.dishId) ?? 0) + 1)
  }

  return new Set(
    Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([dishId]) => dishId),
  )
}
