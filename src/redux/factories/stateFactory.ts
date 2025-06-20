import { altarOfFecundity } from '../../data/altarOfFecundity.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'
import type { GreenSteelState } from '../slices/hgsSlice.ts'

export const createInitialState = (): GreenSteelState => ({
  devastationFocusedEffects: [],
  devastationFilterMode: 'OR',
  devastationItemFilters: [],
  devastationBasicItems: [],
  fecundityItems: altarOfFecundity.filter((item: CraftingIngredient) => item.name.startsWith('Green Steel')),
  invasionFilterMode: 'OR',
  invasionItemFilters: [],
  invasionItems: [],
  selectedDevastationBasic: undefined,
  selectedDevastationFocused: undefined,
  selectedFecundityItem: undefined,
  selectedInvasionItem: undefined,
  selectedSubjugationItem: undefined,
  selectedSubjugationSpell: undefined,
  subjugationFilterMode: 'OR',
  subjugationItemFilters: [],
  subjugationItems: []
})
