import { EQUIPMENT_SLOTS } from './equipment.ts'
import type { EssenceAffixPosition, EssenceCraftingData, EssenceEnhancement } from './essenceCrafting.types.ts'

const approvedAffixPositions = new Set<EssenceAffixPosition>(['prefix', 'suffix', 'extra'])

const isApprovedAffixPosition = (position: string): position is EssenceAffixPosition =>
  approvedAffixPositions.has(position as EssenceAffixPosition)

const getEquipmentSlot = (equipmentSlotId: string) => EQUIPMENT_SLOTS.find(({ id }) => id === equipmentSlotId)

const isSupportedItemLevel = (data: EssenceCraftingData, minimumLevel: number): boolean =>
  Number.isInteger(minimumLevel) &&
  minimumLevel >= data.rules.supportedItemLevels.minimum &&
  minimumLevel <= data.rules.supportedItemLevels.maximum

/**
 * Returns the normalized-placement matches in generated-data source order.
 * This answers placement only; it intentionally does not apply item-level or
 * Mark of House Cannith rules.
 */
export const getPlacementEligibleEnhancements = (
  data: EssenceCraftingData,
  equipmentSlotId: string,
  position: string
): readonly EssenceEnhancement[] => {
  const equipmentSlot = getEquipmentSlot(equipmentSlotId)
  if (!equipmentSlot || !isApprovedAffixPosition(position)) return []

  const enhancementsByCategory = data.indexes.enhancementsByPlacement.get(position)
  if (!enhancementsByCategory) return []

  const matches = new Map<string, EssenceEnhancement>()
  for (const itemCategoryId of equipmentSlot.itemCategoryIds) {
    for (const enhancement of enhancementsByCategory.get(itemCategoryId) ?? []) matches.set(enhancement.id, enhancement)
  }
  return [...matches.values()]
}

export const isEnhancementPlacementEligible = (
  data: EssenceCraftingData,
  enhancementId: string,
  equipmentSlotId: string,
  position: string
): boolean => {
  const enhancement = data.indexes.enhancementById.get(enhancementId)
  const equipmentSlot = getEquipmentSlot(equipmentSlotId)
  if (!enhancement || !equipmentSlot || !isApprovedAffixPosition(position)) return false

  const placement = enhancement.placements.find((candidate) => candidate.position === position)
  const equipmentItemCategoryIds: readonly string[] = equipmentSlot.itemCategoryIds
  return placement?.itemCategoryIds.some((id) => equipmentItemCategoryIds.includes(id)) ?? false
}

export const isEnhancementAvailableAtMinimumLevel = (
  data: EssenceCraftingData,
  enhancementId: string,
  minimumLevel: number
): boolean => {
  const enhancement = data.indexes.enhancementById.get(enhancementId)
  return (
    enhancement !== undefined &&
    isSupportedItemLevel(data, minimumLevel) &&
    minimumLevel >= enhancement.minimumItemLevel
  )
}

/** A missing selection is valid because there is no stale enhancement to reject. */
export const isSelectedEnhancementStillValid = (
  data: EssenceCraftingData,
  selectedEnhancementId: string | null,
  equipmentSlotId: string,
  position: string,
  minimumLevel: number
): boolean =>
  selectedEnhancementId === null ||
  (isEnhancementPlacementEligible(data, selectedEnhancementId, equipmentSlotId, position) &&
    isEnhancementAvailableAtMinimumLevel(data, selectedEnhancementId, minimumLevel))

const compareEnhancementsForDisplay = (left: EssenceEnhancement, right: EssenceEnhancement): number =>
  left.displayName.localeCompare(right.displayName, undefined, { sensitivity: 'base' }) ||
  left.id.localeCompare(right.id)

/** Returns placement- and level-eligible choices in stable alphabetical display order. */
export const getAvailableEnhancementChoices = (
  data: EssenceCraftingData,
  equipmentSlotId: string,
  position: string,
  minimumLevel: number
): readonly EssenceEnhancement[] => {
  if (!isSupportedItemLevel(data, minimumLevel)) return []
  return getPlacementEligibleEnhancements(data, equipmentSlotId, position)
    .filter((enhancement) => minimumLevel >= enhancement.minimumItemLevel)
    .sort(compareEnhancementsForDisplay)
}

/**
 * The Mark grants permission to use the Extra position; it does not change
 * whether a particular enhancement has an Extra placement.
 */
export const hasCannithMarkExtraAffixPermission = (data: EssenceCraftingData, hasCannithMark: boolean): boolean =>
  data.rules.extraAffix.markRequirement.quantity > 0 && hasCannithMark
