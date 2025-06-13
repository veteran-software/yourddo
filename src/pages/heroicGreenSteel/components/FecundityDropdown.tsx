import { useEffect, useState } from 'react'
import { Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import { selectFecundityItem } from '../../../redux/slices/hgsSlice.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { filterForSublist } from '../../../utils/objectUtils.ts'
import IngredientDropdownSection from './IngredientDropdownSection.tsx'
import IngredientDropdownToggle from './IngredientDropdownToggle.tsx'

const FecundityDropdown = () => {
  const { fecundityItems, selectedFecundityItem } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const [weaponList, setWeaponList] = useState<CraftingIngredient[]>([])
  const [accessoryList, setAccessoryList] = useState<CraftingIngredient[]>([])

  useEffect(() => {
    setWeaponList(filterForSublist(fecundityItems, 'Weapon', 'ingredientType'))
    setAccessoryList(
      filterForSublist(fecundityItems, 'Accessory', 'ingredientType')
    )
  }, [fecundityItems])

  return (
    <Stack direction='horizontal' gap={2}>
      <Dropdown className='d-flex flex-grow-1'>
        <IngredientDropdownToggle
          craftingLocation='Altar of Fecundity'
          selectedIngredient={selectedFecundityItem}
          placeholderText='Select Base Item...'
          fecundity
        />

        <Dropdown.Menu
          className='py-0'
          style={{ maxHeight: '50vh', overflowY: 'auto' }}
        >
          <IngredientDropdownSection
            clickHandler={selectFecundityItem}
            header='Weapons'
            ingredientList={weaponList}
            fecundity
          />

          <IngredientDropdownSection
            clickHandler={selectFecundityItem}
            header='Accessories'
            ingredientList={accessoryList}
            fecundity
          />
        </Dropdown.Menu>
      </Dropdown>
    </Stack>
  )
}

export default FecundityDropdown
