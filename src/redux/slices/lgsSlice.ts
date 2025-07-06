import { createSlice, type PayloadAction } from '@reduxjs/toolkit/react'
import { altarOfFecundity } from '../../data/altarOfFecundity.ts'
import { legendaryAltarOfDevastation } from '../../data/legendaryAltarOfDevastation.ts'
import { legendaryAltarOfInvasion } from '../../data/legendaryAltarOfInvasion.ts'
import { legendaryAltarOfSubjugation } from '../../data/legendaryAltarOfSubjugation.ts'
import type { LegendaryGreenSteelBonus } from '../../data/legendaryGreenSteelBonus.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'
import { sortObjectArray } from '../../utils/objectUtils.ts'
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

      state.activeAugments = sortObjectArray(
        [...altarOfFecundity]
          .filter((item: CraftingIngredient) => item.name.startsWith('Legendary Green Steel Augment'))
          .map((item: CraftingIngredient) => {
            return {
              ...item,
              name: item.name.replace('Legendary Green Steel Augment: ', '')
            }
          }),
        'name'
      )
    },
    resetFecundityItem: (state) => {
      state.selectedFecundityItem = undefined
      state.selectedInvasionItem = undefined
      state.selectedSubjugationItem = undefined
      state.selectedDevastationItem = undefined

      state.invasionItemFilters = []
      state.subjugationItemFilters = []
      state.devastationItemFilters = []
    },
    selectInvasionItem: (state, action: PayloadAction<CraftingIngredient>) => {
      state.selectedInvasionItem = action.payload
    },
    resetInvasionItem: (state) => {
      state.selectedInvasionItem = undefined
      state.invasionItemFilters = []
    },
    selectSubjugationItem: (state, action: PayloadAction<CraftingIngredient>) => {
      state.selectedSubjugationItem = action.payload
    },
    resetSubjugationItem: (state) => {
      state.selectedSubjugationItem = undefined
      state.subjugationItemFilters = []
    },
    selectDevastationItem: (state, action: PayloadAction<CraftingIngredient>) => {
      state.selectedDevastationItem = action.payload
    },
    resetDevastationItem: (state) => {
      state.selectedDevastationItem = undefined
      state.devastationItemFilters = []
    },
    setInvasionItemFilters: (state, action: PayloadAction<string[]>) => {
      state.invasionItemFilters = [...action.payload]
    },
    setSubjugationItemFilters: (state, action: PayloadAction<string[]>) => {
      state.subjugationItemFilters = [...action.payload]
    },
    setDevastationItemFilters: (state, action: PayloadAction<string[]>) => {
      state.devastationItemFilters = [...action.payload]
    },
    setInvasionFilterMode: (state, action: PayloadAction<'OR' | 'AND'>) => {
      state.invasionFilterMode = action.payload
    },
    setSubjugationFilterMode: (state, action: PayloadAction<'OR' | 'AND'>) => {
      state.subjugationFilterMode = action.payload
    },
    setDevastationFilterMode: (state, action: PayloadAction<'OR' | 'AND'>) => {
      state.devastationFilterMode = action.payload
    },
    setActiveAugment: (state, action: PayloadAction<CraftingIngredient | undefined>) => {
      state.selectedActiveAugment = action.payload
    },
    resetActiveAugment: (state) => {
      state.selectedActiveAugment = undefined
    },
    setBonusEffect: (state, action: PayloadAction<LegendaryGreenSteelBonus | undefined>) => {
      state.selectedBonusEffect = action.payload
    },
    resetBonusEffect: (state) => {
      state.selectedBonusEffect = undefined
    },
    setBonusEffectFilters: (state, action: PayloadAction<string[]>) => {
      state.bonusEffectFilters = [...action.payload]
    },
    setActiveAugmentFilters: (state, action: PayloadAction<string[]>) => {
      state.activeAugmentFilters = [...action.payload]
    },
    resetActiveAugmentFilters: (state) => {
      state.activeAugmentFilters = []
    },
    resetBonusEffectFilters: (state) => {
      state.bonusEffectFilters = []
    },
    setBonusEffectItemFilters: (state, action: PayloadAction<string[]>) => {
      state.bonusEffectFilters = [...action.payload]
    }
  }
})

export const {
  selectFecundityItem,
  resetFecundityItem,
  selectInvasionItem,
  resetInvasionItem,
  selectSubjugationItem,
  resetSubjugationItem,
  selectDevastationItem,
  resetDevastationItem,
  setInvasionItemFilters,
  setSubjugationItemFilters,
  setDevastationItemFilters,
  setInvasionFilterMode,
  setSubjugationFilterMode,
  setDevastationFilterMode,
  resetActiveAugmentFilters,
  resetBonusEffectFilters,
  setBonusEffectItemFilters,
  setActiveAugmentFilters,
  resetActiveAugment,
  setBonusEffect,
  setBonusEffectFilters,
  resetBonusEffect,
  setActiveAugment
} = actions

export default reducer

export interface LegendaryGreenSteelState {
  // Default lists
  fecundityItems: CraftingIngredient[]
  invasionItems: CraftingIngredient[]
  subjugationItems: CraftingIngredient[]
  devastationItems: CraftingIngredient[]
  activeAugments: CraftingIngredient[]
  bonusEffects: LegendaryGreenSteelBonus[]

  selectedFecundityItem: CraftingIngredient | undefined
  selectedInvasionItem: CraftingIngredient | undefined
  selectedSubjugationItem: CraftingIngredient | undefined
  selectedDevastationItem: CraftingIngredient | undefined
  selectedActiveAugment: CraftingIngredient | undefined
  selectedBonusEffect: LegendaryGreenSteelBonus | undefined

  invasionItemFilters: string[]
  subjugationItemFilters: string[]
  devastationItemFilters: string[]
  activeAugmentFilters: string[]
  bonusEffectFilters: string[]

  invasionFilterMode: 'OR' | 'AND'
  subjugationFilterMode: 'OR' | 'AND'
  devastationFilterMode: 'OR' | 'AND'
  activeAugmentFilterMode: 'OR' | 'AND'
  bonusEffectFilterMode: 'OR' | 'AND'
}
