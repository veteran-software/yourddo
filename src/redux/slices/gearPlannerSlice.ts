import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { isMinorArtifact } from '../../pages/gearPlanner/helpers'
import type {
  Curse,
  GearAugment,
  GearItem,
  GearSetup,
  LootItem
} from '../../pages/gearPlanner/types'
import {
  ARTIFICER_PET_SLOTS,
  DRUID_PET_SLOTS,
  GearSlot
} from '../../pages/gearPlanner/types'

interface PetState {
  slots: Record<string, GearItem | null>
  slottedAugments: Record<string, Record<number, GearAugment | null>>
  slottedCurses: Record<string, Curse | null>
  slottedFiligrees: Record<string, (LootItem | null)[]>
  unlockedFiligreeSlots: Record<string, number>
}

interface GearPlannerState {
  characterSetups: GearSetup[]
  activeSetupId: string
  artificerPet: PetState
  druidPet: PetState
}

const initialPetState = (): PetState => ({
  slots: {},
  slottedAugments: {},
  slottedCurses: {},
  slottedFiligrees: {},
  unlockedFiligreeSlots: {}
})

const initialState: GearPlannerState = {
  characterSetups: [
    {
      id: 'default',
      name: 'Default Setup',
      minLevel: 1,
      maxLevel: 34,
      classes: [null, null, null],
      weaponFilters: [],
      armorFilters: [],
      shieldFilters: [],
      allowMetalWithDruid: false,
      slots: {} as Record<GearSlot, GearItem | null>,
      slottedAugments: {},
      slottedCurses: {},
      slottedFiligrees: {},
      unlockedFiligreeSlots: {}
    }
  ],
  activeSetupId: 'default',
  artificerPet: initialPetState(),
  druidPet: initialPetState()
}

type SlotOwner = 'character' | 'artificer_pet' | 'druid_pet'

const getSlotOwner = (slot: GearSlot): SlotOwner => {
  if (ARTIFICER_PET_SLOTS.includes(slot)) return 'artificer_pet'
  if (DRUID_PET_SLOTS.includes(slot)) return 'druid_pet'
  return 'character'
}

