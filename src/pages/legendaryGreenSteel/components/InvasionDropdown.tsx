import * as React from 'react'
import { useEffect, useState } from 'react'
import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import { resetInvasionItem, selectInvasionItem } from '../../../redux/slices/lgsSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import IngredientDropdownToggle from '../../heroicGreenSteel/components/IngredientDropdownToggle.tsx'
import useInvasion from '../hooks/useInvasion.ts'
import IngredientDropdownSection from './IngredientDropdownSection.tsx'

const InvasionDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedInvasionItem } = useAppSelector((state) => state.legendaryGreenSteel, shallowEqual)

  const { ingredientsMap } = useInvasion()

  const [label, setLabel] = useState<React.JSX.Element>(<></>)

  useEffect(() => {
    setLabel(
      <>
        <Col sm={1}>T1:</Col>
        <Col sm={11} className='d-flex justify-content-start'>
          <strong>
            <small>
              {selectedInvasionItem?.effectsAdded
                ? selectedInvasionItem.effectsAdded.map((effect) => effect.name).join(', ')
                : 'Select an Upgrade...'}
            </small>
          </strong>
        </Col>
      </>
    )
  }, [selectedInvasionItem])

  return (
    <>
      <hr />
      <small>Eldritch Altar of Invasion</small>
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
            {Object.entries(ingredientsMap).map(([name, ingredients]) => (
              <IngredientDropdownSection
                key={`${name}-${ingredients
                  .map((ingredient: CraftingIngredient) =>
                    (ingredient.effectsAdded as CraftingIngredient[]).map((effect: CraftingIngredient) => effect.name)
                  )
                  .join('-')}`}
                clickHandler={selectInvasionItem}
                header={
                  <Stack direction='horizontal' gap={2} className='align-items-center justify-content-center'>
                    {name}
                  </Stack>
                }
                ingredientList={ingredients}
              />
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {selectedInvasionItem && (
          <Button
            variant='outline-info'
            onClick={() => {
              dispatch(resetInvasionItem())
            }}
          >
            Reset
          </Button>
        )}
      </Stack>
    </>
  )
}

export default InvasionDropdown
