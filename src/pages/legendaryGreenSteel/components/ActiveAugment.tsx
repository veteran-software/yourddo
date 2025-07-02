import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import { resetActiveAugment, setActiveAugment } from '../../../redux/slices/lgsSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import IngredientDropdownToggle from '../../heroicGreenSteel/components/IngredientDropdownToggle.tsx'

const ActiveAugment = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedActiveAugment, activeAugments } = useAppSelector((state) => state.legendaryGreenSteel, shallowEqual)

  const label = (
    <>
      <Col sm={1} title='Legendary Green Steel : Active Augment'>
        <small>Aug:</small>
      </Col>

      <Col sm={11} className='d-flex justify-content-start'>
        <strong>
          <small>{selectedActiveAugment ? selectedActiveAugment.name : 'Select an Augment...'}</small>
        </strong>
      </Col>
    </>
  )

  return (
    <>
      <hr />
      <small>Active Augment</small>

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
            {activeAugments.map((bonus: CraftingIngredient) => (
              <Dropdown.Item
                key={bonus.name}
                onClick={() => {
                  dispatch(setActiveAugment(bonus))
                }}
              >
                <Stack direction='vertical' gap={1} title={bonus.description}>
                  <small>
                    <strong>{bonus.name}</strong>
                  </small>
                  <small>
                    <em>&nbsp;&nbsp;{bonus.description}</em>
                  </small>
                </Stack>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {selectedActiveAugment && (
          <Button
            variant='outline-info'
            onClick={() => {
              dispatch(resetActiveAugment())
            }}
          >
            Reset
          </Button>
        )}
      </Stack>
    </>
  )
}

export default ActiveAugment
