import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { altarOfSubjugation } from '../../data/altarOfSubjugation.ts'
import { baseItems } from '../../pages/incrediblePotential/data/baseItems.ts'
import type { Ring } from '../../types/core.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'

const initialState: IncrediblePotentialState = {
  craftedIngredients: {} as Record<string, number>,
  filterMode: 'OR',
  filteredRingList: baseItems,
  filteredUpgradeList: altarOfSubjugation.filter((recipe: CraftingIngredient) =>
    recipe.name.toLowerCase().includes('ring upgrade')
  ),
  rawMaterials: {} as Record<string, number>,
  ringFilters: baseItems
    .flatMap((item: Ring): string[] =>
      item.enchantments.slice(0, 2).map((enhancement) => enhancement.name)
    )
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
    .sort((a: string, b: string) => a.localeCompare(b)),
  selectedRing: undefined,
  selectedRingFilters: [],
  selectedUpgrade: undefined,
  selectedUpgradeFilters: [],
  upgradeFilters: altarOfSubjugation
    .filter((recipe: CraftingIngredient) =>
      recipe.name.toLowerCase().includes('ring upgrade')
    )
    .flatMap(
      (item: CraftingIngredient): string[] =>
        item.effectsAdded?.slice(0, 2).map((enhancement) => enhancement.name) ??
        []
    )
    .filter((value, index, self) => self.indexOf(value) === index)
}

const { actions, reducer } = createSlice({
  initialState,
  name: 'incrediblePotential',
  reducers: {
    addCraftedIngredient: (
      state,
      action: PayloadAction<CraftingIngredient>
    ) => {
      state.craftedIngredients = {
        ...state.craftedIngredients,
        [action.payload.name]:
          (state.craftedIngredients[action.payload.name] ?? 0) +
          action.payload.quantity
      }
    },
    addRawMaterial: (state, action: PayloadAction<CraftingIngredient>) => {
      state.rawMaterials = {
        ...state.rawMaterials,
        [action.payload.name]:
          (state.rawMaterials[action.payload.name] ?? 0) +
          action.payload.quantity
      }
    },
    clearCraftedIngredients: (state) => {
      state.craftedIngredients = {} as Record<string, number>
    },
    clearRawMaterials: (state) => {
      state.rawMaterials = {} as Record<string, number>
    },
    setFilteredRingList(state, action: PayloadAction<Ring[]>) {
      state.filteredRingList = action.payload
    },
    setFilteredUpgradeList(state, action: PayloadAction<CraftingIngredient[]>) {
      state.filteredUpgradeList = action.payload
    },
    setSelectedRing: (state, action: PayloadAction<Ring | undefined>) => {
      state.selectedRing = action.payload
    },
    setSelectedRingFilters: (state, action: PayloadAction<string[]>) => {
      state.selectedRingFilters = action.payload
    },
    setSelectedUpgradeFilters: (state, action: PayloadAction<string[]>) => {
      state.selectedUpgradeFilters = action.payload
    },
    setSelectedUpgrade: (
      state,
      action: PayloadAction<CraftingIngredient | undefined>
    ) => {
      state.selectedUpgrade = action.payload
    },
    setFilterMode: (state, action: PayloadAction<'OR' | 'AND'>) => {
      state.filterMode = action.payload
    }
  }
})

interface IncrediblePotentialState {
  craftedIngredients: Record<string, number>
  filteredRingList: Ring[]
  filteredUpgradeList: CraftingIngredient[]
  filterMode: 'OR' | 'AND'
  rawMaterials: Record<string, number>
  ringFilters: string[]
  selectedRing: Ring | undefined
  selectedRingFilters: string[]
  selectedUpgradeFilters: string[]
  selectedUpgrade: CraftingIngredient | undefined
  upgradeFilters: string[]
}

export const {
  addCraftedIngredient,
  clearCraftedIngredients,
  addRawMaterial,
  clearRawMaterials,
  setFilteredRingList,
  setFilteredUpgradeList,
  setSelectedRingFilters,
  setSelectedUpgradeFilters,
  setSelectedRing,
  setSelectedUpgrade,
  setFilterMode
} = actions
export default reducer
