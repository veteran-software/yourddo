import { createSlice, type PayloadAction } from '@reduxjs/toolkit/react'
import type { CraftingIngredient } from '../../types/crafting.ts'

const { actions, reducer } = createSlice({
  name: 'dinosaurBone',
  initialState: {
    selectedItem: undefined,
    itemFilters: [],
    itemFilterMode: 'AND',
    selectedAugments: {},
    augmentFilters: [],
    augmentFilterMode: 'OR'
  } as DinosaurBoneState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<CraftingIngredient | undefined>) => {
      state.selectedItem = action.payload
      state.selectedAugments = {}
    },
    resetSelectedItem: (state) => {
      state.selectedItem = undefined
      state.selectedAugments = {}
    },
    setItemFilters: (state, action: PayloadAction<string[]>) => {
      state.itemFilters = [...action.payload]
    },
    resetItemFilters: (state) => {
      state.itemFilters = []
    },
    setItemFilterMode: (state, action: PayloadAction<'OR' | 'AND'>) => {
      state.itemFilterMode = action.payload
    },
    resetItemFilterMode: (state) => {
      state.itemFilterMode = 'AND'
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
      const slot = action.payload
      state.selectedAugments[slot] = null
    },
    setAugmentFilters(state, action: PayloadAction<string[]>) {
      state.augmentFilters = action.payload
    },
    setAugmentFilterMode(state, action: PayloadAction<'OR' | 'AND'>) {
      state.augmentFilterMode = action.payload
    }
  }
})

interface DinosaurBoneState {
  selectedItem: CraftingIngredient | undefined
  itemFilters: string[]
  itemFilterMode: 'OR' | 'AND'
  selectedAugments: Record<string, CraftingIngredient | null>
  augmentFilters: string[]
  augmentFilterMode: 'OR' | 'AND'
}

export default reducer
export const {
  setSelectedItem,
  setItemFilters,
  setItemFilterMode,
  resetSelectedItem,
  resetItemFilters,
  resetItemFilterMode,
  setSelectedAugment,
  resetSelectedAugment,
  setAugmentFilters,
  setAugmentFilterMode
} = actions
