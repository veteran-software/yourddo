import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { isMinorArtifact } from '../../pages/gearPlanner/helpers'
import {
  ARTIFICER_PET_SLOTS,
  type Curse,
  DRUID_PET_SLOTS,
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootEnchantment,
  type LootItem
} from '../../pages/gearPlanner/types'

interface PetState {
  slots: Record<string, GearItem | null>
  slottedAugments: Record<string, Record<number, GearAugment | null>>
  slottedCurses: Record<string, Curse | null>
  slottedFiligrees: Record<string, (GearItem | null)[]>
  unlockedFiligreeSlots: Record<string, number>
  slottedGemSetBonuses: Record<string, (string | null)[]>
  slottedEssenceEnchantments: Record<string, Record<string, string | null>>
  slottedNearlyFinished: Record<string, LootEnchantment | null>
  slottedRitualTable: Record<string, LootEnchantment | null>
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
  unlockedFiligreeSlots: {},
  slottedGemSetBonuses: {},
  slottedEssenceEnchantments: {},
  slottedNearlyFinished: {},
  slottedRitualTable: {}
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
      unlockedFiligreeSlots: {},
      slottedGemSetBonuses: {},
      slottedEssenceEnchantments: {},
      slottedNearlyFinished: {},
      slottedRitualTable: {}
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
    enforceSingleMinorArtifact: (
      state,
      action: PayloadAction<{
        setupId: string
        item: GearItem | null
        slot: GearSlot
      }>
    ) => {
      const { setupId, item, slot } = action.payload
      const setup = state.characterSetups.find((s) => s.id === setupId)
      if (setup && item && isMinorArtifact(item)) {
        Object.keys(setup.slots).forEach((s) => {
          const currentItem = setup.slots[s as GearSlot]
          if (currentItem && isMinorArtifact(currentItem) && s !== slot) {
            const otherSlot = s as GearSlot
            const otherItem = setup.slots[otherSlot]
            if (otherItem) {
              setup.slottedFiligrees[otherItem.id] = []
              setup.unlockedFiligreeSlots[otherItem.id] = 0
            }
            setup.slots[otherSlot] = null
          }
        })
      }
    },
    setActiveSetup: (state, action: PayloadAction<string>) => {
      state.activeSetupId = action.payload
    },
    addSetup: (state, action: PayloadAction<GearSetup>) => {
      const setup = action.payload
      if (!setup.slottedFiligrees) setup.slottedFiligrees = {}
      if (!setup.unlockedFiligreeSlots) setup.unlockedFiligreeSlots = {}
      if (!setup.slottedGemSetBonuses) setup.slottedGemSetBonuses = {}
      if (!setup.slottedEssenceEnchantments)
        setup.slottedEssenceEnchantments = {}
      if (!setup.slottedNearlyFinished) setup.slottedNearlyFinished = {}
      if (!setup.slottedRitualTable) setup.slottedRitualTable = {}
      state.characterSetups.push(setup)
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
          gearPlannerSlice.caseReducers.enforceSingleMinorArtifact(state, {
            payload: { setupId: state.activeSetupId, item, slot },
            type: 'gearPlanner/enforceSingleMinorArtifact'
          })

          const oldItem = setup.slots[slot]
          if (oldItem) {
            setup.slottedFiligrees[oldItem.id] = []
            setup.unlockedFiligreeSlots[oldItem.id] = 0
          }
          setup.slots[slot] = item
        }
      } else if (owner === 'artificer_pet') {
        const oldItem = state.artificerPet.slots[slot]
        if (oldItem) {
          state.artificerPet.slottedFiligrees[oldItem.id] = []
          state.artificerPet.unlockedFiligreeSlots[oldItem.id] = 0
        }
        state.artificerPet.slots[slot] = item
      } else if (owner === 'druid_pet') {
        const oldItem = state.druidPet.slots[slot]
        if (oldItem) {
          state.druidPet.slottedFiligrees[oldItem.id] = []
          state.druidPet.unlockedFiligreeSlots[oldItem.id] = 0
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
          petState.slottedFiligrees[itemId] = new Array(10).fill(
            null
          ) as GearItem[]
        }
        petState.slottedFiligrees[itemId][slotIndex] =
          filigree as GearItem | null
      }

      if (owner === 'character') {
        const setup = state.characterSetups.find(
          (s) => s.id === state.activeSetupId
        )
        if (setup) {
          if (!setup.slottedFiligrees[itemId]) {
            setup.slottedFiligrees[itemId] = new Array(10).fill(
              null
            ) as GearItem[]
          }
          setup.slottedFiligrees[itemId][slotIndex] =
            filigree as GearItem | null
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
    },
    setGemSetBonus: (
      state,
      action: PayloadAction<{
        itemId: string
        slotIndex: number
        setName: string | null
        slot?: GearSlot
      }>
    ) => {
      const { itemId, slotIndex, setName, slot } = action.payload
      let owner: SlotOwner = 'character'

      if (slot) {
        owner = getSlotOwner(slot)
      }

      const updateGemBonus = (petState: PetState) => {
        if (!petState.slottedGemSetBonuses[itemId]) {
          petState.slottedGemSetBonuses[itemId] = [null, null]
        }
        petState.slottedGemSetBonuses[itemId][slotIndex] = setName
      }

      if (owner === 'character') {
        const setup = state.characterSetups.find(
          (s) => s.id === state.activeSetupId
        )
        if (setup) {
          if (!setup.slottedGemSetBonuses[itemId]) {
            setup.slottedGemSetBonuses[itemId] = [null, null]
          }
          setup.slottedGemSetBonuses[itemId][slotIndex] = setName
        }
      } else if (owner === 'artificer_pet') {
        updateGemBonus(state.artificerPet)
      } else if (owner === 'druid_pet') {
        updateGemBonus(state.druidPet)
      }
    },
    setEssenceEnchantment: (
      state,
      action: PayloadAction<{
        itemId: string
        slotName: string
        enchantmentId: string | null
        slot?: GearSlot
      }>
    ) => {
      const { itemId, slotName, enchantmentId, slot } = action.payload
      let owner: SlotOwner = 'character'

      if (slot) {
        owner = getSlotOwner(slot)
      }

      const updateEssence = (petState: PetState) => {
        if (!petState.slottedEssenceEnchantments[itemId]) {
          petState.slottedEssenceEnchantments[itemId] = {}
        }
        petState.slottedEssenceEnchantments[itemId][slotName] = enchantmentId
      }

      if (owner === 'character') {
        const setup = state.characterSetups.find(
          (s) => s.id === state.activeSetupId
        )
        if (setup) {
          if (!setup.slottedEssenceEnchantments[itemId]) {
            setup.slottedEssenceEnchantments[itemId] = {}
          }
          setup.slottedEssenceEnchantments[itemId][slotName] = enchantmentId
        }
      } else if (owner === 'artificer_pet') {
        updateEssence(state.artificerPet)
      } else if (owner === 'druid_pet') {
        updateEssence(state.druidPet)
      }
    },
    setNearlyFinishedEnchantment: (
      state,
      action: PayloadAction<{
        itemId: string
        enchantment: LootEnchantment | null
        slot?: GearSlot
      }>
    ) => {
      const { itemId, enchantment, slot } = action.payload
      let owner: SlotOwner = 'character'

      if (slot) {
        owner = getSlotOwner(slot)
      }

      const updateNearlyFinished = (petState: PetState) => {
        petState.slottedNearlyFinished[itemId] = enchantment
      }

      if (owner === 'character') {
        const setup = state.characterSetups.find(
          (s) => s.id === state.activeSetupId
        )
        if (setup) {
          setup.slottedNearlyFinished[itemId] = enchantment
        }
      } else if (owner === 'artificer_pet') {
        updateNearlyFinished(state.artificerPet)
      } else if (owner === 'druid_pet') {
        updateNearlyFinished(state.druidPet)
      }
    },
    setRitualTableEnchantment: (
      state,
      action: PayloadAction<{
        itemId: string
        enchantment: LootEnchantment | null
        slot?: GearSlot
      }>
    ) => {
      const { itemId, enchantment, slot } = action.payload
      let owner: SlotOwner = 'character'

      if (slot) {
        owner = getSlotOwner(slot)
      }

      const updateRitualTable = (petState: PetState) => {
        petState.slottedRitualTable[itemId] = enchantment
      }

      if (owner === 'character') {
        const setup = state.characterSetups.find(
          (s) => s.id === state.activeSetupId
        )
        if (setup) {
          setup.slottedRitualTable[itemId] = enchantment
        }
      } else if (owner === 'artificer_pet') {
        updateRitualTable(state.artificerPet)
      } else if (owner === 'druid_pet') {
        updateRitualTable(state.druidPet)
      }
    },
    setItemMinLevel: (
      state,
      action: PayloadAction<{
        itemId: string
        minLevel: number
        slot?: GearSlot
      }>
    ) => {
      const { itemId, minLevel, slot } = action.payload
      let owner: SlotOwner = 'character'

      if (slot) {
        owner = getSlotOwner(slot)
      }

      const updateMinLevel = (petState: PetState) => {
        const currentItem = Object.values(petState.slots).find(
          (i) => i?.id === itemId
        )
        if (currentItem) {
          currentItem.minLevel = String(minLevel)
        }
      }

      if (owner === 'character') {
        const setup = state.characterSetups.find(
          (s) => s.id === state.activeSetupId
        )
        if (setup) {
          const currentItem = Object.values(setup.slots).find(
            (i) => i?.id === itemId
          )
          if (currentItem) {
            currentItem.minLevel = String(minLevel)
          }
        }
      } else if (owner === 'artificer_pet') {
        updateMinLevel(state.artificerPet)
      } else if (owner === 'druid_pet') {
        updateMinLevel(state.druidPet)
      }
    },
    setItemMaterial: (
      state,
      action: PayloadAction<{
        itemId: string
        material: string
        slot?: GearSlot
      }>
    ) => {
      const { itemId, material, slot } = action.payload
      let owner: SlotOwner = 'character'

      if (slot) {
        owner = getSlotOwner(slot)
      }

      const updateMaterial = (petState: PetState) => {
        const currentItem = Object.values(petState.slots).find(
          (i) => i?.id === itemId
        )
        if (currentItem) {
          currentItem.material = material
        }
      }

      if (owner === 'character') {
        const setup = state.characterSetups.find(
          (s) => s.id === state.activeSetupId
        )
        if (setup) {
          const currentItem = Object.values(setup.slots).find(
            (i) => i?.id === itemId
          )
          if (currentItem) {
            currentItem.material = material
          }
        }
      } else if (owner === 'artificer_pet') {
        updateMaterial(state.artificerPet)
      } else if (owner === 'druid_pet') {
        updateMaterial(state.druidPet)
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
  setUnlockedFiligreeSlots,
  setGemSetBonus,
  setEssenceEnchantment,
  setNearlyFinishedEnchantment,
  setRitualTableEnchantment,
  setItemMinLevel,
  setItemMaterial
} = gearPlannerSlice.actions

export default gearPlannerSlice.reducer
