// These older names are still used as identities by the crafting datasets.
const publishedNames: Record<string, string> = {
  'lunar gem of peace (heroic)': 'lunar gem of heal and listen (heroic)',
  'lunar gem of peace (legendary)': 'lunar gem of heal and listen (legendary)',
  'solar gem of arcane layers (heroic)': 'solar gem of armor layers (heroic)',
  'solar gem of arcane layers (legendary)': 'solar gem of armor layers (legendary)',
  'emerald of vile empowerment': 'emerald of arcane empowerment',
  'emerald of eldritch empowerment': 'emerald of arcane empowerment',
  'topaz of wizardry +327': 'topaz of wizardry +294',
  'ruby of radiance 66': 'ruby of radiance 166',
  'topaz of augment summoning': 'topaz of augmented summoning'
}

const normalizeName = (name: string) => name.trim().toLowerCase().replaceAll(/\s+/g, ' ')

export function scopedAugmentMatcher<T extends { name: string; slotTypes: readonly string[]; minimumLevel: number }>(
  entries: readonly T[]
) {
  const byName = new Map<string, T[]>()
  for (const entry of entries) {
    const key = normalizeName(entry.name)
    const sameName = byName.get(key) ?? []
    sameName.push(entry)
    byName.set(key, sameName)
  }
  return (name: string, color: string, minimumLevel: number) => {
    const key = normalizeName(name)
    const candidates = byName.get(publishedNames[key] ?? key)?.filter((entry) => entry.slotTypes.includes(color))
    return (
      candidates?.find((entry) => entry.minimumLevel === minimumLevel) ??
      (candidates?.length === 1 ? candidates[0] : undefined)
    )
  }
}
