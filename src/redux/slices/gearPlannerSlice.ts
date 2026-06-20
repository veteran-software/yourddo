import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import traceOfMadnessData from '../../data/traceOfMadness.json'
import { isMinorArtifact } from '../../pages/gearPlanner/helpers'
import { createDefaultSetup, initialPetState } from '../../pages/gearPlanner/initialState'
import {
  ARTIFICER_PET_SLOTS,
  type Curse,
  DRUID_PET_SLOTS,
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootEnchantment,
  type LootItem,
  type SlottedProperties,
  type UpgradeEntry
} from '../../pages/gearPlanner/types'

export interface GearPlannerState {
  characterSetups: GearSetup[]
  activeSetupId: string
}

// Represents potentially-incomplete data loaded from older localStorage snapshots.
// All slotted fields are optional because they may be absent in older saves.
// slottedTraceOfMadness accepts string (legacy) or LootEnchantment (current).
interface PartialSlotted {
  slots?: Record<string, unknown>
  armorFilters?: string[]
  weaponFilters?: string[]
  shieldFilters?: string[]
  allowMetalWithDruid?: boolean
  slottedNearlyFinished?: Record<string, LootEnchantment | null>
  slottedAlmostThere?: Record<string, LootEnchantment | null>
  slottedFinishingTouch?: Record<string, LootEnchantment | null>
  slottedRitualTable?: Record<string, LootEnchantment | null>
  slottedLostPurpose?: Record<string, LootEnchantment | null>
  slottedTraceOfMadness?: Record<string, LootEnchantment | string | null>
  slottedFountainOfNecroticMight?: Record<string, boolean>
  slottedStormreaverUpgrade?: Record<string, boolean>
  slottedZhentarimAttuned?: Record<string, boolean>
  slottedAugments?: Record<string, Record<number, GearAugment | null>>
  slottedCurses?: Record<string, Curse | null>
  slottedFiligrees?: Record<string, (GearItem | null)[]>
  unlockedFiligreeSlots?: Record<string, number>
  slottedGemSetBonuses?: Record<string, (string | null)[]>
  slottedEssenceEnchantments?: Record<string, Record<string, string | null>>
  artificerPet?: PartialSlotted
  druidPet?: PartialSlotted
}

interface PartialGearPlannerState {
  characterSetups?: PartialSlotted[]
  activeSetupId?: string
}

export const GEAR_PLANNER_STORAGE_KEY = 'gearPlannerState'

const loadState = (): GearPlannerState => {
  try {
    const serializedState: string | null = localStorage.getItem(GEAR_PLANNER_STORAGE_KEY)
    if (serializedState === null) {
      return {
        characterSetups: [createDefaultSetup('default', 'Default Setup')],
        activeSetupId: 'default'
      }
    }
    const state = JSON.parse(serializedState) as PartialGearPlannerState

    const ensureFields = (target: PartialSlotted) => {
      target.slots ??= {}
      target.armorFilters ??= []
      target.weaponFilters ??= []
      target.shieldFilters ??= []
      target.slottedNearlyFinished ??= {}
      target.slottedAlmostThere ??= {}
      target.slottedFinishingTouch ??= {}
      target.slottedRitualTable ??= {}
      target.slottedLostPurpose ??= {}
      target.slottedTraceOfMadness ??= {}
      target.slottedFountainOfNecroticMight ??= {}
      target.slottedStormreaverUpgrade ??= {}
      target.slottedZhentarimAttuned ??= {}
      target.slottedAugments ??= {}
      target.slottedCurses ??= {}
      target.slottedFiligrees ??= {}
      target.unlockedFiligreeSlots ??= {}
      target.slottedGemSetBonuses ??= {}
      target.slottedEssenceEnchantments ??= {}
    }

    // Migrate slottedTraceOfMadness: convert legacy string (upgrade name) to LootEnchantment
    const migrateTraceOfMadness = (target: PartialSlotted) => {
      const slots = target.slottedTraceOfMadness
      if (!slots) return
      for (const [id, val] of Object.entries(slots)) {
        if (typeof val === 'string') {
          const upgradeEntry = (traceOfMadnessData as UpgradeEntry[]).find((u) => u.name === val)
          slots[id] = upgradeEntry?.effectsAdded[0] ?? null
        }
      }
    }

    // Migrate/Fix state if fields are missing
    state.characterSetups?.forEach((setup) => {
      ensureFields(setup)
      setup.allowMetalWithDruid ??= false
      setup.artificerPet ??= initialPetState() as unknown as PartialSlotted
      setup.druidPet ??= initialPetState() as unknown as PartialSlotted
      ensureFields(setup.artificerPet)
      ensureFields(setup.druidPet)

      migrateTraceOfMadness(setup)
      migrateTraceOfMadness(setup.artificerPet)
      migrateTraceOfMadness(setup.druidPet)
    })

    return state as unknown as GearPlannerState
  } catch (err) {
    console.error('Error loading state from localStorage:', err)

    return {
      characterSetups: [createDefaultSetup('default', 'Default Setup')],
      activeSetupId: 'default'
    }
  }
}

