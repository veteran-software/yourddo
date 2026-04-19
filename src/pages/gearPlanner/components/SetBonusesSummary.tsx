import { useCallback, useMemo } from 'react'
import { Badge, Row } from 'react-bootstrap'
import { FaLayerGroup } from 'react-icons/fa6'
import type { GearAugment, GearItem, LootEnchantment } from '../types.ts'
import SetBonusCard from './SetBonusCard.tsx'

const SetBonusesSummary = (props: Props) => {
  const { equippedItems, onSetClick, slottedAugments, slottedFiligrees, slottedGemSetBonuses, slottedLostPurpose } =
    props

  const getCountsFromItems = (
    equippedItems: GearItem[],
    slottedGemSetBonuses: Record<string, (string | null)[]>,
    counts: Record<string, number>
  ) => {
    equippedItems.forEach((item) => {
      if (item.name.includes('Gem of Many Facets')) {
        const gemBonuses = slottedGemSetBonuses[item.id] ?? []
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
  }

  const getCountsFromAugments = (
    slottedAugments: Record<string, Record<number, GearAugment | null>>,
    counts: Record<string, number>
  ) => {
    for (const itemAugments of Object.values(slottedAugments)) {
      for (const aug of Object.values(itemAugments)) {
        if (aug?.setBonus) {
          for (const sb of aug.setBonus) {
            counts[sb.name] = (counts[sb.name] ?? 0) + 1
          }
        }
      }
    }
  }

  const updateFiligreeSetCounts = (fili: GearItem | null, filigreeNamesPerSet: Record<string, Set<string>>) => {
    if (!fili?.setBonus) return
    for (const sb of fili.setBonus) {
      const setName = sb.name
      if (!(setName in filigreeNamesPerSet)) {
        filigreeNamesPerSet[setName] = new Set()
      }

      if (fili.name) {
        filigreeNamesPerSet[setName].add(fili.name)
      }
    }
  }

  const getCountsFromFiligrees = useCallback(
    (slottedFiligrees: Record<string, (GearItem | null)[]>, counts: Record<string, number>) => {
      const filigreeNamesPerSet: Record<string, Set<string>> = {}

      for (const itemFiligrees of Object.values(slottedFiligrees)) {
        for (const fili of itemFiligrees) {
          updateFiligreeSetCounts(fili, filigreeNamesPerSet)
        }
      }

      for (const [setName, names] of Object.entries(filigreeNamesPerSet)) {
        counts[setName] = (counts[setName] ?? 0) + names.size
      }
    },
    []
  )

  const getCountsFromLostPurpose = (
    slottedLostPurpose: Record<string, LootEnchantment | null>,
    counts: Record<string, number>
  ) => {
    for (const enchantment of Object.values(slottedLostPurpose)) {
      if (enchantment?.name) {
        counts[enchantment.name] = (counts[enchantment.name] ?? 0) + 1
      }
    }
  }

  const activeSets = useMemo(() => {
    const counts: Record<string, number> = {}

    getCountsFromItems(equippedItems, slottedGemSetBonuses, counts)
    getCountsFromAugments(slottedAugments, counts)
    getCountsFromFiligrees(slottedFiligrees, counts)
    getCountsFromLostPurpose(slottedLostPurpose, counts)

    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
  }, [
    equippedItems,
    getCountsFromFiligrees,
    slottedAugments,
    slottedFiligrees,
    slottedGemSetBonuses,
    slottedLostPurpose
  ])

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
