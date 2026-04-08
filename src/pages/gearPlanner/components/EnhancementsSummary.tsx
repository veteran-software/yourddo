import { useMemo } from 'react'
import { Accordion, Badge, Col, Row } from 'react-bootstrap'
import { FaListUl } from 'react-icons/fa6'
import { getBonus, normalizeString, parseModifierValue } from '../conflictResolver.ts'
import { aggregateEnchantmentEntries, sortItemsByValue } from '../helpers.ts'
import type { Curse, GearAugment, GearItem } from '../types.ts'

const EnchantmentsSummary = ({
  equippedItems,
  slottedAugments,
  slottedCurses
}: {
  equippedItems: GearItem[]
  slottedAugments: Record<string, Record<number, GearAugment | null>>
  slottedCurses: Record<string, Curse | null>
}) => {
  const aggregated = useMemo(() => {
    const map: Record<
      string,
      {
        originalName: string
        bonuses: Record<
          string,
          {
            maxValue: number
            maxValueStr: string
            items: { itemName: string; slot: string; value: number; valueStr: string }[]
          }
        >
      }
    > = {}

    for (const item of equippedItems) {
      const entries = aggregateEnchantmentEntries(item, slottedAugments[item.id], slottedCurses[item.id])

      for (const { ench, sourceName } of entries) {
        const normName = normalizeString(ench.name)
        const normBonus = getBonus(ench.bonus)
        const value = parseModifierValue(ench.modifier)
        const valueStr = ench.modifier?.toString() ?? ''

        if (!map[normName]) {
          map[normName] = { originalName: ench.name, bonuses: {} }
        }
        if (!map[normName].bonuses[normBonus]) {
          map[normName].bonuses[normBonus] = { maxValue: -Infinity, maxValueStr: '', items: [] }
        }

        const group = map[normName].bonuses[normBonus]
        if (value > group.maxValue) {
          group.maxValue = value
          group.maxValueStr = valueStr
        } else if (group.maxValue === -Infinity) {
          group.maxValue = 0
          group.maxValueStr = valueStr
        }

        group.items.push({ itemName: sourceName, slot: item.slot, value, valueStr })
      }
    }

    const result = Object.values(map).map((entry) => {
      const bonuses = Object.entries(entry.bonuses)
        .map(([bonusType, data]) => {
          const sortedItems = [...data.items].sort(sortItemsByValue)
          return {
            bonusType,
            maxValue: data.maxValue === -Infinity ? 0 : data.maxValue,
            maxValueStr: data.maxValueStr,
            items: sortedItems
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
  }, [equippedItems, slottedAugments, slottedCurses])

  if (aggregated.length === 0) return null

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
                    {ench.isNumeric && <Badge bg='primary'>+{String(ench.total)}</Badge>}
                  </div>
                </Accordion.Header>

                <Accordion.Body className='p-2 bg-dark'>
                  {ench.bonuses.map((bonus, bIdx) => (
                    <div key={`${bonus.bonusType}-${String(bIdx)}`} className='mb-2 last-child-mb-0'>
                      <div className='d-flex justify-content-between align-items-center border-bottom border-secondary mb-1 pb-1'>
                        <span className='small text-light italic text-capitalize'>{bonus.bonusType}</span>

                        <span className='small fw-bold text-light'>
                          {bonus.maxValue === 0 ? bonus.maxValueStr || 'Active' : `+${String(bonus.maxValue)}`}
                        </span>
                      </div>

                      {bonus.items.map((item, iIdx) => (
                        <div
                          key={`${item.itemName}-${String(iIdx)}`}
                          className={`ps-2 small d-flex justify-content-between align-items-center ${
                            item.value === bonus.maxValue ? 'text-secondary' : 'text-muted text-decoration-line-through'
                          }`}
                        >
                          <span className='text-truncate me-1'>• {item.itemName}</span>

                          <span className='flex-shrink-0'>
                            {item.value === 0 ? item.valueStr : `+${String(item.value)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default EnchantmentsSummary
