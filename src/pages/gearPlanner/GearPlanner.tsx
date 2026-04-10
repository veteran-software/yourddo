import { useEffect, useRef, useState } from 'react'
import {
  Accordion,
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Stack,
  Tab,
  Tabs
} from 'react-bootstrap'
import {
  FaChevronRight,
  FaGear,
  FaLayerGroup,
  FaLink,
  FaMagnifyingGlass,
  FaXmark
} from 'react-icons/fa6'
import { useLocation, useNavigate } from 'react-router-dom'
import PermalinkModal from '../../components/common/PermalinkModal.tsx'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  addSetup as addSetupAction,
  setActiveSetup as setActiveSetupAction,
  updateSetup as updateSetupAction
} from '../../redux/slices/gearPlannerSlice'
import CharacterSettingsSidebar from './components/CharacterSettingsSidebar.tsx'
import EnchantmentSearchOffcanvas
  from './components/EnchantmentSearchOffcanvas.tsx'
import EnchantmentsSummary from './components/EnhancementsSummary.tsx'
import FiligreeModal from './components/FiligreeModal.tsx'
import ItemBrowserOffcanvas from './components/ItemBrowserOffcanvas.tsx'
import SetBonusBrowserOffcanvas from './components/SetBonusBrowserOffcanvas.tsx'
import SetBonusesSummary from './components/SetBonusesSummary.tsx'
import WeaponCategory from './components/WeaponCategory.tsx'
import useGearPlanner from './hooks/useGearPlanner.tsx'
import {
  buildPermalinkUrl,
  encodeGearPermalink,
  readGpFromUrl,
  removeGpFromUrl,
  tryDecodeGearPermalink
} from './permalink.ts'
import {
  ARMOR_TYPES,
  ARTIFICER_PET_SLOTS,
  DRUID_PET_SLOTS,
  GEAR_CLASSES,
  GEAR_SLOTS,
  type GearItem,
  type GearSetup,
  GearSlot,
  SHIELD_TYPES,
  WEAPON_TYPES
} from './types'
import './GearPlanner.css'

