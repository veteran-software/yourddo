import { formatResolvedEffectModifier, resolveEnhancementEffects } from '../essenceCrafting/enhancementEffects.ts'
import {
  getAvailableEnhancementChoicesForItemCategories,
  isEnhancementEligibleForItemCategories,
  isSupportedEssenceItemLevel
} from '../essenceCrafting/enhancementEligibility.ts'
import type {
  EssenceAffixPosition,
  EssenceCraftingData,
  EssenceEnhancement
} from '../essenceCrafting/essenceCrafting.types.ts'
import type { GearPlannerCurse, GearPlannerEffect, GearPlannerItem, GearPlannerSlot } from './gearPlanner.types.ts'
import { gearPlannerSlots } from './gearPlanner.types.ts'

const essenceCraftedSourceFile = 'synthetic:essence-crafted'
const extraMinimumItemLevel = 10

export const gearPlannerEssenceCraftingMaterials = [
  'Adamantine',
  'Blueshine',
  'Byeshk',
  'Cloth',
  'Cold Iron',
  'Dwarven Iron',
  'Flametouched Iron',
  'Gem',
  'Glass',
  'Leather',
  'Magesteel',
  'Mithral',
  'Planeforged Steel',
  'Silver',
  'Spiritcraft Leather',
  'Spiritforged Iron',
  'Stone',
  'Wood'
] as const

export type GearPlannerEssenceCraftingMaterial = (typeof gearPlannerEssenceCraftingMaterials)[number] | ''

export interface GearPlannerEssenceCraftingConfiguration {
  minimumLevel: number
  material: GearPlannerEssenceCraftingMaterial
  prefixId: string | null
  suffixId: string | null
  extraId: string | null
}

export type GearPlannerEssenceCraftingConfigurations = Readonly<Record<string, GearPlannerEssenceCraftingConfiguration>>

interface EssenceCraftedDefinition {
  kind: string
  name: string
  type: string
  itemCategoryId: string
}

const accessoryDefinitions: Partial<Record<GearPlannerSlot, EssenceCraftedDefinition>> = {
  [gearPlannerSlots.eyes]: {
    kind: 'goggles',
    name: 'Essence Crafted Goggles',
    type: 'Crafted',
    itemCategoryId: 'goggles'
  },
  [gearPlannerSlots.head]: { kind: 'helmet', name: 'Essence Crafted Helmet', type: 'Crafted', itemCategoryId: 'head' },
  [gearPlannerSlots.neck]: {
    kind: 'necklace',
    name: 'Essence Crafted Necklace',
    type: 'Crafted',
    itemCategoryId: 'necklace'
  },
  [gearPlannerSlots.trinket]: {
    kind: 'trinket',
    name: 'Essence Crafted Trinket',
    type: 'Crafted',
    itemCategoryId: 'trinket'
  },
  [gearPlannerSlots.armor]: { kind: 'armor', name: 'Essence Crafted Armor', type: 'Armor', itemCategoryId: 'armor' },
  [gearPlannerSlots.cloak]: { kind: 'cloak', name: 'Essence Crafted Cloak', type: 'Crafted', itemCategoryId: 'cloak' },
  [gearPlannerSlots.wrists]: {
    kind: 'bracers',
    name: 'Essence Crafted Bracers',
    type: 'Crafted',
    itemCategoryId: 'bracers'
  },
  [gearPlannerSlots.waist]: { kind: 'belt', name: 'Essence Crafted Belt', type: 'Crafted', itemCategoryId: 'belt' },
  [gearPlannerSlots.feet]: { kind: 'boots', name: 'Essence Crafted Boots', type: 'Crafted', itemCategoryId: 'boots' },
  [gearPlannerSlots.hands]: {
    kind: 'gloves',
    name: 'Essence Crafted Gloves',
    type: 'Crafted',
    itemCategoryId: 'gloves'
  },
  [gearPlannerSlots.firstFinger]: {
    kind: 'ring',
    name: 'Essence Crafted Ring',
    type: 'Crafted',
    itemCategoryId: 'ring'
  },
  [gearPlannerSlots.secondFinger]: {
    kind: 'ring',
    name: 'Essence Crafted Ring',
    type: 'Crafted',
    itemCategoryId: 'ring'
  }
}

