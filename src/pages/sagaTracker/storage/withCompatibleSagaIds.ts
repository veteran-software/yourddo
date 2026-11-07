export const withCompatibleSagaIds = <T,>(entries: Record<string, T>): Record<string, T> => {
  const legacyId = 'the-planewalkers-path-epic'
  const currentId = 'the-planeswalkers-path-epic'
  if (!Object.hasOwn(entries, legacyId)) return entries

  const { [legacyId]: legacyValue, ...compatible } = entries
  if (!Object.hasOwn(compatible, currentId)) compatible[currentId] = legacyValue
  return compatible
}
