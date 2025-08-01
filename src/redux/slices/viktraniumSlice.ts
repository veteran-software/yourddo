import { createSlice, type PayloadAction } from '@reduxjs/toolkit/react'
import type { AugmentItem } from '../../types/augmentItem.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'

const { actions, reducer } = createSlice({
  name: 'viktraniumExperiment',
  initialState: {
    selectedCraftedItem: undefined,
    selectedLootItem: undefined,
    itemFilters: [],
    itemFilterMode: 'AND',
    selectedAugments: {},
    augmentFilters: [],
    augmentFilterMode: 'OR'
  } as ViktraniumExperimentState,
  reducers: {
    setItemFilters: (state, action: PayloadAction<string[]>) => {
      state.itemFilters = [...action.payload]
    },
    resetItemFilters: (state) => {
      state.itemFilters = []
    },
    setSelectedLootItem: (state, action: PayloadAction<CraftingIngredient | undefined>) => {
      state.selectedLootItem = action.payload
      state.selectedAugments = {}
    },
    resetSelectedLootItem: (state) => {
      state.selectedLootItem = undefined
      state.selectedAugments = {}
    },
    setSelectedCraftedItem: (state, action: PayloadAction<CraftingIngredient | undefined>) => {
      state.selectedCraftedItem = action.payload
      state.selectedAugments = {}
    },
    resetSelectedCraftedItem: (state) => {
      state.selectedCraftedItem = undefined
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
        augment: AugmentItem | null
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

interface ViktraniumExperimentState {
  selectedCraftedItem: CraftingIngredient | undefined
  selectedLootItem: CraftingIngredient | undefined
  itemFilters: string[]
  itemFilterMode: 'OR' | 'AND'
  selectedAugments: Record<string, AugmentItem | null>
  augmentFilters: string[]
  augmentFilterMode: 'OR' | 'AND'
}

export default reducer
export const {
  setSelectedLootItem,
  setSelectedCraftedItem,
  setItemFilters,
  setItemFilterMode,
  resetSelectedLootItem,
  resetSelectedCraftedItem,
  resetItemFilters,
  resetItemFilterMode,
  setSelectedAugment,
  resetSelectedAugment,
  setAugmentFilters,
  setAugmentFilterMode
} = actions
