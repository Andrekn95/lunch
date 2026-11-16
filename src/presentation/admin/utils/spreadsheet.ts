const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx']

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const delimiters = [',', ';', '\t']

  let bestDelimiter = ','
  let bestCount = -1

  for (const delimiter of delimiters) {
    const count = firstLine.split(delimiter).length - 1
    if (count > bestCount) {
      bestCount = count
      bestDelimiter = delimiter
    }
  }

  return bestDelimiter
}

function parseDelimitedText(text: string, delimiter: string): string[][] {
  const source = text.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]

    if (inQuotes) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          field += '"'
          index += 1
        } else {
          inQuotes = false
        }
      } else {
        field += character
      }
      continue
    }

    if (character === '"') {
      inQuotes = true
    } else if (character === delimiter) {
      row.push(field)
      field = ''
    } else if (character === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (character !== '\r') {
      field += character
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

export interface SpreadsheetSheet {
  name: string
  rows: unknown[][]
}

function getFileExtension(file: File): string {
  return file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
}

function validateSpreadsheetFile(file: File): string {
  const extension = getFileExtension(file)

  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    throw new Error('Formato no soportado. Sube un archivo .csv o .xlsx (Excel).')
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('El archivo supera el tamaño máximo permitido de 10 MB.')
  }

  return extension
}

function decodeCsv(buffer: ArrayBuffer): string {
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
    return text.includes('\uFFFD')
      ? new TextDecoder('windows-1252').decode(buffer)
      : text
  } catch {
    return new TextDecoder('windows-1252').decode(buffer)
  }
}

export async function readSpreadsheetSheets(
  file: File,
): Promise<SpreadsheetSheet[]> {
  const extension = validateSpreadsheetFile(file)

  if (extension === '.csv') {
    const text = decodeCsv(await file.arrayBuffer())
    return [
      {
        name: file.name,
        rows: parseDelimitedText(text, detectDelimiter(text)),
      },
    ]
  }

  const { default: readXlsxFile } = await import(
    'read-excel-file/browser'
  )
  const sheets = await readXlsxFile(file)

  return sheets.map((sheet) => ({
    name: sheet.sheet,
    rows: sheet.data,
  }))
}

export async function readSpreadsheetMatrix(
  file: File,
): Promise<unknown[][]> {
  const [sheet] = await readSpreadsheetSheets(file)
  return sheet?.rows ?? []
}

function escapeCsvField(value: string): string {
  if (/[",;\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

export function downloadCsv(
  fileName: string,
  rows: readonly (readonly string[])[],
): void {
  const csv = rows
    .map((row) => row.map((field) => escapeCsvField(field)).join(','))
    .join('\r\n')

  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  link.click()

  URL.revokeObjectURL(url)
}
