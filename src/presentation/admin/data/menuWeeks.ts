import type { MenuPlanCell, WeekDay } from '../../../domain/entities'
import { WEEK_DAYS } from '../../../domain/entities'
import { getWeekStartIsoDate } from '../../../domain/value-objects/calendar'

export interface MenuWeekDay {
  day: WeekDay
  dayLabel: string
  dateLabel: string
  isoDate: string
}

export interface MenuWeek {
  id: string
  label: string
  rangeLabel: string
  monthLabel: string
  days: MenuWeekDay[]
}

const DAY_LABELS: Record<WeekDay, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
}

const DEFAULT_WEEK_STARTS = [
  '2026-11-02',
  '2026-11-09',
  '2026-11-16',
  '2026-11-23',
  '2026-11-30',
]

const DAY_MS = 24 * 60 * 60 * 1000

const MONTH_LONG_FORMATTER = new Intl.DateTimeFormat('es-EC', {
  month: 'long',
  timeZone: 'UTC',
})

const MONTH_SHORT_FORMATTER = new Intl.DateTimeFormat('es-EC', {
  month: 'short',
  timeZone: 'UTC',
})

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat('es-EC', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const DAY_MONTH_FORMATTER = new Intl.DateTimeFormat('es-EC', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function toUtcDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`)
}

function addDays(isoDate: string, days: number): string {
  return new Date(toUtcDate(isoDate).getTime() + days * DAY_MS)
    .toISOString()
    .slice(0, 10)
}

function getRangeLabel(weekStartDate: string, weekEndDate: string): string {
  const start = toUtcDate(weekStartDate)
  const end = toUtcDate(weekEndDate)
  const startDay = start.getUTCDate()
  const endDay = end.getUTCDate()
  const startMonth = start.getUTCMonth()
  const endMonth = end.getUTCMonth()
  const startYear = start.getUTCFullYear()
  const endYear = end.getUTCFullYear()

  if (startYear === endYear && startMonth === endMonth) {
    return `${startDay} – ${endDay} de ${MONTH_LONG_FORMATTER.format(start)}`
  }

  const startLabel = `${startDay} ${MONTH_SHORT_FORMATTER.format(start).replace(/\./g, '')}`
  const endLabel = `${endDay} ${MONTH_SHORT_FORMATTER.format(end).replace(/\./g, '')}`

  if (startYear === endYear) {
    return `${startLabel} – ${endLabel}`
  }

  return `${startLabel} ${startYear} – ${endLabel} ${endYear}`
}

export function getMenuWeek(weekStartDate: string): MenuWeek {
  const id = getWeekStartIsoDate(weekStartDate)
  const start = toUtcDate(id)
  const weekEndDate = addDays(id, 4)
  const weekOfMonth = Math.floor((start.getUTCDate() - 1) / 7) + 1

  return {
    id,
    label: `Semana ${weekOfMonth}`,
    rangeLabel: getRangeLabel(id, weekEndDate),
    monthLabel: capitalize(MONTH_YEAR_FORMATTER.format(start)),
    days: WEEK_DAYS.map((day, index) => {
      const isoDate = addDays(id, index)

      return {
        day,
        dayLabel: DAY_LABELS[day],
        dateLabel: DAY_MONTH_FORMATTER.format(toUtcDate(isoDate)).replace(
          /\./g,
          '',
        ),
        isoDate,
      }
    }),
  }
}

export function getMenuWeeks(selections: readonly MenuPlanCell[]): MenuWeek[] {
  const weekStarts = new Set(DEFAULT_WEEK_STARTS)

  for (const selection of selections) {
    if (!selection.weekStartDate) continue
    weekStarts.add(getWeekStartIsoDate(selection.weekStartDate))
  }

  return Array.from(weekStarts)
    .sort()
    .map((weekStartDate) => getMenuWeek(weekStartDate))
}
