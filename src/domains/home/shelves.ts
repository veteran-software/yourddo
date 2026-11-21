import { navigation } from '../../shared/navigation/navigation'
export const homeTools = navigation.flatMap((group) => group.items)
export const recentsKey = 'yourddo:home:recent-tools:v1'
export const pinsKey = 'yourddo:home:favorite-tools:v1'
export function readShelf(key: string): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(saved) ? saved.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}
export function writeShelf(key: string, values: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(values))
  } catch {
    /* Pins still work for this visit. */
  }
}
export function recordVisit(path: string) {
  if (!homeTools.some((tool) => tool.path === path)) return
  const history = readShelf(recentsKey)
  const entry = history.find((value) => value.split('||')[0] === path) ?? path
  writeShelf(recentsKey, [entry, ...history.filter((value) => value.split('||')[0] !== path)].slice(0, 5))
}
