/**
 * Normalizes item names to their singular form for consistent lookups.
 * Handles common plural suffixes and specific DDO ingredient names.
 */
export const toSingularName = (materialName: string): string => {
  const raw = (materialName || '').trim()
  if (!raw) return raw
  const lower = raw.toLowerCase()
  if (lower === 'magic item essences') return 'Magic Item Essence'
  if (lower === 'purified eberron dragonshard fragments') return 'Purified Eberron Dragonshard Fragment'
  if (/[^aeiou]ies$/i.test(raw)) return raw.replace(/ies$/i, 'y')
  if (/(ches|shes|xes|zes|ses)$/i.test(raw)) return raw.replace(/es$/i, '')
  if (/(^.*[^s])s$/i.test(raw)) return raw.replace(/s$/i, '')
  return raw
}
