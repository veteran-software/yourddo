import { EQUIPMENT_SLOTS } from './equipment.ts'
import type {
  EssenceAffixPosition,
  EssenceCraftingData,
  EssenceEnhancement,
  EssencePlacement
} from './essenceCrafting.types.ts'

const approvedAffixPositions = new Set<EssenceAffixPosition>(['prefix', 'suffix', 'extra'])

const isApprovedAffixPosition = (position: string): position is EssenceAffixPosition =>
  approvedAffixPositions.has(position as EssenceAffixPosition)

const getEquipmentSlot = (equipmentSlotId: string) => EQUIPMENT_SLOTS.find(({ id }) => id === equipmentSlotId)

export function placementMinimumLevel(
  enhancement: EssenceEnhancement,
  categoryIds: readonly string[],
  position: string,
  placements: readonly EssencePlacement[] = enhancement.placements
): number {
  return Math.min(
    ...placements
      .filter((entry) => entry.position === position)
      .flatMap((entry) =>
        entry.itemCategoryIds
          .filter((id) => categoryIds.includes(id))
          .map((id) => Math.max(enhancement.minimumItemLevel, entry.minimumItemLevels?.[id] ?? 0))
      )
  )
}

export function restoredShardLevel(
  data: EssenceCraftingData,
  categoryIds: readonly string[],
  itemLevel: number,
  selections: readonly (readonly [EssenceAffixPosition, string | null])[]
): number {
  let level = itemLevel
  for (const [position, id] of selections) {
    if (!id) continue
    const previous = data.previousEnhancementById?.get(id)
    const current = data.indexes.enhancementById.get(id)
    if (!previous || !current || placementMinimumLevel(previous, categoryIds, position) > itemLevel) continue
    const floor = placementMinimumLevel(current, categoryIds, position)
    if (floor <= data.rules.supportedItemLevels.maximum) level = Math.max(level, floor)
  }
  return level
}

export const isSupportedEssenceItemLevel = (data: EssenceCraftingData, minimumLevel: number): boolean =>
  Number.isInteger(minimumLevel) &&
  minimumLevel >= data.rules.supportedItemLevels.minimum &&
  minimumLevel <= data.rules.supportedItemLevels.maximum

const compareEnhancementsForDisplay = (left: EssenceEnhancement, right: EssenceEnhancement): number =>
  left.displayName.localeCompare(right.displayName, undefined, { sensitivity: 'base' }) ||
  left.id.localeCompare(right.id)

/** Returns placement- and level-eligible choices for normalized item categories. */
export const getAvailableEnhancementChoicesForItemCategories = (
  data: EssenceCraftingData,
  itemCategoryIds: readonly string[],
  position: string,
  minimumLevel: number
): readonly EssenceEnhancement[] => {
  if (!isSupportedEssenceItemLevel(data, minimumLevel) || !isApprovedAffixPosition(position)) return []
  const enhancementsByCategory = data.indexes.enhancementsByPlacement.get(position)
  if (!enhancementsByCategory) return []

  const matches = new Map<string, EssenceEnhancement>()
  for (const itemCategoryId of itemCategoryIds) {
    for (const enhancement of enhancementsByCategory.get(itemCategoryId) ?? []) {
      if (minimumLevel >= placementMinimumLevel(enhancement, [itemCategoryId], position))
        matches.set(enhancement.id, enhancement)
    }
  }
  return [...matches.values()].sort(compareEnhancementsForDisplay)
}

/** Checks normalized category placement and minimum-level eligibility together. */
export const isEnhancementEligibleForItemCategories = (
  data: EssenceCraftingData,
  enhancementId: string,
  itemCategoryIds: readonly string[],
  position: string,
  minimumLevel: number
): boolean =>
  isSupportedEssenceItemLevel(data, minimumLevel) &&
  isApprovedAffixPosition(position) &&
  getAvailableEnhancementChoicesForItemCategories(data, itemCategoryIds, position, minimumLevel).some(
    ({ id }) => id === enhancementId
  )

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
    isSupportedEssenceItemLevel(data, minimumLevel) &&
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
): boolean => {
  if (selectedEnhancementId === null) return true
  const enhancement = data.indexes.enhancementById.get(selectedEnhancementId)
  const equipment = getEquipmentSlot(equipmentSlotId)
  return (
    !!enhancement &&
    !!equipment &&
    isSupportedEssenceItemLevel(data, minimumLevel) &&
    minimumLevel >= placementMinimumLevel(enhancement, equipment.itemCategoryIds, position)
  )
}

/** Returns placement- and level-eligible choices in stable alphabetical display order. */
export const getAvailableEnhancementChoices = (
  data: EssenceCraftingData,
  equipmentSlotId: string,
  position: string,
  minimumLevel: number
): readonly EssenceEnhancement[] => {
  const equipmentSlot = getEquipmentSlot(equipmentSlotId)
  return equipmentSlot
    ? getAvailableEnhancementChoicesForItemCategories(data, equipmentSlot.itemCategoryIds, position, minimumLevel)
    : []
}

/**
 * The Mark grants permission to use the Extra position; it does not change
 * whether a particular enhancement has an Extra placement.
 */
export const hasCannithMarkExtraAffixPermission = (data: EssenceCraftingData, hasCannithMark: boolean): boolean =>
  data.rules.extraAffix.markRequirement.quantity > 0 && hasCannithMark
