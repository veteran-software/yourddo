import { useEffect, useState } from 'react'
import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import FarmedIngredientDisplay from '../../../components/FarmedIngredientDisplay.tsx'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import { resetFecundityItem, selectFecundityItem } from '../../../redux/slices/hgsSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { filterForSublist } from '../../../utils/objectUtils.ts'
import IngredientDropdownToggle from './IngredientDropdownToggle.tsx'

const FecundityDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { fecundityItems, selectedFecundityItem } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const [weaponList, setWeaponList] = useState<CraftingIngredient[]>([])
  const [accessoryList, setAccessoryList] = useState<CraftingIngredient[]>([])

  useEffect(() => {
    setWeaponList(
      filterForSublist(fecundityItems, 'Weapon', 'ingredientType').toSorted((a, b) => a.name.localeCompare(b.name))
    )
    setAccessoryList(
      filterForSublist(fecundityItems, 'Accessory', 'ingredientType').toSorted((a, b) => a.name.localeCompare(b.name))
    )
  }, [fecundityItems])

  const label = (
    <>
      <Col sm={1}>B:</Col>
      <Col sm={11} className='d-flex justify-content-start'>
        <strong>
          <small>{selectedFecundityItem ? selectedFecundityItem.name : 'Select Base Item...'}</small>
        </strong>
      </Col>
    </>
  )

  return (
    <>
      <small>Eldritch Altar of Fecundity</small>
      <Stack direction='horizontal' gap={2}>
        <Dropdown className='d-flex flex-grow-1'>
          <IngredientDropdownToggle label={label} />

          <Dropdown.Menu
            className='py-0 w-100'
            style={{
              maxHeight: '50vh',
              overflowY: 'auto'
            }}
          >
            <Dropdown.Header className='border-bottom bg-light-subtle text-white'>
              <h6 className='m-0 text-center'>Weapons</h6>
            </Dropdown.Header>

            {weaponList.length > 0 &&
              weaponList.map((ingredient) => (
                <Dropdown.Item
                  key={ingredient.name}
                  onClick={() => {
                    dispatch(selectFecundityItem(ingredient))
                  }}
                >
                  <FarmedIngredientDisplay
                    ingredient={ingredient}
                    quantity={1}
                    showLocation={false}
                    showQuantity={false}
                  />
                </Dropdown.Item>
              ))}

            <Dropdown.Header className='border-bottom bg-light-subtle text-white'>
              <h6 className='m-0 text-center'>Accessories</h6>
            </Dropdown.Header>

            {accessoryList.length > 0 &&
              accessoryList.map((ingredient) => (
                <Dropdown.Item
                  key={ingredient.name}
                  onClick={() => {
                    dispatch(selectFecundityItem(ingredient))
                  }}
                >
                  <FarmedIngredientDisplay
                    ingredient={ingredient}
                    quantity={1}
                    showLocation={false}
                    showQuantity={false}
                  />
                </Dropdown.Item>
              ))}
          </Dropdown.Menu>
        </Dropdown>

        {selectedFecundityItem && (
          <Button
            variant='outline-info'
            onClick={() => {
              dispatch(resetFecundityItem())
            }}
          >
            Reset
          </Button>
        )}
      </Stack>
    </>
  )
}

export default FecundityDropdown
