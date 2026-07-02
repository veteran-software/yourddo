import fountainData from '../../data/fountainOfNecroticMight.json'
import nearlyFinishedRecipes from '../../data/nearlyFinished/recipes.json'
import reaperForgeData from '../../data/reaperForge.json'
import { findSetBonus } from '../../data/setBonuses.ts'
import stormreaverUpgradeData from '../../data/stormreaverUpgrade.json'
import zhentarimData from '../../data/zhentarimAttuned.json'
import type { SetBonus } from '../../types/crafting.ts'
import { UPGRADE_PLACEHOLDER_ENCHANTMENTS } from './constants'
import type { EssenceEnchantment } from './dataLoader.ts'
import { nearlyFinishedUpgradeItems } from './dataLoader.ts'
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
import {
  getItemUpgradeView,
  type LegacyBooleanUpgradeMap,
  type LegacyLootEnchantmentMap,
  type LegacyTraceOfMadnessMap,
  resolveItemUpgrades
} from './upgradeState'

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

interface ReaperForgeGrant {
  stat: string
  modifier: number
  unit?: 'percent'
}

interface ReaperForgeEffect {
  id: string
  name: string
  allowedSlots: GearSlot[]
  grants: ReaperForgeGrant[]
}

const reaperForgeEffects = (reaperForgeData as { effects: ReaperForgeEffect[] }).effects

export const getReaperForgeEffectsForSlot = (slot: GearSlot): ReaperForgeEffect[] => {
  return reaperForgeEffects.filter((effect) => effect.allowedSlots.includes(slot))
}

export const getReaperForgeEffectById = (effectId: string | null | undefined): ReaperForgeEffect | undefined => {
  if (!effectId) return undefined
  return reaperForgeEffects.find((effect) => effect.id === effectId)
}

