import { useEffect, useState } from 'react'
import { Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import { selectInvasionItem } from '../../../redux/slices/hgsSlice.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { filterForSublist } from '../../../utils/objectUtils.ts'
import IngredientDropdownSection from './IngredientDropdownSection.tsx'
import IngredientDropdownToggle from './IngredientDropdownToggle.tsx'

const InvasionDropdown = () => {
  const { invasionItems, selectedInvasionItem } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const [airItems, setAirItems] = useState<CraftingIngredient[]>([])
  const [earthItems, setEarthItems] = useState<CraftingIngredient[]>([])
  const [fireItems, setFireItems] = useState<CraftingIngredient[]>([])
  const [waterItems, setWaterItems] = useState<CraftingIngredient[]>([])
  const [negativeItems, setNegativeItems] = useState<CraftingIngredient[]>([])
  const [positiveItems, setPositiveItems] = useState<CraftingIngredient[]>([])

  useEffect(() => {
    setAirItems(filterForSublist(invasionItems, 'Air Affinity', 'effectsAdded'))
    setEarthItems(
      filterForSublist(invasionItems, 'Earth Affinity', 'effectsAdded')
    )
    setFireItems(
      filterForSublist(invasionItems, 'Fire Affinity', 'effectsAdded')
    )
    setWaterItems(
      filterForSublist(invasionItems, 'Water Affinity', 'effectsAdded')
    )
    setPositiveItems(
      filterForSublist(
        invasionItems,
        'Positive Energy Affinity',
        'effectsAdded'
      )
    )
    setNegativeItems(
      filterForSublist(
        invasionItems,
        'Negative Energy Affinity',
        'effectsAdded'
      )
    )
  }, [invasionItems])

  return (
    <>
      <hr />

      <Stack direction='horizontal' gap={2}>
        <Dropdown className='d-flex flex-grow-1'>
          <IngredientDropdownToggle
            placeholderText={'Select an Upgrade...'}
            selectedIngredient={selectedInvasionItem}
            craftingLocation='Altar of Invasion'
          />

          <Dropdown.Menu
            className='py-0'
            style={{ maxHeight: '50vh', overflowY: 'auto' }}
          >
            <IngredientDropdownSection
              clickHandler={selectInvasionItem}
              header={'Air Affinity'}
              ingredientList={airItems}
            />

            <IngredientDropdownSection
              clickHandler={selectInvasionItem}
              header={'Earth Affinity'}
              ingredientList={earthItems}
            />

            <IngredientDropdownSection
              clickHandler={selectInvasionItem}
              header={'Fire Affinity'}
              ingredientList={fireItems}
            />

            <IngredientDropdownSection
              clickHandler={selectInvasionItem}
              header={'Water Affinity'}
              ingredientList={waterItems}
            />

            <IngredientDropdownSection
              clickHandler={selectInvasionItem}
              header={'Positive Energy Affinity'}
              ingredientList={positiveItems}
            />

            <IngredientDropdownSection
              clickHandler={selectInvasionItem}
              header={'Negative Energy Affinity'}
              ingredientList={negativeItems}
            />
          </Dropdown.Menu>
        </Dropdown>
      </Stack>
    </>
  )
}

export default InvasionDropdown
