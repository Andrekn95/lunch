import { useMemo } from 'react'
import {
  Apple,
  CakeSlice,
  CupSoda,
  Drumstick,
  Salad,
  Soup,
  TriangleAlert,
  Wheat,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type {
  Dish,
  DishCategory,
  MenuPlanCell,
  WeekDay,
} from '../../../domain/entities'
import {
  MENU_CATEGORY_SLOTS,
  MENU_SLOT_ROWS,
} from '../../../domain/entities'
import { findDuplicateDishIds } from '../../../domain/value-objects/menuPlan'
import type { MenuWeek } from '../data/menuWeeks'
import { DISH_CATEGORY_STYLES } from '../utils/dishCategories'

const CATEGORY_ICONS: Record<DishCategory, LucideIcon> = {
  Sopa: Soup,
  Proteína: Drumstick,
  Guarnición: Wheat,
  Ensalada: Salad,
  'Bebida Fría': CupSoda,
  Postre: CakeSlice,
  Fruta: Apple,
}

interface MenuWeekGridProps {
  week: MenuWeek
  dishes: Dish[]
  selections: MenuPlanCell[]
  onSelect: (
    day: WeekDay,
    category: DishCategory,
    slot: number,
    dishId: string,
  ) => void
}

export function MenuWeekGrid({
  week,
  dishes,
  selections,
  onSelect,
}: MenuWeekGridProps) {
  const categoryRows = useMemo(
    () =>
      MENU_SLOT_ROWS.map(({ category, slot }) => ({
        category,
        slot,
        slotCount: MENU_CATEGORY_SLOTS[category],
        options: dishes
          .filter((dish) => dish.category === category)
          .sort((left, right) => left.name.localeCompare(right.name, 'es')),
      })),
    [dishes],
  )

  const selectedByCell = useMemo(
    () =>
      new Map(
        selections.map((selection) => [
          `${selection.day}|${selection.category}|${selection.slot}`,
          selection.dishId,
        ]),
      ),
    [selections],
  )

  const duplicateDishIds = useMemo(
    () => findDuplicateDishIds(selections),
    [selections],
  )

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-20 w-44 border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
            >
              Categoría / Día
            </th>
            {week.days.map((day) => (
              <th
                key={day.day}
                scope="col"
                className="min-w-40 border-b border-l border-slate-200 bg-slate-50 px-3 py-3"
              >
                <p className="text-xs font-semibold text-slate-800">
                  {day.dayLabel}
                </p>
                <p className="text-[11px] font-normal text-slate-400">
                  {day.dateLabel}
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categoryRows.map(({ category, slot, slotCount, options }) => {
            const Icon = CATEGORY_ICONS[category]
            const style = DISH_CATEGORY_STYLES[category]

            return (
              <tr key={`${category}-${slot}`} className="align-top">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-slate-200/60 ${style.soft} ${style.icon}`}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800">
                        {category}
                      </span>
                      {slotCount > 1 && (
                        <span className="text-[10px] font-medium text-slate-400">
                          Opción {slot + 1}
                        </span>
                      )}
                    </span>
                  </div>
                </th>

                {week.days.map((day) => {
                  const selectedId =
                    selectedByCell.get(
                      `${day.day}|${category}|${slot}`,
                    ) ?? ''
                  const isDuplicate =
                    selectedId !== '' && duplicateDishIds.has(selectedId)
                  const selectedDish = options.find(
                    (dish) => dish.id === selectedId,
                  )
                  const selectedInOtherSlot = new Set(
                    selections
                      .filter(
                        (selection) =>
                          selection.day === day.day &&
                          selection.category === category &&
                          selection.slot !== slot,
                      )
                      .map((selection) => selection.dishId),
                  )

                  return (
                    <td
                      key={day.day}
                      className={`border-b border-l border-slate-200 p-2 align-top ${
                        isDuplicate ? 'bg-amber-50/80' : 'bg-white'
                      }`}
                    >
                      <select
                        value={selectedId}
                        onChange={(event) =>
                          onSelect(
                            day.day,
                            category,
                            slot,
                            event.target.value,
                          )
                        }
                        disabled={options.length === 0}
                        aria-label={`${category}${slotCount > 1 ? ` opción ${slot + 1}` : ''} del ${day.dayLabel}`}
                        aria-invalid={isDuplicate || undefined}
                        title={selectedDish?.description || undefined}
                        className={`w-full rounded-lg border px-2 py-2 text-xs font-medium outline-none transition-colors focus:ring-2 focus:ring-offset-1 ${
                          isDuplicate
                            ? 'border-amber-400 bg-amber-50 text-amber-900 focus:border-amber-500 focus:ring-amber-200'
                            : selectedId
                              ? 'border-slate-200 bg-white text-slate-700 focus:border-brand-500 focus:ring-brand-100'
                              : 'border-dashed border-slate-200 bg-slate-50/80 text-slate-400 focus:border-brand-500 focus:ring-brand-100'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <option value="">— Sin asignar —</option>
                        {options.map((dish) => (
                          <option
                            key={dish.id}
                            value={dish.id}
                            disabled={selectedInOtherSlot.has(dish.id)}
                          >
                            {dish.name}
                          </option>
                        ))}
                        {selectedId && !selectedDish && (
                          <option value={selectedId}>
                            Platillo no disponible
                          </option>
                        )}
                      </select>

                      {isDuplicate && (
                        <p className="mt-1.5 flex items-start gap-1 text-[10px] font-semibold leading-tight text-amber-700">
                          <TriangleAlert
                            className="mt-px size-3 shrink-0"
                            aria-hidden="true"
                          />
                          Plato repetido en la misma semana
                        </p>
                      )}

                      {!selectedId && options.length === 0 && (
                        <p className="mt-1.5 text-[10px] leading-tight text-slate-400">
                          Sin platillos en esta categoría
                        </p>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
