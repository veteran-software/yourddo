import type { EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types.ts'
import { collectSelectedGearPlannerAugments } from './augments.ts'
import { slaveLordsMarker } from './slaveLords'
import { collectSelectedGearPlannerCurses } from './curses.ts'
import { type GearPlannerEssenceCraftingConfigurations, resolveGearPlannerEssenceAffixes } from './essenceCrafting.ts'
import { collectSelectedGearPlannerFiligrees, sentientFiligreeType } from './filigrees.ts'
import type { GearPlannerEffect, GearPlannerItem } from './gearPlanner.types.ts'
import type {
  GearPlannerEquipment,
  GearPlannerSlottedAugments,
  GearPlannerSlottedCurses,
  GearPlannerSlottedFiligrees
} from './planner.ts'
import {
  getEffectiveGearPlannerAugmentSlotsByItem,
  getGearPlannerEffectiveReforgingEffects,
  type GearPlannerReforgingData,
  type GearPlannerReforgingStage,
  type GearPlannerReforgingState
} from './reforging.ts'

export type GearPlannerEffectSourceCategory =
  | 'crafting'
  | 'equipped-item'
  | 'reforging-tier'
  | 'reforging-choice'
  | 'augment'
  | 'curse'
  | 'essence'
  | 'filigree'
  | 'set'

export interface GearPlannerEffectSource {
  id: string
  effect: GearPlannerEffect
  category: GearPlannerEffectSourceCategory
  itemId?: string
  itemName?: string
  slot?: string
  augmentName?: string
  augmentSlotIndex?: number
  augmentSlotName?: string
  curseId?: string
  craftLabel?: string
  curseName?: string
  essenceEnhancementId?: string
  essenceEnhancementName?: string
  essenceAffixPosition?: 'prefix' | 'suffix' | 'extra'
  filigreeType?: number
  filigreeName?: string
  filigreeSlotIndex?: number
  reforgingStage?: GearPlannerReforgingStage
  reforgingChoiceLabel?: string
  setName?: string
  setThreshold?: number
  setCategory?: 'item' | 'filigree'
  normalizedName: string
  normalizedBonusType: string
  comparisonValue: number
}

export interface GearPlannerEffectSummaryGroup {
  bonusType: string
  effectiveValue: number
  effectiveDisplay: string
  entries: readonly (GearPlannerEffectSource & { isEffective: boolean })[]
}

export interface GearPlannerEffectSummary {
  name: string
  normalizedName: string
  total: number
  isNumeric: boolean
  groups: readonly GearPlannerEffectSummaryGroup[]
}

export interface GearPlannerEffectConflict {
  name: string
  normalizedName: string
  bonusType: string
  entries: readonly (GearPlannerEffectSource & { isEffective: boolean })[]
}

export interface GearPlannerEffectConflictResolution {
  conflicts: readonly GearPlannerEffectConflict[]
  bySourceId: Readonly<Record<string, { isEffective: boolean; entries: GearPlannerEffectConflict['entries'] }>>
}

const stackableBonusTypes = new Set(['no type', 'reaper', 'mythic'])
const summingBonusTypes = new Set(['reaper', 'mythic'])
const legacyUpgradePlaceholders = new Set([
  'Craftable Rune Arm',
  'Nearly Finished',
  'Nearly Complete',
  'Nearly Complete: Ability Score',
  'Nearly Complete: Healing Amplification',
  'Nearly Complete: Insightful Ability Score',
  'Nearly Complete: Quality Ability Score',
  'Nearly Complete: Skill',
  'Nearly Complete: Spell Focus',
  'Almost There',
  'Finishing Touch',
  'Lost Purpose',
  slaveLordsMarker,
  'Trace of Madness',
  'Ritual Table',
  'Sealed in Fire',
  'Sealed in Undeath',
  'Zhentarim Attuned',
  'Upgradeable Item (Black Abbot)',
  'Upgradeable Item (Stormreaver)'
])

export const normalizeEffectName = (value: string | number | undefined | null): string =>
  value == null ? '' : String(value).trim().toLowerCase()

// Preserve legacy getBonus behavior: absent, empty, and numeric values are no-type bonuses.
export const normalizeBonusType = (value: string | number | undefined | null): string => {
  const normalized = normalizeEffectName(value)
  return normalized === '' || !Number.isNaN(Number(normalized)) ? 'no type' : normalized
}

// Comparison-only legacy parser. Source modifier text remains untouched for display.
export const parseEffectModifier = (value: string | number | undefined | null): number => {
  if (value == null) return 0
  if (typeof value === 'number') return value
  const parsed = Number.parseFloat(value.replaceAll(/[+%[\]W]/g, ''))
  return Number.isNaN(parsed) ? 0 : parsed
}

const equippedItems = (equipment: GearPlannerEquipment): readonly GearPlannerItem[] =>
  Object.values(equipment).filter((item): item is GearPlannerItem => item !== null)

export const augmentEffectId = (itemId: string, slotIndex: number, effectIndex: number) =>
  `${itemId}:augment:${String(slotIndex)}:${String(effectIndex)}`

export const collectEquippedEffects = (
  equipment: GearPlannerEquipment,
  slottedAugments: GearPlannerSlottedAugments = {},
  slottedFiligrees: GearPlannerSlottedFiligrees = {},
  slottedCurses: GearPlannerSlottedCurses = {},
  essenceData?: EssenceCraftingData,
  essenceCrafting: GearPlannerEssenceCraftingConfigurations = {},
  reforgingData?: GearPlannerReforgingData,
  reforging: GearPlannerReforgingState = {}
): readonly GearPlannerEffectSource[] => [
  ...equippedItems(equipment).flatMap((item) => {
    const effective = reforgingData
      ? getGearPlannerEffectiveReforgingEffects(item, reforging[item.id], reforgingData)
      : { enchantments: item.source.enchantments ?? [], tier: null, choices: [] }
    const category: 'reforging-tier' | 'equipped-item' = effective.tier ? 'reforging-tier' : 'equipped-item'
    const sourceId = category === 'reforging-tier' ? `reforging-tier:${effective.tier?.tier ?? ''}` : 'equipped-item'
    return [
      ...(item.crafts?.some((craft) => craft.replacesEnchantments) ? [] : effective.enchantments).flatMap(
        (effect, index) =>
          legacyUpgradePlaceholders.has(effect.name)
            ? []
            : [
                {
                  id: `${item.id}:${sourceId}:${String(index)}`,
                  effect,
                  itemId: item.id,
                  itemName: item.source.name,
                  slot: item.slot,
                  category,
                  ...(effective.tier ? { reforgingStage: effective.tier.stage } : {}),
                  normalizedName: normalizeEffectName(effect.name),
                  normalizedBonusType: normalizeBonusType(effect.bonus),
                  comparisonValue: parseEffectModifier(effect.modifier)
                }
              ]
      ),
      ...(item.crafts ?? []).flatMap((craft) =>
        (craft.effects ?? []).map((effect, index) => ({
          id: `${item.id}:craft:${craft.system}:${String(index)}`,
          effect,
          itemId: item.id,
          itemName: item.source.name,
          slot: item.slot,
          category: 'crafting' as const,
          craftLabel: craft.system === 'mythic' ? 'Mythic Boost ' + craft.label : craft.label,
          normalizedName: normalizeEffectName(effect.name),
          normalizedBonusType: normalizeBonusType(effect.bonus),
          comparisonValue: parseEffectModifier(effect.modifier)
        }))
      ),
      ...effective.choices.map(({ stage, choice }) => ({
        id: `${item.id}:reforging-choice:${stage}:${encodeURIComponent(choice.id)}`,
        effect: choice.effect,
        itemId: item.id,
        itemName: item.source.name,
        slot: item.slot,
        category: 'reforging-choice' as const,
        reforgingStage: stage,
        reforgingChoiceLabel: choice.label,
        normalizedName: normalizeEffectName(choice.effect.name),
        normalizedBonusType: normalizeBonusType(choice.effect.bonus),
        comparisonValue: parseEffectModifier(choice.effect.modifier)
      }))
    ]
  }),
  ...collectSelectedGearPlannerAugments(
    equipment,
    slottedAugments,
    reforgingData ? getEffectiveGearPlannerAugmentSlotsByItem(equipment, reforging, reforgingData) : {}
  ).flatMap(({ item, slotIndex, augmentSlot, augment }) =>
    augment.effectsAdded.map((effect, effectIndex) => ({
      id: augmentEffectId(item.id, slotIndex, effectIndex),
      effect,
      itemId: item.id,
      itemName: item.source.name,
      slot: item.slot,
      category: 'augment' as const,
      augmentName: augment.name,
      augmentSlotIndex: slotIndex,
      augmentSlotName: augmentSlot.name,
      normalizedName: normalizeEffectName(effect.name),
      normalizedBonusType: normalizeBonusType(effect.bonus),
      comparisonValue: parseEffectModifier(effect.modifier)
    }))
  ),
  ...collectSelectedGearPlannerCurses(equipment, slottedCurses).flatMap(({ item, curse }) =>
    curse.enchantments.map((effect, effectIndex) => ({
      id: `${item.id}:curse:${encodeURIComponent(curse.id)}:${String(effectIndex)}`,
      effect,
      itemId: item.id,
      itemName: item.source.name,
      slot: item.slot,
      category: 'curse' as const,
      curseId: curse.id,
      curseName: curse.name,
      normalizedName: normalizeEffectName(effect.name),
      normalizedBonusType: normalizeBonusType(effect.bonus),
      comparisonValue: parseEffectModifier(effect.modifier)
    }))
  ),
  ...(essenceData
    ? equippedItems(equipment).flatMap((item) => {
        const configuration = essenceCrafting[item.id]
        if (!configuration) return []
        return resolveGearPlannerEssenceAffixes(essenceData, item, configuration, slottedCurses[item.id]).flatMap(
          ({ position, enhancement, effects: essenceEffects }) =>
            essenceEffects.map((effect, effectIndex) => ({
              id: `${item.id}:essence:${position}:${encodeURIComponent(enhancement.id)}:${String(effectIndex)}`,
              effect,
              itemId: item.id,
              itemName: item.source.name,
              slot: item.slot,
              category: 'essence' as const,
              essenceEnhancementId: enhancement.id,
              essenceEnhancementName: enhancement.displayName,
              essenceAffixPosition: position,
              normalizedName: normalizeEffectName(effect.name),
              normalizedBonusType: normalizeBonusType(effect.bonus),
              comparisonValue: parseEffectModifier(effect.modifier)
            }))
        )
      })
    : []),
  ...collectSelectedGearPlannerFiligrees(equipment, slottedFiligrees).flatMap(({ item, slotIndex, filigree }) =>
    (filigree.source.enchantments ?? []).map((effect, effectIndex) => ({
      id: `${item.id}:filigree:${String(slotIndex)}:${String(effectIndex)}`,
      effect: { ...effect, bonus: 'Filigree' },
      itemId: item.id,
      itemName: item.source.name,
      slot: item.slot,
      category: 'filigree' as const,
      filigreeType: sentientFiligreeType(filigree),
      filigreeName: filigree.name,
      filigreeSlotIndex: slotIndex,
      normalizedName: normalizeEffectName(effect.name),
      normalizedBonusType: normalizeBonusType('Filigree'),
      comparisonValue: parseEffectModifier(effect.modifier)
    }))
  )
]

const sourceDisplay = (source: GearPlannerEffectSource): string =>
  source.effect.modifier === undefined || source.effect.modifier === null ? '' : String(source.effect.modifier)

const isProwessStrength = (entry: GearPlannerEffectSource) =>
  entry.filigreeType === 71 && entry.normalizedName === 'strength' && entry.comparisonValue === 1

const withEffectiveEntries = (
  entries: readonly GearPlannerEffectSource[],
  bonusType: string
): GearPlannerEffectSummaryGroup => {
  const summing = summingBonusTypes.has(bonusType)
  const prowessStrength = Math.min(20, new Set(entries.filter(isProwessStrength).map((entry) => entry.itemId)).size)
  const effectiveValue = summing
    ? entries.reduce((total, entry) => total + entry.comparisonValue, 0)
    : Math.max(prowessStrength, ...entries.map((entry) => entry.comparisonValue))
  const effectiveDisplay =
    entries
      .find((entry) => entry.comparisonValue === effectiveValue && sourceDisplay(entry))
      ?.effect.modifier?.toString() ??
    entries.find((entry) => sourceDisplay(entry))?.effect.modifier?.toString() ??
    ''

  return {
    bonusType,
    effectiveValue,
    effectiveDisplay,
    entries: entries.map((entry) => ({
      ...entry,
      isEffective:
        summing ||
        entry.comparisonValue === effectiveValue ||
        (isProwessStrength(entry) && prowessStrength === effectiveValue)
    }))
  }
}

export const aggregateEffectSummary = (
  sources: readonly GearPlannerEffectSource[]
): readonly GearPlannerEffectSummary[] => {
  const byName = new Map<string, GearPlannerEffectSource[]>()
  for (const source of sources) {
    const entries = byName.get(source.normalizedName) ?? []
    entries.push(source)
    byName.set(source.normalizedName, entries)
  }

  return [...byName.entries()]
    .map(([normalizedName, entries]) => {
      const byBonus = new Map<string, GearPlannerEffectSource[]>()
      for (const entry of entries) {
        const grouped = byBonus.get(entry.normalizedBonusType) ?? []
        grouped.push(entry)
        byBonus.set(entry.normalizedBonusType, grouped)
      }
      const groups = [...byBonus.entries()]
        .map(([bonusType, groupEntries]) => withEffectiveEntries(groupEntries, bonusType))
        .toSorted(
          (left, right) => right.effectiveValue - left.effectiveValue || left.bonusType.localeCompare(right.bonusType)
        )
      const isNumeric = groups.some((group) => group.effectiveValue !== 0)
      return {
        name: entries[0].effect.name,
        normalizedName,
        total: isNumeric ? groups.reduce((total, group) => total + group.effectiveValue, 0) : 0,
        isNumeric,
        groups
      }
    })
    .toSorted((left, right) => left.name.localeCompare(right.name))
}

// Legacy curse, filigree, and set effects participate in display aggregation, never normal item/augment conflicts.
export const conflictEligibleEffectSources = (
  sources: readonly GearPlannerEffectSource[]
): readonly GearPlannerEffectSource[] =>
  sources.filter(
    ({ category, reforgingStage }) =>
      category === 'crafting' ||
      category === 'equipped-item' ||
      category === 'augment' ||
      (category === 'reforging-choice' && reforgingStage === 'nearly-finished')
  )

export interface GearPlannerPotentialEffectConflict {
  isConflict: boolean
  currentMax: number
  currentModifier?: string | number
  isRedundant: boolean
  isUpgrade?: boolean
  isOverpowered?: boolean
}

// Matches legacy checkPotentialConflict for a candidate effect. The host item's base effects are ignored;
// its selected augments remain eligible, and selected curses never become permanent conflict sources.
export const previewPotentialEffectConflict = (
  effect: GearPlannerEffect,
  sources: readonly GearPlannerEffectSource[],
  hostItemId: string
): GearPlannerPotentialEffectConflict => {
  const normalizedName = normalizeEffectName(effect.name)
  const normalizedBonusType = normalizeBonusType(effect.bonus)
  if (
    stackableBonusTypes.has(normalizedBonusType) ||
    normalizedName === 'nearly finished' ||
    normalizedName.startsWith('nearly complete') ||
    normalizedName === 'lost purpose' ||
    normalizedName === 'trace of madness' ||
    normalizedName === 'ritual table' ||
    normalizedName === 'zhentarim attuned' ||
    (normalizedName.includes('enhancement bonus') && !normalizedName.includes('to '))
  ) {
    return { isConflict: false, currentMax: 0, isRedundant: false }
  }

  const matches = conflictEligibleEffectSources(sources).filter(
    (source) =>
      (source.itemId !== hostItemId || source.category === 'augment') &&
      source.normalizedName === normalizedName &&
      source.normalizedBonusType === normalizedBonusType
  )
  if (!matches.length) return { isConflict: false, currentMax: 0, isRedundant: false }

  const strongest = matches.reduce((best, source) => (source.comparisonValue > best.comparisonValue ? source : best))
  const currentMax = strongest.comparisonValue
  const candidateValue = parseEffectModifier(effect.modifier)
  return {
    isConflict: true,
    currentMax,
    currentModifier: strongest.effect.modifier,
    isRedundant: candidateValue === currentMax,
    isUpgrade: candidateValue > currentMax,
    isOverpowered: candidateValue < currentMax
  }
}

export const resolveEffectConflicts = (
  sources: readonly GearPlannerEffectSource[]
): GearPlannerEffectConflictResolution => {
  const grouped = new Map<string, GearPlannerEffectSource[]>()
  for (const source of sources) {
    if (
      stackableBonusTypes.has(source.normalizedBonusType) ||
      (source.normalizedName.includes('enhancement bonus') && !source.normalizedName.includes('to '))
    )
      continue
    const key = `${source.normalizedName}\u0000${source.normalizedBonusType}`
    const entries = grouped.get(key) ?? []
    entries.push(source)
    grouped.set(key, entries)
  }

  const bySourceId: Record<string, GearPlannerEffectConflictResolution['bySourceId'][string]> = {}
  const conflicts = [...grouped.values()].flatMap((entries): GearPlannerEffectConflict[] => {
    if (entries.length < 2) return []
    if (entries.every(isProwessStrength)) return []
    const resolvedEntries = withEffectiveEntries(entries, entries[0].normalizedBonusType).entries
    for (const entry of resolvedEntries)
      bySourceId[entry.id] = { isEffective: entry.isEffective, entries: resolvedEntries }
    return [
      {
        name: entries[0].effect.name,
        normalizedName: entries[0].normalizedName,
        bonusType: entries[0].normalizedBonusType,
        entries: resolvedEntries
      }
    ]
  })

  return { conflicts, bySourceId }
}
