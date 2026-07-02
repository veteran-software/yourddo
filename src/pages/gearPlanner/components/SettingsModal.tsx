import { Accordion, Button, Col, Form, Modal, Row, Stack } from 'react-bootstrap'
import { updateSetup as updateSetupAction } from '../../../redux/slices/gearPlannerSlice'
import type { AppDispatch } from '../../../redux/store'
import { ARMOR_TYPES, GEAR_CLASSES, type GearSetup, SHIELD_TYPES, WEAPON_TYPES } from '../types'
import WeaponCategory from './WeaponCategory'

interface SettingsModalProps {
  show: boolean
  onHide: () => void
  activeSetup: GearSetup
  dispatch: AppDispatch
  updateClassProficiencies: (setup: GearSetup, oldClasses: (string | null)[], newClasses: (string | null)[]) => void
}

const SettingsModal = ({ show, onHide, activeSetup, dispatch, updateClassProficiencies }: SettingsModalProps) => (
  <Modal show={show} onHide={onHide} centered size='xl'>
    <Modal.Header closeButton className='bg-primary text-white'>
      <Modal.Title>Gear Set Settings</Modal.Title>
    </Modal.Header>

    <Modal.Body className='bg-dark text-white p-4'>
      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className='mb-4' controlId='gear-planner-setup-name'>
              <Form.Label className='fw-bold text-info'>Setup Name</Form.Label>

              <Form.Control
                type='text'
                value={activeSetup.name}
                className='bg-light text-dark'
                onChange={(e) => {
                  dispatch(
                    updateSetupAction({
                      id: activeSetup.id,
                      name: e.target.value
                    })
                  )
                }}
              />
            </Form.Group>

            <Row className='mb-4'>
              <Col xs={6}>
                <Form.Group controlId='gear-planner-min-level'>
                  <Form.Label className='fw-bold text-info'>Min Level</Form.Label>

                  <Form.Control
                    type='number'
                    min={1}
                    max={34}
                    value={activeSetup.minLevel}
                    className='bg-light text-dark'
                    onChange={(e) => {
                      dispatch(
                        updateSetupAction({
                          id: activeSetup.id,
                          minLevel: Number(e.target.value)
                        })
                      )
                    }}
                  />
                </Form.Group>
              </Col>

              <Col xs={6}>
                <Form.Group controlId='gear-planner-max-level'>
                  <Form.Label className='fw-bold text-info'>Max Level</Form.Label>

                  <Form.Control
                    type='number'
                    min={1}
                    max={34}
                    value={activeSetup.maxLevel}
                    className='bg-light text-dark'
                    onChange={(e) => {
                      dispatch(
                        updateSetupAction({
                          id: activeSetup.id,
                          maxLevel: Number(e.target.value)
                        })
                      )
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-3'>
              <Form.Label className='fw-bold text-info'>Classes (Up to 3)</Form.Label>

              <Stack gap={2}>
                {[0, 1, 2].map((idx) => (
                  <Form.Select
                    key={idx}
                    value={activeSetup.classes[idx] ?? ''}
                    className='bg-light text-dark'
                    onChange={(e) => {
                      const newClasses = [...activeSetup.classes]
                      newClasses[idx] = e.target.value || null

                      const setupUpdate: Partial<GearSetup> & { id: string } = {
                        id: activeSetup.id,
                        classes: newClasses
                      }

                      const tempSetup = {
                        ...activeSetup,
                        classes: newClasses
                      }

                      updateClassProficiencies(tempSetup, activeSetup.classes, newClasses)

                      setupUpdate.weaponFilters = tempSetup.weaponFilters
                      setupUpdate.armorFilters = tempSetup.armorFilters
                      setupUpdate.shieldFilters = tempSetup.shieldFilters

                      dispatch(updateSetupAction(setupUpdate))
                    }}
                  >
                    <option value=''>Select Class...</option>

                    {GEAR_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </Form.Select>
                ))}
              </Stack>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className='mb-3'>
              <Form.Label className='fw-bold text-info d-block'>Weapon Type Filters</Form.Label>

              <Accordion data-bs-theme='dark' className='border border-secondary rounded overflow-hidden'>
                {Object.entries(WEAPON_TYPES).map(([category, types]) => (
                  <WeaponCategory
                    key={category}
                    category={category}
                    types={types}
                    activeSetup={activeSetup}
                    dispatch={dispatch}
                  />
                ))}
              </Accordion>
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label className='fw-bold text-info d-block'>Armor Type Filters</Form.Label>

              <div className='p-2 border border-secondary rounded mb-3'>
                <Row>
                  {ARMOR_TYPES.map((type) => (
                    <Col xs={12} md={6} key={type}>
                      <Form.Check
                        type='checkbox'
                        id={`armor-${type}`}
                        label={type}
                        checked={activeSetup.armorFilters.includes(type)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...activeSetup.armorFilters, type]
                            : activeSetup.armorFilters.filter((t) => t !== type)
                          dispatch(
                            updateSetupAction({
                              id: activeSetup.id,
                              armorFilters: updated
                            })
                          )
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              </div>

              <Form.Label className='fw-bold text-info d-block'>Shield & Off-hand Type Filters</Form.Label>

              <div className='p-2 border border-secondary rounded mb-3'>
                <Row>
                  {SHIELD_TYPES.map((type) => (
                    <Col xs={12} md={6} key={type}>
                      <Form.Check
                        type='checkbox'
                        id={`shield-${type}`}
                        label={type}
                        checked={activeSetup.shieldFilters.includes(type)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...activeSetup.shieldFilters, type]
                            : activeSetup.shieldFilters.filter((t) => t !== type)
                          dispatch(
                            updateSetupAction({
                              id: activeSetup.id,
                              shieldFilters: updated
                            })
                          )
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              </div>

              <Form.Label className='fw-bold text-info d-block'>Character Settings</Form.Label>

              <div className='p-2 border border-secondary rounded'>
                <Form.Check
                  type='checkbox'
                  id='druid-metal-override'
                  label='Allow Metal (Druidic Oath Override)'
                  checked={activeSetup.allowMetalWithDruid}
                  disabled={!activeSetup.classes.includes('Druid')}
                  onChange={(e) => {
                    dispatch(
                      updateSetupAction({
                        id: activeSetup.id,
                        allowMetalWithDruid: e.target.checked
                      })
                    )
                  }}
                />

                {!activeSetup.classes.includes('Druid') && (
                  <div className='text-muted small mt-0'>
                    <small>Only applicable if Druid class is selected.</small>
                  </div>
                )}
              </div>
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </Modal.Body>

    <Modal.Footer className='bg-primary border-top-0'>
      <Button variant='light' onClick={onHide}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
)

export default SettingsModal
