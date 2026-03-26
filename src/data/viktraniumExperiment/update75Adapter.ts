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
  dropLocations?: {
    sourceType?: string
    questWildernessChain?: string
    difficulty?: string
    bleakConductors?: string
    bleakInsulators?: string
    bleakAlternators?: string
    bleakResistors?: string
    legendaryBleakMementos?: string
    legendaryBleakAlternator?: string
    legendaryBleakResistor?: string
    legendaryBleakInsulator?: string
    legendaryBleakConductor?: string
  }[]
  dropLocationRaw?: string
}

// Helpers to categorize items similar to existing static data
const jewelryTypes = new Set(['Goggles', 'Necklace', 'Trinket', 'Ring', 'Bracers'])

const clothingTypes = new Set(['Belt', 'Boots', 'Gloves', 'Helm', 'Helmet', 'Cloak'])

const shieldTypes = new Set(['Small Shield', 'Large Shield', 'Orb', 'Buckler', 'Tower Shield'])

const meleeWeaponTypes = new Set([
  'Bastard Sword',
  'Battle Axe',
  'Club',
  'Dagger',
  'Dwarven War Axe',
  'Falchion',
  'Great Axe',
  'Great Club',
  'Great Sword',
  'Handaxe',
  'Handwraps',
  'Heavy Mace',
  'Heavy Pick',
  'Kama',
  'Khopesh',
  'Kukri',
  'Light Hammer',
  'Light Mace',
  'Light Pick',
  'Long Sword',
  'Maul',
  'Morningstar',
  'Quarterstaff',
  'Rapier',
  'Scimitar',
  'Short Sword',
  'Sickle',
  'War Hammer'
])

const rangedWeaponTypes = new Set([
  'Longbow',
  'Long Bow',
  'Shortbow',
  'Short Bow',
  'Great Crossbow',
  'Light Crossbow',
  'Heavy Crossbow',
  'Repeating Heavy Crossbow',
  'Repeating Light Crossbow',
  'Rune Arm'
])

const throwingWeaponTypes = new Set(['Throwing Axe', 'Throwing Dagger', 'Throwing Hammer', 'Dart', 'Shuriken'])

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
      // Build the Augment key in camelCase, e.g., lamordiaMelancholicWeapon
      const k = `lamordia${mood}${slot}`
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
    // Normalize subtype: both "Helmet" and "Helm" map to "Helm"
    if (it.type === 'Helmet' || it.type === 'Helm') {
      subType = 'Helm'
    } else {
      subType = it.type
    }
  } else if (clothingTypes.has(it.type)) {
    type = 'Clothing'
    subType = it.type
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

  // Found in & Requirements
  const { foundIn, requirements } = (() => {
    const dl = it.dropLocations?.find((l) => l.sourceType === 'Viktranium Crafting')
    if (!dl) {
      const firstDl = it.dropLocations?.[0]
      if (!firstDl) return { foundIn: undefined, requirements: undefined }
      const locName = firstDl.questWildernessChain ?? undefined
      const diff = firstDl.difficulty ? ` (${firstDl.difficulty})` : ''
      return { foundIn: locName ? [`${locName}${diff}`] : undefined, requirements: undefined }
    }

    const reqs: { name: string; quantity: number }[] = []
    if (dl.legendaryBleakMementos)
      reqs.push({ name: 'Legendary Bleak Memento', quantity: Number(dl.legendaryBleakMementos) })
    if (dl.bleakConductors) reqs.push({ name: 'Bleak Conductor', quantity: Number(dl.bleakConductors) })
    if (dl.bleakInsulators) reqs.push({ name: 'Bleak Insulator', quantity: Number(dl.bleakInsulators) })
    if (dl.bleakAlternators) reqs.push({ name: 'Bleak Alternator', quantity: Number(dl.bleakAlternators) })
    if (dl.bleakResistors) reqs.push({ name: 'Bleak Resistor', quantity: Number(dl.bleakResistors) })

    if (dl.legendaryBleakAlternator)
      reqs.push({ name: 'Legendary Bleak Alternator', quantity: Number(dl.legendaryBleakAlternator) })
    if (dl.legendaryBleakResistor)
      reqs.push({ name: 'Legendary Bleak Resistor', quantity: Number(dl.legendaryBleakResistor) })
    if (dl.legendaryBleakInsulator)
      reqs.push({ name: 'Legendary Bleak Insulator', quantity: Number(dl.legendaryBleakInsulator) })
    if (dl.legendaryBleakConductor)
      reqs.push({ name: 'Legendary Bleak Conductor', quantity: Number(dl.legendaryBleakConductor) })

    if (it.dropLocationRaw?.includes('|Wicked|')) {
      return { foundIn: ['Wicked Viktranium Experiment Crafting'], requirements: reqs }
    }
    return { foundIn: ['Viktranium Crafting'], requirements: reqs }
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
    foundIn,
    requirements
  }
}

const items: CraftingIngredient[] = (rawItems as U75Item[]).map(mapItem)

const isCrafted = (ci: CraftingIngredient) => ci.foundIn?.includes('Viktranium Crafting')
const isWickedCrafted = (ci: CraftingIngredient) => ci.foundIn?.includes('Wicked Viktranium Experiment Crafting')
const isHeroic = (ci: CraftingIngredient) => ci.minimumLevel === 8
const isLegendary = (ci: CraftingIngredient) => ci.minimumLevel === 34

// Loot (non-crafted)
const lootHeroic = items.filter((i) => !isCrafted(i) && !isWickedCrafted(i) && isHeroic(i))
const lootLegendary = items.filter((i) => !isCrafted(i) && !isWickedCrafted(i) && isLegendary(i))

// Crafted
const craftedHeroic = items.filter((i) => isCrafted(i) && isHeroic(i))
const craftedLegendary = items.filter((i) => isCrafted(i) && isLegendary(i))
const craftedWickedLegendary = items.filter((i) => isWickedCrafted(i) && isLegendary(i))

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
  Shields: craftedHeroic.filter((i) => i.type === 'Shield').sort(sortByName),
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
  Shields: craftedLegendary.filter((i) => i.type === 'Shield').sort(sortByName),
  Ranged: craftedLegendary.filter((i) => i.type === 'Ranged').sort(sortByName),
  Throwing: craftedLegendary.filter((i) => i.type === 'Throwing').sort(sortByName)
} as const

export const craftedWickedViktraniumWeapons: Record<string, CraftingIngredient[]> = {
  Melee: craftedWickedLegendary.filter((i) => i.type === 'Melee').sort(sortByName),
  Ranged: craftedWickedLegendary.filter((i) => i.type === 'Ranged').sort(sortByName),
  Shields: craftedWickedLegendary.filter((i) => i.type === 'Shield').sort(sortByName),
  Throwing: craftedWickedLegendary.filter((i) => i.type === 'Throwing').sort(sortByName)
} as const