const initialState: GearPlannerState = loadState()

type SlotOwner = 'character' | 'artificer_pet' | 'druid_pet'

const getSlotOwner = (slot: GearSlot): SlotOwner => {
  if (ARTIFICER_PET_SLOTS.includes(slot)) return 'artificer_pet'
  if (DRUID_PET_SLOTS.includes(slot)) return 'druid_pet'
  return 'character'
}

const getTarget = (setup: GearSetup, owner: SlotOwner): SlottedProperties => {
  if (owner === 'artificer_pet') return setup.artificerPet
  if (owner === 'druid_pet') return setup.druidPet
  return setup
}

const clearMetadata = (target: SlottedProperties, id: string) => {
  /* eslint-disable @typescript-eslint/no-dynamic-delete */
  delete target.slottedAugments[id]
  delete target.slottedCurses[id]
  delete target.slottedFiligrees[id]
  delete target.unlockedFiligreeSlots[id]
  delete target.slottedGemSetBonuses[id]
  delete target.slottedEssenceEnchantments[id]
  delete target.slottedNearlyFinished[id]
  delete target.slottedAlmostThere[id]
  delete target.slottedFinishingTouch[id]
  delete target.slottedRitualTable[id]
  delete target.slottedLostPurpose[id]
  delete target.slottedTraceOfMadness[id]
  delete target.slottedFountainOfNecroticMight[id]
  delete target.slottedStormreaverUpgrade[id]
  delete target.slottedZhentarimAttuned[id]
  /* eslint-enable @typescript-eslint/no-dynamic-delete */
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
        const itemIdsToRemove: string[] = []
        Object.entries(setup.slots).forEach(([s, currentItem]) => {
          if (currentItem && isMinorArtifact(currentItem) && s !== slot) {
            itemIdsToRemove.push(currentItem.id)
            setup.slots[s as GearSlot] = null
          }
        })

        if (itemIdsToRemove.length > 0) {
          itemIdsToRemove.forEach((id) => {
            clearMetadata(setup, id)
          })
        }
      }
    },
    setActiveSetup: (state, action: PayloadAction<string>) => {
      state.activeSetupId = action.payload
    },
    addSetup: (state, action: PayloadAction<GearSetup>) => {
      state.characterSetups.push(action.payload)
    },
    removeSetup: (state, action: PayloadAction<string>) => {
      state.characterSetups = state.characterSetups.filter((s) => s.id !== action.payload)
      if (state.characterSetups.length === 0) {
        state.characterSetups.push(createDefaultSetup('default', 'Default Setup'))
      }
      if (state.activeSetupId === action.payload || !state.characterSetups.some((s) => s.id === state.activeSetupId)) {
        state.activeSetupId = state.characterSetups[0]?.id || 'default'
      }
    },
    updateSetup: (state, action: PayloadAction<Partial<GearSetup> & { id: string }>) => {
      const setup = state.characterSetups.find((s) => s.id === action.payload.id)
      if (setup) {
        Object.assign(setup, action.payload)

        // Enforce level range 1-34 and relationship minLevel <= maxLevel
        setup.minLevel = Number.isNaN(setup.minLevel) ? 1 : Math.max(1, Math.min(34, setup.minLevel))
        setup.maxLevel = Number.isNaN(setup.maxLevel) ? 34 : Math.max(1, Math.min(34, setup.maxLevel))

        if (setup.minLevel > setup.maxLevel) {
          if (action.payload.minLevel !== undefined && action.payload.maxLevel === undefined) {
            // If minLevel was changed, push maxLevel up to match
            setup.maxLevel = setup.minLevel
          } else if (action.payload.maxLevel !== undefined && action.payload.minLevel === undefined) {
            // If maxLevel was changed, push minLevel down to match
            setup.minLevel = setup.maxLevel
          } else {
            // If both were changed and are in conflict, or other cases, ensure validity
            setup.maxLevel = setup.minLevel
          }
        }
      }
    },
    equipItem: (state, action: PayloadAction<{ slot: GearSlot; item: GearItem | null }>) => {
      const { slot, item } = action.payload
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const owner = getSlotOwner(slot)

      if (owner === 'character') {
        gearPlannerSlice.caseReducers.enforceSingleMinorArtifact(state, {
          payload: { setupId: state.activeSetupId, item, slot },
          type: 'gearPlanner/enforceSingleMinorArtifact'
        })
      }

      const target = getTarget(setup, owner)

      const oldItem = target.slots[slot]
      if (oldItem) {
        clearMetadata(target, oldItem.id)
      }

      target.slots[slot] = item
      if (item) {
        target.slottedFiligrees[item.id] ??= new Array(10).fill(null)
        target.unlockedFiligreeSlots[item.id] ??= 0
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
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedAugments[itemId] ??= {}
      target.slottedAugments[itemId][slotIndex] = augment
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
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedCurses[itemId] = curse
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
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedFiligrees[itemId] ??= new Array(10).fill(null) as GearItem[]
      target.slottedFiligrees[itemId][slotIndex] = filigree as GearItem | null
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
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.unlockedFiligreeSlots[itemId] = numSlots
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
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedGemSetBonuses[itemId] ??= [null, null]
      target.slottedGemSetBonuses[itemId][slotIndex] = setName
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
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedEssenceEnchantments[itemId] ??= {}
      target.slottedEssenceEnchantments[itemId][slotName] = enchantmentId
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
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedNearlyFinished[itemId] = enchantment
    },
    setAlmostThereEnchantment: (
      state,
      action: PayloadAction<{
        itemId: string
        enchantment: LootEnchantment | null
        slot?: GearSlot
      }>
    ) => {
      const { itemId, enchantment, slot } = action.payload
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedAlmostThere[itemId] = enchantment
    },
    setFinishingTouchEnchantment: (
      state,
      action: PayloadAction<{
        itemId: string
        enchantment: LootEnchantment | null
        slot?: GearSlot
      }>
    ) => {
      const { itemId, enchantment, slot } = action.payload
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedFinishingTouch[itemId] = enchantment
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
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedRitualTable[itemId] = enchantment
    },
    setLostPurposeEnchantment: (
      state,
      action: PayloadAction<{
        itemId: string
        enchantment: LootEnchantment | null
        slot?: GearSlot
      }>
    ) => {
      const { itemId, enchantment, slot } = action.payload
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedLostPurpose[itemId] = enchantment
    },
    setTraceOfMadnessEnchantment: (
      state,
      action: PayloadAction<{
        itemId: string
        enchantment: LootEnchantment | null
        slot?: GearSlot
      }>
    ) => {
      const { itemId, enchantment, slot } = action.payload
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedTraceOfMadness[itemId] = enchantment
    },
    setFountainOfNecroticMight: (
      state,
      action: PayloadAction<{
        itemId: string
        active: boolean
        slot?: GearSlot
      }>
    ) => {
      const { itemId, active, slot } = action.payload
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedFountainOfNecroticMight[itemId] = active
    },
    setStormreaverUpgrade: (
      state,
      action: PayloadAction<{
        itemId: string
        active: boolean
        slot?: GearSlot
      }>
    ) => {
      const { itemId, active, slot } = action.payload
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedStormreaverUpgrade[itemId] = active
    },
    setZhentarimAttuned: (
      state,
      action: PayloadAction<{
        itemId: string
        active: boolean
        slot?: GearSlot
      }>
    ) => {
      const { itemId, active, slot } = action.payload
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      target.slottedZhentarimAttuned[itemId] = active
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
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      const currentItem = Object.values(target.slots).find((i) => i?.id === itemId)
      if (currentItem) {
        currentItem.minLevel = String(minLevel)
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
      const setup = state.characterSetups.find((s) => s.id === state.activeSetupId)
      if (!setup) return

      const target = getTarget(setup, slot ? getSlotOwner(slot) : 'character')
      const currentItem = Object.values(target.slots).find((i) => i?.id === itemId)
      if (currentItem) {
        currentItem.material = material
      }
    },
    importSetups: (state, action: PayloadAction<GearSetup[]>) => {
      state.characterSetups = action.payload
      state.activeSetupId = action.payload[0]?.id ?? 'default'
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
  setAlmostThereEnchantment,
  setFinishingTouchEnchantment,
  setRitualTableEnchantment,
  setLostPurposeEnchantment,
  setTraceOfMadnessEnchantment,
  setFountainOfNecroticMight,
  setStormreaverUpgrade,
  setZhentarimAttuned,
  setItemMinLevel,
  setItemMaterial,
  importSetups
} = gearPlannerSlice.actions

export default gearPlannerSlice.reducer
