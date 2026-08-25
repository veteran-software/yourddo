import { collectSelectedAugmentSetMemberships } from './augments.ts'
import {
  type GearPlannerEffectSource,
  normalizeBonusType,
  normalizeEffectName,
  parseEffectModifier
} from './effects.ts'
import { collectSelectedGearPlannerFiligrees } from './filigrees.ts'
import type { GearPlannerEffect, GearPlannerFiligreeSetDefinition, GearPlannerItem } from './gearPlanner.types.ts'
import type { GearPlannerEquipment, GearPlannerSlottedAugments, GearPlannerSlottedFiligrees } from './planner.ts'
import {
  type GearPlannerStandardSetDefinition,
  standardGearPlannerSetDefinitionByName
} from './standardSetDefinitions.ts'

export type GearPlannerSetMembershipCategory = 'equipped-item' | 'augment' | 'filigree'

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
  filigreeName?: string
  filigreeSlotIndex?: number
}

export interface GearPlannerSetThresholdState {
  threshold: number
  effects: readonly GearPlannerEffect[]
  id: string
  isActive: boolean
}

export interface GearPlannerSetProgress {
  name: string
  count: number
  category: 'item' | 'filigree'
  memberships: readonly GearPlannerSetMembership[]
  definition?: GearPlannerStandardSetDefinition | GearPlannerFiligreeSetDefinition
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
  slottedAugments: GearPlannerSlottedAugments,
  slottedFiligrees: GearPlannerSlottedFiligrees = {}
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
  ),
  ...collectFiligreeSetMemberships(equipment, slottedFiligrees)
]

// Legacy counts distinct display names per grouping across all equipped hosts.
export const collectFiligreeSetMemberships = (
  equipment: GearPlannerEquipment,
  slottedFiligrees: GearPlannerSlottedFiligrees
): readonly GearPlannerSetMembership[] => {
  const membershipsBySetAndName = new Map<string, Map<string, GearPlannerSetMembership>>()
  for (const { item, slotIndex, filigree } of collectSelectedGearPlannerFiligrees(equipment, slottedFiligrees)) {
    for (const setName of (filigree.grouping ?? '')
      .split('/')
      .map((name) => name.trim())
      .filter(Boolean)) {
      const byName = membershipsBySetAndName.get(setName) ?? new Map<string, GearPlannerSetMembership>()
      membershipsBySetAndName.set(setName, byName)
      if (!byName.has(filigree.name)) {
        byName.set(filigree.name, {
          id: `${item.id}:filigree-set:${String(slotIndex)}:${encodeURIComponent(setName)}`,
          setName,
          category: 'filigree',
          itemId: item.id,
          itemName: item.source.name,
          slot: item.slot,
          filigreeName: filigree.name,
          filigreeSlotIndex: slotIndex
        })
      }
    }
  }
  return [...membershipsBySetAndName.values()].flatMap((byName) => [...byName.values()])
}

export const resolveGearPlannerSetState = (
  equipment: GearPlannerEquipment,
  slottedAugments: GearPlannerSlottedAugments,
  definitions: ReadonlyMap<string, GearPlannerStandardSetDefinition> = standardGearPlannerSetDefinitionByName,
  slottedFiligrees: GearPlannerSlottedFiligrees = {},
  filigreeDefinitions: ReadonlyMap<string, GearPlannerFiligreeSetDefinition> = new Map()
): GearPlannerSetState => {
  const memberships = collectGearPlannerSetMemberships(equipment, slottedAugments, slottedFiligrees)
  const membershipsBySet = new Map<string, GearPlannerSetMembership[]>()
  for (const membership of memberships) {
    const category = membership.category === 'filigree' ? 'filigree' : 'item'
    const key = `${category}\u0000${membership.setName}`
    const current = membershipsBySet.get(key) ?? []
    current.push(membership)
    membershipsBySet.set(key, current)
  }

  const sets = [...membershipsBySet.entries()]
    .map(([, setMemberships]) => {
      const name = setMemberships[0].setName
      const category: GearPlannerSetProgress['category'] =
        setMemberships[0].category === 'filigree' ? 'filigree' : 'item'
      const definition = category === 'filigree' ? filigreeDefinitions.get(name) : definitions.get(name)
      return {
        name,
        count: setMemberships.length,
        category,
        memberships: setMemberships,
        ...(definition === undefined ? {} : { definition }),
        thresholds:
          definition?.thresholds.map((threshold, index) => ({
            ...threshold,
            id: `${category}:${name}:${String(index)}`,
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
  setState.sets.flatMap((set) =>
    set.thresholds.flatMap(({ id, isActive, threshold, effects }) =>
      !isActive
        ? []
        : effects.map((effect, effectIndex) => ({
            id: `set:${id}:${String(effectIndex)}`,
            effect,
            category: 'set' as const,
            setName: set.name,
            setThreshold: threshold,
            setCategory: set.category,
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
