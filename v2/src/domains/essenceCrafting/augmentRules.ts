import { getColorAugmentType, getCompatibleAugmentTypes } from '../../shared/augments/compatibility.ts'
import { EQUIPMENT_SLOTS } from './equipment.ts'
import type {
  EssenceAugment,
  EssenceAugmentSlotType,
  EssenceCraftingData,
  EssenceEffect
} from './essenceCrafting.types.ts'

export type AugmentEffectFilterMode = 'or' | 'and'

/**
 * These are Essence Crafting's legacy socket floors, rather than a shared
 * augment-compatibility rule. The effective requirement also honors the
 * generated dataset's supported minimum item level.
 */
const minimumItemLevelByColor = {
  Colorless: 1,
  Red: 2,
  Blue: 2,
  Yellow: 3,
  Green: 5,
  Purple: 8,
  Orange: 8
} as const

const getEquipmentSlot = (equipmentSlotId: string) => EQUIPMENT_SLOTS.find(({ id }) => id === equipmentSlotId)

const getAugmentSlotType = (data: EssenceCraftingData, augmentSlotTypeId: string) =>
  data.rules.augmentSlotTypes.find(({ id }) => id === augmentSlotTypeId)

const getAugmentSlotIdentity = (augmentSlotType: EssenceAugmentSlotType): string =>
  getColorAugmentType(augmentSlotType.displayName) ?? augmentSlotType.id

const compareByDisplayNameAndId = (
  left: { displayName: string; id: string },
  right: { displayName: string; id: string }
) =>
  left.displayName.localeCompare(right.displayName, undefined, { sensitivity: 'base' }) ||
  left.id.localeCompare(right.id)

const getCompatibleAugmentTypeIds = (
  data: EssenceCraftingData,
  augmentSlotType: EssenceAugmentSlotType
): ReadonlySet<string> => {
  const compatibleColorNames = new Set(getCompatibleAugmentTypes(augmentSlotType.displayName))
  const isColorSlot = getColorAugmentType(augmentSlotType.displayName) !== undefined

  return new Set(
    data.augmentTypes
      .filter(
        (augmentType) =>
          augmentSlotType.acceptsAugmentTypeIds.includes(augmentType.id) &&
          (!isColorSlot || compatibleColorNames.has(augmentType.displayName))
      )
      .map(({ id }) => id)
  )
}

/**
 * Returns the published slot types that can be added to an equipment slot,
 * excluding colors/types already present on that planned item.
 */
export const getAvailableAugmentSlotTypes = (
  data: EssenceCraftingData,
  equipmentSlotId: string,
  alreadyAddedAugmentSlotTypeIds: readonly string[] = []
): readonly EssenceAugmentSlotType[] => {
  const equipmentSlot = getEquipmentSlot(equipmentSlotId)
  if (!equipmentSlot) return []

  const alreadyAddedIdentities = new Set(
    alreadyAddedAugmentSlotTypeIds
      .map((augmentSlotTypeId) => getAugmentSlotType(data, augmentSlotTypeId))
      .filter((augmentSlotType): augmentSlotType is EssenceAugmentSlotType => augmentSlotType !== undefined)
      .map(getAugmentSlotIdentity)
  )
  const availableIds = new Set<string>()

  for (const itemCategoryId of equipmentSlot.itemCategoryIds) {
    const placement = data.rules.augmentSlotPlacements.find((candidate) => candidate.itemCategoryId === itemCategoryId)
    for (const augmentSlotTypeId of placement?.augmentSlotTypeIds ?? []) {
      const augmentSlotType = getAugmentSlotType(data, augmentSlotTypeId)
      if (augmentSlotType && !alreadyAddedIdentities.has(getAugmentSlotIdentity(augmentSlotType))) {
        availableIds.add(augmentSlotTypeId)
      }
    }
  }

  return data.rules.augmentSlotTypes.filter(({ id }) => availableIds.has(id))
}

/** Returns whether a slot type is category-eligible and not already present. */
export const isAugmentSlotTypeAvailable = (
  data: EssenceCraftingData,
  equipmentSlotId: string,
  augmentSlotTypeId: string,
  alreadyAddedAugmentSlotTypeIds: readonly string[] = []
): boolean =>
  getAvailableAugmentSlotTypes(data, equipmentSlotId, alreadyAddedAugmentSlotTypeIds).some(
    ({ id }) => id === augmentSlotTypeId
  )

/**
 * Returns the minimum item level required to add a known slot type. Unknown
 * slot types have no requirement because they cannot be added to a plan.
 */
