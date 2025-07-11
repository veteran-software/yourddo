import { shallowEqual } from 'react-redux'
import { altarOfFecundity } from '../../../../data/altarOfFecundity.ts'
import { legendaryAltarOfDevastation } from '../../../../data/legendaryAltarOfDevastation.ts'
import { legendaryAltarOfInvasion } from '../../../../data/legendaryAltarOfInvasion.ts'
import { legendaryAltarOfSubjugation } from '../../../../data/legendaryAltarOfSubjugation.ts'
import { useAppSelector } from '../../../../redux/hooks'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import useRecipeBuilder from '../../common/hooks/useRecipeBuilder'
import BaseIngredientList, { type TierItem } from '../BaseIngredientList.tsx'
import { allAltars } from './elementalData.ts'

const createTierItem = (
  eventKey: string,
  tier: string,
  altarName: string,
  selectedItem: CraftingIngredient | undefined
): TierItem => ({
  eventKey,
  tier,
  altarName,
  selectedItem: selectedItem
    ? {
        name: selectedItem.name,
        requirements: selectedItem.requirements ?? []
      }
    : null
})

const HeroicIngredientList = () => {
  const {
    selectedFecundityItem,
    selectedSubjugationItem,
    selectedInvasionItem,
    selectedDevastationFocused,
    selectedDevastationBasic
  } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const { rawMaterials, craftedMaterials } = useRecipeBuilder('heroic')

  const tiers: TierItem[] = [
    createTierItem('2', 'Base Item', 'Eldritch Altar of Fecundity', selectedFecundityItem),
    createTierItem('3', 'Tier: 1', 'Altar of Invasion', selectedInvasionItem),
    createTierItem('4', 'Tier: 2', 'Altar of Subjugation', selectedSubjugationItem),
    createTierItem('5', 'Tier: 3 Basic', 'Altar of Devastation', selectedDevastationBasic),
    createTierItem('6', 'Tier: 3 Focused', 'Altar of Devastation', selectedDevastationFocused)
  ]

  return (
    <BaseIngredientList
      rawMaterials={rawMaterials}
      craftedMaterials={craftedMaterials}
      tiers={tiers}
      ingredientSources={allAltars}
    />
  )
}

const LegendaryIngredientList = () => {
  const {
    selectedFecundityItem,
    selectedSubjugationItem,
    selectedInvasionItem,
    selectedDevastationItem,
    selectedActiveAugment
  } = useAppSelector((state) => state.legendaryGreenSteel, shallowEqual)

  const { rawMaterials, craftedMaterials } = useRecipeBuilder('legendary')

  const ingredientSources = [
    ...legendaryAltarOfInvasion,
    ...legendaryAltarOfSubjugation,
    ...legendaryAltarOfDevastation,
    ...altarOfFecundity
  ]

  const tiers: TierItem[] = [
    createTierItem('2', 'Base Item', 'Eldritch Altar of Fecundity', selectedFecundityItem),
    createTierItem('3', 'Tier: 1', 'Legendary Altar of Invasion', selectedInvasionItem),
    createTierItem('4', 'Tier: 2', 'Legendary Altar of Subjugation', selectedSubjugationItem),
    createTierItem('5', 'Tier: 3', 'Legendary Altar of Devastation', selectedDevastationItem),
    createTierItem('6', 'Active Augment', 'Eldritch Altar of Fecundity', selectedActiveAugment)
  ]

  return (
    <BaseIngredientList
      rawMaterials={rawMaterials}
      craftedMaterials={craftedMaterials}
      tiers={tiers}
      ingredientSources={ingredientSources}
    />
  )
}

export { HeroicIngredientList, LegendaryIngredientList }
