const CATEGORY_STYLES: Record<string, string> = {
  'No perecibles': 'bg-amber-50 text-amber-700 ring-amber-200',
  'Frutas y vegetales': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Congelados: 'bg-sky-50 text-sky-700 ring-sky-200',
  Suministros: 'bg-slate-100 text-slate-600 ring-slate-200',
  Lácteos: 'bg-violet-50 text-violet-700 ring-violet-200',
}

export function getCategoryBadgeClass(category: string): string {
  return (
    CATEGORY_STYLES[category] ??
    'bg-brand-50 text-brand-700 ring-brand-200'
  )
}
