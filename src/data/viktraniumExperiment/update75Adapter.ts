import type { Binding, Enhancement } from '../../types/core.ts'
import type { Augment, CraftingIngredient } from '../../types/crafting.ts'
import rawItems from '../loot/update75.json'

interface U75Item {
  name: string
  type: string
  subType?: string
  description?: string
  minLevel: string
  binding?: Binding
  enchantments?: Enhancement[]
  augments?: string[]
  dropLocations?: { sourceType?: string; questWildernessChain?: string; difficulty?: string }[]
}

// Helpers to categorize items similar to existing static data
const jewelryTypes = new Set([
  'Goggles',
  'Necklace',
  'Trinket',
  'Cloak',
  'Belt',
  'Ring',
  'Boots',
  'Bracers',
  'Gloves',
  'Mask',
  'Circlet',
  'Helm',
  'Helmet',
  'Eyes',
  'Wrists',
  'Hands',
  'Feet',
  'Head'
])

const shieldTypes = new Set(['Shield', 'Orb', 'Buckler', 'Tower Shield'])

const meleeWeaponTypes = new Set([
  'Bastard Sword',
  'Battle Axe',
  'Club',
  'Dagger',
  'Falchion',
  'Greataxe',
  'Greatclub',
  'Greatsword',
  'Handaxe',
  'Heavy Mace',
  'Khopesh',
  'Kukri',
  'L. Pick',
  'Light Mace',
  'Longsword',
  'Maul',
  'Morningstar',
  'Rapier',
  'Scimitar',
  'Shortsword',
  'Sickle',
  'Warhammer',
  'Quarterstaff',
  'Handwraps',
  'Sceptre',
  'Scepter',
  'Staff',
  'Heavy Pick',
  'Light Pick',
  'Heavy Flail',
  'Light Flail',
  'Trident',
  'Whip',
  'Melee'
])

const rangedWeaponTypes = new Set([
  'Longbow',
  'Shortbow',
  'Great Xbow',
  'Light Xbow',
  'Heavy Xbow',
  'Repeating Xbow',
  'Rune Arm'
])
const throwingWeaponTypes = new Set(['Throwing Axe', 'Throwing Dagger', 'Shuriken'])

const toAugmentObject = (augments?: string[]): Augment[] | undefined => {
  if (!augments?.length) return undefined
  const a: Record<string, string | null> = {}
  augments.forEach((s) => {
    const t = s.trim()
    // Colors
    const color = t.toLowerCase()
    switch (color) {
      case 'red':
      case 'orange':
      case 'yellow':
      case 'blue':
      case 'green':
      case 'purple':
      case 'sun':
      case 'moon':
      case 'colorless':
        a[color] = null
        return
      default:
        break
    }

    // Lamordia slots
    const lam = /^Lamordia: (Melancholic|Dolorous|Miserable|Woeful) \((Weapon|Accessory|Armor)\)$/
    const m = lam.exec(t)
    if (m) {
      const mood = m[1]
      const slot = m[2]
      const key = `lamordia${mood}${slot}`.replace(' ', '')
      // Ensure camelCase for mood
      const k = key
        .replace('Melancholic', 'Melancholic')
        .replace('Dolorous', 'Dolorous')
        .replace('Miserable', 'Miserable')
        .replace('Woeful', 'Woeful')
      a[k.charAt(0).toLowerCase() + k.slice(1)] = null
    }
  })

  return [a as Augment]
}