export const getReaperForgeEnchantments = (effectId: string | null | undefined): LootEnchantment[] => {
  const effect = getReaperForgeEffectById(effectId)
  if (!effect) return []

  return effect.grants.map((grant) => ({
    name: grant.stat,
    bonus: 'Reaper',
    modifier: grant.unit === 'percent' ? `${String(grant.modifier)}%` : grant.modifier
  }))
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

interface ReforgingRecipe {
  item: string
  stage: string
  effectsAdded?: LootEnchantment[]
  choices?: { name: string }[]
}

export const findReforgingRecipe = (itemName: string, stage: string): ReforgingRecipe | undefined => {
  const station = (nearlyFinishedRecipes as { reforgingStation: ReforgingRecipe[] }).reforgingStation
  return station.find((r) => r.item === itemName && r.stage === stage)
}

const NEARLY_FINISHED_CHOICE_RE = /\{\{Ability\|([^|{}]+)\|([^|{}]+)(?:\|([^|{}]+))?}}/gi

const formatNearlyFinishedChoiceLabel = (stat: string, modifier: string, bonus?: string): string => {
  const parts: string[] = []

  if (bonus?.trim()) {
    parts.push(bonus.trim())
  }

  parts.push(stat.trim())

  const normalizedModifier =
    modifier.trim().startsWith('+') || modifier.trim().startsWith('-') ? modifier.trim() : `+${modifier.trim()}`

  parts.push(normalizedModifier)

  return parts.join(' ')
}

export const parseNearlyFinishedChoice = (label: string): LootEnchantment => {
  const trimmed = label.trim()
  const lastSpace = trimmed.lastIndexOf(' ')

  if (lastSpace === -1) {
    return {
      name: trimmed,
      bonus: 'Enhancement'
    }
  }

  const content = trimmed.slice(0, lastSpace).trim()
  const value = trimmed
    .slice(lastSpace + 1)
    .trim()
    .replace(/^\+/, '')

  if (!content || Number.isNaN(Number(value))) {
    return {
      name: trimmed,
      bonus: 'Enhancement'
    }
  }

  const tokens = content.split(/\s+/)
  const knownBonusTokens = new Set([
    'alchemy',
    'competence',
    'enhancement',
    'exceptional',
    'insight',
    'insightful',
    'morale',
    'profane',
    'quality',
    'resistance',
    'racial',
    'responsiveness',
    'vitality',
    'artifact',
    'artifact-level',
    'blessed',
    'dodge',
    'luck',
    'festive',
    'guild',
    'sacred',
    'devotion',
    'parrying',
    'exalted'
  ])

  const firstToken = tokens[0]?.toLowerCase()
  if (firstToken && knownBonusTokens.has(firstToken) && tokens.length > 1) {
    return {
      name: tokens.slice(1).join(' '),
      bonus: tokens[0],
      modifier: value
    }
  }

  return {
    name: content,
    bonus: 'Enhancement',
    modifier: value
  }
}

export const getNearlyFinishedChoiceLabels = (
  recipeChoices: { name: string }[] | undefined,
  upgradeable?: string
): string[] => {
  if (recipeChoices?.length) {
    return recipeChoices.map((choice) => choice.name)
  }

  if (!upgradeable) {
    return []
  }

  const labels: string[] = []
  let match: RegExpExecArray | null

  NEARLY_FINISHED_CHOICE_RE.lastIndex = 0
  while ((match = NEARLY_FINISHED_CHOICE_RE.exec(upgradeable)) !== null) {
    labels.push(formatNearlyFinishedChoiceLabel(match[1], match[2], match[3]))
  }

  return labels
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
  if (name.includes('Weapon (Melee)')) type = 'Weapon (Melee)'
  else if (name.includes('Weapon (Ranged)')) type = 'Weapon (Ranged)'
  else if (name.includes('Weapon')) type = 'Weapon'
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

export const canApplyCurse = (item: GearItem) => {
  return item.slot !== GearSlot.Quiver
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

interface AggregateEnchantmentEntriesOptions {
  slottedEssenceEnchantments?: Record<string, Record<string, string | null>>
  essenceEnchantments?: EssenceEnchantment[]
  activeSetEnhancements?: { ench: LootEnchantment; sourceName: string }[]
  itemUpgrades?: import('./upgradeState').ItemUpgrades
  slottedNearlyFinished?: LegacyLootEnchantmentMap
  slottedAlmostThere?: LegacyLootEnchantmentMap
  slottedFinishingTouch?: LegacyLootEnchantmentMap
  slottedRitualTable?: LegacyLootEnchantmentMap
  slottedLostPurpose?: LegacyLootEnchantmentMap
  slottedTraceOfMadness?: LegacyTraceOfMadnessMap
  slottedFountainOfNecroticMight?: LegacyBooleanUpgradeMap
  slottedStormreaverUpgrade?: LegacyBooleanUpgradeMap
  slottedZhentarimAttuned?: LegacyBooleanUpgradeMap
}

export const aggregateEnchantmentEntries = (
  item: GearItem,
  itemAugs: Record<number, GearAugment | null> | undefined,
  curse: Curse | null | undefined,
  filigrees: (GearItem | null)[] | undefined,
  options: AggregateEnchantmentEntriesOptions = {}
) => {
  const { slottedEssenceEnchantments, essenceEnchantments, activeSetEnhancements } = options
  const resolvedItemUpgrades = resolveItemUpgrades(options)
  const itemUpgrade = getItemUpgradeView(resolvedItemUpgrades, item.id)
  const isFountainUpgraded = itemUpgrade.fountainOfNecroticMight ?? false
  const isStormreaverUpgraded = itemUpgrade.stormreaverUpgrade ?? false
  const isZhentarimUpgraded = itemUpgrade.zhentarimAttuned ?? false
  const reaperForgeEnchantments = getReaperForgeEnchantments(itemUpgrade.reaperForge ?? null)

  const nfStored = itemUpgrade.nearlyFinished ?? null
  const atStored = itemUpgrade.almostThere ?? null
  const ftStored = itemUpgrade.finishingTouch ?? null
  const nfRecipe = findReforgingRecipe(item.name, 'Nearly Finished')
  const atRecipe = findReforgingRecipe(item.name, 'Almost There')
  const ftRecipe = findReforgingRecipe(item.name, 'Finishing Touch')
  const nfIsToggle = nfRecipe != null && !nfRecipe.choices?.length
  const atIsToggle = atRecipe != null && !atRecipe.choices?.length
  const ftIsToggle = ftRecipe != null && !ftRecipe.choices?.length

  // For toggle (checkbox) upgrades, replace the full enchantment list with the
  // runtime upgrade tier's enchantment list. Higher tiers take priority.
  const upgradeItems = nearlyFinishedUpgradeItems as Partial<typeof nearlyFinishedUpgradeItems>
  let resolvedEnchantments: LootEnchantment[]
  if (ftIsToggle && ftStored?.name === '__active__') {
    resolvedEnchantments =
      upgradeItems[`${item.name} (Complete)`]?.enchantments ??
      getDisplayEnchantments(item, isFountainUpgraded, isStormreaverUpgraded, isZhentarimUpgraded)
  } else if (atIsToggle && atStored?.name === '__active__') {
    resolvedEnchantments =
      upgradeItems[`${item.name} (Almost There Upgraded)`]?.enchantments ??
      getDisplayEnchantments(item, isFountainUpgraded, isStormreaverUpgraded, isZhentarimUpgraded)
  } else if (nfIsToggle && nfStored?.name === '__active__') {
    resolvedEnchantments =
      upgradeItems[`${item.name} (Nearly Finished Upgraded)`]?.enchantments ??
      getDisplayEnchantments(item, isFountainUpgraded, isStormreaverUpgraded, isZhentarimUpgraded)
  } else {
    resolvedEnchantments = getDisplayEnchantments(item, isFountainUpgraded, isStormreaverUpgraded, isZhentarimUpgraded)
  }

  const entries: { ench: LootEnchantment; sourceName: string }[] = resolvedEnchantments
    .filter((e: LootEnchantment) => !UPGRADE_PLACEHOLDER_ENCHANTMENTS.has(e.name))
    .map((e: LootEnchantment) => ({
      ench: e,
      sourceName: item.name
    }))

  const addReforgingStageEffects = (stored: LootEnchantment | null | undefined, isToggle: boolean) => {
    if (!stored) return
    // Toggle: enchantments already replaced above — nothing more to add
    if (isToggle) return
    // Dropdown: add the selected choice enchantment
    entries.push({ ench: { ...stored }, sourceName: item.name })
  }

  addReforgingStageEffects(nfStored, nfIsToggle)
  addReforgingStageEffects(atStored, atIsToggle)
  addReforgingStageEffects(ftStored, ftIsToggle)

  const ritualTable = itemUpgrade.ritualTable
  if (ritualTable) {
    entries.push({
      ench: { ...ritualTable, modifier: ritualTable.modifier ?? 'Enhancement' },
      sourceName: item.name
    })
  }

  const lostPurpose = itemUpgrade.lostPurpose
  if (lostPurpose) {
    entries.push({
      ench: { ...lostPurpose, modifier: lostPurpose.modifier ?? 'Enhancement' },
      sourceName: item.name
    })
  }

  const traceEnch = itemUpgrade.traceOfMadness
  if (traceEnch) {
    entries.push({
      ench: { ...traceEnch, modifier: traceEnch.modifier ?? 'Enhancement' },
      sourceName: item.name
    })
  }

  reaperForgeEnchantments.forEach((ench) => {
    entries.push({
      ench,
      sourceName: item.name
    })
  })

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

export const getSetCounts = (
  equippedItems: GearItem[],
  slottedAugments: Record<string, Record<number, GearAugment | null>>,
  slottedFiligrees?: Record<string, (GearItem | null)[]>,
  slottedGemSetBonuses?: Record<string, (string | null)[]>,
  slottedLostPurpose?: Record<string, LootEnchantment | null>
): Record<string, number> => {
  const counts: Record<string, number> = {}
  getItemCounts(equippedItems, slottedGemSetBonuses, counts, slottedLostPurpose)
  getAugmentCounts(slottedAugments, counts)
  getFiligreeCounts(slottedFiligrees, counts)
  return counts
}

export const getActiveSetEnhancements = (
  equippedItems: GearItem[],
  slottedAugments: Record<string, Record<number, GearAugment | null>>,
  slottedFiligrees?: Record<string, (GearItem | null)[]>,
  slottedGemSetBonuses?: Record<string, (string | null)[]>,
  slottedLostPurpose?: Record<string, LootEnchantment | null>
) => {
  const counts = getSetCounts(
    equippedItems,
    slottedAugments,
    slottedFiligrees,
    slottedGemSetBonuses,
    slottedLostPurpose
  )

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
