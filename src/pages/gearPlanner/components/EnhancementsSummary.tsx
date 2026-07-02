import { memo, useMemo } from 'react'
import { Accordion, Col, Row } from 'react-bootstrap'
import { FaListUl } from 'react-icons/fa6'
import { getBonus, normalizeString, parseModifierValue } from '../conflictResolver.ts'
import type { EssenceEnchantment } from '../dataLoader.ts'
import { aggregateEnchantmentEntries, getActiveSetEnhancements, sortItemsByValue } from '../helpers.ts'
import type { Curse, GearAugment, GearItem, LootEnchantment } from '../types.ts'
import GenericBadge from './badges/GenericBadge.tsx'

type AggregationSourceType = 'item' | 'augment' | 'filigree' | 'essence'

const isItemOrEssenceSource = (i: AggregationItem) => i.sourceType === 'item' || i.sourceType === 'essence'
const isNonItemSource = (i: AggregationItem) => i.sourceType !== 'item' && i.sourceType !== 'essence'
const getSourceLabel = (i: AggregationItem): string => {
  if (i.sourceType === 'filigree') return 'Filigree'
  if (i.sourceType === 'augment') return 'Augment'
  return i.sourceType
}

interface AggregationItem {
  itemName: string
  slot: string
  value: number
  valueStr: string
  sourceType: AggregationSourceType
}

interface AggregationBonus {
  maxValue: number
  maxValueStr: string
  items: AggregationItem[]
}

interface AggregationEntry {
  originalName: string
  bonuses: Record<string, AggregationBonus>
}

type AggregationMap = Record<string, AggregationEntry>

