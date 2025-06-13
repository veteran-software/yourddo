import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import fecundity from '../../data/altarOfFecundity.json'
import { altarOfInvasion } from '../../data/altarOfInvasion.ts'
import { altarOfSubjugation } from '../../data/altarOfSubjugation.ts'
import type { Enhancement, Spell } from '../../types/core.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'

const initialState: GreenSteelState = {
  devastationDualShard: undefined,
  devastationFilterMode: 'OR',
  devastationItemFilters: [],
  devastationItems: [],
  fecundityItems: (fecundity as CraftingIngredient[]).filter(
    (item: CraftingIngredient) => {
      return item.name.startsWith('Green Steel')
    }
  ),
  invasionFilterMode: 'OR',
  invasionItemFilters: [],
  invasionItems: [],
  selectedDevastationItem: undefined,
  selectedFecundityItem: undefined,
  selectedInvasionItem: undefined,
  selectedSubjugationItem: undefined,
  subjugationFilterMode: 'OR',
  subjugationItemFilters: [],
  subjugationItems: [],
  subjugationSpell: undefined
}

const { actions, reducer } = createSlice({
  initialState,
  name: 'greenSteel',
  reducers: {
    setSubjugationSpell: (state, action: PayloadAction<Spell>) => {
      state.subjugationSpell = action.payload
    },
    selectFecundityItem: (state, action: PayloadAction<CraftingIngredient>) => {
      state.selectedFecundityItem = action.payload

      const baseItemType: 'Weapon' | 'Accessory' =
        action.payload.ingredientType?.endsWith('Weapon')
          ? 'Weapon'
          : 'Accessory'
      state.invasionItems = altarOfInvasion
        .map((item: CraftingIngredient) =>
          item.name.endsWith(`${baseItemType} Upgrade`) ? item : undefined
        )
        .filter((item: CraftingIngredient | undefined) => item !== undefined)

      state.subjugationItems = altarOfSubjugation
        .map((item: CraftingIngredient) =>
          item.name.endsWith(`${baseItemType} Upgrade`) ? item : undefined
        )
        .filter((item: CraftingIngredient | undefined) => item !== undefined)
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
    },
    selectSubjugationItem: (
      state,
      action: PayloadAction<CraftingIngredient>
    ) => {
      state.selectedSubjugationItem = action.payload
    },
    resetSubjugationItem: (state) => {
      state.selectedSubjugationItem = undefined
    }
  }
})

interface GreenSteelState {
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

  subjugationSpell: Spell | undefined
  devastationDualShard: Enhancement | undefined
}

export const {
  setSubjugationSpell,
  selectFecundityItem,
  resetFecundityItem,
  selectInvasionItem,
  resetInvasionItem,
  selectSubjugationItem,
  resetSubjugationItem
} = actions

export default reducer
