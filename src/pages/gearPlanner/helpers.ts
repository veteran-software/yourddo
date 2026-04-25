import fountainData from '../../data/fountainOfNecroticMight.json'
import { findSetBonus } from '../../data/setBonuses.ts'
import stormreaverUpgradeData from '../../data/stormreaverUpgrade.json'
import traceOfMadnessData from '../../data/traceOfMadness.json'
import zhentarimData from '../../data/zhentarimAttuned.json'
import type { SetBonus } from '../../types/crafting.ts'
import type { EssenceEnchantment } from './dataLoader.ts'
import {
  type Curse,
  type GearAugment,
  type GearItem,
  GearSlot,
  type LootEnchantment,
  type LootItem,
  type UpgradeEntry,
  WEAPON_TYPES
} from './types.ts'

export const isEssenceCraftedName = (name: string) => name.startsWith('Essence Crafted')

export const findFountainUpgradeData = (itemName: string, pageTitle?: string): UpgradeEntry | undefined => {
  return findUpgradeData(itemName, fountainData, pageTitle)
}

export const findStormreaverUpgradeData = (itemName: string, pageTitle?: string): UpgradeEntry | undefined => {
  return findUpgradeData(itemName, stormreaverUpgradeData, pageTitle)
}

export const findZhentarimUpgradeData = (itemName: string, pageTitle?: string): UpgradeEntry | undefined => {
  return findUpgradeData(itemName, zhentarimData, pageTitle)
}

export const findTraceOfMadnessUpgradeData = (upgradeName: string): UpgradeEntry | undefined => {
  return traceOfMadnessData.find((u) => u.name === upgradeName)
}

export const findUpgradeData = (
  itemName: string,
  dataSet: UpgradeEntry[],
  pageTitle?: string
): UpgradeEntry | undefined => {
  const normalize = (s: string) => s.replace(/\s/g, ' ').trim().toLowerCase()
  const target = normalize(itemName)

  let data = dataSet.find((f) => normalize(f.name) === target)
  if (!data && pageTitle) {
    const cleanPageTitle = normalize(pageTitle.split('(')[0])
    data = dataSet.find((f) => normalize(f.name) === cleanPageTitle)
  }
  return data
}

export const getDisplayEnchantments = (
  item: GearItem,
  isFountainUpgraded: boolean,
  isStormreaverUpgraded: boolean,
  isZhentarimUpgraded = false
): LootEnchantment[] => {
  if (isFountainUpgraded) {
    const upgradeData = findFountainUpgradeData(item.name, item.pageTitle)
    if (upgradeData) {
      return upgradeData.effectsAdded
    }
  } else if (isStormreaverUpgraded) {
    const upgradeData = findStormreaverUpgradeData(item.name, item.pageTitle)
    if (upgradeData) {
      return upgradeData.effectsAdded
    }
  } else if (isZhentarimUpgraded) {
    const upgradeData = findZhentarimUpgradeData(item.name, item.pageTitle)
    if (upgradeData) {
      return upgradeData.effectsAdded
    }
  }
  return item.enchantments ?? []
}

export const createEssenceCraftedItem = (type: string, name: string, slot: GearSlot, minLevel: number): GearItem => ({
  id: `essence-crafted-${slot}-${type}`,
  name: name,
  pageTitle: name,
  slot: slot,
  type: type,
  description: 'A custom crafted item using essence crafting.',
  minLevel: String(minLevel),
  absoluteMinLevel: String(minLevel),
  binding: { type: 'Bound to Character on Acquire', to: 'Character', from: 'Crafting' },
  restriction: '',
  material: '',
  hardness: '0',
  durability: '0',
  weight: '0',
  dropLocations: [{ sourceType: 'Essence Crafting', isCraftOnly: true }],
  update: '0',
  details: '',
  upgradeable: 'No',
  upgradedFrom: '',
  icon: 'essence_crafted',
  image: 'essence_crafted',
  enchantments: [],
  essenceSlots: ['prefix', 'suffix', 'extra'],
  isEssenceCrafted: true
})

