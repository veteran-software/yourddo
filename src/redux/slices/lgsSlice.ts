import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { legendaryAltarOfDevastation } from '../../data/legendaryAltarOfDevastation.ts'
import { legendaryAltarOfInvasion } from '../../data/legendaryAltarOfInvasion.ts'
import { legendaryAltarOfSubjugation } from '../../data/legendaryAltarOfSubjugation.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'
import { createInitialLgsState } from '../factories/stateFactory.ts'

const { actions, reducer } = createSlice({
  initialState: createInitialLgsState(),
  name: 'legendaryGreenSteel',
  reducers: {
    selectFecundityItem: (state, action: PayloadAction<CraftingIngredient>) => {
      if (state.selectedFecundityItem && state.selectedFecundityItem.ingredientType !== action.payload.ingredientType) {
        state.selectedFecundityItem = undefined
        state.selectedInvasionItem = undefined
        state.selectedSubjugationItem = undefined
        state.selectedDevastationItem = undefined
      }

      state.selectedFecundityItem = action.payload

      const baseItemType: 'Weapon' | 'Equipment' = action.payload.ingredientType?.endsWith('Weapon')
        ? 'Weapon'
        : 'Equipment'

      state.invasionItems = [...legendaryAltarOfInvasion].filter((item: CraftingIngredient) =>
        item.name.includes(baseItemType)
      )

      state.subjugationItems = [...legendaryAltarOfSubjugation].filter((item: CraftingIngredient) =>
        item.name.includes(baseItemType)
      )

      state.devastationItems = [...legendaryAltarOfDevastation].filter((item: CraftingIngredient) =>
        item.name.includes(baseItemType)
      )
    },
    resetFecundityItem: (state) => {
      state.selectedFecundityItem = undefined
      state.selectedInvasionItem = undefined
      state.selectedSubjugationItem = undefined
      state.selectedDevastationItem = undefined
    },
    selectInvasionItem: (state, action: PayloadAction<CraftingIngredient>) => {
      state.selectedInvasionItem = action.payload
    },
    resetInvasionItem: (state) => {
      state.selectedInvasionItem = undefined
    }
  }
})

export const { selectFecundityItem, resetFecundityItem, selectInvasionItem, resetInvasionItem } = actions

export default reducer

export interface LegendaryGreenSteelState {
  // Default lists
  fecundityItems: CraftingIngredient[]
  invasionItems: CraftingIngredient[]
  subjugationItems: CraftingIngredient[]
  devastationItems: CraftingIngredient[]

  selectedFecundityItem: CraftingIngredient | undefined
  selectedInvasionItem: CraftingIngredient | undefined
  selectedSubjugationItem: CraftingIngredient | undefined
  selectedDevastationItem: CraftingIngredient | undefined

  invasionItemFilters: string[]
  subjugationItemFilters: string[]
  devastationItemFilters: string[]

  invasionFilterMode: 'OR' | 'AND'
  subjugationFilterMode: 'OR' | 'AND'
  devastationFilterMode: 'OR' | 'AND'
}
