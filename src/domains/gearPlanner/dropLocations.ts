export function gearDropLocations(locations: unknown) {
  const entries = new Map<string, { title: string; href: string; detail: string }>()
  for (const location of Array.isArray(locations) ? locations : []) {
    if (!location || typeof location !== 'object') continue
    const row = location as Record<string, unknown>
    const field = (key: string) => (typeof row[key] === 'string' ? row[key].trim() : '')
    const namedLocation =
      field('questWildernessChain') ||
      field('adventurePack') ||
      field('vendorName') ||
      field('crateName') ||
      field('craftingLocation') ||
      field('storyArc') ||
      field('randomHighestChance') ||
      field('raidRuneStore') ||
      field('storeName') ||
      field('patronName')
    const title =
      namedLocation ||
      (row.isCraftOnly === true ? 'Craft only' : field('sourceType').replace(/([a-z])([A-Z])/g, '$1 $2'))
    if (!title) continue
    const page = field('titleForLink') || field('randomPageLink') || namedLocation
    const query = row.isCraftOnly === true ? 'Crafting' : title
    const href =
      'https://ddocompendium.com/w/' +
      (page ? encodeURIComponent(page) : 'Special:Search?search=' + encodeURIComponent(query))
    const detail = [field('difficulty'), field('whichChestPerson'), field('vendorLocation'), field('vendorArea')]
      .filter(Boolean)
      .join(' · ')
    entries.set(JSON.stringify([title, href, detail]), { title, href, detail })
  }
  return [...entries.values()]
}
