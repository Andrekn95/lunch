export function readStoredCollection<T>(
  key: string,
  guard: (value: unknown) => value is T,
): T[] | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return null

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null

    return parsed.filter(guard)
  } catch {
    return null
  }
}

export function writeStoredCollection<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(items))
  } catch {
    return
  }
}