const mapItem = (it: U75Item): CraftingIngredient => {
  const minLvl = Number(it.minLevel || '0')
  let type: string | undefined
  let subType: string | undefined

  if (jewelryTypes.has(it.type)) {
    type = 'Jewelry'
    subType = it.type === 'Helmet' ? 'Helm' : it.type === 'Helm' ? 'Helm' : it.type
  } else if (shieldTypes.has(it.type)) {
    type = 'Shield'
    subType = it.type
  } else if (meleeWeaponTypes.has(it.type)) {
    type = 'Melee'
    subType = it.type
  } else if (rangedWeaponTypes.has(it.type)) {
    type = 'Ranged'
    subType = it.type
  } else if (throwingWeaponTypes.has(it.type)) {
    type = 'Throwing'
    subType = it.type
  } else {
    // Fallbacks: try to categorize remaining as Armor/Clothing/Weapons
    if (/robe|armor|docent/i.test(it.type)) {
      type = /robe|clothing/i.test(it.type) ? 'Clothing' : 'Armor'
    } else {
      // Default weapons bucket
      type = 'Weapon'
      subType = it.type
    }
  }

  // Found in
  const foundIn: string[] | undefined = (() => {
    const dl = it.dropLocations?.[0]
    if (!dl) return undefined
    if (dl.sourceType === 'Viktranium Crafting') return ['Viktranium Crafting']
    const locName = dl.questWildernessChain ?? undefined
    const diff = dl.difficulty ? ` (${dl.difficulty})` : ''
    return locName ? [`${locName}${diff}`] : undefined
  })()

  return {
    name: it.name,
    type,
    subType,
    description: it.description,
    minimumLevel: minLvl,
    binding: it.binding,
    effectsAdded: it.enchantments,
    augments: toAugmentObject(it.augments),
    foundIn
  }
}

const items: CraftingIngredient[] = (rawItems as U75Item[]).map(mapItem)

const isCrafted = (ci: CraftingIngredient) => ci.foundIn?.includes('Viktranium Crafting')
const isHeroic = (ci: CraftingIngredient) => ci.minimumLevel === 8
const isLegendary = (ci: CraftingIngredient) => ci.minimumLevel === 34

// Loot (non-crafted)
const lootHeroic = items.filter((i) => !isCrafted(i) && isHeroic(i))
const lootLegendary = items.filter((i) => !isCrafted(i) && isLegendary(i))

// Crafted
const craftedHeroic = items.filter((i) => isCrafted(i) && isHeroic(i))
const craftedLegendary = items.filter((i) => isCrafted(i) && isLegendary(i))

// Grouping helpers
const sortByName = (a: CraftingIngredient, b: CraftingIngredient) => a.name.localeCompare(b.name)

export const lootHeroicViktraniumItems: Record<string, CraftingIngredient[]> = {
  Armor: lootHeroic.filter((i) => i.type === 'Armor').sort(sortByName),
  Weapons: lootHeroic
    .filter((i) => i.type === 'Weapon' || i.type === 'Melee' || i.type === 'Ranged' || i.type === 'Throwing')
    .sort(sortByName),
  Shields: lootHeroic.filter((i) => i.type === 'Shield').sort(sortByName),
  Clothing: lootHeroic.filter((i) => i.type === 'Clothing').sort(sortByName),
  Jewelry: lootHeroic.filter((i) => i.type === 'Jewelry').sort(sortByName)
} as const

export const craftedHeroicViktraniumWeapons: Record<string, CraftingIngredient[]> = {
  Melee: craftedHeroic.filter((i) => i.type === 'Melee').sort(sortByName),
  Ranged: craftedHeroic.filter((i) => i.type === 'Ranged').sort(sortByName),
  Throwing: craftedHeroic.filter((i) => i.type === 'Throwing').sort(sortByName)
} as const

export const lootLegendaryViktraniumItems: Record<string, CraftingIngredient[]> = {
  Armor: lootLegendary.filter((i) => i.type === 'Armor').sort(sortByName),
  Weapons: lootLegendary
    .filter((i) => i.type === 'Weapon' || i.type === 'Melee' || i.type === 'Ranged' || i.type === 'Throwing')
    .sort(sortByName),
  Shields: lootLegendary.filter((i) => i.type === 'Shield').sort(sortByName),
  Clothing: lootLegendary.filter((i) => i.type === 'Clothing').sort(sortByName),
  Jewelry: lootLegendary.filter((i) => i.type === 'Jewelry').sort(sortByName)
} as const

export const craftedLegendaryViktraniumWeapons: Record<string, CraftingIngredient[]> = {
  Melee: craftedLegendary.filter((i) => i.type === 'Melee').sort(sortByName),
  Ranged: craftedLegendary.filter((i) => i.type === 'Ranged').sort(sortByName),
  Throwing: craftedLegendary.filter((i) => i.type === 'Throwing').sort(sortByName)
} as const
