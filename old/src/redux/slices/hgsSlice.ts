import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { altarOfDevastation } from '../../data/altarOfDevastation.ts'
import { altarOfInvasion } from '../../data/altarOfInvasion.ts'
import { altarOfSubjugation } from '../../data/altarOfSubjugation.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'
import { deconstructHgsShard } from '../../utils/objectUtils.ts'
import { createInitialHgsState } from '../factories/stateFactory.ts'
import { filterItemsBySuffix } from '../helpers/filterHelpers.ts'
import { resetPlanner } from '../helpers/resetHelpers.ts'

const { actions, reducer } = createSlice({
  initialState: createInitialHgsState(),
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
      if (state.selectedSubjugationSpell && !state.selectedSubjugationSpell.requirements?.[0].name.includes(deconstructHgsShard(action.payload.name).focus)) {
        state.selectedSubjugationSpell = undefined
      }
    },
    resetInvasionItem: (state) => {
      state.selectedInvasionItem = undefined
    },
    selectSubjugationItem: (state, action: PayloadAction<CraftingIngredient>) => {
      state.selectedSubjugationItem = action.payload
      if (state.selectedSubjugationSpell && !state.selectedSubjugationSpell.requirements?.[1].name.includes(deconstructHgsShard(action.payload.name).focus)) {
        state.selectedSubjugationSpell = undefined
      }
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
    },
    setInvasionFilterMode: (state, action: PayloadAction<'OR' | 'AND'>) => {
      state.invasionFilterMode = action.payload
    },
    setSubjugationFilterMode: (state, action: PayloadAction<'OR' | 'AND'>) => {
      state.subjugationFilterMode = action.payload
    },
    setDevastationBasicFilterMode: (state, action: PayloadAction<'OR' | 'AND'>) => {
      state.devastationBasicFilterMode = action.payload
    },
    setDevastationFocusedFilterMode: (state, action: PayloadAction<'OR' | 'AND'>) => {
      state.devastationBasicFilterMode = action.payload
    },
    setInvasionItemFilters: (state, action: PayloadAction<string[]>) => {
      state.invasionItemFilters = [...action.payload]
    },
    setSubjugationItemFilters: (state, action: PayloadAction<string[]>) => {
      state.subjugationItemFilters = [...action.payload]
    },
    setDevastationBasicItemFilters: (state, action: PayloadAction<string[]>) => {
      state.devastationBasicItemFilters = [...action.payload]
    },
    setDevastationFocusedItemFilters: (state, action: PayloadAction<string[]>) => {
      state.devastationFocusedItemFilters = [...action.payload]
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
  devastationBasicItemFilters: string[]
  devastationFocusedItemFilters: string[]

  invasionFilterMode: 'OR' | 'AND'
  subjugationFilterMode: 'OR' | 'AND'
  devastationBasicFilterMode: 'OR' | 'AND'
  devastationFocusedFilterMode: 'OR' | 'AND'
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
  resetSubjugationSpell,
  setInvasionFilterMode,
  setSubjugationFilterMode,
  setDevastationBasicFilterMode,
  setInvasionItemFilters,
  setSubjugationItemFilters,
  setDevastationBasicItemFilters,
  setDevastationFocusedItemFilters,
  setDevastationFocusedFilterMode
} = actions

export default reducer
