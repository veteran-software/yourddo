import { Stack } from 'react-bootstrap'
import { titleCase } from 'title-case'
import FilterableDropdown from '../../../../components/common/FilterableDropdown.tsx'
import useFecundity from '../../../../components/common/hooks/useFecundity.ts'
import FarmedIngredientDisplay from '../../../../components/FarmedIngredientDisplay.tsx'
import { useAppDispatch } from '../../../../redux/hooks.ts'
import { resetFecundityItem, selectFecundityItem } from '../../../../redux/slices/lgsSlice.ts'
import type { AppDispatch } from '../../../../redux/store.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'

const FecundityDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { legendarySelectedFecundityItem, legendaryWeaponList, legendaryAccessoryList } = useFecundity('Legendary')

  return (
    <FilterableDropdown
      canFilter={false}
      dropdownTriggerPrefix='B:'
      title='Eldritch Altar of Fecundity'
      items={{
        weapons: legendaryWeaponList,
        accessories: legendaryAccessoryList
      }}
      onSelect={(item: CraftingIngredient) => dispatch(selectFecundityItem(item))}
      onReset={() => dispatch(resetFecundityItem())}
      selectedItem={legendarySelectedFecundityItem}
      label={legendarySelectedFecundityItem ? legendarySelectedFecundityItem.name : 'Select Base Item...'}
      renderSectionHeader={(name: string) => (
        <Stack direction='horizontal' gap={2} className='align-items-center justify-content-center'>
          {titleCase(name)}
        </Stack>
      )}
      renderSectionBody={(ingredient: CraftingIngredient) => (
        <FarmedIngredientDisplay ingredient={ingredient} quantity={1} showLocation={false} showQuantity={false} />
      )}
    />
  )
}

export default FecundityDropdown
