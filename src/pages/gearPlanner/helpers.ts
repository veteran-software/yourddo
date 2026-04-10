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
  return item.artifacttype?.trim().length > 0
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
  filigrees: (LootItem | null)[] | undefined
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
  filigrees: (LootItem | null)[] | undefined
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
