import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import CraftedIngredientDisplay from '../../../../components/common/CraftedIngredientDisplay.tsx'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks.ts'
import { resetActiveAugment, setActiveAugment } from '../../../../redux/slices/lgsSlice.ts'
import type { AppDispatch } from '../../../../redux/store.ts'
import type { Enhancement } from '../../../../types/core.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'

const ActiveAugment = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedActiveAugment, activeAugments } = useAppSelector((state) => state.legendaryGreenSteel, shallowEqual)

  return (
    <Stack direction='vertical' gap={0}>
      <small>Eldritch Altar of Fecundity : Active Augment</small>

      <Stack direction='horizontal' gap={2}>
        <Dropdown className='d-flex flex-grow-1'>
          <Dropdown.Toggle className='w-100 d-flex flex-row align-items-center justify-content-center border-light'>
            <Col sm={1}>Aug:</Col>
            <Col sm={11} className='d-flex justify-content-start'>
              <strong>
                <small>{selectedActiveAugment ? selectedActiveAugment.name : 'Select an Augment...'}</small>
              </strong>
            </Col>
          </Dropdown.Toggle>

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
                <CraftedIngredientDisplay
                  dropdownName={bonus.effectsAdded
                    ?.map((effect: Enhancement) => {
                      return `${effect.name}${
                        effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${effect.bonus})` : ''
                      }`
                    })
                    .toSorted((a: string, b: string) => a.localeCompare(b))
                    .join(', ')}
                  ingredient={bonus}
                  isDropdown
                  quantity={1}
                  showLocation={false}
                  showQuantity={false}
                  showPopover={false}
                />
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
    </Stack>
  )
}

export default ActiveAugment
