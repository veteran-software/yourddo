import { collectSelectedAugmentSetMemberships } from './augments.ts'
import {
  type GearPlannerEffectSource,
  normalizeBonusType,
  normalizeEffectName,
  parseEffectModifier
} from './effects.ts'
import type { GearPlannerEffect, GearPlannerItem } from './gearPlanner.types.ts'
import type { GearPlannerEquipment, GearPlannerSlottedAugments } from './planner.ts'
import {
  type GearPlannerStandardSetDefinition,
  type GearPlannerStandardSetThreshold,
  standardGearPlannerSetDefinitionByName
} from './standardSetDefinitions.ts'

export type GearPlannerSetMembershipCategory = 'equipped-item' | 'augment'

export interface GearPlannerSetMembership {
  id: string
  setName: string
  category: GearPlannerSetMembershipCategory
  itemId: string
  itemName: string
  slot: string
  augmentName?: string
  augmentSlotIndex?: number
  augmentSlotName?: string
}

export interface GearPlannerSetThresholdState extends GearPlannerStandardSetThreshold {
  id: string
  isActive: boolean
}

export interface GearPlannerSetProgress {
  name: string
  count: number
  memberships: readonly GearPlannerSetMembership[]
  definition?: GearPlannerStandardSetDefinition
  thresholds: readonly GearPlannerSetThresholdState[]
}

export interface GearPlannerSetState {
  memberships: readonly GearPlannerSetMembership[]
  sets: readonly GearPlannerSetProgress[]
  unresolvedDefinitionNames: readonly string[]
}

const equippedItems = (equipment: GearPlannerEquipment): readonly GearPlannerItem[] =>
  Object.values(equipment).filter((item): item is GearPlannerItem => item !== null)

export const collectEquippedItemSetMemberships = (
  equipment: GearPlannerEquipment
): readonly GearPlannerSetMembership[] =>
  equippedItems(equipment).flatMap((item) =>
    (item.source.setBonus ?? []).map(({ name }, setIndex) => ({
      id: `${item.id}:equipped-item-set:${String(setIndex)}`,
      setName: name,
      category: 'equipped-item' as const,
      itemId: item.id,
      itemName: item.source.name,
      slot: item.slot
    }))
  )

export const collectGearPlannerSetMemberships = (
  equipment: GearPlannerEquipment,
  slottedAugments: GearPlannerSlottedAugments
): readonly GearPlannerSetMembership[] => [
  ...collectEquippedItemSetMemberships(equipment),
  ...collectSelectedAugmentSetMemberships(equipment, slottedAugments).map(
    ({ item, slotIndex, augmentSlot, augment, setBonus }, membershipIndex) => ({
      id: `${item.id}:augment-set:${String(slotIndex)}:${String(membershipIndex)}`,
      setName: setBonus.name,
      category: 'augment' as const,
      itemId: item.id,
      itemName: item.source.name,
      slot: item.slot,
      augmentName: augment.name,
      augmentSlotIndex: slotIndex,
      augmentSlotName: augmentSlot.name
    })
  )
]

export const resolveGearPlannerSetState = (
  equipment: GearPlannerEquipment,
  slottedAugments: GearPlannerSlottedAugments,
  definitions: ReadonlyMap<string, GearPlannerStandardSetDefinition> = standardGearPlannerSetDefinitionByName
): GearPlannerSetState => {
  const memberships = collectGearPlannerSetMemberships(equipment, slottedAugments)
  const membershipsBySet = new Map<string, GearPlannerSetMembership[]>()
  for (const membership of memberships) {
    const current = membershipsBySet.get(membership.setName) ?? []
    current.push(membership)
    membershipsBySet.set(membership.setName, current)
  }

  const sets = [...membershipsBySet.entries()]
    .map(([name, setMemberships]) => {
      const definition = definitions.get(name)
      return {
        name,
        count: setMemberships.length,
        memberships: setMemberships,
        ...(definition === undefined ? {} : { definition }),
        thresholds:
          definition?.thresholds.map((threshold, index) => ({
            ...threshold,
            id: `${name}:${String(index)}`,
            isActive: threshold.threshold <= setMemberships.length
          })) ?? []
      }
    })
    .toSorted((left, right) => left.name.localeCompare(right.name))

  return {
    memberships,
    sets,
    unresolvedDefinitionNames: sets.filter(({ definition }) => definition === undefined).map(({ name }) => name)
  }
}

export const collectActiveSetEffectSources = (setState: GearPlannerSetState): readonly GearPlannerEffectSource[] =>
  setState.sets.flatMap(({ name: setName, thresholds }) =>
    thresholds.flatMap(({ id, isActive, threshold, effects }) =>
      !isActive
        ? []
        : effects.map((effect, effectIndex) => ({
            id: `set:${id}:${String(effectIndex)}`,
            effect,
            category: 'set' as const,
            setName,
            setThreshold: threshold,
            normalizedName: normalizeEffectName(effect.name),
            normalizedBonusType: normalizeBonusType(effect.bonus),
            comparisonValue: parseEffectModifier(effect.modifier)
          }))
    )
  )

export const formatGearPlannerSetEffect = (effect: GearPlannerEffect): string => {
  const modifier = effect.modifier == null ? '' : ` ${String(effect.modifier)}`
  const bonus = effect.bonus == null || effect.bonus === '' ? '' : ` (${String(effect.bonus)})`
  return `${effect.name}${modifier}${bonus}`
}
