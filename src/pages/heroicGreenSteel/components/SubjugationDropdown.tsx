import { Dropdown, Stack } from 'react-bootstrap'
import { FaRepeat } from 'react-icons/fa6'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import { selectSubjugationItem } from '../../../redux/slices/hgsSlice.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import useAspects from '../hooks/useAspects.ts'
import IngredientDropdownSection from './IngredientDropdownSection.tsx'
import IngredientDropdownToggle from './IngredientDropdownToggle.tsx'

interface AspectList {
  name: string
  elements: string[]
  ingredients: CraftingIngredient[]
}

const SubjugationDropdown = () => {
  const { aspects } = useAspects()
  const { selectedSubjugationItem } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  return (
    <>
      <hr />

      <Stack direction='horizontal' gap={2}>
        <Dropdown className='d-flex flex-grow-1'>
          <IngredientDropdownToggle
            placeholderText={'Select an Upgrade...'}
            selectedIngredient={selectedSubjugationItem}
            craftingLocation='Altar of Subjugation'
          />

          <Dropdown.Menu
            className='py-0'
            style={{ maxHeight: '50vh', overflowY: 'auto' }}
          >
            {aspects.map((aspect: AspectList) => (
              <IngredientDropdownSection
                clickHandler={selectSubjugationItem}
                headerText={aspect.name}
                header={
                  <Stack
                    direction='horizontal'
                    gap={2}
                    className='align-items-center justify-content-center'
                  >
                    {aspect.name}
                    <Stack direction='horizontal' gap={2}>
                      ({aspect.elements[0]}
                      <FaRepeat size={10} />
                      {aspect.elements[0]})
                    </Stack>{' '}
                  </Stack>
                }
                ingredientList={aspect.ingredients}
              />
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Stack>
    </>
  )
}

export default SubjugationDropdown
