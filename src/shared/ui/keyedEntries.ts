// Published lists can repeat identical effects without providing an ID.
export function keyedEntries<T>(values: readonly T[], identity: (value: T) => string = JSON.stringify) {
  const occurrences = new Map<string, number>()
  return values.map((value) => {
    const id = identity(value)
    const occurrence = occurrences.get(id) ?? 0
    occurrences.set(id, occurrence + 1)
    return { key: `${occurrence.toString()}:${id}`, value }
  })
}
