const MODULES = 25
const FINDER_POSITIONS = [
  [0, 0],
  [0, MODULES - 7],
  [MODULES - 7, 0],
] as const

function getFinderModule(row: number, col: number): boolean | null {
  for (const [startRow, startCol] of FINDER_POSITIONS) {
    const localRow = row - startRow
    const localCol = col - startCol

    if (localRow >= 0 && localRow < 7 && localCol >= 0 && localCol < 7) {
      const isBorder =
        localRow === 0 ||
        localRow === 6 ||
        localCol === 0 ||
        localCol === 6
      const isCenter =
        localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4
      return isBorder || isCenter
    }
  }

  return null
}

function getTimingModule(row: number, col: number): boolean | null {
  const isBetweenFinders = (value: number) => value >= 8 && value <= MODULES - 9

  if (row === 6 && isBetweenFinders(col)) return col % 2 === 0
  if (col === 6 && isBetweenFinders(row)) return row % 2 === 0

  return null
}

function isModuleOn(row: number, col: number, seed: string): boolean {
  const finder = getFinderModule(row, col)
  if (finder !== null) return finder

  const timing = getTimingModule(row, col)
  if (timing !== null) return timing

  let hash = 2166136261
  hash = Math.imul(hash ^ row, 16777619)
  hash = Math.imul(hash ^ col, 16777619)

  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 16777619)
  }

  return (hash >>> 0) % 100 < 46
}

const CELLS = Array.from({ length: MODULES * MODULES }, (_, index) => ({
  row: Math.floor(index / MODULES),
  col: index % MODULES,
}))

export function MockQrCode({ value }: { value: string }) {
  return (
    <div className="mx-auto w-56 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div
        className="grid aspect-square w-full auto-rows-fr overflow-hidden rounded-md"
        style={{ gridTemplateColumns: `repeat(${MODULES}, minmax(0, 1fr))` }}
        aria-hidden="true"
      >
        {CELLS.map(({ row, col }) => (
          <span
            key={`${row}-${col}`}
            className={isModuleOn(row, col, value) ? 'bg-slate-900' : 'bg-white'}
          />
        ))}
      </div>
      <p className="mt-3 text-center font-mono text-[10px] tracking-[0.2em] text-slate-500">
        {value}
      </p>
    </div>
  )
}
