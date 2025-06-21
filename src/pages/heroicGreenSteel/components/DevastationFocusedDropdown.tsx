import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import { resetDevastationFocused, selectDevastationFocused } from '../../../redux/slices/hgsSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import useDevastationFocused from '../hooks/useDevastationFocused.ts'
import IngredientDropdownSection from './IngredientDropdownSection.tsx'
import IngredientDropdownToggle from './IngredientDropdownToggle.tsx'

const DevastationFocusedDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedDevastationFocused, selectedDevastationBasic } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const { ingredientsMap } = useDevastationFocused()

  const label = (
    <>
      <Col sm={1} title='Tier 3: Focused'>
        T3-F:
      </Col>

      <Col sm={11} className='d-flex justify-content-start'>
        <strong>
          <small>
            {selectedDevastationFocused
              ? selectedDevastationFocused.effectsAdded?.map((effect: Enhancement) => effect.name).join(', ')
              : 'Select a Focused Upgrade...'}
          </small>
        </strong>
      </Col>
    </>
  )

  const renderSection = (name: string, ingredients: CraftingIngredient[]) => {
    return (
      <IngredientDropdownSection
        clickHandler={selectDevastationFocused}
        header={
          <Stack direction='horizontal' gap={2} className='align-items-center justify-content-center'>
            {name}
          </Stack>
        }
        ingredientList={ingredients}
      />
    )
  }

  return (
    <Stack direction='horizontal' gap={2} className='mt-2'>
      <Dropdown className='d-flex flex-grow-1'>
        <IngredientDropdownToggle label={label} disabled={selectedDevastationBasic !== undefined} />

        <Dropdown.Menu className='py-0 w-100' style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          {Object.entries(ingredientsMap).map(([element, ingredients]) => {
            return renderSection(element, ingredients)
          })}
        </Dropdown.Menu>
      </Dropdown>

      {selectedDevastationFocused && (
        <Button
          variant='outline-info'
          onClick={() => {
            dispatch(resetDevastationFocused())
          }}
        >
          Reset
        </Button>
      )}
    </Stack>
  )
}

export default DevastationFocusedDropdown