export const getAugmentSlotMinimumItemLevel = (
  data: EssenceCraftingData,
  augmentSlotTypeId: string
): number | undefined => {
  const augmentSlotType = getAugmentSlotType(data, augmentSlotTypeId)
  if (!augmentSlotType) return undefined

  const color = getColorAugmentType(augmentSlotType.displayName)
  const colorFloor = color ? minimumItemLevelByColor[color] : data.rules.supportedItemLevels.minimum
  return Math.max(data.rules.supportedItemLevels.minimum, colorFloor)
}

/**
 * Returns compatible published augments in stable alphabetical display order.
 * This is compatibility only; item-level eligibility is checked separately.
 */
export const getCompatibleAugments = (
  data: EssenceCraftingData,
  augmentSlotTypeId: string
): readonly EssenceAugment[] => {
  const augmentSlotType = getAugmentSlotType(data, augmentSlotTypeId)
  if (!augmentSlotType) return []

  const compatibleAugmentTypeIds = getCompatibleAugmentTypeIds(data, augmentSlotType)
  return data.augments
    .filter(({ augmentTypeId }) => compatibleAugmentTypeIds.has(augmentTypeId))
    .sort(compareByDisplayNameAndId)
}

const getCompatibleAugmentEffects = (data: EssenceCraftingData, augmentSlotTypeId: string): readonly EssenceEffect[] =>
  getCompatibleAugments(data, augmentSlotTypeId).flatMap(({ effects }) => effects)

/** Returns unique compatible effect names in stable alphabetical display order. */
export const getAvailableAugmentEffectNames = (
  data: EssenceCraftingData,
  augmentSlotTypeId: string
): readonly string[] =>
  [...new Set(getCompatibleAugmentEffects(data, augmentSlotTypeId).map(({ displayName }) => displayName))].sort(
    (left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' })
  )

/** Keeps a compatible augment when it has at least one selected effect name. */
export const filterCompatibleAugmentsByAnyEffect = (
  data: EssenceCraftingData,
  augmentSlotTypeId: string,
  selectedEffectNames: readonly string[]
): readonly EssenceAugment[] => {
  if (selectedEffectNames.length === 0) return getCompatibleAugments(data, augmentSlotTypeId)
  const selected = new Set(selectedEffectNames)
  return getCompatibleAugments(data, augmentSlotTypeId).filter((augment) =>
    augment.effects.some(({ displayName }) => selected.has(displayName))
  )
}

/** Keeps a compatible augment only when it has every selected effect name. */
export const filterCompatibleAugmentsByAllEffects = (
  data: EssenceCraftingData,
  augmentSlotTypeId: string,
  selectedEffectNames: readonly string[]
): readonly EssenceAugment[] => {
  if (selectedEffectNames.length === 0) return getCompatibleAugments(data, augmentSlotTypeId)
  const selected = new Set(selectedEffectNames)
  return getCompatibleAugments(data, augmentSlotTypeId).filter((augment) => {
    const names = new Set(augment.effects.map(({ displayName }) => displayName))
    return [...selected].every((effectName) => names.has(effectName))
  })
}

export const filterCompatibleAugmentsByEffects = (
  data: EssenceCraftingData,
  augmentSlotTypeId: string,
  selectedEffectNames: readonly string[],
  mode: AugmentEffectFilterMode
): readonly EssenceAugment[] =>
  mode === 'or'
    ? filterCompatibleAugmentsByAnyEffect(data, augmentSlotTypeId, selectedEffectNames)
    : filterCompatibleAugmentsByAllEffects(data, augmentSlotTypeId, selectedEffectNames)

const isSupportedItemLevel = (data: EssenceCraftingData, minimumItemLevel: number): boolean =>
  Number.isInteger(minimumItemLevel) &&
  minimumItemLevel >= data.rules.supportedItemLevels.minimum &&
  minimumItemLevel <= data.rules.supportedItemLevels.maximum

/**
 * A missing selection is valid. A selected augment must still be compatible
 * with a category-eligible slot and meet both its own and the slot's floor.
 */
export const isSelectedAugmentStillValid = (
  data: EssenceCraftingData,
  selectedAugmentId: string | null,
  equipmentSlotId: string,
  augmentSlotTypeId: string,
  itemMinimumLevel: number
): boolean => {
  if (selectedAugmentId === null) return true
  if (!isSupportedItemLevel(data, itemMinimumLevel)) return false
  if (!isAugmentSlotTypeAvailable(data, equipmentSlotId, augmentSlotTypeId)) return false

  const augment = data.indexes.augmentById.get(selectedAugmentId)
  const slotMinimumItemLevel = getAugmentSlotMinimumItemLevel(data, augmentSlotTypeId)
  return (
    augment !== undefined &&
    slotMinimumItemLevel !== undefined &&
    itemMinimumLevel >= slotMinimumItemLevel &&
    itemMinimumLevel >= augment.minimumItemLevel &&
    getCompatibleAugments(data, augmentSlotTypeId).some(({ id }) => id === selectedAugmentId)
  )
}
