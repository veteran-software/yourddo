import legacyIds from './legacyIds.json'

const oldPlaneswalkerId = 'the-planewalkers-path-epic'
const correctedPlaneswalkerId = 'the-planeswalkers-path-epic'
// The last manual lists matched to the first published saga catalog, including quest tier.
const sagaIds = new Map(Object.entries(legacyIds.sagas))
const questIds = new Map(Object.entries(legacyIds.quests))

export const canonicalSagaId = (id: string): string =>
  sagaIds.get(id === oldPlaneswalkerId ? correctedPlaneswalkerId : id) ?? id

export const canonicalQuestId = (id: string): string => questIds.get(id) ?? id

function remapIds<T>(entries: Record<string, T>, canonicalId: (id: string) => string): Record<string, T> {
  const aliases = Object.keys(entries).filter((id) => canonicalId(id) !== id)
  if (aliases.length === 0) return entries
  const result = new Map(Object.entries(entries))
  for (const alias of aliases) {
    const id = canonicalId(alias)
    if (!Object.hasOwn(entries, id)) result.set(id, entries[alias])
    result.delete(alias)
  }
  return Object.fromEntries(result)
}

export const withCompatibleSagaIds = <T>(entries: Record<string, T>): Record<string, T> =>
  remapIds(
    remapIds(entries, (id) => (id === oldPlaneswalkerId ? correctedPlaneswalkerId : id)),
    canonicalSagaId
  )

export const withCompatibleQuestIds = <T>(entries: Record<string, T>): Record<string, T> =>
  remapIds(entries, canonicalQuestId)
