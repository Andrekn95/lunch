import type { DishCategory } from '../../../domain/entities'
import { MENU_CATEGORY_SLOTS } from '../../../domain/entities'
import type { MenuMatrixEntry } from '../../../application/use-cases/ImportMenuMatrixUseCase'
import {
  getWeekDayFromIsoDate,
  getWeekStartIsoDate,
} from '../../../domain/value-objects/calendar'
import { resolveDishCategory } from './dishCategories'
import { downloadCsv, readSpreadsheetMatrix } from './spreadsheet'

export interface ParsedMenuMatrixCell {
  rowNumber: number
  date: string
  category: DishCategory | null
  rawCategory: string
  dishName: string
  errors: string[]
}

export interface ParsedMenuMatrix {
  cells: ParsedMenuMatrixCell[]
  entries: MenuMatrixEntry[]
  dates: string[]
  weeks: string[]
  warnings: string[]
}

const TEMPLATE_ROWS = [
  [
    'Categoría',
    '02/11/2026',
    '03/11/2026',
    '04/11/2026',
    '05/11/2026',
    '06/11/2026',
  ],
  ['Sopa', '', '', '', '', ''],
  ['Proteína', '', '', '', '', ''],
  ['Proteína', '', '', '', '', ''],
  ['Guarnición', '', '', '', '', ''],
  ['Guarnición', '', '', '', '', ''],
  ['Bebida Fría', '', '', '', '', ''],
  ['Bebida Fría', '', '', '', '', ''],
  ['Postre', '', '', '', '', ''],
  ['Fruta', '', '', '', '', ''],
]

const DAY_MS = 24 * 60 * 60 * 1000

function toIsoDateFromParts(
  year: number,
  month: number,
  day: number,
): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  const timestamp = Date.UTC(year, month - 1, day)

  if (new Date(timestamp).getUTCDate() !== day) return null

  return new Date(timestamp).toISOString().slice(0, 10)
}

function parseDateString(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const isoMatch = trimmed.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (isoMatch) {
    return toIsoDateFromParts(
      Number(isoMatch[1]),
      Number(isoMatch[2]),
      Number(isoMatch[3]),
    )
  }

  const localMatch = trimmed.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/)
  if (!localMatch) return null

  const rawYear = Number(localMatch[3])
  const year = rawYear < 100 ? 2000 + rawYear : rawYear

  return toIsoDateFromParts(
    year,
    Number(localMatch[2]),
    Number(localMatch[1]),
  )
}

function parseExcelSerial(value: number): string | null {
  if (!Number.isFinite(value) || value < 20000 || value > 80000) {
    return null
  }

  const timestamp = Date.UTC(1899, 11, 30) + Math.floor(value) * DAY_MS
  return new Date(timestamp).toISOString().slice(0, 10)
}

function parseDateCell(value: unknown): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null

    const usesUtcMidnight =
      value.getUTCHours() === 0 &&
      value.getUTCMinutes() === 0 &&
      value.getUTCSeconds() === 0

    const year = usesUtcMidnight ? value.getUTCFullYear() : value.getFullYear()
    const month = usesUtcMidnight ? value.getUTCMonth() + 1 : value.getMonth() + 1
    const day = usesUtcMidnight ? value.getUTCDate() : value.getDate()

    return toIsoDateFromParts(year, month, day)
  }

  if (typeof value === 'number') return parseExcelSerial(value)

  if (typeof value === 'string') return parseDateString(value)

  return null
}

function getCellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return ''
  return String(value).trim()
}

function formatDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat('es-EC', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
    .format(new Date(`${isoDate}T00:00:00Z`))
    .replace(/\./g, '')
}

export function getMenuMatrixDateLabel(isoDate: string): string {
  return formatDateLabel(isoDate)
}

export async function parseMenuMatrixFile(
  file: File,
): Promise<ParsedMenuMatrix> {
  const matrix = await readSpreadsheetMatrix(file)
  return buildMenuMatrix(matrix)
}

