import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import {
  resetInvasionItem,
  selectInvasionItem
} from '../../../redux/slices/hgsSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import useInvasion from '../hooks/useInvasion.ts'
import IngredientDropdownSection from './IngredientDropdownSection.tsx'
import IngredientDropdownToggle from './IngredientDropdownToggle.tsx'

const InvasionDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedInvasionItem } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const { affinities } = useInvasion()

  const label = (
    <>
      <Col sm={1}>T1:</Col>
      <Col sm={11} className='d-flex justify-content-start'>
        <strong>
          <small>
            {selectedInvasionItem?.effectsAdded
              ? selectedInvasionItem.effectsAdded
                  .map((effect) => effect.name)
                  .join(', ')
              : 'Select an Upgrade...'}
          </small>
        </strong>
      </Col>
    </>
  )

  return (
    <>
      <hr />
      <small>Eldritch Altar of Invasion</small>
      <Stack direction='horizontal' gap={2}>
        <Dropdown className='d-flex flex-grow-1'>
          <IngredientDropdownToggle label={label} />

          <Dropdown.Menu
            className='py-0 w-100'
            style={{ maxHeight: '50vh', overflowY: 'auto' }}
          >
            {affinities.map((affinity) => (
              <IngredientDropdownSection
                clickHandler={selectInvasionItem}
                headerText={affinity.name}
                header={
                  <Stack
                    direction='horizontal'
                    gap={2}
                    className='align-items-center justify-content-center'
                  >
                    {affinity.name}
                    <Stack direction='horizontal' gap={2}>
                      ({affinity.elements[0]})
                    </Stack>
                  </Stack>
                }
                ingredientList={affinity.ingredients}
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
