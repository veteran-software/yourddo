import { Button, Card, Col, Row } from 'react-bootstrap'
import { FaPlus, FaTrash } from 'react-icons/fa6'
import type { GearItem, GearSetup, LootItem } from '../types.ts'
import { GearSlot } from '../types.ts'

interface SentientGemSectionProps {
  weapon: GearItem
  setup: GearSetup
  setFiligree: (
    itemId: string,
    slotIndex: number,
    filigree: LootItem | null,
    slot: GearSlot
  ) => void
  openSlotBrowser: (slot: GearSlot) => void
  browsingSlot: GearSlot | null
  setBrowsingFiligreeSlotIndex: (index: number | null) => void
  browsingFiligreeSlotIndex: number | null
}

const SentientGemSection = ({
  weapon,
  setup,
  setFiligree,
  openSlotBrowser,
  browsingSlot,
  setBrowsingFiligreeSlotIndex,
  browsingFiligreeSlotIndex
}: SentientGemSectionProps) => {
  const minLevel = Number.parseInt(weapon.minLevel, 10) || 1
  if (minLevel < 20) return null

  const slotted = setup.slottedFiligrees[weapon.id] ?? new Array(10).fill(null)

  const handleSlotClick = (index: number) => {
    setBrowsingFiligreeSlotIndex(index)
    openSlotBrowser(GearSlot.Filigree)
  }

  const handleRemove = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setFiligree(weapon.id, index, null, weapon.slot)
  }

  return (
    <Card className='mt-3 border-info bg-dark text-light shadow-sm'>
      <Card.Header className='bg-info text-dark fw-bold d-flex justify-content-between align-items-center py-1'>
        <span style={{ fontSize: '0.9rem' }}>Sentient Gem</span>
      </Card.Header>
      <Card.Body className='p-2'>
        <Row className='g-2'>
          {slotted.map((fili, idx) => {
            const isActive =
              browsingSlot === GearSlot.Filigree &&
              browsingFiligreeSlotIndex === idx
            return (
              <Col
                key={idx}
                xs={6}
                md={4}
                lg={2.4}
                style={{ flex: '0 0 20%', maxWidth: '20%' }}
              >
                <div
                  className={`p-2 border rounded text-center cursor-pointer position-relative d-flex flex-column align-items-center justify-content-center ${
                    isActive
                      ? 'border-primary bg-primary-subtle text-dark'
                      : 'border-secondary bg-dark-subtle'
                  }`}
                  style={{
                    height: '70px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    handleSlotClick(idx)
                  }}
                >
                  {fili ? (
                    <>
                      <div
                        className='small text-truncate w-100 fw-bold'
                        title={fili.name}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {fili.name}
                      </div>
                      <Button
                        variant='link'
                        className='p-0 text-danger position-absolute top-0 end-0 me-1'
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
                      style={{ fontSize: '0.65rem' }}
                    >
                      <FaPlus className='me-1' /> Slot {idx + 1}
                    </div>
                  )}
                </div>
              </Col>
            )
          })}
        </Row>
      </Card.Body>
    </Card>
  )
}

export default SentientGemSection