function buildMenuMatrix(matrix: unknown[][]): ParsedMenuMatrix {
  const nonEmptyRows = matrix.filter((row) =>
    row.some(
      (cell) =>
        (cell instanceof Date && !Number.isNaN(cell.getTime())) ||
        getCellText(cell) !== '',
    ),
  )

  if (nonEmptyRows.length < 2) {
    throw new Error(
      'El archivo debe incluir una fila de fechas y al menos una categoría con platillos.',
    )
  }

  const headerCandidates = nonEmptyRows.slice(0, 12)
  let headerIndex = -1
  let headerDateColumns: { index: number; date: string }[] = []

  headerCandidates.forEach((row, index) => {
    const dateColumns = row.flatMap((cell, columnIndex) => {
      const date = parseDateCell(cell)
      return date ? [{ index: columnIndex, date }] : []
    })

    if (dateColumns.length > headerDateColumns.length) {
      headerIndex = index
      headerDateColumns = dateColumns
    }
  })

  if (headerIndex === -1 || headerDateColumns.length === 0) {
    throw new Error(
      'No encontramos columnas con fechas en el archivo. Incluye una fila de encabezados como 24/08/2026.',
    )
  }

  const warnings: string[] = []
  const dateColumns = headerDateColumns.filter(({ date }) => {
    if (getWeekDayFromIsoDate(date)) return true

    warnings.push(
      `Se omitió la columna del ${formatDateLabel(date)} porque es fin de semana.`,
    )
    return false
  })

  if (dateColumns.length === 0) {
    throw new Error(
      'Todas las columnas con fechas corresponden a fines de semana. Incluye al menos un día de lunes a viernes.',
    )
  }

  const duplicateDates = new Set<string>()
  const uniqueDateColumns = dateColumns.filter(({ date }) => {
    if (duplicateDates.has(date)) {
      warnings.push(
        `La fecha ${formatDateLabel(date)} aparece más de una vez; se usó la primera columna.`,
      )
      return false
    }

    duplicateDates.add(date)
    return true
  })

  const excludedColumns = new Set(
    headerDateColumns.map((column) => column.index),
  )
  const dataRows = nonEmptyRows.slice(headerIndex + 1)
  const maxColumns = Math.max(...nonEmptyRows.map((row) => row.length))

  let categoryColumn = 0
  let bestCategoryCount = -1

  for (let columnIndex = 0; columnIndex < maxColumns; columnIndex += 1) {
    if (excludedColumns.has(columnIndex)) continue

    const categoryCount = dataRows.filter((row) =>
      resolveDishCategory(getCellText(row[columnIndex])),
    ).length

    if (categoryCount > bestCategoryCount) {
      bestCategoryCount = categoryCount
      categoryColumn = columnIndex
    }
  }

  if (bestCategoryCount <= 0) {
    throw new Error(
      'No encontramos filas con categorías válidas a la izquierda del menú. Usa Sopa, Proteína, Guarnición, Ensalada, Bebida Fría, Postre o Fruta.',
    )
  }

  const cells: ParsedMenuMatrixCell[] = []
  let previousRawCategory = ''
  let previousCategory: DishCategory | null = null
  let carriedCategoryRows = 0

  dataRows.forEach((row, rowOffset) => {
    const rowNumber = headerIndex + rowOffset + 2
    let rawCategory = getCellText(row[categoryColumn])
    let category = rawCategory ? resolveDishCategory(rawCategory) : null
    const dishes = uniqueDateColumns.map(({ index, date }) => ({
      date,
      dishName: getCellText(row[index]),
    }))

    if (dishes.every((dish) => !dish.dishName)) return

    if (!rawCategory && previousCategory) {
      rawCategory = previousRawCategory
      category = previousCategory
      carriedCategoryRows += 1
    } else if (category) {
      previousRawCategory = rawCategory
      previousCategory = category
    }

    for (const dish of dishes) {
      if (!dish.dishName) continue

      const errors: string[] = []

      if (!rawCategory) {
        errors.push('Categoría obligatoria')
      } else if (!category) {
        errors.push(
          `Categoría no reconocida: "${rawCategory}". Usa Sopa, Proteína, Guarnición, Ensalada, Bebida Fría, Postre o Fruta.`,
        )
      }

      cells.push({
        rowNumber,
        date: dish.date,
        category,
        rawCategory,
        dishName: dish.dishName,
        errors,
      })
    }
  })

  if (cells.length === 0) {
    throw new Error(
      'No encontramos platillos en las columnas de fechas. Revisa que las fechas estén en la fila de encabezados y los platillos debajo.',
    )
  }

  if (carriedCategoryRows > 0) {
    warnings.push(
      `Se reutilizó la última categoría en ${carriedCategoryRows} ${
        carriedCategoryRows === 1 ? 'fila' : 'filas'
      } sin categoría.`,
    )
  }

  const slotCounters = new Map<string, number>()
  const zeroSlotCategories = new Map<DishCategory, number>()
  const overflowGroups = new Map<
    string,
    { date: string; category: DishCategory; capacity: number; count: number }
  >()

  for (const cell of cells) {
    if (!cell.category || cell.errors.length > 0) continue

    const capacity = MENU_CATEGORY_SLOTS[cell.category]

    if (capacity === 0) {
      cell.errors.push(
        `${cell.category} no forma parte del menú diario configurado.`,
      )
      zeroSlotCategories.set(
        cell.category,
        (zeroSlotCategories.get(cell.category) ?? 0) + 1,
      )
      continue
    }

    const groupKey = `${cell.date}|${cell.category}`
    const usedSlots = slotCounters.get(groupKey) ?? 0

    if (usedSlots >= capacity) {
      cell.errors.push(
        `${cell.category} admite ${capacity} ${capacity === 1 ? 'platillo' : 'platillos'} por día.`,
      )
      const overflow = overflowGroups.get(groupKey) ?? {
        date: cell.date,
        category: cell.category,
        capacity,
        count: 0,
      }
      overflow.count += 1
      overflowGroups.set(groupKey, overflow)
      continue
    }

    slotCounters.set(groupKey, usedSlots + 1)
  }

  for (const [category, count] of zeroSlotCategories) {
    warnings.push(
      `Se omitieron ${count} platillos de ${category} porque esa categoría no forma parte del menú diario.`,
    )
  }

  for (const group of overflowGroups.values()) {
    warnings.push(
      `${formatDateLabel(group.date)} · ${group.category} admite ${group.capacity}; se conservaron los primeros ${group.capacity} y se omitieron ${group.count}.`,
    )
  }

  const validCells = cells.filter(
    (cell) => cell.category && cell.errors.length === 0,
  )
  const entries: MenuMatrixEntry[] = validCells.map((cell) => ({
    date: cell.date,
    category: cell.category as DishCategory,
    dishName: cell.dishName,
  }))
  const dates = Array.from(new Set(validCells.map((cell) => cell.date))).sort()
  const weeks = Array.from(
    new Set(dates.map((date) => getWeekStartIsoDate(date))),
  ).sort()

  return {
    cells,
    entries,
    dates,
    weeks,
    warnings,
  }
}

export function downloadMenuMatrixTemplate() {
  downloadCsv('plantilla-menu-semanal.csv', TEMPLATE_ROWS)
}
