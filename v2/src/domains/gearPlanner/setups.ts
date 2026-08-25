import type { EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types.ts'
import { createGearPlannerEssenceCraftingConfiguration, isEssenceCraftedGearPlannerItem } from './essenceCrafting.ts'
import type { GearPlannerAugment, GearPlannerCurse, GearPlannerFiligree, GearPlannerItem } from './gearPlanner.types.ts'
import type { GearPlannerCharacterSlot } from './planner.ts'
import {
  createEmptyGearPlannerSelectionState,
  equipGearPlannerItemInSelection,
  type GearPlannerEssenceCraftingUpdate,
  type GearPlannerSelectionState,
  setGearPlannerEssenceCraftingConfiguration,
  setGearPlannerSlottedAugment,
  setGearPlannerSlottedCurse,
  setGearPlannerSlottedFiligree,
  setGearPlannerUnlockedFiligreeSlots
} from './planner.ts'

export const gearPlannerMinimumLevel = 1
export const gearPlannerMaximumLevel = 36

export interface GearPlannerSetup extends GearPlannerSelectionState {
  id: string
  name: string
  minimumLevel: number
  maximumLevel: number
}

export interface GearPlannerSetupsState {
  setups: readonly GearPlannerSetup[]
  activeSetupId: string
}

export const createGearPlannerSetup = (id: string, name: string): GearPlannerSetup => ({
  id,
  name,
  minimumLevel: gearPlannerMinimumLevel,
  maximumLevel: gearPlannerMaximumLevel,
  ...createEmptyGearPlannerSelectionState()
})

export const createDefaultGearPlannerState = (): GearPlannerSetupsState => ({
  setups: [createGearPlannerSetup('default', 'Default Setup')],
  activeSetupId: 'default'
})

export const createGearPlannerSetupId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `setup-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

const replaceSetup = (
  state: GearPlannerSetupsState,
  id: string,
  update: (setup: GearPlannerSetup) => GearPlannerSetup
): GearPlannerSetupsState => {
  const index = state.setups.findIndex((setup) => setup.id === id)
  if (index < 0) return state
  const previous = state.setups[index]
  const next = update(previous)
  if (next === previous) return state
  return { ...state, setups: state.setups.map((setup, current) => (current === index ? next : setup)) }
}

export const activeGearPlannerSetup = (state: GearPlannerSetupsState): GearPlannerSetup =>
  state.setups.find((setup) => setup.id === state.activeSetupId) ?? state.setups[0]

export const selectGearPlannerSetup = (state: GearPlannerSetupsState, id: string): GearPlannerSetupsState =>
  state.setups.some((setup) => setup.id === id) && id !== state.activeSetupId ? { ...state, activeSetupId: id } : state

export const addGearPlannerSetup = (
  state: GearPlannerSetupsState,
  id: string,
  name = `New Setup ${String(state.setups.length + 1)}`
): GearPlannerSetupsState => {
  if (!id.trim() || state.setups.some((setup) => setup.id === id)) return state
  const setup = createGearPlannerSetup(id, name)
  return { setups: [...state.setups, setup], activeSetupId: setup.id }
}

export const renameGearPlannerSetup = (
  state: GearPlannerSetupsState,
  id: string,
  name: string
): GearPlannerSetupsState => {
  const trimmed = name.trim()
  return trimmed ? replaceSetup(state, id, (setup) => ({ ...setup, name: trimmed })) : state
}

export const deleteGearPlannerSetup = (state: GearPlannerSetupsState, id: string): GearPlannerSetupsState => {
  if (state.setups.length <= 1 || !state.setups.some((setup) => setup.id === id)) return state
  const setups = state.setups.filter((setup) => setup.id !== id)
  return { setups, activeSetupId: state.activeSetupId === id ? setups[0].id : state.activeSetupId }
}

export const clearGearPlannerSetup = (state: GearPlannerSetupsState, id: string): GearPlannerSetupsState =>
  replaceSetup(state, id, (setup) => createGearPlannerSetup(setup.id, setup.name))

export const updateGearPlannerSetupLevels = (
  state: GearPlannerSetupsState,
  id: string,
  update: Partial<Pick<GearPlannerSetup, 'minimumLevel' | 'maximumLevel'>>
): GearPlannerSetupsState =>
  replaceSetup(state, id, (setup) => {
    let minimumLevel = Math.max(
      gearPlannerMinimumLevel,
      Math.min(gearPlannerMaximumLevel, update.minimumLevel ?? setup.minimumLevel)
    )
    let maximumLevel = Math.max(
      gearPlannerMinimumLevel,
      Math.min(gearPlannerMaximumLevel, update.maximumLevel ?? setup.maximumLevel)
    )
    if (minimumLevel > maximumLevel) {
      if (update.minimumLevel !== undefined && update.maximumLevel === undefined) maximumLevel = minimumLevel
      else minimumLevel = maximumLevel
    }
    return minimumLevel === setup.minimumLevel && maximumLevel === setup.maximumLevel
      ? setup
      : { ...setup, minimumLevel, maximumLevel }
  })

export const equipGearPlannerSetupItem = (
  state: GearPlannerSetupsState,
  slot: GearPlannerCharacterSlot,
  item: GearPlannerItem | null,
  essenceData?: EssenceCraftingData
): GearPlannerSetupsState =>
  replaceSetup(state, state.activeSetupId, (setup) => {
    const selection = equipGearPlannerItemInSelection(setup, slot, item)
    if (selection === setup) return setup
    const next = { ...setup, ...selection }
    return item && essenceData && isEssenceCraftedGearPlannerItem(item) && setup.equipment[slot]?.id !== item.id
      ? {
          ...next,
          essenceCrafting: {
            ...next.essenceCrafting,
            [item.id]: createGearPlannerEssenceCraftingConfiguration(essenceData, setup.minimumLevel)
          }
        }
      : next
  })

export const setGearPlannerSetupAugment = (
  state: GearPlannerSetupsState,
  itemId: string,
  slotIndex: number,
  augment: GearPlannerAugment | null
): GearPlannerSetupsState =>
  replaceSetup(state, state.activeSetupId, (setup) => {
    const selection = setGearPlannerSlottedAugment(setup, itemId, slotIndex, augment)
    return selection === setup ? setup : { ...setup, ...selection }
  })

export const setGearPlannerSetupFiligree = (
  state: GearPlannerSetupsState,
  itemId: string,
  slotIndex: number,
  filigree: GearPlannerFiligree | null
): GearPlannerSetupsState =>
  replaceSetup(state, state.activeSetupId, (setup) => {
    const selection = setGearPlannerSlottedFiligree(setup, itemId, slotIndex, filigree)
    return selection === setup ? setup : { ...setup, ...selection }
  })

export const setGearPlannerSetupCurse = (
  state: GearPlannerSetupsState,
  itemId: string,
  curseId: string | null,
  curses: readonly GearPlannerCurse[]
): GearPlannerSetupsState =>
  replaceSetup(state, state.activeSetupId, (setup) => {
    const selection = setGearPlannerSlottedCurse(setup, itemId, curseId, curses)
    return selection === setup ? setup : { ...setup, ...selection }
  })

export const setGearPlannerSetupUnlockedFiligreeSlots = (
  state: GearPlannerSetupsState,
  itemId: string,
  count: number
): GearPlannerSetupsState =>
  replaceSetup(state, state.activeSetupId, (setup) => {
    const selection = setGearPlannerUnlockedFiligreeSlots(setup, itemId, count)
    return selection === setup ? setup : { ...setup, ...selection }
  })

export const setGearPlannerSetupEssenceCraftingConfiguration = (
  state: GearPlannerSetupsState,
  itemId: string,
  update: GearPlannerEssenceCraftingUpdate,
  data: EssenceCraftingData
): GearPlannerSetupsState =>
  replaceSetup(state, state.activeSetupId, (setup) => {
    const selection = setGearPlannerEssenceCraftingConfiguration(setup, itemId, update, data)
    return selection === setup ? setup : { ...setup, ...selection }
  })
