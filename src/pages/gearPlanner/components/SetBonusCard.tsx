import { memo, useMemo } from 'react'
import { Card, Col } from 'react-bootstrap'
import { findSetBonus } from '../../../data/setBonuses.ts'
import { getActiveEnhancementsForSet } from '../helpers.ts'
import GenericBadge from './badges/GenericBadge.tsx'

const SetBonusCard = memo((props: Props) => {
  const { count, onSetClick, setName } = props

  const setDef = useMemo(() => findSetBonus(setName), [setName])

  const activeEnhancements = useMemo(
    () => getActiveEnhancementsForSet(setDef, count),
    [setDef, count]
  )

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

          {activeEnhancements.map((enh, idx) => (
            <div
              key={`${enh.name}-${String(idx)}`}
              className='small text-secondary ps-2 border-start border-secondary mb-1'
            >
              • {enh.name}
              {enh.modifier ? `: ${String(enh.modifier)}` : ''} (
              {enh.numPiecesEquipped ?? setDef?.numPiecesEquipped} pieces)
            </div>
          ))}

          {activeEnhancements.length === 0 && (
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