const mainHandDefinitions: readonly EssenceCraftedDefinition[] = [
  {
    kind: 'weapon-melee',
    name: 'Essence Crafted Weapon (Melee)',
    type: 'Weapon (Melee)',
    itemCategoryId: 'weapon'
  },
  {
    kind: 'weapon-ranged',
    name: 'Essence Crafted Weapon (Ranged)',
    type: 'Weapon (Ranged)',
    itemCategoryId: 'weapon'
  }
]

const offHandDefinitions: readonly EssenceCraftedDefinition[] = [
  ...mainHandDefinitions,
  { kind: 'shield', name: 'Essence Crafted Shield', type: 'Shield', itemCategoryId: 'shield' },
  { kind: 'rune-arm', name: 'Essence Crafted Rune Arm', type: 'Rune Arm', itemCategoryId: 'rune-arm' },
  { kind: 'orb', name: 'Essence Crafted Orb', type: 'Orb', itemCategoryId: 'orb' }
]

const stableSyntheticItemId = (slot: GearPlannerSlot, kind: string): string =>
  ['essence-crafted', slot, kind].map(encodeURIComponent).join('|')

const definitionForSlot = (slot: GearPlannerSlot): readonly EssenceCraftedDefinition[] => {
  if (slot === gearPlannerSlots.mainHand) return mainHandDefinitions
  if (slot === gearPlannerSlots.offHand) return offHandDefinitions
  const definition = accessoryDefinitions[slot]
  return definition ? [definition] : []
}

const createEssenceCraftedItem = (
  slot: GearPlannerSlot,
  definition: EssenceCraftedDefinition,
  minimumLevel: number
): GearPlannerItem => ({
  id: stableSyntheticItemId(slot, definition.kind),
  slot,
  sourceFile: essenceCraftedSourceFile,
  minimumLevel,
  absoluteMinimumLevel: minimumLevel,
  essenceCrafting: { kind: definition.kind, itemCategoryId: definition.itemCategoryId },
  source: {
    name: definition.name,
    pageTitle: definition.name,
    type: definition.type,
    minLevel: minimumLevel,
    absoluteMinLevel: minimumLevel,
    material: '',
    binding: { type: 'Bound to Character on Acquire', to: 'Character', from: 'Crafting' },
    enchantments: [],
    dropLocations: []
  }
})

/** Creates browser-only planner records without changing immutable CDN source arrays. */
export const getEssenceCraftedGearPlannerItems = (
  slot: GearPlannerSlot,
  minimumLevel: number
): readonly GearPlannerItem[] =>
  definitionForSlot(slot).map((definition) => createEssenceCraftedItem(slot, definition, minimumLevel))

/** Resolves only known deterministic synthetic IDs; arbitrary item IDs never reconstruct. */
export const resolveEssenceCraftedGearPlannerItem = (
  itemId: string,
  slot: GearPlannerSlot
): GearPlannerItem | undefined => getEssenceCraftedGearPlannerItems(slot, 1).find(({ id }) => id === itemId)

export const isEssenceCraftedGearPlannerItem = (
  item: GearPlannerItem | null | undefined
): item is GearPlannerItem & { essenceCrafting: NonNullable<GearPlannerItem['essenceCrafting']> } =>
  item?.sourceFile === essenceCraftedSourceFile && item.essenceCrafting !== undefined

export const createGearPlannerEssenceCraftingConfiguration = (
  data: EssenceCraftingData,
  minimumLevel: number
): GearPlannerEssenceCraftingConfiguration => ({
  minimumLevel: isSupportedEssenceItemLevel(data, minimumLevel) ? minimumLevel : data.rules.supportedItemLevels.minimum,
  material: '',
  prefixId: null,
  suffixId: null,
  extraId: null
})

export const isGearPlannerEssenceCraftingMaterial = (value: string): value is GearPlannerEssenceCraftingMaterial =>
  value === '' ||
  gearPlannerEssenceCraftingMaterials.includes(value as (typeof gearPlannerEssenceCraftingMaterials)[number])

