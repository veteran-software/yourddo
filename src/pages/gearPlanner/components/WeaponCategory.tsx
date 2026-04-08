import { Accordion, Col, Form, Row } from 'react-bootstrap'
import { useAppDispatch } from '../../../redux/hooks.ts'
import {
  updateSetup as updateSetupAction
} from '../../../redux/slices/gearPlannerSlice.ts'
import type { GearSetup } from '../types.ts'

const WeaponCategory = (props: Props) => {
  const { activeSetup, category, dispatch, types } = props

  return (
    <Accordion.Item eventKey={category} key={category} className='border-0'>
      <Accordion.Header className='bg-dark py-1'>{category} Weapons</Accordion.Header>

      <Accordion.Body className='bg-dark-subtle p-2'>
        <Row>
          {types.map((type) => (
            <Col xs={12} md={6} key={type}>
              <Form.Check
                type='checkbox'
                id={`weapon-${type}`}
                label={type}
                checked={activeSetup.weaponFilters.includes(type)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...activeSetup.weaponFilters, type]
                    : activeSetup.weaponFilters.filter((t) => t !== type)
                  dispatch(updateSetupAction({ id: activeSetup.id, weaponFilters: updated }))
                }}
              />
            </Col>
          ))}
        </Row>
      </Accordion.Body>
    </Accordion.Item>
  )
}

interface Props {
  category: string
  types: string[]
  activeSetup: GearSetup
  dispatch: ReturnType<typeof useAppDispatch>
}

export default WeaponCategory
