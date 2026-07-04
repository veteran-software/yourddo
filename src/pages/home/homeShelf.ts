export const RECENT_TOOLS_STORAGE_KEY = 'yourddo:home:recent-tools:v1'
export const FAVORITE_TOOLS_STORAGE_KEY = 'yourddo:home:favorite-tools:v1'

const TOOL_PATH_TO_ID: Record<string, string> = {
  '/gear-planner': 'gear-planner',
  '/saga-tracker': 'saga-tracker',
  '/essence-crafting': 'essence-crafting',
  '/cauldron-of-cadence': 'cauldron-of-cadence',
  '/dinosaur-bone': 'dinosaur-bone',
  '/green-steel': 'green-steel',
  '/incredible-potential': 'incredible-potential',
  '/legendary-green-steel': 'legendary-green-steel',
  '/nearly-finished': 'nearly-finished',
  '/viktranium-experiment': 'viktranium-experiment',
  '/monastery-of-the-scorpion': 'monastery-of-the-scorpion',
  '/reavers-fate': 'reavers-fate',
  '/the-key-to-the-mythal': 'reavers-fate',
  '/total-chaos': 'total-chaos',
  '/the-shadow-crypt': 'the-shadow-crypt',
  '/the-shroud': 'the-shroud'
}

export const getToolIdForPath = (pathname: string): string | null => {
  return TOOL_PATH_TO_ID[pathname] ?? null
}

export const readStorageList = (key: string): string[] => {
  if (typeof localStorage === 'undefined') return []

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed.filter((value): value is string => typeof value === 'string' && value.length > 0)
  } catch {
    return []
  }
}

export const writeStorageList = (key: string, values: string[]) => {
  if (typeof localStorage === 'undefined') return

  localStorage.setItem(key, JSON.stringify(values))
}

export const recordRecentToolPath = (pathname: string) => {
  const toolId = getToolIdForPath(pathname)
  if (!toolId) return

  const recentIds = readStorageList(RECENT_TOOLS_STORAGE_KEY)
  const nextRecent = [toolId, ...recentIds.filter((id) => id !== toolId)].slice(0, 5)
  writeStorageList(RECENT_TOOLS_STORAGE_KEY, nextRecent)
}
