import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ChefHat,
  Loader2,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import type {
  Dish,
  DishCategory,
  MenuPlanCell,
  WeekDay,
} from '../../../domain/entities'
import { MENU_SLOT_ROWS } from '../../../domain/entities'
import { findDuplicateDishIds } from '../../../domain/value-objects/menuPlan'
import {
  autoFillWeekUseCase,
  dishRepository,
  menuPlanRepository,
  setMenuCellUseCase,
} from '../../../infrastructure/container'
import { getMenuWeeks } from '../data/menuWeeks'
import { MenuWeekGrid } from './MenuWeekGrid'

interface MenuConstructorProps {
  onOpenCatalog: () => void
}

const TOTAL_WEEK_CELLS = MENU_SLOT_ROWS.length * 5

export function MenuConstructor({ onOpenCatalog }: MenuConstructorProps) {
  const [dishes] = useState<Dish[]>(() => dishRepository.listSnapshot())
  const [selections, setSelections] = useState<MenuPlanCell[]>(() =>
    menuPlanRepository.listSnapshot(),
  )
  const weeks = useMemo(() => getMenuWeeks(selections), [selections])
  const [activeWeekId, setActiveWeekId] = useState(() => {
    const weekWithData = [...getMenuWeeks(selections)]
      .reverse()
      .find((week) =>
        selections.some(
          (selection) => selection.weekStartDate === week.id,
        ),
      )

    return weekWithData?.id ?? getMenuWeeks(selections)[0].id
  })
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [autoFillNotice, setAutoFillNotice] = useState<{
    tone: 'success' | 'warning'
    message: string
  } | null>(null)

  useEffect(() => {
    if (!saveError) return

    const timeout = window.setTimeout(() => setSaveError(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [saveError])

  useEffect(() => {
    if (!autoFillNotice) return

    const timeout = window.setTimeout(() => setAutoFillNotice(null), 7000)
    return () => window.clearTimeout(timeout)
  }, [autoFillNotice])

  const activeWeek =
    weeks.find((week) => week.id === activeWeekId) ?? weeks[0]

  const weekStats = useMemo(
    () =>
      new Map(
        weeks.map((week) => {
          const weekSelections = selections.filter(
            (selection) => selection.weekStartDate === week.id,
          )
          const duplicates = findDuplicateDishIds(weekSelections)
          const duplicateCells = weekSelections.filter((selection) =>
            duplicates.has(selection.dishId),
          ).length

          return [
            week.id,
            {
              filled: weekSelections.length,
              duplicateCells,
            },
          ]
        }),
      ),
    [selections, weeks],
  )

  const activeSelections = useMemo(
    () =>
      selections.filter(
        (selection) => selection.weekStartDate === activeWeek.id,
      ),
    [selections, activeWeek.id],
  )

  const activeStats = weekStats.get(activeWeek.id) ?? {
    filled: 0,
    duplicateCells: 0,
  }
  const emptyCells = Math.max(0, TOTAL_WEEK_CELLS - activeStats.filled)

  async function handleAutoFill() {
    if (isAutoFilling) return

    setIsAutoFilling(true)
    setSaveError(null)
    setAutoFillNotice(null)

    try {
      const result = await autoFillWeekUseCase.execute(activeWeek.id)
      setSelections(menuPlanRepository.listSnapshot())

      if (result.unfilled === 0) {
        setAutoFillNotice({
          tone: 'success',
          message:
            result.filled === 1
              ? 'Se rellenó 1 espacio sin repetir platillos.'
              : `Se rellenaron ${result.filled} espacios sin repetir platillos.`,
        })
        return
      }

      const shortages = result.shortages
        .map(({ category, missing }) => `${category}: ${missing}`)
        .join(' · ')
      const filledLabel =
        result.filled === 1
          ? 'Se rellenó 1 espacio'
          : `Se rellenaron ${result.filled} espacios`

      setAutoFillNotice({
        tone: 'warning',
        message: `${result.filled > 0 ? filledLabel : 'No se pudo rellenar ningún espacio'}. Faltan platillos únicos para ${result.unfilled} ${
          result.unfilled === 1 ? 'espacio' : 'espacios'
        } (${shortages}).`,
      })
    } catch {
      setSaveError(
        'No se pudo autocompletar la semana. Inténtalo de nuevo.',
      )
    } finally {
      setIsAutoFilling(false)
    }
  }

  function handleSelect(
    day: WeekDay,
    category: DishCategory,
    slot: number,
    dishId: string,
  ) {
    const weekStartDate = activeWeek.id

    setSelections((current) => {
      const next = current.filter(
        (selection) =>
          !(
            selection.weekStartDate === weekStartDate &&
            selection.day === day &&
            selection.category === category &&
            selection.slot === slot
          ),
      )

      return dishId
        ? [...next, { weekStartDate, day, category, slot, dishId }]
        : next
    })
    setSaveError(null)

    void setMenuCellUseCase
      .execute({
        weekStartDate,
        day,
        category,
        slot,
        dishId: dishId || null,
      })
      .catch(() => {
        setSaveError(
          'No se pudo guardar la selección. Inténtalo de nuevo.',
        )
      })
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100">
            <CalendarDays className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Constructor de menús
            </h2>
            <p className="text-xs text-slate-500">
              Planifica los menús por semana, categoría y día.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {activeWeek.monthLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
            <ChefHat className="size-3.5" aria-hidden="true" />
            {dishes.length} platillos disponibles
          </span>
        </div>
      </header>

      {dishes.length === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800 ring-1 ring-inset ring-sky-200">
          <p className="flex items-start gap-2">
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            Aún no hay platillos en el catálogo. Agrega o importa platillos
            para poder llenar los menús.
          </p>
          <button
            type="button"
            onClick={onOpenCatalog}
            className="rounded-xl bg-sky-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Ir al catálogo
          </button>
        </div>
      )}

      <div
        role="tablist"
        aria-label="Semanas del menú"
        className="grid grid-cols-2 gap-2 sm:grid-cols-5"
      >
        {weeks.map((week) => {
          const isActive = week.id === activeWeek.id
          const stats = weekStats.get(week.id) ?? {
            filled: 0,
            duplicateCells: 0,
          }

          return (
            <button
              key={week.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveWeekId(week.id)}
              className={`rounded-2xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold">{week.label}</span>
                {stats.duplicateCells > 0 ? (
                  <TriangleAlert
                    className={`size-3.5 shrink-0 ${
                      isActive ? 'text-amber-300' : 'text-amber-500'
                    }`}
                    aria-hidden="true"
                  />
                ) : (
                  stats.filled === TOTAL_WEEK_CELLS && (
                    <CheckCircle2
                      className={`size-3.5 shrink-0 ${
                        isActive ? 'text-emerald-300' : 'text-emerald-500'
                      }`}
                      aria-hidden="true"
                    />
                  )
                )}
              </span>
              <span
                className={`mt-0.5 block text-[11px] ${
                  isActive ? 'text-white/60' : 'text-slate-400'
                }`}
              >
                {week.rangeLabel}
              </span>
              <span
                className={`mt-1.5 block text-[10px] font-medium ${
                  stats.duplicateCells > 0
                    ? isActive
                      ? 'text-amber-300'
                      : 'text-amber-600'
                    : isActive
                      ? 'text-white/70'
                      : 'text-slate-500'
                }`}
              >
                {stats.filled}/{TOTAL_WEEK_CELLS} asignados
                {stats.duplicateCells > 0
                  ? ` · ${stats.duplicateCells} repetidos`
                  : ''}
              </span>
            </button>
          )
        })}
      </div>

      {saveError && (
        <p
          role="alert"
          className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200"
        >
          {saveError}
        </p>
      )}

      {activeStats.duplicateCells > 0 && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-inset ring-amber-200"
        >
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          Hay {activeStats.duplicateCells}{' '}
          {activeStats.duplicateCells === 1 ? 'celda' : 'celdas'} con el mismo
          platillo repetido en esta semana. Revisa las celdas resaltadas en
          amarillo.
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {activeWeek.label} · {activeWeek.rangeLabel}
            </h3>
            <p className="text-xs text-slate-500">
              Haz clic en una celda para elegir el platillo de esa categoría.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
              {activeStats.filled} de {TOTAL_WEEK_CELLS} espacios asignados
            </span>
            <button
              type="button"
              onClick={() => {
                void handleAutoFill()
              }}
              disabled={
                isAutoFilling || dishes.length === 0 || emptyCells === 0
              }
              title="Rellena los espacios vacíos sin repetir platillos en la semana"
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAutoFilling ? (
                <Loader2
                  className="size-3.5 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Sparkles className="size-3.5" aria-hidden="true" />
              )}
              {isAutoFilling ? 'Rellenando…' : 'Auto rellenar'}
            </button>
          </div>
        </header>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${
              activeStats.duplicateCells > 0
                ? 'bg-amber-500'
                : 'bg-brand-600'
            }`}
            style={{
              width: `${(activeStats.filled / TOTAL_WEEK_CELLS) * 100}%`,
            }}
          />
        </div>

        {autoFillNotice && (
          <p
            role="status"
            className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-medium ring-1 ring-inset ${
              autoFillNotice.tone === 'success'
                ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                : 'bg-amber-50 text-amber-800 ring-amber-200'
            }`}
          >
            {autoFillNotice.tone === 'success' ? (
              <CheckCircle2
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
            ) : (
              <TriangleAlert
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
            )}
            {autoFillNotice.message}
          </p>
        )}

        <div className="mt-4">
          <MenuWeekGrid
            week={activeWeek}
            dishes={dishes}
            selections={activeSelections}
            onSelect={handleSelect}
          />
        </div>

        <footer className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-amber-100 ring-1 ring-inset ring-amber-300" />
            Platillo repetido en la misma semana
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border border-dashed border-slate-300 bg-slate-50" />
            Celda sin asignar
          </span>
        </footer>
      </section>
    </div>
  )
}
