import { shallowEqual } from 'react-redux'
import BaseIngredientList, { type TierItem } from '../../../../../components/common/BaseIngredientList.tsx'
import { useAppSelector } from '../../../../../redux/hooks.ts'
import { allAltars } from '../../../common/helpers/elementalData.ts'
import useRecipeBuilder from '../../../common/hooks/useRecipeBuilder.ts'

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
      altarName: 'Altar of Invasion',
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
      altarName: 'Altar of Subjugation',
      selectedItem: selectedSubjugationItem
        ? {
            name: selectedSubjugationItem.name,
            requirements: selectedSubjugationItem.requirements ?? []
          }
        : null
    },
    {
      eventKey: '5',
      tier: 'Tier: 3 Basic',
      altarName: 'Altar of Devastation',
      selectedItem: selectedDevastationBasic
        ? {
            name: selectedDevastationBasic.name,
            requirements: selectedDevastationBasic.requirements ?? []
          }
        : null
    },
    {
      eventKey: '6',
      tier: 'Tier: 3 Focused',
      altarName: 'Altar of Devastation',
      selectedItem: selectedDevastationFocused
        ? {
            name: selectedDevastationFocused.name,
            requirements: selectedDevastationFocused.requirements ?? []
          }
        : null
    }
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

export default HeroicIngredientList
