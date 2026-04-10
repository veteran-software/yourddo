import { useEffect, useRef, useState } from 'react'
import {
  Badge,
  Button,
  Col,
  Form,
  ListGroup,
  Modal,
  Row
} from 'react-bootstrap'
import { FaMagnifyingGlass, FaMinus, FaPlus, FaTrash } from 'react-icons/fa6'
import { useAppSelector } from '../../../redux/hooks.ts'
import { getTroveOwners, normItem } from '../../../utils/troveUtils.ts'
import { getMaxFiligreeSlots } from '../helpers'
import type { GearItem, GearSetup, GearSlot, LootItem } from '../types'

const FiligreeModal = (props: Props) => {
  const {
    allFiligrees,
    item,
    onHide,
    setFiligree,
    setUnlockedFiligreeSlots,
    setup,
    show,
    slot
  } = props

  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyOwned, setShowOnlyOwned] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(50)
  const observerTarget = useRef<HTMLDivElement>(null)

  const { troveData } = useAppSelector((state) => state.app)

  const maxSlots = getMaxFiligreeSlots(item)
  const isArtifact = (item.artifacttype?.trim().length ?? 0) > 0
  const currentUnlockedSlots = setup.unlockedFiligreeSlots[item.id] ?? 1
  const slotted =
    setup.slottedFiligrees[item.id] ?? new Array(maxSlots).fill(null)

  const handleSlotClick = (index: number) => {
    setActiveSlotIndex(index === activeSlotIndex ? null : index)
    setSearchTerm('')
    setDisplayLimit(50)
  }

  const handleRemove = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setFiligree(item.id, index, null, slot)
    if (activeSlotIndex === index) {
      setActiveSlotIndex(null)
    }
  }

  const handleAddSlot = () => {
    if (currentUnlockedSlots < maxSlots) {
      setUnlockedFiligreeSlots(item.id, currentUnlockedSlots + 1, slot)
    }
  }

  const handleRemoveSlot = () => {
    if (currentUnlockedSlots > 1) {
      const indexToRemove = currentUnlockedSlots - 1
      // Clear filigree in the slot being removed
      setFiligree(item.id, indexToRemove, null, slot)
      setUnlockedFiligreeSlots(item.id, currentUnlockedSlots - 1, slot)
      if (activeSlotIndex === indexToRemove) {
        setActiveSlotIndex(null)
      }
    }
  }

  const handleSelectFiligree = (fili: GearItem) => {
    if (activeSlotIndex !== null) {
      setFiligree(item.id, activeSlotIndex, fili, slot)
      setActiveSlotIndex(null)
      setSearchTerm('')
      setDisplayLimit(50)
    }
  }

  const normalizeName = (name: string) => {
    const rareSuffix = ' (Rare)'
    if (name.endsWith(rareSuffix)) {
      return name.slice(0, -rareSuffix.length).trim()
    }
    return name.trim()
  }

  const isFiligreeSlotted = (fili: GearItem) => {
    const normalizedNewName = normalizeName(fili.name)
    return slotted.some(
      (s, idx) =>
        s &&
        normalizeName(s.name) === normalizedNewName &&
        idx !== activeSlotIndex
    )
  }

  const allFiltered = allFiligrees.filter((f) => {
    const matchesSearch = f.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false

    if (showOnlyOwned) {
      const normalizedName = normItem(f.name)

      const troveEntry =
        troveData?.[normalizedName] ??
        troveData?.[
          normalizedName.endsWith(' (rare)')
            ? normalizedName.slice(0, -' (rare)'.length).trim()
            : normalizedName.trim()
        ]

      return !!troveEntry
    }

    return true
  })

  const filteredFiligrees = allFiltered.slice(0, displayLimit)

  useEffect(() => {
    if (!observerTarget.current || activeSlotIndex === null) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayLimit < allFiltered.length) {
          setDisplayLimit((prev) => prev + 50)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(observerTarget.current)

    return () => {
      observer.disconnect()
    }
  }, [activeSlotIndex, displayLimit, allFiltered.length])

  return (
    <Modal show={show} onHide={onHide} size='lg' centered scrollable>
      <Modal.Header closeButton className='bg-dark text-light border-secondary'>
        <Modal.Title>
          {isArtifact ? 'Minor Artifact' : 'Sentient Gem'} - {item.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className='bg-dark text-light' style={{ minHeight: '400px' }}>
        <p className='text-info mb-4'>
          Select a slot to add or change a filigree. You can unlock up to{' '}
          {maxSlots} slots.
        </p>

        <Row className='g-2 mb-4'>
          {Array.from({ length: maxSlots }).map((_, idx) => {
            const isUnlocked = idx < currentUnlockedSlots
            const fili = slotted[idx]
            const isActive = activeSlotIndex === idx

            if (!isUnlocked) {
              if (idx === currentUnlockedSlots && idx < maxSlots) {
                return (
                  <Col key={idx} xs={6} md={4} lg={2.4}>
                    <div className='d-flex gap-1 h-100'>
                      <Button
                        variant='outline-secondary'
                        className='flex-grow-1 d-flex flex-column align-items-center justify-content-center border-dashed'
                        style={{
                          height: '70px',
                          borderStyle: 'dashed',
                          opacity: 0.6
                        }}
                        onClick={handleAddSlot}
                      >
                        <FaPlus size={14} className='mb-1' />
                        <span style={{ fontSize: '0.7rem' }}>Unlock</span>
                      </Button>

                      {currentUnlockedSlots > 1 && (
                        <Button
                          variant='outline-danger'
                          className='d-flex align-items-center justify-content-center border-dashed px-2'
                          style={{
                            height: '70px',
                            borderStyle: 'dashed',
                            opacity: 0.6
                          }}
                          onClick={handleRemoveSlot}
                          title='Remove last slot'
                        >
                          <FaMinus size={14} />
                        </Button>
                      )}
                    </div>
                  </Col>
                )
              }

              return null
            }

            return (
              <Col key={idx} xs={6} md={4} lg={2.4}>
                <div
                  className={`p-2 border rounded text-center cursor-pointer position-relative d-flex flex-column align-items-center justify-content-center transition-all ${
                    isActive
                      ? 'border-primary bg-primary bg-opacity-25'
                      : 'border-secondary bg-dark-subtle hover-bg-secondary'
                  }`}
                  style={{ height: '70px', cursor: 'pointer' }}
                  onClick={() => {
                    handleSlotClick(idx)
                  }}
                >
                  {fili ? (
                    <>
                      <div
                        className='small text-truncate w-100 fw-bold px-1'
                        title={fili.name}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {fili.name}
                      </div>

                      <Button
                        variant='link'
                        className='p-0 text-danger position-absolute top-0 end-0 me-1 mt-0'
                        onClick={(e) => {
                          handleRemove(e, idx)
                        }}
                        style={{ fontSize: '0.8rem' }}
                      >
                        <FaTrash />
                      </Button>
                    </>
                  ) : (
                    <div
                      className='small text-muted d-flex align-items-center'
                      style={{ fontSize: '0.7rem' }}
                    >
                      <FaPlus className='me-1' /> Slot {idx + 1}
                    </div>
                  )}
                </div>
              </Col>
            )
          })}
        </Row>

        {activeSlotIndex !== null &&
          troveData &&
          Object.keys(troveData).length > 0 && (
            <Row className='mb-3 align-items-center px-1'>
              <Col>
                <Form.Check
                  type='checkbox'
                  id='show-only-owned-filigrees'
                  label='Only Owned'
                  className='text-light small'
                  checked={showOnlyOwned}
                  onChange={(e) => {
                    setShowOnlyOwned(e.target.checked)
                    setDisplayLimit(50)
                  }}
                />
              </Col>
            </Row>
          )}

        {activeSlotIndex !== null && (
          <div className='border border-primary rounded p-3 bg-dark-subtle'>
            <h6 className='text-primary mb-3 d-flex align-items-center'>
              <FaMagnifyingGlass className='me-2' />
              Selecting for Slot {activeSlotIndex + 1}
            </h6>

            <Row className='mb-3 align-items-center'>
              <Col>
                <Form.Group>
                  <Form.Control
                    type='text'
                    placeholder='Search filigrees...'
                    autoFocus
                    className='bg-dark text-light border-secondary'
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setDisplayLimit(50)
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <ListGroup
              className='filigree-selection-list'
              style={{ maxHeight: '400px', overflowY: 'auto' }}
            >
              {filteredFiligrees.length > 0 ? (
                filteredFiligrees.map((f) => {
                  const normalizedName = normItem(f.name)
                  const troveEntry =
                    troveData?.[normalizedName] ??
                    troveData?.[
                      normalizedName.endsWith(' (rare)')
                        ? normalizedName.slice(0, -' (rare)'.length).trim()
                        : normalizedName.trim()
                    ]
                  const owners = troveEntry ? getTroveOwners(troveEntry) : ''
                  const isSlotted = isFiligreeSlotted(f)

                  return (
                    <ListGroup.Item
                      key={f.id}
                      action={!isSlotted}
                      className={`bg-dark text-light border-secondary d-flex justify-content-between align-items-center py-2 ${
                        isSlotted ? 'opacity-25' : ''
                      }`}
                      style={{
                        cursor: isSlotted ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() => {
                        if (!isSlotted) {
                          handleSelectFiligree(f)
                        }
                      }}
                    >
                      <div className='flex-grow-1 min-w-0'>
                        <div className='d-flex align-items-center gap-2 mb-1'>
                          <div
                            className='fw-bold text-truncate'
                            style={{ fontSize: '0.85rem' }}
                          >
                            {f.name}
                          </div>

                          {owners && (
                            <Badge
                              bg='primary'
                              style={{
                                fontSize: '0.6rem',
                                border: '1px solid rgba(255, 255, 255, 0.4)'
                              }}
                            >
                              {owners}
                            </Badge>
                          )}
                        </div>

                        {f.enchantments?.map((ench, eIdx) => (
                          <div
                            key={eIdx}
                            className='text-muted small'
                            style={{ fontSize: '0.75rem' }}
                          >
                            {ench.name}: +{ench.modifier}
                          </div>
                        ))}
                      </div>

                      {f.setBonus?.[0] && (
                        <Badge
                          bg='warning'
                          text='dark'
                          className='ms-2'
                          style={{ fontSize: '0.65rem' }}
                        >
                          {f.setBonus[0].name}
                        </Badge>
                      )}
                    </ListGroup.Item>
                  )
                })
              ) : (
                <div className='text-center text-muted py-3'>
                  No filigrees found.
                </div>
              )}

              {displayLimit < allFiltered.length && (
                <div
                  ref={observerTarget}
                  className='text-center py-3'
                  style={{ height: '50px' }}
                >
                  <div
                    className='spinner-border spinner-border-sm text-primary'
                    role='status'
                  >
                    <span className='visually-hidden'>Loading...</span>
                  </div>
                </div>
              )}
            </ListGroup>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className='bg-dark border-secondary'>
        <Button variant='secondary' onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

interface Props {
  show: boolean
  onHide: () => void
  item: GearItem
  slot: GearSlot
  setup: GearSetup
  allFiligrees: GearItem[]
  setFiligree: (
    itemId: string,
    slotIndex: number,
    filigree: LootItem | null,
    slot: GearSlot
  ) => void
  setUnlockedFiligreeSlots: (
    itemId: string,
    numSlots: number,
    slot: GearSlot
  ) => void
}

export default FiligreeModal
