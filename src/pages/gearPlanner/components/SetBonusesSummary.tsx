import { useMemo } from 'react'
import { Badge, Row } from 'react-bootstrap'
import { FaLayerGroup } from 'react-icons/fa6'
import type { GearAugment, GearItem } from '../types.ts'
import SetBonusCard from './SetBonusCard.tsx'

const SetBonusesSummary = (props: Props) => {
  const { equippedItems, onSetClick, slottedAugments, slottedGemSetBonuses } =
    props

  const activeSets = useMemo(() => {
    const counts: Record<string, number> = {}

    // Count from items
    equippedItems.forEach((item) => {
      if (item.name.includes('Gem of Many Facets')) {
        const gemBonuses = slottedGemSetBonuses?.[item.id] ?? []
        gemBonuses.forEach((setName) => {
          if (setName) {
            counts[setName] = (counts[setName] || 0) + 1
          }
        })
      } else {
        item.setBonus?.forEach((sb) => {
          counts[sb.name] = (counts[sb.name] || 0) + 1
        })
      }
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
  }, [equippedItems, slottedAugments, slottedGemSetBonuses])

  if (activeSets.length === 0) return null

  return (
    <div className='mt-4 p-3 border border-primary rounded bg-dark-subtle shadow-sm'>
      <h5 className='mb-3 text-light border-bottom border-primary pb-2 d-flex justify-content-between align-items-center'>
        <span>
          <FaLayerGroup className='me-2' /> Active Set Bonuses
        </span>

        <Badge
          bg='dark'
          className='text-info border border-info small fw-normal'
        >
          Click set name to browse items
        </Badge>
      </h5>

      <Row>
        {activeSets.map(([setName, count]) => (
          <SetBonusCard
            key={setName}
            setName={setName}
            count={count}
            onSetClick={onSetClick}
          />
        ))}
      </Row>
    </div>
  )
}

interface Props {
  equippedItems: GearItem[]
  slottedAugments: Record<string, Record<number, GearAugment | null>>
  slottedGemSetBonuses?: Record<string, (string | null)[]>
  onSetClick?: (setName: string) => void
}

export default SetBonusesSummary
