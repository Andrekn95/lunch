import type { DishCategory } from '../../../domain/entities'
import type { NewDish } from '../../../application/ports/DishRepository'
import { getDishKey } from '../../../domain/value-objects/dish'
import { resolveDishCategory } from './dishCategories'
import {
  downloadCsv,
  normalizeText,
  readSpreadsheetMatrix,
} from './spreadsheet'

export interface ParsedDishRow {
  rowNumber: number
  name: string
  rawCategory: string
  category: DishCategory | null
  description: string
  errors: string[]
}

const TEMPLATE_ROWS = [
  ['Categoría', 'Platillo', 'Descripción'],
  ['Sopa', 'Sopa de pollo', 'Caldo casero con verduras'],
  ['Sopa', 'Crema de zanahoria', 'Con un toque de mantequilla'],
  ['Proteína', 'Pollo al horno', 'Pechuga marinada con hierbas'],
  ['Proteína', 'Carne guisada', 'Con papas y especias suaves'],
  ['Guarnición', 'Arroz blanco', 'Arroz de grano largo'],
  ['Guarnición', 'Puré de papa', 'Con leche y mantequilla'],
  ['Ensalada', 'Ensalada verde', 'Lechuga, pepino y limón'],
  ['Ensalada', 'Ensalada mixta', 'Tomate, maíz y zanahoria'],
  ['Bebida Fría', 'Jugo de naranja', 'Natural, sin azúcar añadida'],
  ['Bebida Fría', 'Limonada', 'Con hierbabuena'],
  ['Postre', 'Gelatina de frutas', 'Porción individual'],
  ['Postre', 'Arroz con leche', 'Receta de la casa'],
  ['Fruta', 'Manzana', 'Fruta de temporada'],
  ['Fruta', 'Banano', 'Fruta de temporada'],
]

function findColumn(headers: string[], candidates: string[]): number {
  return headers.findIndex((header) => candidates.includes(header))
}

function buildRows(
  matrix: unknown[][],
  existingDishKeys: Set<string>,
): ParsedDishRow[] {
  const nonEmptyRows = matrix.filter((row) =>
    row.some((cell) => String(cell ?? '').trim() !== ''),
  )

  if (nonEmptyRows.length < 2) {
    throw new Error(
      'El archivo debe incluir una fila de encabezados y al menos un platillo.',
    )
  }

  const headers = nonEmptyRows[0].map((cell) =>
    normalizeText(String(cell ?? '')),
  )

  const columns = {
    category: findColumn(headers, [
      'categoria',
      'grupo',
      'tipo',
      'category',
    ]),
    name: findColumn(headers, [
      'platillo',
      'plato',
      'nombre',
      'producto',
      'dish',
    ]),
    description: findColumn(headers, [
      'descripcion',
      'detalle',
      'notas',
      'description',
    ]),
  }

  const missingColumns: string[] = []
  if (columns.category === -1) missingColumns.push('Categoría')
  if (columns.name === -1) missingColumns.push('Platillo')

  if (missingColumns.length > 0) {
    throw new Error(
      `Faltan columnas obligatorias: ${missingColumns.join(', ')}. Descarga la plantilla para revisar el formato.`,
    )
  }

  const seenKeys = new Set<string>()

  return nonEmptyRows.slice(1).map((row, index) => {
    const getValue = (columnIndex: number) =>
      columnIndex >= 0 ? String(row[columnIndex] ?? '').trim() : ''

    const rawCategory = getValue(columns.category)
    const name = getValue(columns.name)
    const description = getValue(columns.description)
    const category = rawCategory ? resolveDishCategory(rawCategory) : null

    const errors: string[] = []

    if (!rawCategory) {
      errors.push('Categoría obligatoria')
    } else if (!category) {
      errors.push(
        'Categoría inválida (usa Sopa, Proteína, Guarnición, Ensalada, Bebida Fría, Postre o Fruta)',
      )
    }

    if (!name) errors.push('Platillo obligatorio')

    if (category && name) {
      const dishKey = getDishKey(category, name)

      if (seenKeys.has(dishKey)) {
        errors.push('Platillo duplicado en el archivo')
      } else if (existingDishKeys.has(dishKey)) {
        errors.push('El platillo ya existe en el catálogo')
      }

      seenKeys.add(dishKey)
    }

    return {
      rowNumber: index + 2,
      name,
      rawCategory,
      category,
      description,
      errors,
    }
  })
}

export async function parseDishFile(
  file: File,
  existingDishKeys: Set<string>,
): Promise<ParsedDishRow[]> {
  const matrix = await readSpreadsheetMatrix(file)
  return buildRows(matrix, existingDishKeys)
}

export function toNewDish(row: ParsedDishRow): NewDish {
  if (!row.category) {
    throw new Error('La fila no tiene una categoría válida.')
  }

  return {
    name: row.name,
    category: row.category,
    description: row.description,
  }
}

export function downloadDishTemplate() {
  downloadCsv('plantilla-catalogo-platillos.csv', TEMPLATE_ROWS)
}
