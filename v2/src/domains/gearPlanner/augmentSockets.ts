import { enabledOwners, ownerSlots } from './character'
import type { GearPlannerSetup } from './setups'
import type { GearPlannerItem, GearPlannerAugment, GearPlannerAugmentSlot } from './gearPlanner.types'
import { isCompatibleGearPlannerAugment } from './augments'

export interface LoadoutSocket {
  item: GearPlannerItem
  index: number
  slot: GearPlannerAugmentSlot
  augment: GearPlannerAugment | null
}

export function loadoutSockets(
  setup: GearPlannerSetup,
  slots: Readonly<Record<string, readonly GearPlannerAugmentSlot[]>>
): LoadoutSocket[] {
  return enabledOwners(setup.character.classes).flatMap((owner) =>
    ownerSlots[owner].flatMap((position) => {
      const item = setup.equipment[position]
      if (!item) return []
      return (slots[item.id] ?? []).map((slot, index) => ({
        item,
        slot,
        index,
        augment: setup.slottedAugments[item.id]?.[index] ?? null
      }))
    })
  )
}

export function canExchangeAugments(from: LoadoutSocket, to: LoadoutSocket) {
  return (
    from.augment !== null &&
    from.augment !== to.augment &&
    (from.item.id !== to.item.id || from.index !== to.index) &&
    isCompatibleGearPlannerAugment(to.slot, from.augment) &&
    (!to.augment || isCompatibleGearPlannerAugment(from.slot, to.augment))
  )
}
