import { shallowEqual } from 'react-redux'
import BaseIngredientList, { type TierItem } from '../../../../components/common/BaseIngredientList.tsx'
import { altarOfFecundity } from '../../../../data/altarOfFecundity.ts'
import { legendaryAltarOfDevastation } from '../../../../data/legendaryAltarOfDevastation.ts'
import { legendaryAltarOfInvasion } from '../../../../data/legendaryAltarOfInvasion.ts'
import { legendaryAltarOfSubjugation } from '../../../../data/legendaryAltarOfSubjugation.ts'
import { useAppSelector } from '../../../../redux/hooks.ts'
import useRecipeBuilder from '../../common/hooks/useRecipeBuilder.ts'

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
    {
      eventKey: '2',
      tier: 'Base Item',
      altarName: 'Eldritch Altar of Fecundity',
      selectedItem: selectedFecundityItem
        ? {
            name: selectedFecundityItem.name,
            requirements: selectedFecundityItem.requirements ?? []
          }
        : null
    },
    {
      eventKey: '3',
      tier: 'Tier: 1',
      altarName: 'Legendary Altar of Invasion',
      selectedItem: selectedInvasionItem
        ? {
            name: selectedInvasionItem.name,
            requirements: selectedInvasionItem.requirements ?? []
          }
        : null
    },
    {
      eventKey: '4',
      tier: 'Tier: 2',
      altarName: 'Legendary Altar of Subjugation',
      selectedItem: selectedSubjugationItem
        ? {
            name: selectedSubjugationItem.name,
            requirements: selectedSubjugationItem.requirements ?? []
          }
        : null
    },
    {
      eventKey: '5',
      tier: 'Tier: 3',
      altarName: 'Legendary Altar of Devastation',
      selectedItem: selectedDevastationItem
        ? {
            name: selectedDevastationItem.name,
            requirements: selectedDevastationItem.requirements ?? []
          }
        : null
    },
    {
      eventKey: '6',
      tier: 'Active Augment',
      altarName: 'Eldritch Altar of Fecundity',
      selectedItem: selectedActiveAugment
        ? {
            name: selectedActiveAugment.name,
            requirements: selectedActiveAugment.requirements ?? []
          }
        : null
    }
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

export default LegendaryIngredientList
