export interface FixedSagaDef {
  id: string
  name: string
  levelRange: string
}

export interface LoadedSagaItem extends FixedSagaDef {
  completed: boolean
  turnedIn: boolean
}

type StoredSagaItem = Partial<Pick<LoadedSagaItem, 'id' | 'completed' | 'turnedIn'>> & Record<string, unknown>

const createStatusMap = (
  entries: StoredSagaItem[]
): Record<string, { completed: boolean; turnedIn: boolean } | undefined> => {
  const statusById: Record<string, { completed: boolean; turnedIn: boolean } | undefined> = {}

  for (const entry of entries) {
    const id = typeof entry.id === 'string' ? entry.id : undefined
    if (!id) continue

    statusById[id] = {
      completed: Boolean(entry.completed),
      turnedIn: Boolean(entry.turnedIn)
    }
  }

  return statusById
}

const readStoredStatuses = (
  storageKey: string
): Record<string, { completed: boolean; turnedIn: boolean } | undefined> => {
  if (typeof localStorage === 'undefined') return {}

  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return {}

    return createStatusMap(parsed as StoredSagaItem[])
  } catch {
    return {}
  }
}

/**
 * Read statuses from localStorage and merge onto the authoritative JSON list
 * provided via fixedSagas. Returns a new array including completed/turnedIn flags.
 */
export const loadInitial = (
  fixedSagas: FixedSagaDef[],
  storageKey: string
): LoadedSagaItem[] => {
  const statusById = readStoredStatuses(storageKey)

  // Return the authoritative list from JSON with merged statuses (default false)
  return fixedSagas.map((s) => ({
    ...s,
    completed: statusById[s.id]?.completed ?? false,
    turnedIn: statusById[s.id]?.turnedIn ?? false
  }))
}
