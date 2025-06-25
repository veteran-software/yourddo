import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { altarOfDevastation } from '../../data/altarOfDevastation.ts'
import { altarOfInvasion } from '../../data/altarOfInvasion.ts'
import { altarOfSubjugation } from '../../data/altarOfSubjugation.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'
import { createInitialState } from '../factories/stateFactory.ts'
import { filterItemsBySuffix } from '../helpers/filterHelpers.ts'
import { resetPlanner } from '../helpers/resetHelpers.ts'

const { actions, reducer } = createSlice({
  initialState: createInitialState(),
  name: 'greenSteel',
  reducers: {
    selectFecundityItem: (state, action: PayloadAction<CraftingIngredient>) => {
      if (state.selectedFecundityItem && state.selectedFecundityItem.ingredientType !== action.payload.ingredientType) {
        resetPlanner(state)
      }

      state.selectedFecundityItem = action.payload

      const baseItemType: 'Weapon' | 'Accessory' = action.payload.ingredientType?.endsWith('Weapon')
        ? 'Weapon'
        : 'Accessory'
      state.invasionItems = filterItemsBySuffix([...altarOfInvasion], `${baseItemType} Upgrade`)

      state.subjugationItems = filterItemsBySuffix([...altarOfSubjugation], `${baseItemType} Upgrade`)

      // T3 Focused Effects
      state.devastationFocusedEffects = altarOfDevastation.filter(
        (ingredient: CraftingIngredient) =>
          !ingredient.name.includes('Basic') && ingredient.name.includes(`${baseItemType} Upgrade`)
      )

      state.devastationBasicItems = altarOfDevastation.filter((ingredient: CraftingIngredient) =>
        ingredient.name.includes(`Basic ${baseItemType} Upgrade`)
      )
    },
    resetFecundityItem: (state) => {
      resetPlanner(state)
    },
    selectInvasionItem: (state, action: PayloadAction<CraftingIngredient>) => {
      state.selectedInvasionItem = action.payload
    },
    resetInvasionItem: (state) => {
      state.selectedInvasionItem = undefined
    },
    selectSubjugationItem: (state, action: PayloadAction<CraftingIngredient>) => {
      state.selectedSubjugationItem = action.payload
    },
    resetSubjugationItem: (state) => {
      state.selectedSubjugationItem = undefined
    },
    selectSubjugationSpell: (state, action: PayloadAction<CraftingIngredient>) => {
      state.selectedSubjugationSpell = action.payload
    },
    resetSubjugationSpell: (state) => {
      state.selectedSubjugationSpell = undefined
    },
    selectDevastationBasic: (state, action: PayloadAction<CraftingIngredient>) => {
      state.selectedDevastationBasic = action.payload
      state.selectedDevastationFocused = undefined
    },
    resetDevastationBasic: (state) => {
      state.selectedDevastationBasic = undefined
    },
    selectDevastationFocused: (state, action: PayloadAction<CraftingIngredient>) => {
      state.selectedDevastationFocused = action.payload
      state.selectedDevastationBasic = undefined
    },
    resetDevastationFocused: (state) => {
      state.selectedDevastationFocused = undefined
    }
  }
})

export interface GreenSteelState {
  // Default lists
  fecundityItems: CraftingIngredient[]
  invasionItems: CraftingIngredient[]
  subjugationItems: CraftingIngredient[]
  devastationBasicItems: CraftingIngredient[]
  devastationFocusedEffects: CraftingIngredient[]

  selectedFecundityItem: CraftingIngredient | undefined
  selectedInvasionItem: CraftingIngredient | undefined
  selectedSubjugationItem: CraftingIngredient | undefined
  selectedSubjugationSpell: CraftingIngredient | undefined
  selectedDevastationBasic: CraftingIngredient | undefined
  selectedDevastationFocused: CraftingIngredient | undefined

  invasionItemFilters: string[]
  subjugationItemFilters: string[]
  devastationItemFilters: string[]

  invasionFilterMode: 'OR' | 'AND'
  subjugationFilterMode: 'OR' | 'AND'
  devastationFilterMode: 'OR' | 'AND'
}

export const {
  selectFecundityItem,
  resetFecundityItem,
  selectInvasionItem,
  resetInvasionItem,
  selectSubjugationItem,
  resetSubjugationItem,
  selectDevastationBasic,
  resetDevastationBasic,
  selectDevastationFocused,
  resetDevastationFocused,
  selectSubjugationSpell,
  resetSubjugationSpell
} = actions

export default reducer
