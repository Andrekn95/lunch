import type { WeekDay } from '../entities'

const WEEK_DAY_BY_INDEX: Record<number, WeekDay | null> = {
  0: null,
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: null,
}

const DAY_MS = 24 * 60 * 60 * 1000

function parseIsoDate(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00Z`)
}

export function getWeekDayFromIsoDate(isoDate: string): WeekDay | null {
  const timestamp = parseIsoDate(isoDate)
  if (Number.isNaN(timestamp)) return null

  return WEEK_DAY_BY_INDEX[new Date(timestamp).getUTCDay()] ?? null
}

export function getWeekStartIsoDate(isoDate: string): string {
  const timestamp = parseIsoDate(isoDate)
  if (Number.isNaN(timestamp)) return isoDate

  const weekDayIndex = new Date(timestamp).getUTCDay()
  const daysSinceMonday = weekDayIndex === 0 ? 6 : weekDayIndex - 1

  return new Date(timestamp - daysSinceMonday * DAY_MS)
    .toISOString()
    .slice(0, 10)
}
