import { altarOfFecundity } from '../../data/altarOfFecundity.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'
import { isLgsWeaponOrAccessory } from '../../utils/objectUtils.ts'
import type { GreenSteelState } from '../slices/hgsSlice.ts'
import type { LegendaryGreenSteelState } from '../slices/lgsSlice.ts'

export const createInitialHgsState = (): GreenSteelState => ({
  devastationFocusedEffects: [],
  devastationFilterMode: 'OR',
  devastationItemFilters: [],
  devastationBasicItems: [],
  fecundityItems: [...altarOfFecundity].filter((item: CraftingIngredient) => item.name.startsWith('Green Steel')),
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

export const createInitialLgsState = (): LegendaryGreenSteelState => ({
  activeAugmentFilters: [],
  activeAugments: [],
  bonusEffectFilters: [],
  bonusEffects: [],
  devastationFilterMode: 'AND',
  devastationItemFilters: [],
  devastationItems: [],
  fecundityItems: [...altarOfFecundity].filter((item: CraftingIngredient) => isLgsWeaponOrAccessory(item.name)),
  invasionFilterMode: 'AND',
  invasionItemFilters: [],
  invasionItems: [],
  selectedActiveAugment: undefined,
  selectedBonusEffect: undefined,
  selectedDevastationItem: undefined,
  selectedFecundityItem: undefined,
  selectedInvasionItem: undefined,
  selectedSubjugationItem: undefined,
  subjugationFilterMode: 'AND',
  subjugationItemFilters: [],
  subjugationItems: []
})