export const getScaledEssenceEnchantments = (ench: EssenceEnchantment, minLevel: number): LootEnchantment[] => {
  const idx = Math.max(0, Math.min((ench.scalingStats?.length ?? 1) - 1, minLevel - 1))
  const scalingValue = ench.scalingStats?.[idx]

  const results: LootEnchantment[] = []
  const effects =
    Array.isArray(ench.enchantments) && ench.enchantments.length > 0
      ? ench.enchantments
      : ([{ name: ench.enchantmentName, bonus: ench.bonus }] as LootEnchantment[])

  effects.forEach((innerEnch) => {
    const rawDisplayName = (innerEnch.statModified ?? innerEnch.name) || ench.enchantmentName
    const displayNames: string[] = Array.isArray(rawDisplayName) ? rawDisplayName : [rawDisplayName]

    displayNames.forEach((name) => {
      results.push({
        ...innerEnch,
        name: name.trim(),
        modifier: scalingValue ?? innerEnch.modifier ?? undefined,
        bonus: ench.bonus ?? innerEnch.bonus
      })
    })
  })
  return results
}

export const reconstructEssenceCraftedItem = (name: string, slot: GearSlot, minLevel: number): GearItem => {
  let type = 'Crafted'
  if (name.includes('Weapon')) type = 'Weapon'
  else if (name.includes('Shield')) type = 'Shield'
  else if (name.includes('Rune Arm')) type = 'Rune Arm'
  else if (name.includes('Orb')) type = 'Orb'
  else if (name.includes('Armor')) type = 'Armor'

  return createEssenceCraftedItem(type, name, slot, minLevel)
}

export const isWeapon = (item: LootItem) => {
  return Object.values(WEAPON_TYPES).some((types) => types.includes(item.type)) || item.type === 'Shield'
}

export const isMinorArtifact = (item: LootItem) => {
  return (item.artifactType?.trim().length ?? 0) > 0
}

export const getMaxFiligreeSlots = (item: LootItem) => {
  const minLevel = Number.parseInt(String(item.minLevel), 10) || 1
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

export const sortItemsByValue = (a: { value: number }, b: { value: number }) => b.value - a.value

export const aggregateEnchantmentEntries = (
  item: GearItem,
  itemAugs: Record<number, GearAugment | null> | undefined,
  curse: Curse | null | undefined,
  filigrees: (GearItem | null)[] | undefined,
  slottedEssenceEnchantments?: Record<string, Record<string, string | null>>,
  essenceEnchantments?: EssenceEnchantment[],
  activeSetEnhancements?: { ench: LootEnchantment; sourceName: string }[],
  slottedNearlyFinished?: Record<string, LootEnchantment | null>,
  slottedRitualTable?: Record<string, LootEnchantment | null>,
  slottedLostPurpose?: Record<string, LootEnchantment | null>,
  slottedTraceOfMadness?: Record<string, string | null>,
  slottedFountainOfNecroticMight?: Record<string, boolean>,
  slottedStormreaverUpgrade?: Record<string, boolean>,
  slottedZhentarimAttuned?: Record<string, boolean>
) => {
  const isFountainUpgraded = slottedFountainOfNecroticMight?.[item.id] ?? false
  const isStormreaverUpgraded = slottedStormreaverUpgrade?.[item.id] ?? false
  const isZhentarimUpgraded = slottedZhentarimAttuned?.[item.id] ?? false
  const baseEnchantments = getDisplayEnchantments(item, isFountainUpgraded, isStormreaverUpgraded, isZhentarimUpgraded)

  const entries: { ench: LootEnchantment; sourceName: string }[] = baseEnchantments
    .filter(
      (e: LootEnchantment) =>
        e.name !== 'Craftable Rune Arm' &&
        e.name !== 'Nearly Finished' &&
        e.name !== 'Lost Purpose' &&
        e.name !== 'Trace of Madness' &&
        e.name !== 'Ritual Table' &&
        e.name !== 'Sealed in Fire' &&
        e.name !== 'Sealed in Undeath' &&
        e.name !== 'Zhentarim Attuned' &&
        e.name !== 'Upgradeable Item (Black Abbot)' &&
        e.name !== 'Upgradeable Item (Stormreaver)'
    )
    .map((e: LootEnchantment) => ({
      ench: e,
      sourceName: item.name
    }))

  const nearlyFinished: LootEnchantment | null | undefined = slottedNearlyFinished?.[item.id]
  if (nearlyFinished) {
    entries.push({
      ench: {
        ...nearlyFinished,
        modifier: nearlyFinished.modifier ?? 'Enhancement'
      },
      sourceName: item.name
    })
  }

  const ritualTable = slottedRitualTable?.[item.id]
  if (ritualTable) {
    entries.push({
      ench: { ...ritualTable, modifier: ritualTable.modifier ?? 'Enhancement' },
      sourceName: item.name
    })
  }

  const lostPurpose = slottedLostPurpose?.[item.id]
  if (lostPurpose) {
    entries.push({
      ench: { ...lostPurpose, modifier: lostPurpose.modifier ?? 'Enhancement' },
      sourceName: item.name
    })
  }

  const traceOfMadness = slottedTraceOfMadness?.[item.id]
  if (traceOfMadness) {
    const upgradeData = findTraceOfMadnessUpgradeData(traceOfMadness)
    if (upgradeData) {
      upgradeData.effectsAdded.forEach((ench) => {
        entries.push({
          ench: { ...ench, modifier: ench.modifier ?? 'Enhancement' },
          sourceName: item.name
        })
      })
    }
  }

  addAugmentEntries(entries, item.name, itemAugs)
  addCurseEntries(entries, item.name, curse)
  addFiligreeEntries(entries, item.name, filigrees)
  addEssenceCraftingEntries(entries, item, slottedEssenceEnchantments?.[item.id], essenceEnchantments)

  if (activeSetEnhancements) {
    entries.push(...activeSetEnhancements)
  }

  return entries
}

export const getActiveEnhancementsForSet = (setDef: SetBonus | undefined, count: number) => {
  if (!setDef?.enhancements) return []

  return setDef.enhancements.filter((enh) => (enh.numPiecesEquipped ?? setDef.numPiecesEquipped ?? 0) <= count)
}

const getItemCounts = (
  equippedItems: GearItem[],
  slottedGemSetBonuses: Record<string, (string | null)[]> | undefined,
  counts: Record<string, number>,
  slottedLostPurpose?: Record<string, LootEnchantment | null>
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

    const lp = slottedLostPurpose?.[item.id]
    if (lp?.name) {
      counts[lp.name] = (counts[lp.name] || 0) + 1
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
      if (fili?.grouping) {
        processFiligreeGrouping(fili, filigreeNamesPerSet)
      }
    }
  }

  for (const [setName, names] of Object.entries(filigreeNamesPerSet)) {
    counts[setName] = (counts[setName] ?? 0) + names.size
  }
}