const EnchantmentsSummary = (props: Props) => {
  const {
    allItems,
    equippedItems,
    essenceEnchantments,
    onBonusClick,
    slottedAugments,
    slottedCurses,
    slottedEssenceEnchantments,
    itemUpgrades,
    slottedFiligrees,
    slottedGemSetBonuses,
    slottedLostPurpose,
    slottedTraceOfMadness,
    slottedNearlyFinished,
    slottedAlmostThere,
    slottedFinishingTouch,
    slottedRitualTable,
    slottedFountainOfNecroticMight,
    slottedStormreaverUpgrade,
    slottedZhentarimAttuned
  } = props

  const allPossibleBonuses = useMemo(() => {
    const map: Record<string, Set<string> | undefined> = {}

    const processEnch = (ench: LootEnchantment) => {
      const normName = normalizeString(ench.name)
      if (!normName) {
        return
      }

      const set = (map[normName] ??= new Set<string>())
      set.add(getBonus(ench.bonus))
    }

    allItems?.forEach((item) => {
      if (Array.isArray(item.enchantments)) {
        item.enchantments.forEach(processEnch)
      }
    })

    essenceEnchantments?.forEach((ee) => {
      ee.enchantments?.forEach(processEnch)
    })

    return map
  }, [allItems, essenceEnchantments])

  const aggregated = useMemo(() => {
    const map: AggregationMap = {}

    const getSourceType = (sourceName: string): AggregationSourceType => {
      if (sourceName.includes(' (Filigree:')) return 'filigree'
      if (sourceName.includes(' (Essence:')) return 'essence'
      if (sourceName.includes(' (') && sourceName.endsWith(')')) return 'augment'
      return 'item'
    }

    const addEntryToMap = (ench: LootEnchantment, sourceName: string, slot: string) => {
      const normName = normalizeString(ench.name)
      const normBonus = getBonus(ench.bonus)
      const value = parseModifierValue(ench.modifier)
      const valueStr = ench.modifier?.toString() ?? ''

      if (!(normName in map)) {
        map[normName] = { originalName: ench.name, bonuses: {} }
      }

      if (!(normBonus in map[normName].bonuses)) {
        map[normName].bonuses[normBonus] = {
          maxValue: 0,
          maxValueStr: '',
          items: []
        }
      }

      const group: AggregationBonus = map[normName].bonuses[normBonus]
      if (normBonus === 'reaper') {
        group.maxValue += value
      } else if (value > group.maxValue) {
        group.maxValue = value
        group.maxValueStr = valueStr
      } else if (group.maxValue === 0 && valueStr) {
        group.maxValueStr = valueStr
      }

      group.items.push({
        itemName: sourceName,
        slot,
        value,
        valueStr,
        sourceType: getSourceType(sourceName)
      })
    }

    const activeSetEnhancements = getActiveSetEnhancements(
      equippedItems,
      slottedAugments,
      slottedFiligrees,
      slottedGemSetBonuses,
      slottedLostPurpose
    )

    for (const item of equippedItems) {
      const entries = aggregateEnchantmentEntries(
        item,
        slottedAugments[item.id],
        slottedCurses[item.id],
        slottedFiligrees[item.id],
        {
          slottedEssenceEnchantments,
          itemUpgrades,
          essenceEnchantments,
          slottedNearlyFinished,
          slottedAlmostThere,
          slottedFinishingTouch,
          slottedRitualTable,
          slottedLostPurpose,
          slottedTraceOfMadness,
          slottedFountainOfNecroticMight,
          slottedStormreaverUpgrade,
          slottedZhentarimAttuned
        }
      )

      for (const { ench, sourceName } of entries) {
        addEntryToMap(ench, sourceName, item.slot)
      }
    }

    for (const { ench, sourceName } of activeSetEnhancements) {
      addEntryToMap(ench, sourceName, 'Set Bonus')
    }

    // Add empty entries for missing bonus types
    Object.keys(map).forEach((normName: string) => {
      const possibleBonuses = allPossibleBonuses[normName]
      if (!possibleBonuses || possibleBonuses.size === 0) return

      possibleBonuses.forEach((bonusType: string) => {
        if (!(bonusType in map[normName].bonuses)) {
          map[normName].bonuses[bonusType] = {
            maxValue: 0,
            maxValueStr: '',
            items: []
          }
        }
      })
    })

    const result = Object.entries(map).map(([normName, entry]: [string, AggregationEntry]) => {
      const bonuses = Object.entries(entry.bonuses)
        .map(([bonusType, data]: [string, AggregationBonus]) => {
          const sortedItems: AggregationItem[] = [...data.items].sort(sortItemsByValue)

          const hasItemSource =
            (allPossibleBonuses[normName]?.has(bonusType) ?? false) || sortedItems.some(isItemOrEssenceSource)

          const nonItemSources = new Set(sortedItems.filter(isNonItemSource).map(getSourceLabel))

          return {
            bonusType,
            maxValue: data.maxValue,
            maxValueStr: data.maxValueStr,
            items: sortedItems,
            hasItemSource,
            nonItemSources
          }
        })
        .sort((a, b) => b.maxValue - a.maxValue)

      const isNumeric = bonuses.some((b) => b.maxValue !== 0)
      const total = isNumeric ? bonuses.reduce((sum, b) => sum + b.maxValue, 0) : 0

      return {
        name: entry.originalName,
        total,
        isNumeric,
        bonuses
      }
    })

    return result.sort((a, b) => a.name.localeCompare(b.name))
  }, [
    equippedItems,
    slottedAugments,
    slottedFiligrees,
    slottedGemSetBonuses,
    slottedLostPurpose,
    slottedTraceOfMadness,
    slottedCurses,
    slottedEssenceEnchantments,
    essenceEnchantments,
    slottedNearlyFinished,
    slottedAlmostThere,
    slottedFinishingTouch,
    slottedRitualTable,
    slottedFountainOfNecroticMight,
    slottedStormreaverUpgrade,
    slottedZhentarimAttuned,
    itemUpgrades,
    allPossibleBonuses
  ])

  if (aggregated.length === 0) {
    return null
  }

  const calculateBonus = (bonus: {
    bonusType: string
    maxValue: number
    maxValueStr: string
    items: AggregationItem[]
  }) => {
    if (bonus.items.length === 0) {
      return '---'
    } else if (bonus.maxValue === 0) {
      return bonus.maxValueStr || 'Active'
    } else {
      return `+${String(bonus.maxValue)}`
    }
  }

  return (
    <div className='mt-4 p-3 border border-info rounded bg-dark-subtle shadow-sm'>
      <h5 className='mb-3 text-light border-bottom border-info pb-2 d-flex align-items-center'>
        <FaListUl className='me-2' /> Enchantment Summary
      </h5>

      <Row className='g-2'>
        {aggregated.map((ench, idx) => (
          <Col key={`${ench.name}-${String(idx)}`} xs={12} md={6} lg={4}>
            <Accordion data-bs-theme='dark' className='gear-planner-ench-summary-accordion'>
              <Accordion.Item eventKey='0'>
                <Accordion.Header className=''>
                  <div className='d-flex justify-content-between align-items-center w-100 me-3'>
                    <span className='fw-bold text-info text-truncate me-2' style={{ fontSize: '0.8rem' }}>
                      {ench.name}
                    </span>
                    {ench.isNumeric && <GenericBadge badgeText={`+${String(ench.total)}`} fontSize='0.75rem' />}
                  </div>
                </Accordion.Header>

                <Accordion.Body className='p-2 bg-dark'>
                  {ench.bonuses.map((bonus, bIdx) => {
                    const isReaperBonus = bonus.bonusType === 'reaper'

                    return (
                      <div key={`${bonus.bonusType}-${String(bIdx)}`} className='mb-2 last-child-mb-0'>
                        <div className='d-flex justify-content-between align-items-center border-bottom border-secondary mb-1 pb-1'>
                          {onBonusClick && bonus.hasItemSource ? (
                            <button
                              type='button'
                              className='btn btn-link p-0 border-0 small italic text-capitalize text-info text-decoration-none shadow-none align-baseline'
                              onClick={() => {
                                onBonusClick(ench.name, bonus.bonusType)
                              }}
                            >
                              {bonus.bonusType}
                            </button>
                          ) : (
                            <span className='d-flex align-items-center gap-1'>
                              <span className='small italic text-capitalize text-light'>{bonus.bonusType}</span>
                              {bonus.nonItemSources.size > 0 && (
                                <span className='badge text-bg-secondary' style={{ fontSize: '0.6rem' }}>
                                  {[...bonus.nonItemSources].join('/')} only
                                </span>
                              )}
                            </span>
                          )}

                          <span className='small fw-bold text-light'>{calculateBonus(bonus)}</span>
                        </div>

                        {bonus.items.length === 0 ? (
                          <div className='ps-2 small text-muted italic'>• No items equipped</div>
                        ) : (
                          bonus.items.map((item, iIdx) => (
                            <div
                              key={`${item.itemName}-${String(iIdx)}`}
                              className={`ps-2 small d-flex justify-content-between align-items-center ${
                                isReaperBonus || item.value === bonus.maxValue
                                  ? 'text-secondary'
                                  : 'text-muted text-decoration-line-through'
                              }`}
                            >
                              <span className='text-truncate me-1'>• {item.itemName}</span>

                              <span className='flex-shrink-0'>
                                {item.value === 0 ? item.valueStr : `+${String(item.value)}`}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )
                  })}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        ))}
      </Row>
    </div>
  )
}

interface Props {
  equippedItems: GearItem[]
  slottedAugments: Record<string, Record<number, GearAugment | null>>
  slottedCurses: Record<string, Curse | null>
  slottedFiligrees: Record<string, (GearItem | null)[]>
  slottedGemSetBonuses: Record<string, (string | null)[]>
  slottedEssenceEnchantments: Record<string, Record<string, string | null>>
  itemUpgrades?: import('../upgradeState').ItemUpgrades
  essenceEnchantments?: EssenceEnchantment[]
  slottedNearlyFinished: Record<string, import('../types.ts').LootEnchantment | null>
  slottedAlmostThere: Record<string, import('../types.ts').LootEnchantment | null>
  slottedFinishingTouch: Record<string, import('../types.ts').LootEnchantment | null>
  slottedRitualTable: Record<string, import('../types.ts').LootEnchantment | null>
  slottedLostPurpose: Record<string, import('../types.ts').LootEnchantment | null>
  slottedTraceOfMadness: Record<string, import('../types.ts').LootEnchantment | null>
  slottedFountainOfNecroticMight: Record<string, boolean>
  slottedStormreaverUpgrade: Record<string, boolean>
  slottedZhentarimAttuned: Record<string, boolean>
  allItems?: GearItem[]
  allAugments?: GearAugment[]
  allCurses?: Curse[]
  allFiligrees?: GearItem[]
  onBonusClick?: (name: string, bonusType: string) => void
}

export default memo(EnchantmentsSummary)
