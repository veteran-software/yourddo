import type { AugmentEffectFilterMode } from './augmentRules.ts'
import type { EquipmentSlotId } from './equipment.ts'
import type { EssenceCraftingData } from './essenceCrafting.types.ts'

export type PlannedAugmentSlotId = `augment-slot:${string}`

export interface PlannedAugmentSlot {
  id: PlannedAugmentSlotId
  augmentSlotTypeId: string
  augmentId: string | null
  selectedEffectNames: string[]
  filterMode: AugmentEffectFilterMode
}

export interface PlannedItem {
  prefixEnhancementId: string | null
  suffixEnhancementId: string | null
  extraEnhancementId: string | null
  hasCannithMark: boolean
  minimumLevelOverride: number | null
  augmentSlots: PlannedAugmentSlot[]
}

export interface EssencePlanState {
  masterMinimumLevel: number
  activeSlotIds: EquipmentSlotId[]
  collapsedSlotIds: EquipmentSlotId[]
  itemsBySlotId: Partial<Record<EquipmentSlotId, PlannedItem>>
}

/**
 * Augment slot IDs are reproducible from the slot type and only need to be
 * unique inside their owning planned item. The equipment slot map supplies
 * the outer identity for persistence and permalinks.
 */
export const createPlannedAugmentSlotId = (augmentSlotTypeId: string): PlannedAugmentSlotId =>
  `augment-slot:${augmentSlotTypeId}`

export const createEmptyEssencePlan = (data: Pick<EssenceCraftingData, 'rules'>): EssencePlanState => ({
  masterMinimumLevel: data.rules.supportedItemLevels.minimum,
  activeSlotIds: [],
  collapsedSlotIds: [],
  itemsBySlotId: {}
})
