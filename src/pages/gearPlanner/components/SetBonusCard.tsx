import { memo, useMemo } from 'react'
import { Card, Col } from 'react-bootstrap'
import { findSetBonus } from '../../../data/setBonuses.ts'
import GenericBadge from './badges/GenericBadge.tsx'

const SetBonusCard = memo((props: Props) => {
  const { count, onSetClick, setName } = props

  const setDef = useMemo(() => findSetBonus(setName), [setName])

  return (
    <Col md={6} lg={4} key={setName} className='mb-2'>
      <Card
        className='bg-dark border-secondary h-100 cursor-pointer gear-planner-set-card'
        onClick={() => onSetClick?.(setName)}
      >
        <Card.Body className='p-2'>
          <div className='d-flex justify-content-between align-items-center mb-1'>
            <span className='fw-bold text-info'>{setName}</span>
            <GenericBadge
              badgeText={`${String(count)} Piece${count > 1 ? 's' : ''}`}
              fontSize='0.75rem'
            />
          </div>

          {setDef?.enhancements
            ?.filter((enh) => (enh.numPiecesEquipped ?? 0) <= count)
            .map((enh, idx) => (
              <div
                key={`${enh.name}-${String(idx)}`}
                className='small text-secondary ps-2 border-start border-secondary mb-1'
              >
                • {enh.name} ({enh.numPiecesEquipped} pieces)
              </div>
            ))}

          {(!setDef ||
            setDef.enhancements?.filter(
              (enh) => (enh.numPiecesEquipped ?? 0) <= count
            ).length === 0) && (
            <div className='small text-muted ps-2 italic text-center py-2'>
              Equip more pieces to see bonuses.
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  )
})
SetBonusCard.displayName = 'SetBonusCard'

interface Props {
  setName: string
  count: number
  onSetClick?: (setName: string) => void
}

export default SetBonusCard
