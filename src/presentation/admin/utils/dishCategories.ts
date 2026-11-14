import type { DishCategory } from '../../../domain/entities'
import { DISH_CATEGORIES } from '../../../domain/entities'
import { normalizeText } from './spreadsheet'

const CATEGORY_ALIASES: Record<string, DishCategory> = {
  sopa: 'Sopa',
  sopas: 'Sopa',
  proteina: 'Proteína',
  proteinas: 'Proteína',
  guarnicion: 'Guarnición',
  guarniciones: 'Guarnición',
  ensalada: 'Ensalada',
  ensaladas: 'Ensalada',
  bebida: 'Bebida Fría',
  bebidas: 'Bebida Fría',
  'bebida fria': 'Bebida Fría',
  'bebidas frias': 'Bebida Fría',
  postre: 'Postre',
  postres: 'Postre',
  fruta: 'Fruta',
  frutas: 'Fruta',
}

const CATEGORY_BY_NORMALIZED = new Map(
  DISH_CATEGORIES.map((category) => [normalizeText(category), category]),
)

export function resolveDishCategory(
  rawCategory: string,
): DishCategory | null {
  const normalized = normalizeText(rawCategory)

  return (
    CATEGORY_ALIASES[normalized] ??
    CATEGORY_BY_NORMALIZED.get(normalized) ??
    null
  )
}

interface DishCategoryStyle {
  badge: string
  soft: string
  icon: string
}

export const DISH_CATEGORY_STYLES: Record<DishCategory, DishCategoryStyle> = {
  Sopa: {
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    soft: 'bg-amber-50',
    icon: 'text-amber-600',
  },
  Proteína: {
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    soft: 'bg-rose-50',
    icon: 'text-rose-600',
  },
  Guarnición: {
    badge: 'bg-orange-50 text-orange-700 ring-orange-200',
    soft: 'bg-orange-50',
    icon: 'text-orange-600',
  },
  Ensalada: {
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    soft: 'bg-emerald-50',
    icon: 'text-emerald-600',
  },
  'Bebida Fría': {
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    soft: 'bg-sky-50',
    icon: 'text-sky-600',
  },
  Postre: {
    badge: 'bg-violet-50 text-violet-700 ring-violet-200',
    soft: 'bg-violet-50',
    icon: 'text-violet-600',
  },
  Fruta: {
    badge: 'bg-lime-50 text-lime-700 ring-lime-200',
    soft: 'bg-lime-50',
    icon: 'text-lime-600',
  },
}

export function getDishCategoryBadgeClass(
  category: DishCategory | null,
): string {
  if (!category) {
    return 'bg-rose-50 text-rose-700 ring-rose-200'
  }

  return DISH_CATEGORY_STYLES[category].badge
}