const gearPlannerSlice = createSlice({
  name: 'gearPlanner',
  initialState,
  reducers: {
    setActiveSetup: (state, action: PayloadAction<string>) => {
      state.activeSetupId = action.payload
    },
    addSetup: (state, action: PayloadAction<GearSetup>) => {
      state.characterSetups.push(action.payload)
    },
    removeSetup: (state, action: PayloadAction<string>) => {
      state.characterSetups = state.characterSetups.filter(
        (s) => s.id !== action.payload
      )
      if (state.activeSetupId === action.payload) {
        state.activeSetupId = state.characterSetups[0]?.id || ''
      }
    },
    updateSetup: (
      state,
      action: PayloadAction<Partial<GearSetup> & { id: string }>
    ) => {
      const setup = state.characterSetups.find(
        (s) => s.id === action.payload.id
      )
      if (setup) {
        Object.assign(setup, action.payload)

        // Enforce level range 1-34 and relationship minLevel <= maxLevel
        setup.minLevel = Number.isNaN(setup.minLevel)
          ? 1
          : Math.max(1, Math.min(34, setup.minLevel))
        setup.maxLevel = Number.isNaN(setup.maxLevel)
          ? 34
          : Math.max(1, Math.min(34, setup.maxLevel))

        if (setup.minLevel > setup.maxLevel) {
          if (
            action.payload.minLevel !== undefined &&
            action.payload.maxLevel === undefined
          ) {
            // If minLevel was changed, push maxLevel up to match
            setup.maxLevel = setup.minLevel
          } else if (
            action.payload.maxLevel !== undefined &&
            action.payload.minLevel === undefined
          ) {
            // If maxLevel was changed, push minLevel down to match
            setup.minLevel = setup.maxLevel
          } else {
            // If both were changed and are in conflict, or other cases, ensure validity
            setup.maxLevel = setup.minLevel
          }
        }
      }
    },
    equipItem: (
      state,
      action: PayloadAction<{ slot: GearSlot; item: GearItem | null }>
    ) => {
      const { slot, item } = action.payload
      const owner = getSlotOwner(slot)

      if (owner === 'character') {
        const setup = state.characterSetups.find(
          (s) => s.id === state.activeSetupId
        )
        if (setup) {
          // If we're equipping a minor artifact, ensure only one is equipped
          if (item && isMinorArtifact(item)) {
            Object.keys(setup.slots).forEach((s) => {
              const currentItem = setup.slots[s as GearSlot]
              if (currentItem && isMinorArtifact(currentItem) && s !== slot) {
                // Remove the other minor artifact
                const otherSlot = s as GearSlot
                const otherItem = setup.slots[otherSlot]
                if (otherItem) {
                  delete setup.slottedFiligrees[otherItem.id]
                  delete setup.unlockedFiligreeSlots[otherItem.id]
                }
                setup.slots[otherSlot] = null
              }
            })
          }

          const oldItem = setup.slots[slot]
          if (oldItem) {
            delete setup.slottedFiligrees[oldItem.id]
            delete setup.unlockedFiligreeSlots[oldItem.id]
          }
          setup.slots[slot] = item
        }
      } else if (owner === 'artificer_pet') {
        const oldItem = state.artificerPet.slots[slot]
        if (oldItem) {
          delete state.artificerPet.slottedFiligrees[oldItem.id]
          delete state.artificerPet.unlockedFiligreeSlots[oldItem.id]
        }
        state.artificerPet.slots[slot] = item
      } else if (owner === 'druid_pet') {
        const oldItem = state.druidPet.slots[slot]
        if (oldItem) {
          delete state.druidPet.slottedFiligrees[oldItem.id]
          delete state.druidPet.unlockedFiligreeSlots[oldItem.id]
        }
        state.druidPet.slots[slot] = item
      }
    },
    setAugment: (
      state,
      action: PayloadAction<{
        itemId: string
        slotIndex: number
        augment: GearAugment | null
        slot?: GearSlot
      }>
    ) => {
      const { itemId, slotIndex, augment, slot } = action.payload
      let owner: SlotOwner = 'character'

      if (slot) {
        owner = getSlotOwner(slot)
      } else {
        // Fallback to searching if slot is not provided (though it should be)
        // This is tricky because itemId is not unique across owners if we are unlucky,
        // but it's usually unique.
      }

      const updateAugment = (petState: PetState) => {
        if (!petState.slottedAugments[itemId]) {
          petState.slottedAugments[itemId] = {}
        }
        petState.slottedAugments[itemId][slotIndex] = augment
      }

      if (owner === 'character') {
        const setup = state.characterSetups.find(
          (s) => s.id === state.activeSetupId
        )
        if (setup) {
          if (!setup.slottedAugments[itemId]) {
            setup.slottedAugments[itemId] = {}
          }
          setup.slottedAugments[itemId][slotIndex] = augment
        }
      } else if (owner === 'artificer_pet') {
        updateAugment(state.artificerPet)
      } else if (owner === 'druid_pet') {
        updateAugment(state.druidPet)
      }
    },
    setCurse: (
      state,
      action: PayloadAction<{
        itemId: string
        curse: Curse | null
        slot?: GearSlot
      }>
    ) => {
      const { itemId, curse, slot } = action.payload
      let owner: SlotOwner = 'character'

      if (slot) {
        owner = getSlotOwner(slot)
      }

      if (owner === 'character') {
        const setup = state.characterSetups.find(
          (s) => s.id === state.activeSetupId
        )
        if (setup) {
          setup.slottedCurses[itemId] = curse
        }
      } else if (owner === 'artificer_pet') {
        state.artificerPet.slottedCurses[itemId] = curse
      } else if (owner === 'druid_pet') {
        state.druidPet.slottedCurses[itemId] = curse
      }
    },
    setFiligree: (
      state,
      action: PayloadAction<{
        itemId: string
        slotIndex: number
        filigree: LootItem | null
        slot?: GearSlot
      }>
    ) => {
      const { itemId, slotIndex, filigree, slot } = action.payload
      let owner: SlotOwner = 'character'

      if (slot) {
        owner = getSlotOwner(slot)
      }

      const updateFiligree = (petState: PetState) => {
        if (!petState.slottedFiligrees[itemId]) {
          petState.slottedFiligrees[itemId] = new Array(10).fill(null)
        }
        petState.slottedFiligrees[itemId][slotIndex] = filigree
      }

      if (owner === 'character') {
        const setup = state.characterSetups.find(
          (s) => s.id === state.activeSetupId
        )
        if (setup) {
          if (!setup.slottedFiligrees[itemId]) {
            setup.slottedFiligrees[itemId] = new Array(10).fill(null)
          }
          setup.slottedFiligrees[itemId][slotIndex] = filigree
        }
      } else if (owner === 'artificer_pet') {
        updateFiligree(state.artificerPet)
      } else if (owner === 'druid_pet') {
        updateFiligree(state.druidPet)
      }
    },
    setUnlockedFiligreeSlots: (
      state,
      action: PayloadAction<{
        itemId: string
        numSlots: number
        slot?: GearSlot
      }>
    ) => {
      const { itemId, numSlots, slot } = action.payload
      let owner: SlotOwner = 'character'

      if (slot) {
        owner = getSlotOwner(slot)
      }

      if (owner === 'character') {
        const setup = state.characterSetups.find(
          (s) => s.id === state.activeSetupId
        )
        if (setup) {
          setup.unlockedFiligreeSlots[itemId] = numSlots
        }
      } else if (owner === 'artificer_pet') {
        state.artificerPet.unlockedFiligreeSlots[itemId] = numSlots
      } else if (owner === 'druid_pet') {
        state.druidPet.unlockedFiligreeSlots[itemId] = numSlots
      }
    }
  }
})

export const {
  setActiveSetup,
  addSetup,
  removeSetup,
  updateSetup,
  equipItem,
  setAugment,
  setCurse,
  setFiligree,
  setUnlockedFiligreeSlots
} = gearPlannerSlice.actions

export default gearPlannerSlice.reducer