export const gearPlannerEssenceCraftingCurseBoost = (curse: GearPlannerCurse | null | undefined): number => {
  if (curse?.id === 'Curse of Major Masterworks') return 2
  if (curse?.id === 'Curse of Minor Masterworks') return 1
  return 0
}

export const getGearPlannerEssenceCraftingLevel = (
  data: EssenceCraftingData,
  configuration: GearPlannerEssenceCraftingConfiguration,
  curse: GearPlannerCurse | null | undefined
): number =>
  Math.min(
    data.rules.supportedItemLevels.maximum,
    configuration.minimumLevel + gearPlannerEssenceCraftingCurseBoost(curse)
  )

export const hasGearPlannerEssenceExtraSlot = (configuration: GearPlannerEssenceCraftingConfiguration): boolean =>
  configuration.minimumLevel >= extraMinimumItemLevel

const affixSelection = (
  configuration: GearPlannerEssenceCraftingConfiguration,
  position: EssenceAffixPosition
): string | null =>
  position === 'prefix'
    ? configuration.prefixId
    : position === 'suffix'
      ? configuration.suffixId
      : configuration.extraId

export const getGearPlannerEssenceEnhancementChoices = (
  data: EssenceCraftingData,
  item: GearPlannerItem,
  configuration: GearPlannerEssenceCraftingConfiguration,
  curse: GearPlannerCurse | null | undefined,
  position: EssenceAffixPosition
): readonly EssenceEnhancement[] => {
  if (!isEssenceCraftedGearPlannerItem(item)) return []
  if (position === 'extra' && !hasGearPlannerEssenceExtraSlot(configuration)) return []
  return getAvailableEnhancementChoicesForItemCategories(
    data,
    [item.essenceCrafting.itemCategoryId],
    position,
    getGearPlannerEssenceCraftingLevel(data, configuration, curse)
  )
}

export const isGearPlannerEssenceAffixValid = (
  data: EssenceCraftingData,
  item: GearPlannerItem,
  configuration: GearPlannerEssenceCraftingConfiguration,
  curse: GearPlannerCurse | null | undefined,
  position: EssenceAffixPosition,
  enhancementId: string | null
): boolean => {
  if (enhancementId === null) return true
  if (!isEssenceCraftedGearPlannerItem(item)) return false
  if (position === 'extra' && !hasGearPlannerEssenceExtraSlot(configuration)) return false
  return isEnhancementEligibleForItemCategories(
    data,
    enhancementId,
    [item.essenceCrafting.itemCategoryId],
    position,
    getGearPlannerEssenceCraftingLevel(data, configuration, curse)
  )
}

export interface GearPlannerResolvedEssenceAffix {
  position: EssenceAffixPosition
  enhancement: EssenceEnhancement
  effects: readonly GearPlannerEffect[]
}

/** Resolves selected valid affixes only. Legacy-stale selections remain saved but grant no effects. */
export const resolveGearPlannerEssenceAffixes = (
  data: EssenceCraftingData,
  item: GearPlannerItem,
  configuration: GearPlannerEssenceCraftingConfiguration,
  curse: GearPlannerCurse | null | undefined
): readonly GearPlannerResolvedEssenceAffix[] => {
  if (!isEssenceCraftedGearPlannerItem(item)) return []
  const effectiveLevel = getGearPlannerEssenceCraftingLevel(data, configuration, curse)
  return (['prefix', 'suffix', 'extra'] as const).flatMap((position) => {
    const enhancementId = affixSelection(configuration, position)
    if (!isGearPlannerEssenceAffixValid(data, item, configuration, curse, position, enhancementId) || !enhancementId) {
      return []
    }
    const enhancement = data.indexes.enhancementById.get(enhancementId)
    if (!enhancement) return []
    const resolved = resolveEnhancementEffects(data, enhancementId, effectiveLevel)
    if (resolved.status !== 'resolved') return []
    return [
      {
        position,
        enhancement,
        effects: resolved.effects.map(({ effect, modifier, bonusType }) => ({
          name: effect.displayName,
          ...(formatResolvedEffectModifier(modifier) === undefined
            ? {}
            : { modifier: formatResolvedEffectModifier(modifier) }),
          ...(bonusType ? { bonus: bonusType.displayName } : {})
        }))
      }
    ]
  })
}
