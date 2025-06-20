import { type FC } from 'react'
import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import { resetDevastationBasic, selectDevastationItem } from '../../../redux/slices/hgsSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { useDevastationBasic } from '../hooks/useDevastationBasic.ts'
import IngredientDropdownSection from './IngredientDropdownSection.tsx'
import IngredientDropdownToggle from './IngredientDropdownToggle.tsx'

const DevastationBasicDropdown: FC = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedDevastationBasic, selectedDevastationFocused } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const { ingredientsMap } = useDevastationBasic()

  const label = (
    <>
      <Col sm={1} title='Tier 3: Basic'>
        T3-B:
      </Col>

      <Col sm={11} className='d-flex justify-content-start'>
        <strong>
          <small>
            {selectedDevastationBasic
              ? selectedDevastationBasic.effectsAdded?.map((effect: Enhancement) => effect.name).join(', ')
              : 'Select a Basic Upgrade...'}
          </small>
        </strong>
      </Col>
    </>
  )

  const renderSection = (name: string, ingredients: CraftingIngredient[]) => {
    return (
      <IngredientDropdownSection
        clickHandler={selectDevastationItem}
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
    <>
      <hr />

      <small>Altar of Devastation</small>

      <Stack direction='horizontal' gap={2}>
        <Dropdown className='d-flex flex-grow-1'>
          <IngredientDropdownToggle label={label} disabled={selectedDevastationFocused !== undefined} />

          <Dropdown.Menu className='py-0 w-100' style={{ maxHeight: '50vh', overflowY: 'auto' }}>
            {Object.entries(ingredientsMap).map(([element, ingredients]) => renderSection(element, ingredients))}
          </Dropdown.Menu>
        </Dropdown>

        {selectedDevastationBasic && (
          <Button
            variant='outline-info'
            onClick={() => {
              dispatch(resetDevastationBasic())
            }}
          >
            Reset
          </Button>
        )}
      </Stack>
    </>
  )
}

export default DevastationBasicDropdown
