import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import {
  resetSubjugationItem,
  selectSubjugationItem
} from '../../../redux/slices/hgsSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { filterSublistByElement } from '../../../utils/objectUtils.ts'
import useSubjugation from '../hooks/useSubjugation.ts'
import IngredientDropdownSection from './IngredientDropdownSection.tsx'
import IngredientDropdownToggle from './IngredientDropdownToggle.tsx'

interface AspectList {
  name: string
  elements: string[]
  ingredients: CraftingIngredient[]
}

const SubjugationBasicDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { aspects } = useSubjugation()
  const { selectedSubjugationItem } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const label = (
    <>
      <Col sm={1}>T2:</Col>
      <Col sm={11} className='d-flex justify-content-start'>
        <strong>
          <small>
            {selectedSubjugationItem
              ? selectedSubjugationItem.effectsAdded
                  ?.slice(0, -1)
                  .map((effect) => effect.name)
                  .join(',')
              : 'Select an Upgrade...'}
          </small>
        </strong>
      </Col>
    </>
  )

  const renderSection = (
    name: string,
    element1: string,
    element2: string,
    ingredients: CraftingIngredient[]
  ) => {
    return (
      <IngredientDropdownSection
        clickHandler={selectSubjugationItem}
        header={
          <Stack
            direction='horizontal'
            gap={2}
            className='align-items-center justify-content-center'
          >
            {name}
            <Stack direction='horizontal' gap={2}>
              ({element1} | {element2})
            </Stack>
          </Stack>
        }
        ingredientList={ingredients}
      />
    )
  }

  return (
    <>
      <hr />

      <small>Altar of Subjugation</small>

      <Stack direction='horizontal' gap={2}>
        <Dropdown className='d-flex flex-grow-1'>
          <IngredientDropdownToggle label={label} />

          <Dropdown.Menu
            className='py-0'
            style={{ maxHeight: '50vh', overflowY: 'auto' }}
          >
            {aspects.map((aspect: AspectList) => {
              const first: string = aspect.elements[0]
              const second: string = aspect.elements[1]

              if (first === second) {
                return renderSection(
                  aspect.name,
                  first,
                  second,
                  aspect.ingredients
                )
              }

              return (
                <>
                  {renderSection(
                    aspect.name,
                    first,
                    second,
                    filterSublistByElement(aspect.ingredients, first)
                  )}
                  {renderSection(
                    aspect.name,
                    second,
                    first,
                    filterSublistByElement(aspect.ingredients, second)
                  )}
                </>
              )
            })}
          </Dropdown.Menu>
        </Dropdown>

        {selectedSubjugationItem && (
          <Button
            variant='outline-info'
            onClick={() => {
              dispatch(resetSubjugationItem())
            }}
          >
            Reset
          </Button>
        )}
      </Stack>
    </>
  )
}

export default SubjugationBasicDropdown
