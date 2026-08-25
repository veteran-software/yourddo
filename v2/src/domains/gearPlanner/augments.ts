import { getCompatibleAugmentTypes, normaliseAugmentSlotType } from '../../shared/augments/compatibility.ts'
import type {
  GearPlannerAugment,
  GearPlannerAugmentSlot,
  GearPlannerItem,
  GearPlannerSetBonus
} from './gearPlanner.types.ts'
import type { GearPlannerEquipment, GearPlannerSlottedAugments } from './planner.ts'

const normaliseAugmentType = (value: string): string => normaliseAugmentSlotType(value).toLocaleLowerCase()

export const gearPlannerAugmentIdentity = (augment: GearPlannerAugment): string =>
  [augment.augmentType, augment.minLevel, augment.name, JSON.stringify(augment.source)]
    .map(String)
    .map(encodeURIComponent)
    .join('|')

export const isCompatibleGearPlannerAugment = (
  itemAugmentSlot: GearPlannerAugmentSlot,
  augment: GearPlannerAugment
): boolean => {
  const augmentType = normaliseAugmentType(augment.augmentType)
  if (augmentType === '') return false

  return getCompatibleAugmentTypes(itemAugmentSlot.augmentType).some(
    (compatibleType) => normaliseAugmentType(compatibleType) === augmentType
  )
}

export const getCompatibleGearPlannerAugments = (
  itemAugmentSlot: GearPlannerAugmentSlot,
  augments: readonly GearPlannerAugment[]
): readonly GearPlannerAugment[] =>
  augments
    .filter((augment) => isCompatibleGearPlannerAugment(itemAugmentSlot, augment))
    .toSorted(
      (left, right) =>
        left.name.localeCompare(right.name) ||
        left.minLevel - right.minLevel ||
        left.augmentType.localeCompare(right.augmentType) ||
        gearPlannerAugmentIdentity(left).localeCompare(gearPlannerAugmentIdentity(right))
    )

const equippedItems = (equipment: GearPlannerEquipment): readonly GearPlannerItem[] =>
  Object.values(equipment).filter((item): item is GearPlannerItem => item !== null)

export interface GearPlannerSelectedAugment {
  item: GearPlannerItem
  slotIndex: number
  augmentSlot: GearPlannerAugmentSlot
  augment: GearPlannerAugment
}

export const collectSelectedGearPlannerAugments = (
  equipment: GearPlannerEquipment,
  slottedAugments: GearPlannerSlottedAugments
): readonly GearPlannerSelectedAugment[] =>
  equippedItems(equipment).flatMap((item) =>
    Object.entries(slottedAugments[item.id] ?? {}).flatMap(([slotIndex, augment]) => {
      const index = Number(slotIndex)
      const augmentSlot = item.source.augments?.[index]
      return augment && augmentSlot ? [{ item, slotIndex: index, augmentSlot, augment }] : []
    })
  )

export interface GearPlannerAugmentSetMembership extends GearPlannerSelectedAugment {
  setBonus: GearPlannerSetBonus
}

export const collectSelectedAugmentSetMemberships = (
  equipment: GearPlannerEquipment,
  slottedAugments: GearPlannerSlottedAugments
): readonly GearPlannerAugmentSetMembership[] =>
  collectSelectedGearPlannerAugments(equipment, slottedAugments).flatMap((selection) =>
    (selection.augment.setBonus ?? []).map((setBonus) => ({ ...selection, setBonus }))
  )
