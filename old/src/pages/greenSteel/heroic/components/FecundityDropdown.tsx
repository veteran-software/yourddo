import FilterableDropdown from '../../../../components/common/FilterableDropdown.tsx'
import useFecundity from '../../../../components/common/hooks/useFecundity.ts'
import { useAppDispatch } from '../../../../redux/hooks.ts'
import { resetFecundityItem, selectFecundityItem } from '../../../../redux/slices/hgsSlice.ts'
import type { AppDispatch } from '../../../../redux/store.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'

const FecundityDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { heroicSelectedFecundityItem, heroicWeaponList, heroicAccessoryList } = useFecundity('Heroic')

  return (
    <FilterableDropdown
      dropdownTriggerPrefix='B:'
      title='Eldritch Altar of Fecundity'
      items={{
        weapons: heroicWeaponList,
        accessories: heroicAccessoryList
      }}
      onSelect={(item: CraftingIngredient) => dispatch(selectFecundityItem(item))}
      onReset={() => dispatch(resetFecundityItem())}
      selectedItem={heroicSelectedFecundityItem}
      label={heroicSelectedFecundityItem ? heroicSelectedFecundityItem.name : 'Select Base Item...'}
      canFilter={false}
    />
  )
}

export default FecundityDropdown
