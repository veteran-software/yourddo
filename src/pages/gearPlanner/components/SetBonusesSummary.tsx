import { useMemo } from 'react'
import { Badge, Card, Col, Row } from 'react-bootstrap'
import { FaLayerGroup } from 'react-icons/fa6'
import { findSetBonus } from '../../../data/setBonuses.ts'
import type { GearAugment, GearItem } from '../types.ts'

const SetBonusesSummary = (props: Props) => {
  const { equippedItems, onSetClick, slottedAugments } = props

  const activeSets = useMemo(() => {
    const counts: Record<string, number> = {}

    // Count from items
    equippedItems.forEach((item) => {
      item.setBonus?.forEach((sb) => {
        counts[sb.name] = (counts[sb.name] || 0) + 1
      })
    })

    // Count from augments
    for (const itemAugments of Object.values(slottedAugments)) {
      for (const aug of Object.values(itemAugments)) {
        if (aug?.setBonus) {
          for (const sb of aug.setBonus) {
            counts[sb.name] = (counts[sb.name] ?? 0) + 1
          }
        }
      }
    }

    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
  }, [equippedItems, slottedAugments])

  if (activeSets.length === 0) return null

  return (
    <div className='mt-4 p-3 border border-primary rounded bg-dark-subtle shadow-sm'>
      <h5 className='mb-3 text-light border-bottom border-primary pb-2 d-flex justify-content-between align-items-center'>
        <span>
          <FaLayerGroup className='me-2' /> Active Set Bonuses
        </span>
        <Badge bg='dark' className='text-info border border-info small fw-normal'>
          Click set name to browse items
        </Badge>
      </h5>
      <Row>
        {activeSets.map(([setName, count]) => {
          const setDef = findSetBonus(setName)
          return (
            <Col md={6} lg={4} key={setName} className='mb-2'>
              <Card
                className='bg-dark border-secondary h-100 cursor-pointer gear-planner-set-card'
                onClick={() => onSetClick?.(setName)}
              >
                <Card.Body className='p-2'>
                  <div className='d-flex justify-content-between align-items-center mb-1'>
                    <span className='fw-bold text-info'>{setName}</span>
                    <Badge bg='primary'>
                      {count} Piece{count > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {setDef?.enhancements
                    ?.filter((enh) => (enh.numPiecesEquipped ?? 0) <= count)
                    .map((enh, idx) => (
                      <div key={idx} className='small text-secondary ps-2 border-start border-secondary mb-1'>
                        • {enh.name} ({enh.numPiecesEquipped} pieces)
                      </div>
                    ))}
                  {(!setDef ||
                    setDef.enhancements?.filter((enh) => (enh.numPiecesEquipped ?? 0) <= count).length === 0) && (
                    <div className='small text-muted ps-2 italic text-center py-2'>
                      Equip more pieces to see bonuses.
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          )
        })}
      </Row>
    </div>
  )
}

interface Props {
  equippedItems: GearItem[]
  slottedAugments: Record<string, Record<number, GearAugment | null>>
  onSetClick?: (setName: string) => void
}

export default SetBonusesSummary
