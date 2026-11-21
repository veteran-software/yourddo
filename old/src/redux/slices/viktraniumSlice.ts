import { createSlice, type PayloadAction } from '@reduxjs/toolkit/react'
import type { CraftingIngredient } from '../../types/crafting.ts'

interface ViktraniumExperimentState {
  selectedHeroicCraftedItem: CraftingIngredient | undefined
  selectedHeroicLootItem: CraftingIngredient | undefined
  selectedLegendaryCraftedItem: CraftingIngredient | undefined
  selectedLegendaryLootItem: CraftingIngredient | undefined
  selectedWickedCraftedItem: CraftingIngredient | undefined
  itemFilters: string[]
  itemFilterMode: 'OR' | 'AND'
  selectedAugments: Record<string, CraftingIngredient | null>
  augmentFilters: string[]
  augmentFilterMode: 'OR' | 'AND'
}

const initialState: ViktraniumExperimentState = {
  selectedHeroicCraftedItem: undefined,
  selectedHeroicLootItem: undefined,
  selectedLegendaryCraftedItem: undefined,
  selectedLegendaryLootItem: undefined,
  selectedWickedCraftedItem: undefined,
  itemFilters: [],
  itemFilterMode: 'AND',
  selectedAugments: {},
  augmentFilters: [],
  augmentFilterMode: 'OR'
}

const { actions, reducer } = createSlice({
  name: 'viktraniumExperiment',
  initialState,
  reducers: {
    setItemFilters: (state, action: PayloadAction<string[]>) => {
      state.itemFilters = [...action.payload]
    },
    resetItemFilters: (state) => {
      state.itemFilters = []
    },
    setSelectedHeroicLootItem: (state, action: PayloadAction<CraftingIngredient | undefined>) => {
      state.selectedHeroicLootItem = action.payload
      state.selectedAugments = {}
    },
    resetSelectedHeroicLootItem: (state) => {
      state.selectedHeroicLootItem = undefined
      state.selectedAugments = {}
    },
    setSelectedHeroicCraftedItem: (state, action: PayloadAction<CraftingIngredient | undefined>) => {
      state.selectedHeroicCraftedItem = action.payload
      state.selectedAugments = {}
    },
    resetSelectedHeroicCraftedItem: (state) => {
      state.selectedHeroicCraftedItem = undefined
      state.selectedAugments = {}
    },
    setSelectedLegendaryLootItem: (state, action: PayloadAction<CraftingIngredient | undefined>) => {
      state.selectedLegendaryLootItem = action.payload
      state.selectedAugments = {}
    },
    resetSelectedLegendaryLootItem: (state) => {
      state.selectedLegendaryLootItem = undefined
      state.selectedAugments = {}
    },
    setSelectedLegendaryCraftedItem: (state, action: PayloadAction<CraftingIngredient | undefined>) => {
      state.selectedLegendaryCraftedItem = action.payload
      state.selectedAugments = {}
    },
    resetSelectedLegendaryCraftedItem: (state) => {
      state.selectedLegendaryCraftedItem = undefined
      state.selectedAugments = {}
    },
    setSelectedWickedCraftedItem: (state, action: PayloadAction<CraftingIngredient | undefined>) => {
      state.selectedWickedCraftedItem = action.payload
      state.selectedAugments = {}
    },
    resetSelectedWickedCraftedItem: (state) => {
      state.selectedWickedCraftedItem = undefined
      state.selectedAugments = {}
    },
    setItemFilterMode: (state, action: PayloadAction<'OR' | 'AND'>) => {
      state.itemFilterMode = action.payload
    },
    resetItemFilterMode: (state) => {
      state.itemFilterMode = 'AND'
    },
    setAugmentFilters(state, action: PayloadAction<string[]>) {
      state.augmentFilters = action.payload
    },
    setAugmentFilterMode(state, action: PayloadAction<'OR' | 'AND'>) {
      state.augmentFilterMode = action.payload
    },
    setSelectedAugment(
      state,
      action: PayloadAction<{
        slot: string
        augment: CraftingIngredient | null
      }>
    ) {
      const { slot, augment } = action.payload
      state.selectedAugments[slot] = augment
    },
    resetSelectedAugment(state, action: PayloadAction<string>) {
      const slot: string = action.payload
      state.selectedAugments[slot] = null
    }
  }
})

export default reducer
export const {
  setSelectedHeroicLootItem,
  setSelectedHeroicCraftedItem,
  setSelectedLegendaryLootItem,
  setSelectedLegendaryCraftedItem,
  setSelectedWickedCraftedItem,
  resetSelectedLegendaryCraftedItem,
  resetSelectedLegendaryLootItem,
  resetSelectedWickedCraftedItem,
  setItemFilters,
  setItemFilterMode,
  resetSelectedHeroicLootItem,
  resetSelectedHeroicCraftedItem,
  resetItemFilters,
  resetItemFilterMode,
  setSelectedAugment,
  resetSelectedAugment,
  setAugmentFilters,
  setAugmentFilterMode
} = actions
