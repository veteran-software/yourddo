import { EQUIPMENT_SLOTS } from './equipment'
import type { EssenceCraftingData } from './essenceCrafting.types'
import type { EssencePlanState } from './plannerState'
import { describeEquipmentBlockers, type EssencePlanAction } from './plannerTransitions'

export function describePlanEdit(
  action: EssencePlanAction,
  data: EssenceCraftingData,
  plan: EssencePlanState
): string | undefined {
  const slotId = 'equipmentSlotId' in action ? action.equipmentSlotId : undefined
  const slot = EQUIPMENT_SLOTS.find(({ id }) => id === slotId)?.label ?? 'item'
  switch (action.type) {
    case 'activate-equipment-slot':
      return `Added ${slot} to the plan`
    case 'deactivate-equipment-slot':
      return `Removed ${slot} from the plan`
    case 'set-two-handed':
      return action.enabled ? 'Set Main Hand to two-handed' : 'Set Main Hand to one-handed'
    case 'resolve-equipment-conflict':
      return `Unequipped ${describeEquipmentBlockers(plan, action.blockers)} · ${describePlanEdit(action.change, data, plan) ?? 'Updated equipment'}`
    case 'set-master-minimum-level':
      return `Changed Master ML to ${action.minimumLevel.toString()}`
    case 'set-item-minimum-level-override':
      return action.minimumLevel === null
        ? `Restored Master ML for ${slot}`
        : `Changed ${slot} ML to ${action.minimumLevel.toString()}`
    case 'apply-shard':
    case 'select-prefix-enhancement':
    case 'select-suffix-enhancement':
    case 'select-extra-enhancement': {
      const position = 'position' in action ? action.position : (action.type.split('-')[1] ?? 'affix')
      if (action.enhancementId === null) return `Cleared ${slot} ${position}`
      const shard = data.indexes.enhancementById.get(action.enhancementId)?.displayName ?? 'a shard'
      return `Applied ${shard} to ${slot} ${position}`
    }
    case 'set-cannith-mark':
      return action.enabled ? `Added Mark of House Cannith to ${slot}` : `Removed Mark of House Cannith from ${slot}`
    case 'add-augment-slot':
    case 'change-augment-slot-type': {
      const color =
        data.rules.augmentSlotTypes.find(({ id }) => id === action.augmentSlotTypeId)?.displayName ?? 'augment'
      if (action.type === 'add-augment-slot') return `Added a ${color} socket to ${slot}`
      return `Changed a socket on ${slot} to ${color}`
    }
    case 'remove-augment-slot':
      return `Removed an augment socket from ${slot}`
    case 'select-augment': {
      const augment = data.indexes.augmentById.get(action.augmentId)?.displayName ?? 'an augment'
      return `Slotted ${augment} on ${slot}`
    }
    case 'clear-augment':
      return `Removed an augment from ${slot}`
    case 'reset-planned-item':
      return `Reset ${slot} selections`
    default:
      return undefined
  }
}
