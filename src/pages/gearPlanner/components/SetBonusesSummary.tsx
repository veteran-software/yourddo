import { useMemo } from 'react'
import { Badge, Row } from 'react-bootstrap'
import { FaLayerGroup } from 'react-icons/fa6'
import { getSetCounts } from '../helpers.ts'
import type { GearAugment, GearItem, LootEnchantment } from '../types.ts'
import SetBonusCard from './SetBonusCard.tsx'

const SetBonusesSummary = (props: Props) => {
  const { equippedItems, onSetClick, slottedAugments, slottedFiligrees, slottedGemSetBonuses, slottedLostPurpose } =
    props

  const activeSets = useMemo(() => {
    const counts = getSetCounts(
      equippedItems,
      slottedAugments,
      slottedFiligrees,
      slottedGemSetBonuses,
      slottedLostPurpose
    )
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
  }, [equippedItems, slottedAugments, slottedFiligrees, slottedGemSetBonuses, slottedLostPurpose])

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
        {activeSets.map(([setName, count]) => (
          <SetBonusCard key={setName} setName={setName} count={count} onSetClick={onSetClick} />
        ))}
      </Row>
    </div>
  )
}

interface Props {
  equippedItems: GearItem[]
  slottedAugments: Record<string, Record<number, GearAugment | null>>
  slottedFiligrees: Record<string, (GearItem | null)[]>
  slottedGemSetBonuses: Record<string, (string | null)[]>
  slottedLostPurpose: Record<string, LootEnchantment | null>
  onSetClick?: (setName: string) => void
}

export default SetBonusesSummary
