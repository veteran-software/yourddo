import { findSetBonus } from '../../data/setBonuses.ts'
import type { SetBonus } from '../../types/crafting.ts'
import {
  type Curse,
  type GearAugment,
  type GearItem,
  type LootEnchantment,
  type LootItem,
  WEAPON_TYPES
} from './types.ts'

export const isWeapon = (item: LootItem) => {
  return (
    Object.values(WEAPON_TYPES).some((types) => types.includes(item.type)) ||
    item.type === 'Shield'
  )
}

export const isMinorArtifact = (item: LootItem) => {
  return (item.artifacttype?.trim().length ?? 0) > 0
}

export const getMaxFiligreeSlots = (item: LootItem) => {
  const minLevel = Number.parseInt(item.minLevel, 10) || 1
  if (isMinorArtifact(item)) {
    if (minLevel >= 33) return 5
    if (minLevel >= 30) return 4
    if (minLevel >= 29) return 3
    if (minLevel >= 20) return 1
    return 0 // Minor artifacts under level 20 don't usually have slots
  }
  if (isWeapon(item)) {
    return minLevel >= 20 ? 10 : 0
  }
  return 0
}

export const sortItemsByValue = (a: { value: number }, b: { value: number }) =>
  b.value - a.value

export const aggregateEnchantmentEntries = (
  item: GearItem,
  itemAugs: Record<number, GearAugment | null> | undefined,
  curse: Curse | null | undefined,
  filigrees: (GearItem | null)[] | undefined,
  activeSetEnhancements?: { ench: LootEnchantment; sourceName: string }[]
) => {
  const entries: { ench: LootEnchantment; sourceName: string }[] = (
    item.enchantments ?? []
  ).map((e) => ({
    ench: e,
    sourceName: item.name
  }))

  addAugmentEntries(entries, item.name, itemAugs)
  addCurseEntries(entries, item.name, curse)
  addFiligreeEntries(entries, item.name, filigrees)

  if (activeSetEnhancements) {
    entries.push(...activeSetEnhancements)
  }

  return entries
}

export const getActiveEnhancementsForSet = (
  setDef: SetBonus | undefined,
  count: number
) => {
  if (!setDef?.enhancements) return []

  return setDef.enhancements.filter(
    (enh) => (enh.numPiecesEquipped ?? setDef.numPiecesEquipped ?? 0) <= count
  )
}

const getItemCounts = (
  equippedItems: GearItem[],
  slottedGemSetBonuses: Record<string, (string | null)[]> | undefined,
  counts: Record<string, number>
) => {
  equippedItems.forEach((item) => {
    if (item.name.includes('Gem of Many Facets')) {
      const gemBonuses = slottedGemSetBonuses?.[item.id] ?? []
      gemBonuses.forEach((setName) => {
        if (setName) {
          counts[setName] = (counts[setName] || 0) + 1
        }
      })
    } else {
      item.setBonus?.forEach((sb) => {
        counts[sb.name] = (counts[sb.name] || 0) + 1
      })
    }
  })
}

const getAugmentCounts = (
  slottedAugments: Record<string, Record<number, GearAugment | null>>,
  counts: Record<string, number>
) => {
  for (const itemAugments of Object.values(slottedAugments)) {
    for (const aug of Object.values(itemAugments)) {
      if (aug?.setBonus) {
        for (const sb of aug.setBonus) {
          counts[sb.name] = (counts[sb.name] ?? 0) + 1
        }
      }
    }
  }
}

const getFiligreeCounts = (
  slottedFiligrees: Record<string, (GearItem | null)[]> | undefined,
  counts: Record<string, number>
) => {
  if (!slottedFiligrees) return
  const filigreeNamesPerSet: Record<string, Set<string>> = {}
  for (const itemFiligrees of Object.values(slottedFiligrees)) {
    for (const fili of itemFiligrees) {
      if (fili?.grouping && typeof fili.grouping === 'string') {
        processFiligreeGrouping(fili, filigreeNamesPerSet)
      }
    }
  }

  for (const [setName, names] of Object.entries(filigreeNamesPerSet)) {
    counts[setName] = (counts[setName] ?? 0) + names.size
  }
}

const processFiligreeGrouping = (
  fili: GearItem,
  filigreeNamesPerSet: Record<string, Set<string>>
) => {
  const groupingStr = fili.grouping
  if (typeof groupingStr !== 'string') return

  const setNames = groupingStr
    .split('/')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  for (const setName of setNames) {
    if (!filigreeNamesPerSet[setName]) {
      filigreeNamesPerSet[setName] = new Set<string>()
    }
    if (fili.name) {
      filigreeNamesPerSet[setName].add(fili.name)
    }
  }
}

export const getActiveSetEnhancements = (
  equippedItems: GearItem[],
  slottedAugments: Record<string, Record<number, GearAugment | null>>,
  slottedFiligrees?: Record<string, (GearItem | null)[]>,
  slottedGemSetBonuses?: Record<string, (string | null)[]>
) => {
  const counts: Record<string, number> = {}

  getItemCounts(equippedItems, slottedGemSetBonuses, counts)
  getAugmentCounts(slottedAugments, counts)
  getFiligreeCounts(slottedFiligrees, counts)

  const entries: { ench: LootEnchantment; sourceName: string }[] = []
  for (const [setName, count] of Object.entries(counts)) {
    if (count > 0) {
      const setDef = findSetBonus(setName)
      const activeEnh = getActiveEnhancementsForSet(setDef, count)
      activeEnh.forEach((enh) => {
        entries.push({
          ench: enh,
          sourceName: `Set Bonus: ${setName}`
        })
      })
    }
  }

  return entries
}

const addAugmentEntries = (
  entries: { ench: LootEnchantment; sourceName: string }[],
  itemName: string,
  itemAugs: Record<number, GearAugment | null> | undefined
) => {
  if (!itemAugs) return
  for (const aug of Object.values(itemAugs)) {
    if (aug?.effectsAdded) {
      for (const e of aug.effectsAdded) {
        entries.push({ ench: e, sourceName: `${itemName} (${aug.name})` })
      }
    }
  }
}

const addCurseEntries = (
  entries: { ench: LootEnchantment; sourceName: string }[],
  itemName: string,
  curse: Curse | null | undefined
) => {
  if (!curse?.enchantments) return
  for (const e of curse.enchantments) {
    entries.push({ ench: e, sourceName: `${itemName} (${curse.name})` })
  }
}

const addFiligreeEntries = (
  entries: { ench: LootEnchantment; sourceName: string }[],
  itemName: string,
  filigrees: (GearItem | null)[] | undefined
) => {
  if (!filigrees) return
  for (const fili of filigrees) {
    if (fili?.enchantments) {
      for (const e of fili.enchantments) {
        entries.push({
          ench: { ...e, bonus: 'Filigree' },
          sourceName: `${itemName} (Filigree: ${fili.name})`
        })
      }
    }
  }
}
