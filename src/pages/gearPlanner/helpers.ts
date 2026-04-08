import {
  type Curse,
  type GearAugment,
  type GearItem,
  type LootEnchantment
} from './types.ts'

export const sortItemsByValue = (a: { value: number }, b: { value: number }) =>
  b.value - a.value

export const aggregateEnchantmentEntries = (
  item: GearItem,
  itemAugs: Record<number, GearAugment | null> | undefined,
  curse: Curse | null | undefined
) => {
  const entries: { ench: LootEnchantment; sourceName: string }[] = (
    item.enchantments ?? []
  ).map((e) => ({
    ench: e,
    sourceName: item.name
  }))

  if (itemAugs) {
    for (const aug of Object.values(itemAugs)) {
      if (aug?.effectsAdded) {
        for (const e of aug.effectsAdded) {
          entries.push({ ench: e, sourceName: `${item.name} (${aug.name})` })
        }
      }
    }
  }

  if (curse?.enchantments) {
    for (const e of curse.enchantments) {
      entries.push({ ench: e, sourceName: `${item.name} (${curse.name})` })
    }
  }

  return entries
}
