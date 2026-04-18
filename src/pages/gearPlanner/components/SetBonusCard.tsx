import { useMemo } from 'react'
import { Card, Col } from 'react-bootstrap'
import { findSetBonus } from '../../../data/setBonuses.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { SetBonus } from '../../../types/crafting.ts'
import { getActiveEnhancementsForSet } from '../helpers.ts'
import GenericBadge from './badges/GenericBadge.tsx'

const SetBonusCard = (props: Props) => {
  const { count, onSetClick, setName } = props

  const setDefinition: SetBonus = useMemo(() => findSetBonus(setName), [setName])

  const activeEnhancements: Enhancement[] = useMemo(
    () => getActiveEnhancementsForSet(setDefinition, count),
    [setDefinition, count]
  )

  return (
    <Col md={6} lg={4} key={setName} className='mb-2'>
      <Card
        as={onSetClick ? 'button' : 'div'}
        className={`bg-dark border-secondary h-100 gear-planner-set-card w-100 text-start p-0 ${
          onSetClick ? 'cursor-pointer' : ''
        }`}
        onClick={() => onSetClick?.(setName)}
        {...(onSetClick ? { type: 'button' } : {})}
      >
        <Card.Body className='p-2 w-100'>
          <div className='d-flex justify-content-between align-items-center mb-1'>
            <span className='fw-bold text-info'>{setName}</span>
            <GenericBadge badgeText={`${String(count)} Piece${count > 1 ? 's' : ''}`} fontSize='0.75rem' />
          </div>

          {activeEnhancements.map((enchantment: Enhancement, idx: number) => (
            <div
              key={`${enchantment.name}-${String(idx)}`}
              className='small text-secondary ps-2 border-start border-secondary mb-1'
            >
              • {enchantment.name}
              {enchantment.modifier ? `: ${String(enchantment.modifier)}` : ''} (
              {enchantment.numPiecesEquipped ?? setDefinition.numPiecesEquipped} pieces)
            </div>
          ))}

          {activeEnhancements.length === 0 && (
            <div className='small text-muted ps-2 italic text-center py-2'>Equip more pieces to see bonuses.</div>
          )}
        </Card.Body>
      </Card>
    </Col>
  )
}

interface Props {
  setName: string
  count: number
  onSetClick?: (setName: string) => void
}

export default SetBonusCard