const GearPlanner = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    characterSetups: setups,
    activeSetupId,
    artificerPet,
    druidPet
  } = useAppSelector((state) => state.gearPlanner)
  const { troveData } = useAppSelector((state) => state.app)

  const [showConflicts, setShowConflicts] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showPermalink, setShowPermalink] = useState(false)
  const [showEnchantmentSearch, setShowEnchantmentSearch] = useState(false)
  const [showSetBonusBrowser, setShowSetBonusBrowser] = useState(false)
  const [showFiligreeModal, setShowFiligreeModal] = useState(false)
  const [filigreeTarget, setFiligreeTarget] = useState<{
    item: GearItem
    slot: GearSlot
  } | null>(null)
  const [browsingSet, setBrowsingSet] = useState<string | null>(null)
  const [setBonusFilter, setSetBonusFilter] = useState<string | null>(null)
  const [enchantmentSearch, setEnchantmentSearch] = useState('')
  const [itemNameSearch] = useState('')
  const observerTarget = useRef<HTMLDivElement>(null)

  const gpHook = useGearPlanner({
    enchantmentSearch,
    itemNameSearch,
    setBonusFilter,
    setBrowsingSet,
    showConflicts
  })

  useEffect(() => {
    window.openFiligreeModal = (item: GearItem, slot: GearSlot) => {
      setFiligreeTarget({ item, slot })
      window.filigreeTarget = { item, slot }
      setShowFiligreeModal(true)
    }
    return () => {
      delete window.openFiligreeModal
      delete window.filigreeTarget
    }
  }, [])

  // Handle permalink from URL
  useEffect(() => {
    if (gpHook.loading) return

    const { gp, source } = readGpFromUrl(location)

    if (gp) {
      const result = tryDecodeGearPermalink(
        gp,
        gpHook.allItems,
        gpHook.allAugments,
        gpHook.allCurses
      )

      if (result.ok) {
        const importedSetup = {
          ...result.data,
          name: `${result.data.name} (Imported)`
        }
        dispatch(addSetupAction(importedSetup))
        dispatch(setActiveSetupAction(importedSetup.id))
      }

      void removeGpFromUrl(navigate, location, source)
    }
  }, [
    dispatch,
    gpHook.allAugments,
    gpHook.allCurses,
    gpHook.allItems,
    gpHook.loading,
    location,
    navigate
  ])

  if (gpHook.loading) {
    return (
      <Container className='py-4 text-center'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading Gear Data...</span>
        </div>
        <p className='mt-2' aria-hidden='true'>
          Loading Gear Data...
        </p>
      </Container>
    )
  }

  if (!gpHook.activeSetup) {
    return (
      <Container className='py-4'>
        <Card className='shadow'>
          <Card.Body className='text-center py-5'>
            <h4 className='text-muted'>No gear setups available.</h4>
            <Button
              variant='primary'
              className='mt-3'
              onClick={gpHook.addSetup}
            >
              Create Default Setup
            </Button>
          </Card.Body>
        </Card>
      </Container>
    )
  }

  return (
    <div className='gear-planner-container'>
      <Button
        variant='primary'
        className='gear-planner-sidebar-toggle shadow-sm'
        onClick={() => {
          setShowSidebar(!showSidebar)
        }}
        title='Toggle Settings Sidebar'
      >
        <FaChevronRight
          className={showSidebar ? 'rotate-180' : ''}
          style={{ transition: 'transform 0.3s' }}
        />
      </Button>

      <CharacterSettingsSidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        activeSetup={gpHook.activeSetup}
      />

      <Container fluid='lg' className='py-4'>
        <Card className='shadow'>
          <Card.Header className='bg-primary text-white py-3'>
            <Row className='align-items-center g-3'>
              <Col xs={12} md='auto'>
                <h2 className='mb-0'>Gear Planner</h2>
              </Col>

              <Col xs={12} md className='ms-md-auto'>
                <div className='d-flex justify-content-md-end gap-2'>
                  <Button
                    variant='light'
                    size='sm'
                    className='d-flex align-items-center gap-2'
                    onClick={() => {
                      setShowSetBonusBrowser(true)
                    }}
                  >
                    <FaLayerGroup /> Browse Set Bonuses
                  </Button>

                  <Button
                    variant='light'
                    size='sm'
                    className='d-flex align-items-center gap-2'
                    onClick={() => {
                      setShowEnchantmentSearch(true)
                    }}
                  >
                    <FaMagnifyingGlass /> Search Enchantments/Sets
                  </Button>
                </div>
              </Col>

              <Col
                xs={12}
                md='auto'
                className='d-flex gap-2 justify-content-md-end'
              >
                <ButtonGroup>
                  <Button
                    variant='outline-light'
                    size='sm'
                    className='d-flex align-items-center gap-2'
                    onClick={() => {
                      setShowPermalink(true)
                    }}
                  >
                    <FaLink /> Permalink
                  </Button>

                  <Button
                    variant='outline-light'
                    size='sm'
                    className='d-flex align-items-center gap-2'
                    onClick={() => {
                      setShowSettings(true)
                    }}
                  >
                    <FaGear /> Setup Settings
                  </Button>

                  <Button
                    variant='outline-light'
                    size='sm'
                    onClick={gpHook.addSetup}
                  >
                    Add Setup
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
          </Card.Header>

          <Card.Body>
            <Tabs
              id='gear-setup-tabs'
              activeKey={activeSetupId}
              onSelect={(k) => {
                if (k) {
                  dispatch(setActiveSetupAction(k))
                }
              }}
              className='mb-4'
            >
              {setups.map((setup) => (
                <Tab
                  key={setup.id}
                  eventKey={setup.id}
                  title={
                    <Stack direction='horizontal' gap={2}>
                      <span>{setup.name}</span>
                      {setups.length > 1 && (
                        <Button
                          variant='link'
                          className='p-0 text-danger'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation()
                            gpHook.deleteSetup(setup.id)
                          }}
                        >
                          <FaXmark />
                        </Button>
                      )}
                    </Stack>
                  }
                >
                  <div className='mt-3'>
                    <h5 className='mb-3 border-bottom pb-2'>Equipped Items</h5>

                    <Row>
                      {GEAR_SLOTS.map((slot) => gpHook.renderSlot(slot, setup))}
                    </Row>

                    <SetBonusesSummary
                      equippedItems={gpHook.characterEquipped}
                      slottedAugments={gpHook.activeSetup.slottedAugments}
                      onSetClick={gpHook.openSetBrowser}
                    />

                    <EnchantmentsSummary
                      equippedItems={gpHook.characterEquipped}
                      slottedAugments={gpHook.activeSetup.slottedAugments}
                      slottedCurses={gpHook.activeSetup.slottedCurses}
                      slottedFiligrees={gpHook.activeSetup.slottedFiligrees}
                    />

                    {setup.classes?.includes('Artificer') &&
                      setup.classes?.includes('Druid') && (
                        <div className='mt-3 p-2 bg-warning-subtle text-warning-emphasis border border-warning rounded small text-center fw-bold'>
                          Note: Only one pet may be active at a time.
                        </div>
                      )}

                    {setup.classes?.includes('Artificer') && (
                      <div className='mt-4 p-3 border border-info rounded bg-dark-subtle'>
                        <h5 className='mb-3 text-info border-bottom border-info pb-2'>
                          Iron Defender (Artificer Pet)
                        </h5>

                        <Row>
                          {ARTIFICER_PET_SLOTS.map((slot) =>
                            gpHook.renderSlot(slot, setup)
                          )}
                        </Row>

                        <SetBonusesSummary
                          equippedItems={gpHook.artificerEquipped}
                          slottedAugments={artificerPet.slottedAugments}
                          onSetClick={gpHook.openSetBrowser}
                        />

                        <EnchantmentsSummary
                          equippedItems={gpHook.artificerEquipped}
                          slottedAugments={artificerPet.slottedAugments}
                          slottedCurses={artificerPet.slottedCurses}
                          slottedFiligrees={artificerPet.slottedFiligrees}
                        />
                      </div>
                    )}

                    {setup.classes?.includes('Druid') && (
                      <div className='mt-4 p-3 border border-success rounded bg-dark-subtle'>
                        <h5 className='mb-3 text-success border-bottom border-success pb-2'>
                          Wolf Companion (Druid Pet)
                        </h5>

                        <Row>
                          {DRUID_PET_SLOTS.map((slot) =>
                            gpHook.renderSlot(slot, setup)
                          )}
                        </Row>

                        <SetBonusesSummary
                          equippedItems={gpHook.druidEquipped}
                          slottedAugments={druidPet.slottedAugments}
                          onSetClick={gpHook.openSetBrowser}
                        />

                        <EnchantmentsSummary
                          equippedItems={gpHook.druidEquipped}
                          slottedAugments={druidPet.slottedAugments}
                          slottedCurses={druidPet.slottedCurses}
                          slottedFiligrees={druidPet.slottedFiligrees}
                        />
                      </div>
                    )}
                  </div>
                </Tab>
              ))}
            </Tabs>
          </Card.Body>
        </Card>

        <Modal
          show={showSettings}
          onHide={() => {
            setShowSettings(false)
          }}
          centered
          size='xl'
        >
          <Modal.Header closeButton className='bg-primary text-white'>
            <Modal.Title>Gear Setup Settings</Modal.Title>
          </Modal.Header>

          <Modal.Body className='bg-dark text-white p-4'>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-4'>
                    <Form.Label className='fw-bold text-info'>
                      Setup Name
                    </Form.Label>
                    <Form.Control
                      type='text'
                      value={gpHook.activeSetup.name}
                      className='bg-light text-dark'
                      onChange={(e) => {
                        dispatch(
                          updateSetupAction({
                            id: gpHook.activeSetup.id,
                            name: e.target.value
                          })
                        )
                      }}
                    />
                  </Form.Group>

                  <Row className='mb-4'>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className='fw-bold text-info'>
                          Min Level
                        </Form.Label>
                        <Form.Control
                          type='number'
                          min={1}
                          max={34}
                          value={gpHook.activeSetup.minLevel}
                          className='bg-light text-dark'
                          onChange={(e) => {
                            dispatch(
                              updateSetupAction({
                                id: gpHook.activeSetup.id,
                                minLevel: Number(e.target.value)
                              })
                            )
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className='fw-bold text-info'>
                          Max Level
                        </Form.Label>
                        <Form.Control
                          type='number'
                          min={1}
                          max={34}
                          value={gpHook.activeSetup.maxLevel}
                          className='bg-light text-dark'
                          onChange={(e) => {
                            dispatch(
                              updateSetupAction({
                                id: gpHook.activeSetup.id,
                                maxLevel: Number(e.target.value)
                              })
                            )
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold text-info'>
                      Classes (Up to 3)
                    </Form.Label>

                    <Stack gap={2}>
                      {[0, 1, 2].map((idx) => (
                        <Form.Select
                          key={idx}
                          value={gpHook.activeSetup.classes[idx] ?? ''}
                          className='bg-light text-dark'
                          onChange={(e) => {
                            const newClasses = [...gpHook.activeSetup.classes]
                            newClasses[idx] = e.target.value || null

                            const setupUpdate: Partial<GearSetup> = {
                              id: gpHook.activeSetup.id,
                              classes: newClasses
                            }

                            // Helper to calculate proficiencies
                            const tempSetup = {
                              ...gpHook.activeSetup,
                              classes: newClasses
                            }

                            gpHook.updateClassProficiencies(
                              tempSetup,
                              gpHook.activeSetup.classes,
                              newClasses
                            )

                            setupUpdate.weaponFilters = tempSetup.weaponFilters
                            setupUpdate.armorFilters = tempSetup.armorFilters
                            setupUpdate.shieldFilters = tempSetup.shieldFilters

                            dispatch(
                              updateSetupAction(setupUpdate as GearSetup)
                            )
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
                    <Form.Label className='fw-bold text-info d-block'>
                      Weapon Type Filters
                    </Form.Label>

                    <Accordion
                      data-bs-theme='dark'
                      className='border border-secondary rounded overflow-hidden'
                    >
                      {Object.entries(WEAPON_TYPES).map(([category, types]) => (
                        <WeaponCategory
                          key={category}
                          category={category}
                          types={types}
                          activeSetup={gpHook.activeSetup}
                          dispatch={dispatch}
                        />
                      ))}
                    </Accordion>
                  </Form.Group>

                  <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold text-info d-block'>
                      Armor Type Filters
                    </Form.Label>

                    <div className='p-2 border border-secondary rounded mb-3'>
                      <Row>
                        {ARMOR_TYPES.map((type) => (
                          <Col xs={12} md={6} key={type}>
                            <Form.Check
                              type='checkbox'
                              id={`armor-${type}`}
                              label={type}
                              checked={gpHook.activeSetup.armorFilters.includes(
                                type
                              )}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...gpHook.activeSetup.armorFilters, type]
                                  : gpHook.activeSetup.armorFilters.filter(
                                      (t) => t !== type
                                    )
                                dispatch(
                                  updateSetupAction({
                                    id: gpHook.activeSetup.id,
                                    armorFilters: updated
                                  })
                                )
                              }}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>

                    <Form.Label className='fw-bold text-info d-block'>
                      Shield & Off-hand Type Filters
                    </Form.Label>

                    <div className='p-2 border border-secondary rounded mb-3'>
                      <Row>
                        {SHIELD_TYPES.map((type) => (
                          <Col xs={12} md={6} key={type}>
                            <Form.Check
                              type='checkbox'
                              id={`shield-${type}`}
                              label={type}
                              checked={gpHook.activeSetup.shieldFilters.includes(
                                type
                              )}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...gpHook.activeSetup.shieldFilters, type]
                                  : gpHook.activeSetup.shieldFilters.filter(
                                      (t) => t !== type
                                    )
                                dispatch(
                                  updateSetupAction({
                                    id: gpHook.activeSetup.id,
                                    shieldFilters: updated
                                  })
                                )
                              }}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>

                    <Form.Label className='fw-bold text-info d-block'>
                      Character Settings
                    </Form.Label>
                    <div className='p-2 border border-secondary rounded'>
                      <Form.Check
                        type='checkbox'
                        id='druid-metal-override'
                        label='Allow Metal (Druidic Oath Override)'
                        checked={gpHook.activeSetup.allowMetalWithDruid}
                        disabled={!gpHook.activeSetup.classes.includes('Druid')}
                        onChange={(e) => {
                          dispatch(
                            updateSetupAction({
                              id: gpHook.activeSetup.id,
                              allowMetalWithDruid: e.target.checked
                            })
                          )
                        }}
                      />
                      {!gpHook.activeSetup.classes.includes('Druid') && (
                        <div className='text-muted small mt-0'>
                          <small>
                            Only applicable if Druid class is selected.
                          </small>
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>

          <Modal.Footer className='bg-primary border-top-0'>
            <Button
              variant='light'
              onClick={() => {
                setShowSettings(false)
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <EnchantmentSearchOffcanvas
          showEnchantmentSearch={showEnchantmentSearch}
          setShowEnchantmentSearch={setShowEnchantmentSearch}
          enchantmentSearch={enchantmentSearch}
          setEnchantmentSearch={setEnchantmentSearch}
          showConflicts={showConflicts}
          setShowConflicts={setShowConflicts}
          troveData={troveData}
          {...gpHook}
        />

        <SetBonusBrowserOffcanvas
          showSetBonusBrowser={showSetBonusBrowser}
          setShowSetBonusBrowser={setShowSetBonusBrowser}
          browsingSet={browsingSet}
          setBrowsingSet={setBrowsingSet}
          troveData={troveData}
          {...gpHook}
        />

        {filigreeTarget && (
          <FiligreeModal
            show={showFiligreeModal}
            onHide={() => { setShowFiligreeModal(false); }}
            item={filigreeTarget.item}
            slot={filigreeTarget.slot}
            setup={gpHook.activeSetup}
            allFiligrees={gpHook.allFiligrees}
            setFiligree={gpHook.setSlottedFiligree}
            setUnlockedFiligreeSlots={gpHook.setUnlockedFiligreeSlots}
          />
        )}

        <ItemBrowserOffcanvas
          showConflicts={showConflicts}
          setShowConflicts={setShowConflicts}
          setBonusFilter={setBonusFilter}
          setSetBonusFilter={setSetBonusFilter}
          observerTarget={observerTarget}
          {...gpHook}
        />

        <PermalinkModal
          show={showPermalink}
          onHide={() => {
            setShowPermalink(false)
          }}
          buildUrl={() =>
            buildPermalinkUrl(encodeGearPermalink(gpHook.activeSetup), location)
          }
          title='Create a Gear Planner Permalink'
        />
      </Container>
    </div>
  )
}

export default GearPlanner

declare global {
  interface Window {
    openFiligreeModal?: (item: GearItem, slot: GearSlot) => void
    filigreeTarget?: { item: GearItem; slot: GearSlot }
  }
}
