import { Button, Col, Dropdown, Stack } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { type LegendaryGreenSteelBonus, legendaryGreenSteelBonus } from '../../../../data/legendaryGreenSteelBonus.ts'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks.ts'
import { resetBonusEffect, setBonusEffect } from '../../../../redux/slices/lgsSlice.ts'
import type { AppDispatch } from '../../../../redux/store.ts'
import IngredientDropdownToggle from '../../heroic/components/IngredientDropdownToggle.tsx'

const BonusEffectDropdown = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { selectedBonusEffect } = useAppSelector((state) => state.legendaryGreenSteel, shallowEqual)

  const label = (
    <>
      <Col sm={1} title='Legendary Green Steel : Bonus Effect'>
        <small>Bonus:</small>
      </Col>

      <Col sm={11} className='d-flex justify-content-start'>
        <strong>
          <small>{selectedBonusEffect ? selectedBonusEffect.name : 'Select a Bonus...'}</small>
        </strong>
      </Col>
    </>
  )

  return (
    <Stack direction='vertical' gap={0}>
      <small>Bonus Effect</small>

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
            {legendaryGreenSteelBonus.map((bonus: LegendaryGreenSteelBonus) => (
              <Dropdown.Item
                key={bonus.name}
                onClick={() => {
                  dispatch(setBonusEffect(bonus))
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

        {selectedBonusEffect && (
          <Button
            variant='outline-info'
            onClick={() => {
              dispatch(resetBonusEffect())
            }}
          >
            Reset
          </Button>
        )}
      </Stack>
    </Stack>
  )
}

export default BonusEffectDropdown
