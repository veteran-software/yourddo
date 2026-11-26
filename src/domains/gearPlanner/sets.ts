import { collectSelectedAugmentSetMemberships } from './augments.ts'
import { type GearPlannerEffectSource, normalizeBonusType, normalizeEffectName, effectAmount } from './effects.ts'
import { collectSelectedGearPlannerFiligrees, filigreeSetNames } from './filigrees.ts'
import type {
  GearPlannerAugmentSlot,
  GearPlannerEffect,
  GearPlannerFiligreeSetDefinition,
  GearPlannerItem
} from './gearPlanner.types.ts'
import type { GearPlannerEquipment, GearPlannerSlottedAugments, GearPlannerSlottedFiligrees } from './planner.ts'
import type { GearPlannerStandardSetDefinition, GearPlannerStandardSetThreshold } from './standardSetDefinitions.ts'

export type GearPlannerSetMembershipCategory = 'equipped-item' | 'augment' | 'filigree'

export interface GearPlannerSetMembership {
  id: string
  setName: string
  setId?: number
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

export interface GearPlannerSetThresholdState extends GearPlannerStandardSetThreshold {
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

function baseSetMemberships(item: GearPlannerItem, overrides: ReadonlyMap<string, boolean>) {
  if (item.source.name.includes('Gem of Many Facets') || overrides.get(item.id)) return []
  return (item.source.setBonus ?? []).slice(overrides.has(item.id) ? 1 : 0)
}

export const collectEquippedItemSetMemberships = (
  equipment: GearPlannerEquipment,
  overrides: ReadonlyMap<string, boolean> = new Map()
): readonly GearPlannerSetMembership[] =>
  equippedItems(equipment).flatMap((item) =>
    [
      ...baseSetMemberships(item, overrides),
      ...(item.crafts ?? []).flatMap((craft) => (craft.setName ? [{ name: craft.setName, id: undefined }] : []))
    ].map(({ name, id: setId }, setIndex) => ({
      id: `${item.id}:equipped-item-set:${String(setIndex)}`,
      setName: name,
      ...(setId !== undefined && { setId }),
      category: 'equipped-item' as const,
      itemId: item.id,
      itemName: item.source.name,
      slot: item.slot
    }))
  )

export const collectGearPlannerSetMemberships = (
  equipment: GearPlannerEquipment,
  slottedAugments: GearPlannerSlottedAugments,
  slottedFiligrees: GearPlannerSlottedFiligrees = {},
  augmentSlotsByItem: Readonly<Record<string, readonly GearPlannerAugmentSlot[]>> = {}
): readonly GearPlannerSetMembership[] => {
  const memberships = collectSelectedAugmentSetMemberships(equipment, slottedAugments, augmentSlotsByItem)
  const overrides = new Map(
    memberships.flatMap(({ item, augment }) =>
      augment.clearSecondarySet === undefined ? [] : [[item.id, augment.clearSecondarySet] as const]
    )
  )
  return [
    ...collectEquippedItemSetMemberships(equipment, overrides),
    ...memberships.map(({ item, slotIndex, augmentSlot, augment, setBonus }, membershipIndex) => ({
      id: `${item.id}:augment-set:${String(slotIndex)}:${String(membershipIndex)}`,
      setName: setBonus.name,
      ...(setBonus.id !== undefined && { setId: setBonus.id }),
      category: 'augment' as const,
      itemId: item.id,
      itemName: item.source.name,
      slot: item.slot,
      augmentName: augment.name,
      augmentSlotIndex: slotIndex,
      augmentSlotName: augmentSlot.name
    })),
    ...collectFiligreeSetMemberships(equipment, slottedFiligrees)
  ]
}

export const collectFiligreeSetMemberships = (
  equipment: GearPlannerEquipment,
  slottedFiligrees: GearPlannerSlottedFiligrees
): readonly GearPlannerSetMembership[] =>
  collectSelectedGearPlannerFiligrees(equipment, slottedFiligrees).flatMap(({ item, slotIndex, filigree }) =>
    filigreeSetNames(filigree).map((setName) => ({
      id: `${item.id}:filigree-set:${String(slotIndex)}:${encodeURIComponent(setName)}`,
      setName,
      category: 'filigree' as const,
      itemId: item.id,
      itemName: item.source.name,
      slot: item.slot,
      filigreeName: filigree.name,
      filigreeSlotIndex: slotIndex
    }))
  )

export const resolveGearPlannerSetState = (
  equipment: GearPlannerEquipment,
  slottedAugments: GearPlannerSlottedAugments,
  definitions: ReadonlyMap<string | number, GearPlannerStandardSetDefinition> = new Map(),
  slottedFiligrees: GearPlannerSlottedFiligrees = {},
  filigreeDefinitions: ReadonlyMap<string, GearPlannerFiligreeSetDefinition> = new Map(),
  augmentSlotsByItem: Readonly<Record<string, readonly GearPlannerAugmentSlot[]>> = {}
): GearPlannerSetState => {
  const memberships = collectGearPlannerSetMemberships(equipment, slottedAugments, slottedFiligrees, augmentSlotsByItem)
  const setKey = ({ setId, setName }: GearPlannerSetMembership) =>
    setId !== undefined && definitions.has(setId) ? setId : setName
  const membershipsBySet = new Map<string, GearPlannerSetMembership[]>()
  for (const membership of memberships) {
    const category = membership.category === 'filigree' ? 'filigree' : 'item'
    const key = `${category}\u0000${String(setKey(membership))}`
    const current = membershipsBySet.get(key) ?? []
    current.push(membership)
    membershipsBySet.set(key, current)
  }

  const sets = [...membershipsBySet.entries()]
    .map(([, setMemberships]) => {
      const name = setMemberships[0].setName
      const category: GearPlannerSetProgress['category'] =
        setMemberships[0].category === 'filigree' ? 'filigree' : 'item'
      const key = setKey(setMemberships[0])
      const definition = category === 'filigree' ? filigreeDefinitions.get(name) : definitions.get(key)
      const count = setMemberships.length
      const highest =
        definition?.thresholdMode === 'highestOnly'
          ? Math.max(
              0,
              ...definition.thresholds.flatMap(({ requirement, threshold }) =>
                !requirement && threshold <= count ? [threshold] : []
              )
            )
          : undefined
      return {
        name,
        count,
        category,
        memberships: setMemberships,
        ...(definition === undefined ? {} : { definition }),
        thresholds:
          definition?.thresholds.map((threshold, index) => ({
            ...threshold,
            id: `${category}:${String(key)}:${String(index)}`,
            isActive:
              !threshold.requirement &&
              threshold.threshold <= count &&
              (highest === undefined || threshold.threshold === highest)
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
            comparisonValue: effectAmount(effect)
          }))
    )
  )

export const formatGearPlannerSetEffect = (effect: GearPlannerEffect): string => {
  const modifier = effect.modifier == null ? '' : ` ${String(effect.modifier)}`
  const bonus = effect.bonus == null || effect.bonus === '' ? '' : ` (${String(effect.bonus)})`
  return `${effect.name}${modifier}${bonus}`
}