const processFiligreeGrouping = (fili: GearItem, filigreeNamesPerSet: Record<string, Set<string>>) => {
  const groupingStr = fili.grouping
  if (typeof groupingStr !== 'string') return

  const setNames = groupingStr
    .split('/')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  for (const setName of setNames) {
    if (!(setName in filigreeNamesPerSet)) {
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
  slottedGemSetBonuses?: Record<string, (string | null)[]>,
  slottedLostPurpose?: Record<string, LootEnchantment | null>
) => {
  const counts: Record<string, number> = {}

  getItemCounts(equippedItems, slottedGemSetBonuses, counts, slottedLostPurpose)
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

const iterateEnchantments = (
  opt: EssenceEnchantment,
  minLevel: number,
  entries: { ench: LootEnchantment; sourceName: string }[],
  item: GearItem
) => {
  const scaledEnchantments = getScaledEssenceEnchantments(opt, minLevel)
  scaledEnchantments.forEach((ench) => {
    entries.push({
      ench,
      sourceName: `${item.name} (Essence: ${opt.shardName ?? 'UNKNOWN'})`
    })
  })
}

const addEssenceCraftingEntries = (
  entries: { ench: LootEnchantment; sourceName: string }[],
  item: GearItem,
  itemEssenceEnchantments: Record<string, string | null> | undefined,
  essenceEnchantments?: EssenceEnchantment[]
) => {
  if (!itemEssenceEnchantments || !essenceEnchantments) return

  const minLevel = Number.parseInt(String(item.minLevel), 10) || 1

  for (const enchantmentId of Object.values(itemEssenceEnchantments)) {
    if (enchantmentId) {
      const opt = essenceEnchantments.find((e) => e.id === enchantmentId)

      if (opt) {
        iterateEnchantments(opt, minLevel, entries, item)
      }
    }
  }
}
