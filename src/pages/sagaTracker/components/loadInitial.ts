export interface FixedSagaDef {
  id: string
  name: string
  levelRange: string
}

export interface LoadedSagaItem extends FixedSagaDef {
  completed: boolean
  turnedIn: boolean
}

/**
 * Read statuses from localStorage and merge onto the authoritative JSON list
 * provided via fixedSagas. Returns a new array including completed/turnedIn flags.
 */
export const loadInitial = (
  fixedSagas: FixedSagaDef[],
  storageKey: string
): LoadedSagaItem[] => {
  type Stored = Partial<Pick<LoadedSagaItem, 'id' | 'completed' | 'turnedIn'>> & Record<string, unknown>

  // Build a map of id -> { completed, turnedIn } from storage (backward compatible)
  const statusById: Record<string, { completed: boolean; turnedIn: boolean }> = {}

  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const arr = JSON.parse(raw) as Stored[]
      if (Array.isArray(arr)) {
        for (const entry of arr) {
          const id = typeof entry.id === 'string' ? entry.id : undefined
          if (!id) continue
          statusById[id] = {
            completed: !!entry.completed,
            turnedIn: !!entry.turnedIn
          }
        }
      }
    }
  } catch {
    // ignore parse/storage errors
  }

  // Return the authoritative list from JSON with merged statuses (default false)
  return fixedSagas.map((s) => ({
    ...s,
    completed: statusById[s.id]?.completed ?? false,
    turnedIn: statusById[s.id]?.turnedIn ?? false
  }))
}
