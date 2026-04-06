import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Accordion,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  Modal,
  Offcanvas,
  Row,
  Stack,
  Tab,
  Tabs
} from 'react-bootstrap'
import { FaChevronRight, FaGear, FaLayerGroup, FaListUl, FaMagnifyingGlass, FaXmark } from 'react-icons/fa6'
import { findSetBonus } from '../../data/setBonuses'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  addSetup as addSetupAction,
  equipItem as equipItemAction,
  removeSetup as removeSetupAction,
  setActiveSetup as setActiveSetupAction,
  setAugment as setAugmentAction,
  updateSetup as updateSetupAction
} from '../../redux/slices/gearPlannerSlice'
import {
  checkPotentialConflict,
  type EnchantmentConflict,
  getBonus,
  getSlotOwner,
  normalizeString,
  parseModifierValue,
  resolveConflicts
} from './conflictResolver'
import { loadGearData, loadSetBonusIndex } from './dataLoader'
import {
  ARMOR_TYPES,
  ARTIFICER_PET_SLOTS,
  CLASS_PROFICIENCIES,
  DRUID_PET_SLOTS,
  GEAR_CLASSES,
  GEAR_SLOTS,
  type GearAugment,
  type GearAugmentSlot,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootEnchantment,
  type SetBonusIndex,
  SHIELD_TYPES,
  WEAPON_TYPES
} from './types'
import './GearPlanner.css'

const SetBonusesSummary = ({
  equippedItems,
  slottedAugments,
  onSetClick
}: {
  equippedItems: GearItem[]
  slottedAugments: Record<string, Record<number, GearAugment | null>>
  onSetClick?: (setName: string) => void
}) => {
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
                    ?.filter((e) => (e.numPiecesEquipped ?? 0) <= count)
                    .map((e, idx) => (
                      <div key={idx} className='small text-secondary ps-2 border-start border-secondary mb-1'>
                        • {e.name} ({e.numPiecesEquipped} pieces)
                      </div>
                    ))}
                  {(!setDef ||
                    setDef.enhancements?.filter((e) => (e.numPiecesEquipped ?? 0) <= count).length === 0) && (
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

const sortItemsByValue = (a: { value: number }, b: { value: number }) => b.value - a.value

const aggregateEnchantmentEntries = (item: GearItem, itemAugs: Record<number, GearAugment | null> | undefined) => {
  const entries: { ench: LootEnchantment; sourceName: string }[] = (item.enchantments ?? []).map((e) => ({
    ench: e,
    sourceName: item.name
  }))

  if (itemAugs) {
    for (const aug of Object.values(itemAugs)) {
      if (aug?.effectsAdded) {
        for (const e of aug.effectsAdded) {
          entries.push({ ench: e, sourceName: `${item.name} (${aug.name})` })
        }
      }
    }
  }
  return entries
}

const EnchantmentsSummary = ({
  equippedItems,
  slottedAugments
}: {
  equippedItems: GearItem[]
  slottedAugments: Record<string, Record<number, GearAugment | null>>
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
      const entries = aggregateEnchantmentEntries(item, slottedAugments[item.id])

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
  }, [equippedItems, slottedAugments])

  if (aggregated.length === 0) return null

  return (
    <div className='mt-4 p-3 border border-info rounded bg-dark-subtle shadow-sm'>
      <h5 className='mb-3 text-light border-bottom border-info pb-2 d-flex align-items-center'>
        <FaListUl className='me-2' /> Enchantment Summary
      </h5>
      <Row className='g-2'>
        {aggregated.map((ench, idx) => (
          <Col key={idx} xs={12} md={6} lg={4}>
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
                  {ench.bonuses.map((b, bIdx) => (
                    <div key={bIdx} className='mb-2 last-child-mb-0'>
                      <div className='d-flex justify-content-between align-items-center border-bottom border-secondary mb-1 pb-1'>
                        <span className='small text-light italic text-capitalize'>{b.bonusType}</span>
                        <span className='small fw-bold text-light'>
                          {b.maxValue !== 0 ? `+${String(b.maxValue)}` : b.maxValueStr || 'Active'}
                        </span>
                      </div>
                      {b.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className={`ps-2 small d-flex justify-content-between align-items-center ${
                            item.value === b.maxValue ? 'text-secondary' : 'text-muted text-decoration-line-through'
                          }`}
                        >
                          <span className='text-truncate me-1'>• {item.itemName}</span>
                          <span className='flex-shrink-0'>
                            {item.value !== 0 ? `+${String(item.value)}` : item.valueStr}
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

const EnchantmentList = React.memo(
  ({
    enchantments,
    itemId,
    conflicts,
    equippedItems,
    source,
    browsingSlot,
    slottedAugments
  }: {
    enchantments: LootEnchantment[] | null | undefined
    itemId: string
    conflicts: Record<string, EnchantmentConflict[]>
    equippedItems: GearItem[]
    source: 'slot' | 'search' | 'browser'
    browsingSlot?: GearSlot | null
    slottedAugments?: Record<string, Record<number, GearAugment | null>>
  }) => {
    if (!enchantments) return null
    return (
      <>
        {enchantments.map((ench: LootEnchantment, idx) => {
          let isOverridden = false
          let isRedundant = false
          let isMax = false
          let effectiveItems: EnchantmentConflict['items'] = []
          let overriddenItems: EnchantmentConflict['items'] = []
          const potential: ReturnType<typeof checkPotentialConflict> =
            source === 'slot'
              ? { isConflict: false, currentMax: 0, isRedundant: false }
              : checkPotentialConflict(ench, equippedItems, browsingSlot ?? undefined, slottedAugments)

          const modifierText = ench.modifier ? `+${ench.modifier}` : ''
          const bonusText = ench.bonus ? `(${ench.bonus})` : ''
          const enchModifierText = ench.modifier ? ` (+${ench.modifier} ${ench.bonus ?? ''})` : ''
          const enchText =
            source === 'slot'
              ? `• ${ench.name} ${modifierText} ${bonusText}`.replace(/\s+/g, ' ').trim()
              : `• ${ench.name}${enchModifierText}`

          if (source === 'slot') {
            const itemConflicts = conflicts[normalizeString(ench.name)]
            const bonusToMatch = getBonus(ench.bonus)
            // In DDO, some bonuses with the same name and same type don't stack.
            // We want to find the conflict that matches this enchantment's bonus type.
            const conflict = itemConflicts?.find((c) => getBonus(c.bonus) === bonusToMatch)
            // console.log('Enchantment:', ench.name, 'Bonus:', ench.bonus, 'Matched Conflict:', conflict);
            const itemInConflict = conflict?.items.find((i) => i.itemId === itemId)
            // console.log('itemId:', itemId, 'itemInConflict:', itemInConflict);
            isOverridden = itemInConflict?.isEffective === false
            isMax = itemInConflict?.isEffective === true
            effectiveItems = conflict?.items.filter((i) => i.isEffective && i.itemId !== itemId) ?? []
            overriddenItems = conflict?.items.filter((i) => !i.isEffective && i.itemId !== itemId) ?? []

            // A 'Redundant' label only if:
            // 1. We are effective (isMax)
            // 2. We are NOT overriding anything (overriddenItems.length === 0)
            // 3. There is another item with the EXACT same value (isRedundant)
            isRedundant =
              isMax && overriddenItems.length === 0 && effectiveItems.some((i) => i.value === itemInConflict?.value)
          }

          const overriddenSlotNames = Array.from(new Set(overriddenItems.map((i) => i.slot))).join(', ')
          const effectiveSlotNames = Array.from(new Set(effectiveItems.map((i) => i.slot))).join(', ')

          let className = 'text-dark'
          if (source !== 'slot') {
            className = 'text-dark fw-bold'
          } else if (isOverridden) {
            className = 'text-decoration-line-through text-secondary'
          }

          return (
            <div
              key={idx}
              className={`d-flex align-items-baseline ${className}`}
              style={source !== 'slot' ? { maxWidth: '300px' } : {}}
            >
              <span className='me-1 text-nowrap d-inline-flex gap-1'>
                {source === 'slot' ? (
                  <>
                    {isMax && overriddenItems.length > 0 && (
                      <Badge bg='warning' text='dark' className='px-1 py-0' style={{ fontSize: '0.6rem' }}>
                        <small>Overrides {overriddenSlotNames}</small>
                      </Badge>
                    )}
                    {isRedundant && (
                      <Badge bg='warning' text='dark' className='px-1 py-0' style={{ fontSize: '0.6rem' }}>
                        <small>Redundant ({effectiveSlotNames})</small>
                      </Badge>
                    )}
                    {isOverridden && (
                      <Badge bg='danger' className='px-1 py-0' style={{ fontSize: '0.6rem' }}>
                        <small>Overridden by {effectiveSlotNames}</small>
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    {potential.isConflict && potential.isRedundant && (
                      <Badge bg='warning' text='dark' className='px-1 py-0' style={{ fontSize: '0.6rem' }}>
                        <small>Conflicts: {potential.currentMax}</small>
                      </Badge>
                    )}
                    {potential.isConflict && !potential.isRedundant && (
                      <Badge bg='info' className='px-1 py-0' style={{ fontSize: '0.6rem' }}>
                        <small>Upgrades: {potential.currentMax}</small>
                      </Badge>
                    )}
                  </>
                )}
              </span>
              <span className='text-truncate flex-grow-1' title={enchText}>
                {enchText}
              </span>
            </div>
          )
        })}
      </>
    )
  }
)
EnchantmentList.displayName = 'EnchantmentList'

const AugmentSlotsList = ({ augments }: { augments: GearAugmentSlot[] }) => {
  return (
    <div className='d-flex flex-wrap gap-1 mt-1'>
      {augments.map((slot, idx) => {
        let bgColor = 'bg-secondary'
        let textColor = 'text-white'

        switch (slot.augmentType) {
          case 'Red':
            bgColor = 'bg-danger'
            break
          case 'Blue':
            bgColor = 'bg-primary'
            break
          case 'Yellow':
            bgColor = 'bg-warning'
            textColor = 'text-dark'
            break
          case 'Purple':
            bgColor = 'bg-purple' // Need to define in CSS
            break
          case 'Orange':
            bgColor = 'bg-orange' // Need to define in CSS
            break
          case 'Green':
            bgColor = 'bg-success'
            break
          case 'Colorless':
            bgColor = 'bg-light'
            textColor = 'text-dark'
            break
          case 'Sun':
            bgColor = 'bg-info'
            textColor = 'text-dark'
            break
          case 'Moon':
            bgColor = 'bg-dark'
            // eslint-disable-next-line sonarjs/no-redundant-assignments
            textColor = 'text-white'
            break
        }

        return (
          <Badge
            key={idx}
            bg={undefined}
            className={`px-1 py-0 ${bgColor} ${textColor} border border-dark`}
            style={{ fontSize: '0.6rem', minWidth: '60px' }}
          >
            {slot.name ?? `${slot.augmentType} Slot`}
          </Badge>
        )
      })}
    </div>
  )
}

const AugmentSlotItem = ({
  selectedItem,
  idx,
  augSlot,
  slotted,
  applicable,
  slot,
  currentConflicts,
  currentEquipped,
  currentSlottedAugments,
  setSlottedAugment,
  openSetBonusBrowser
}: {
  selectedItem: GearItem
  idx: number
  augSlot: GearAugmentSlot
  slotted: GearAugment | null | undefined
  applicable: { groups: Record<string, GearAugment[]>; sortedGroupNames: string[] }
  slot: GearSlot
  currentConflicts: Record<string, EnchantmentConflict[]>
  currentEquipped: GearItem[]
  currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
  setSlottedAugment: (itemId: string, slotIndex: number, augment: GearAugment | null, slot?: GearSlot) => void
  openSetBonusBrowser: (setName: string) => void
}) => {
  return (
    <div key={idx} className='mx-n2 px-2 py-1 mb-1 bg-white last-child-mb-0'>
      <div className='d-flex align-items-center gap-1 mb-1'>
        <span className='text-dark fw-bold' style={{ fontSize: '0.6rem' }}>
          {augSlot.name ?? `${augSlot.augmentType} Slot`}
        </span>
      </div>
      <Dropdown className='w-100 flex-shrink-0'>
        <Dropdown.Toggle
          variant='outline-dark'
          id={`aug-drop-${selectedItem.id}-${String(idx)}`}
          className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
          style={{ fontSize: '0.65rem', minHeight: '20px', backgroundColor: 'rgba(0,0,0,0.05)' }}
        >
          <span className='text-truncate text-dark'>
            {slotted ? `${slotted.name} (ML:${String(slotted.minimumLevel)})` : 'Empty Slot'}
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu
          className='gear-planner-augment-menu'
          style={{ fontSize: '0.65rem', maxHeight: '200px', overflowY: 'auto' }}
        >
          <Dropdown.Item
            onClick={() => {
              setSlottedAugment(selectedItem.id, idx, null, slot)
            }}
          >
            Empty Slot
          </Dropdown.Item>
          <Dropdown.Divider />
          {applicable.sortedGroupNames.map((groupName) => (
            <React.Fragment key={groupName}>
              <Dropdown.Header className='text-light fw-bold py-0 ps-1' style={{ fontSize: '0.6rem' }}>
                {groupName} Augments
              </Dropdown.Header>
              {applicable.groups[groupName].map((aug) => {
                const hasConflict = aug.effectsAdded?.some((ench) => {
                  const pot = checkPotentialConflict(ench, currentEquipped, slot, currentSlottedAugments)
                  return pot.isConflict && pot.isRedundant
                })
                const hasUpgrade = aug.effectsAdded?.some((ench) => {
                  const pot = checkPotentialConflict(ench, currentEquipped, slot, currentSlottedAugments)
                  return pot.isConflict && !pot.isRedundant
                })

                return (
                  <Dropdown.Item
                    key={`${aug.name}-${String(aug.minimumLevel)}`}
                    onClick={() => {
                      setSlottedAugment(selectedItem.id, idx, aug, slot)
                    }}
                    active={slotted?.name === aug.name}
                    className='d-flex align-items-center justify-content-between'
                  >
                    <span className='text-truncate'>
                      {aug.name} (ML:{aug.minimumLevel})
                    </span>
                    <span className='ms-2 flex-shrink-0'>
                      {hasConflict && (
                        <Badge bg='warning' text='dark' className='px-1 py-0 ms-1' style={{ fontSize: '0.55rem' }}>
                          Conflicting
                        </Badge>
                      )}
                      {hasUpgrade && (
                        <Badge bg='info' className='px-1 py-0 ms-1' style={{ fontSize: '0.55rem' }}>
                          Upgrade
                        </Badge>
                      )}
                    </span>
                  </Dropdown.Item>
                )
              })}
            </React.Fragment>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      {slotted?.setBonus && slotted.setBonus.length > 0 && (
        <div className='mt-1 ps-2 mb-1'>
          {slotted.setBonus.map((sb) => (
            <Badge
              key={sb.name}
              bg='warning'
              text='dark'
              className='me-1 set-bonus-badge-clickable'
              style={{ fontSize: '0.6rem' }}
              onClick={() => {
                openSetBonusBrowser(sb.name)
              }}
            >
              Set: {sb.name}
            </Badge>
          ))}
        </div>
      )}
      {slotted?.effectsAdded && (
        <div
          className='mt-1 ps-2 border-start border-2 gear-planner-augment-enchantments flex-grow-1'
          style={{ fontSize: '0.65rem', minHeight: '0' }}
        >
          <EnchantmentList
            enchantments={slotted.effectsAdded}
            itemId={`${selectedItem.id}-aug-${String(idx)}`}
            conflicts={currentConflicts}
            equippedItems={currentEquipped}
            source='slot'
            browsingSlot={slot}
            slottedAugments={currentSlottedAugments}
          />
        </div>
      )}
    </div>
  )
}

const SearchResultSlot = ({
  slot,
  items,
  getContextInfo,
  selectItem,
  setShowEnchantmentSearch,
  openSetBonusBrowser
}: {
  slot: string
  items: GearItem[]
  getContextInfo: (slot: string) => {
    currentConflicts: Record<string, EnchantmentConflict[]>
    currentEquipped: GearItem[]
    currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
  }
  selectItem: (slot: GearSlot, item: GearItem | null) => void
  setShowEnchantmentSearch: (show: boolean) => void
  openSetBonusBrowser: (setName: string) => void
}) => {
  const { currentConflicts, currentEquipped, currentSlottedAugments } = getContextInfo(slot)

  return (
    <Accordion.Item eventKey={slot} key={slot}>
      <Accordion.Header className='small fw-bold'>
        {slot} ({items.length})
      </Accordion.Header>
      <Accordion.Body className='p-2 bg-dark'>
        <Stack gap={2}>
          {items.map((item) => (
            <Card
              key={item.id}
              className='shadow-sm cursor-pointer border-secondary bg-white text-dark position-relative'
              onClick={() => {
                selectItem(item.slot, item)
                setShowEnchantmentSearch(false)
              }}
            >
              <Card.Body className='p-2'>
                {currentEquipped.some((e) => e.id === item.id) && (
                  <Badge
                    bg='success'
                    className='position-absolute top-0 end-0 m-1 shadow-sm'
                    style={{ fontSize: '0.6rem', zIndex: 1 }}
                  >
                    Equipped
                  </Badge>
                )}
                <div className='fw-bold small text-truncate text-dark'>{item.name}</div>
                <div className='text-dark fw-medium' style={{ fontSize: '0.7rem' }}>
                  ML: {item.minLevel || '1'} | {item.artifacttype || 'Item'}
                </div>
                {item.setBonus && item.setBonus.length > 0 && (
                  <div className='mt-1 mb-1'>
                    {item.setBonus.map((sb) => (
                      <Badge
                        key={sb.name}
                        bg='warning'
                        text='dark'
                        className='me-1 set-bonus-badge-clickable'
                        style={{ fontSize: '0.6rem' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          openSetBonusBrowser(sb.name)
                        }}
                      >
                        Set: {sb.name}
                      </Badge>
                    ))}
                  </div>
                )}
                {item.augments && item.augments.length > 0 && <AugmentSlotsList augments={item.augments} />}
                {item.enchantments && item.enchantments.length > 0 && (
                  <div
                    className='mt-1 pt-1 border-top border-secondary-subtle overflow-hidden'
                    style={{ fontSize: '0.7rem' }}
                  >
                    <EnchantmentList
                      enchantments={item.enchantments}
                      itemId={item.id}
                      conflicts={currentConflicts}
                      equippedItems={currentEquipped}
                      source='search'
                      browsingSlot={item.slot}
                      slottedAugments={currentSlottedAugments}
                    />
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </Stack>
      </Accordion.Body>
    </Accordion.Item>
  )
}

const BrowserItem = ({
  item,
  browsingSlot,
  currentConflicts,
  currentEquipped,
  currentSlottedAugments,
  selectItem,
  isMetal,
  openSetBonusBrowser
}: {
  item: GearItem
  browsingSlot: GearSlot
  currentConflicts: Record<string, EnchantmentConflict[]>
  currentEquipped: GearItem[]
  currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
  selectItem: (slot: GearSlot, item: GearItem | null) => void
  isMetal: (material: string | null | undefined) => boolean
  openSetBonusBrowser: (setName: string) => void
}) => {
  return (
    <button
      key={item.id}
      className='list-group-item list-group-item-action d-flex justify-content-between align-items-start position-relative'
      onClick={() => {
        if (browsingSlot) selectItem(browsingSlot, item)
      }}
    >
      <div className='w-100'>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='fw-bold text-white fs-6'>
            {currentEquipped.some((e) => e.id === item.id) && (
              <Badge bg='success' className='me-2' style={{ fontSize: '0.6rem' }}>
                Equipped
              </Badge>
            )}
            {item.name}
          </div>
          <Badge bg='info' pill>
            Select
          </Badge>
        </div>
        {item.setBonus && item.setBonus.length > 0 && (
          <div className='mt-1 mb-1'>
            {item.setBonus.map((sb) => (
              <Badge
                key={sb.name}
                bg='warning'
                text='dark'
                className='me-1 set-bonus-badge-clickable'
                style={{ fontSize: '0.65rem' }}
                onClick={(e) => {
                  e.stopPropagation()
                  openSetBonusBrowser(sb.name)
                }}
              >
                Set: {sb.name}
              </Badge>
            ))}
          </div>
        )}
        {item.augments && item.augments.length > 0 && <AugmentSlotsList augments={item.augments} />}
        <div className='text-light small mb-1'>
          ML: {item.minLevel || '1'} | {item.artifacttype || 'Item'} | Material:{' '}
          <span className={`fw-bold ${isMetal(item.material) ? 'text-danger' : 'text-success'}`}>
            {item.material || 'Unknown'}
          </span>
        </div>
        {item.enchantments && item.enchantments.length > 0 && (
          <div
            className='mt-1 gear-planner-enchantment-box px-2 py-1 rounded small border border-1 border-dark shadow'
            style={{ fontSize: '0.7rem' }}
          >
            <div className='d-flex flex-wrap gap-2'>
              <EnchantmentList
                enchantments={item.enchantments}
                itemId={item.id}
                conflicts={currentConflicts}
                equippedItems={currentEquipped}
                source='browser'
                browsingSlot={browsingSlot}
                slottedAugments={currentSlottedAugments}
              />
            </div>
          </div>
        )}
      </div>
    </button>
  )
}

const WeaponCategory = ({
  category,
  types,
  activeSetup,
  dispatch
}: {
  category: string
  types: string[]
  activeSetup: GearSetup
  dispatch: ReturnType<typeof useAppDispatch>
}) => {
  return (
    <Accordion.Item eventKey={category} key={category} className='border-0'>
      <Accordion.Header className='bg-dark py-1'>{category} Weapons</Accordion.Header>
      <Accordion.Body className='bg-dark-subtle p-2'>
        <Row>
          {types.map((type) => (
            <Col xs={12} md={6} key={type}>
              <Form.Check
                type='checkbox'
                id={`weapon-${type}`}
                label={type}
                checked={activeSetup.weaponFilters.includes(type)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...activeSetup.weaponFilters, type]
                    : activeSetup.weaponFilters.filter((t) => t !== type)
                  dispatch(updateSetupAction({ id: activeSetup.id, weaponFilters: updated }))
                }}
              />
            </Col>
          ))}
        </Row>
      </Accordion.Body>
    </Accordion.Item>
  )
}

const GearPlanner = () => {
  const dispatch = useAppDispatch()
  const {
    characterSetups: setups,
    activeSetupId,
    artificerPet,
    druidPet
  } = useAppSelector((state) => state.gearPlanner)

  const [allItems, setAllItems] = useState<GearItem[]>([])
  const [allAugments, setAllAugments] = useState<GearAugment[]>([])
  const [setBonusIndex, setSetBonusIndex] = useState<SetBonusIndex>({})
  const [loading, setLoading] = useState(true)
  const [browsingSlot, setBrowsingSlot] = useState<GearSlot | null>(null)
  const [itemsToShow, setItemsToShow] = useState(50)
  const [showConflicts, setShowConflicts] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showEnchantmentSearch, setShowEnchantmentSearch] = useState(false)
  const [showSetBonusBrowser, setShowSetBonusBrowser] = useState(false)
  const [browsingSet, setBrowsingSet] = useState<string | null>(null)
  const [setBonusFilter, setSetBonusFilter] = useState<string | null>(null)
  const [enchantmentSearch, setEnchantmentSearch] = useState('')
  const observerTarget = useRef<HTMLDivElement>(null)

  const openSlotBrowser = useCallback((slot: GearSlot | null) => {
    setBrowsingSlot(slot)
    setItemsToShow(50)
  }, [])

  const openSetBonusBrowser = useCallback((setName: string) => {
    setBrowsingSet(setName)
    setShowSetBonusBrowser(true)
  }, [])

  const loadMore = useCallback(() => {
    setItemsToShow((prev) => prev + 50)
  }, [])

  useEffect(() => {
    if (!browsingSlot) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [loadMore, browsingSlot, itemsToShow]) // Added itemsToShow to re-observe when list expands

  useEffect(() => {
    loadGearData()
      .then((data) => {
        setAllItems(data)
      })
      .catch(console.error)

    loadSetBonusIndex()
      .then((data) => {
        setSetBonusIndex(data)
      })
      .catch(console.error)

    fetch('/src/data/loot/runtime/augment.json')
      .then((response) => response.json())
      .then((data: GearAugment[]) => {
        setAllAugments(data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        console.error('Error loading augments:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // If any of the offcanvases are open and we click outside
      if (!target.closest('.gear-planner-offcanvas')) {
        // Only close if we didn't click a toggle button (to prevent immediate reopen)
        if (
          !target.closest('.btn') &&
          !target.closest('.gear-planner-sidebar-toggle') &&
          !target.closest('.card-header')
        ) {
          setShowSidebar(false)
          setShowEnchantmentSearch(false)
          setShowSetBonusBrowser(false)
          openSlotBrowser(null)
        }
      }
    }

    const anyOpen = showSidebar || showEnchantmentSearch || showSetBonusBrowser || browsingSlot !== null

    if (anyOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [showSidebar, showEnchantmentSearch, showSetBonusBrowser, browsingSlot, openSlotBrowser])

  const activeSetup = setups.find((s) => s.id === activeSetupId) ?? setups[0]

  const isMetal = useCallback((material: string | null | undefined) => {
    if (!material) return false
    const metalMaterials = [
      'Steel',
      'Iron',
      'Gold',
      'Silver',
      'Mithral',
      'Adamantine',
      'Alchemical Silver',
      'Cold Iron',
      'Byeshk',
      'Bronze',
      'Copper'
    ]

    return metalMaterials.includes(material)
  }, [])

  const isItemVisibleForClasses = useCallback((item: GearItem, setup: GearSetup) => {
    const isArtificer = setup.classes.includes('Artificer')
    const isDruid = setup.classes.includes('Druid')

    if (item.slot === GearSlot.ArtificerPetArmor || item.slot === GearSlot.ArtificerPetWeapon) {
      return isArtificer
    }
    if (item.slot === GearSlot.DruidPetArmor || item.slot === GearSlot.DruidPetWeapon) {
      return isDruid
    }
    return true
  }, [])

  const itemToSetsMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const [setName, items] of Object.entries(setBonusIndex)) {
      for (const item of items) {
        const key = `${item.name}|${String(item.minLevel)}`
        const list = map.get(key)
        if (list) {
          list.push(setName)
        } else {
          map.set(key, [setName])
        }
      }
    }
    return map
  }, [setBonusIndex])

  const characterEquipped = useMemo(() => {
    if (!activeSetup) return []
    return Object.values(activeSetup.slots).filter((item): item is GearItem => item !== null)
  }, [activeSetup])

  const artificerEquipped = useMemo(() => {
    if (!activeSetup?.classes.includes('Artificer')) return []
    return Object.values(artificerPet.slots).filter((item): item is GearItem => item !== null)
  }, [artificerPet.slots, activeSetup?.classes])

  const druidEquipped = useMemo(() => {
    if (!activeSetup?.classes.includes('Druid')) return []
    return Object.values(druidPet.slots).filter((item): item is GearItem => item !== null)
  }, [druidPet.slots, activeSetup?.classes])

  const characterConflicts = useMemo(
    () => resolveConflicts(characterEquipped, activeSetup?.slottedAugments),
    [characterEquipped, activeSetup?.slottedAugments]
  )

  const artificerConflicts = useMemo(
    () => resolveConflicts(artificerEquipped, artificerPet.slottedAugments),
    [artificerEquipped, artificerPet.slottedAugments]
  )

  const druidConflicts = useMemo(
    () => resolveConflicts(druidEquipped, druidPet.slottedAugments),
    [druidEquipped, druidPet.slottedAugments]
  )

  const getContextInfo = useCallback(
    (slot: string) => {
      const owner = getSlotOwner(slot)
      let currentConflicts = characterConflicts
      let currentEquipped = characterEquipped
      let currentSlottedAugments = activeSetup?.slottedAugments

      if (owner === 'artificer_pet') {
        currentConflicts = artificerConflicts
        currentEquipped = artificerEquipped
        currentSlottedAugments = artificerPet.slottedAugments
      } else if (owner === 'druid_pet') {
        currentConflicts = druidConflicts
        currentEquipped = druidEquipped
        currentSlottedAugments = druidPet.slottedAugments
      }

      return { currentConflicts, currentEquipped, currentSlottedAugments }
    },
    [
      characterConflicts,
      artificerConflicts,
      druidConflicts,
      characterEquipped,
      artificerEquipped,
      druidEquipped,
      activeSetup?.slottedAugments,
      artificerPet.slottedAugments,
      druidPet.slottedAugments
    ]
  )

  const isItemConflicting = useCallback(
    (item: GearItem, slot: GearSlot) => {
      if (!item.enchantments) return false
      const { currentEquipped, currentSlottedAugments } = getContextInfo(slot)

      return item.enchantments.some((ench) => {
        const potential = checkPotentialConflict(ench, currentEquipped, slot, currentSlottedAugments)
        return potential.isConflict && potential.isRedundant
      })
    },
    [getContextInfo]
  )

  const shouldShowItem = useCallback(
    (item: GearItem, slot: GearSlot, setup: GearSetup, ignoreSetFilter = false) => {
      // Conflict/Lesser enchantment filter
      if (!showConflicts && isItemConflicting(item, slot)) {
        return false
      }

      // Level filter
      const itemLevel = parseInt(item.minLevel, 10) || 0
      if (itemLevel < setup.minLevel || itemLevel > setup.maxLevel) {
        return false
      }

      // Slot filter logic
      const slotMatches = (targetSlot: GearSlot, i: GearItem) => {
        if (targetSlot === GearSlot.ArtificerPetArmor || targetSlot === GearSlot.DruidPetArmor) {
          return i.slot === targetSlot && i.name.toLowerCase().includes('docent')
        }
        if (targetSlot === GearSlot.ArtificerPetWeapon || targetSlot === GearSlot.DruidPetWeapon) {
          return i.slot === targetSlot && i.name.toLowerCase().includes('collar')
        }
        return i.slot === targetSlot
      }

      if (!slotMatches(slot, item)) return false

      // Filters logic
      const weaponFilterMatches = (targetSlot: GearSlot, i: GearItem, s: GearSetup) => {
        if ((targetSlot === GearSlot.MainHand || targetSlot === GearSlot.OffHand) && s.weaponFilters.length > 0) {
          return s.weaponFilters.some((w) => {
            const weaponPart = w.toLowerCase()
            return (
              i.name.toLowerCase().includes(weaponPart) ||
              i.type.toLowerCase().includes(weaponPart) ||
              (weaponPart === 'handwraps' && i.type === 'Gloves')
            )
          })
        }
        return true
      }

      const armorFilterMatches = (targetSlot: GearSlot, i: GearItem, s: GearSetup) => {
        if (targetSlot === GearSlot.Armor && s.armorFilters.length > 0) {
          const isClothFilter = s.armorFilters.includes('Cloth Armor')
          const matchesCloth = isClothFilter && (i.type === 'Robe' || i.type === 'Outfit')
          const matchesOther = s.armorFilters.includes(i.type)
          return matchesCloth || matchesOther
        }
        return true
      }

      const otherFilterMatches = (targetSlot: GearSlot, i: GearItem, s: GearSetup) => {
        // Shield Filter
        if (targetSlot === GearSlot.OffHand && s.shieldFilters.length > 0) {
          if (!s.shieldFilters.includes(i.type)) return false
        }

        // Druid Metal Filter
        const isDruid = s.classes.includes('Druid')
        if (isDruid && !s.allowMetalWithDruid) {
          if (isMetal(i.material)) return false
        }

        // Set Bonus Filter
        if (!ignoreSetFilter && setBonusFilter) {
          const indexedItems = setBonusIndex[setBonusFilter]
          return indexedItems?.some((ii) => ii.name === i.name && ii.minLevel === Number(i.minLevel)) ?? false
        }
        return true
      }

      return (
        weaponFilterMatches(slot, item, setup) &&
        armorFilterMatches(slot, item, setup) &&
        otherFilterMatches(slot, item, setup)
      )
    },
    [showConflicts, isItemConflicting, isMetal, setBonusFilter, setBonusIndex]
  )

  const filteredSets = useMemo(() => {
    if (!activeSetup) return []
    const { minLevel: min, maxLevel: max } = activeSetup

    // Pre-calculate visible items for current setup in level range
    const visibleItemNames = new Set<string>()
    // If browsingSlot is set, we also want to know which sets are available for THAT slot.
    const setsWithItemsInSlot = new Set<string>()

    for (const i of allItems) {
      const level = Number(i.minLevel)
      if (level >= min && level <= max && isItemVisibleForClasses(i, activeSetup)) {
        const key = `${i.name}|${level.toString()}`
        visibleItemNames.add(key)

        // If we are browsing a slot, check if this item matches that slot (ignoring set filter)
        if (browsingSlot && shouldShowItem(i, browsingSlot, activeSetup, true)) {
          const itemSets = itemToSetsMap.get(key)
          if (itemSets) {
            itemSets.forEach((s) => setsWithItemsInSlot.add(s))
          }
        }
      }
    }

    return Object.keys(setBonusIndex)
      .filter((setName) => {
        // Global requirement: must have items in level range and visible for classes
        const indexedItems = setBonusIndex[setName]
        let hasVisibleInLevelRange = false
        for (const item of indexedItems) {
          if (item.minLevel >= min && item.minLevel <= max) {
            if (visibleItemNames.has(`${item.name}|${item.minLevel.toString()}`)) {
              hasVisibleInLevelRange = true
              break
            }
          }
        }
        if (!hasVisibleInLevelRange) return false

        // Slot-specific requirement: if browsing a slot, must have items in this slot
        if (browsingSlot) {
          return setsWithItemsInSlot.has(setName)
        }

        return true
      })
      .sort((a, b) => a.localeCompare(b))
  }, [setBonusIndex, activeSetup, allItems, isItemVisibleForClasses, browsingSlot, shouldShowItem, itemToSetsMap])

  const filteredItems = useMemo(() => {
    if (!activeSetup || !browsingSlot) return []
    return allItems
      .filter((i) => shouldShowItem(i, browsingSlot, activeSetup))
      .sort((a, b) => {
        const levelA = parseInt(a.minLevel, 10) || 0
        const levelB = parseInt(b.minLevel, 10) || 0
        if (levelB !== levelA) return levelB - levelA

        return a.name.localeCompare(b.name)
      })
  }, [activeSetup, browsingSlot, allItems, shouldShowItem])

  const searchResultsBySlot = useMemo(() => {
    if (enchantmentSearch.length <= 2) return null

    const searchLower = enchantmentSearch.toLowerCase().trim()

    const itemMatchesSearch = (item: GearItem) => {
      // Class-Pet visibility filter
      if (!isItemVisibleForClasses(item, activeSetup)) return false

      // Conflict/Lesser enchantment filter
      if (!showConflicts && isItemConflicting(item, item.slot)) {
        return false
      }

      let matchesSetName = false
      for (const setName of Object.keys(setBonusIndex)) {
        if (normalizeString(setName).includes(searchLower)) {
          const indexedItems = setBonusIndex[setName]
          if (indexedItems.some((ii) => ii.name === item.name && ii.minLevel === Number(item.minLevel))) {
            matchesSetName = true
            break
          }
        }
      }

      return (
        normalizeString(item.name).includes(searchLower) ||
        item.enchantments?.some((ench) => normalizeString(ench.name).includes(searchLower)) ||
        matchesSetName
      )
    }

    return allItems
      .filter(itemMatchesSearch)
      .sort((a, b) => {
        const levelA = parseInt(a.minLevel, 10) || 0
        const levelB = parseInt(b.minLevel, 10) || 0
        if (levelB !== levelA) return levelB - levelA
        return a.name.localeCompare(b.name)
      })
      .reduce<Record<string, GearItem[]>>((acc, item) => {
        if (!acc[item.slot]) acc[item.slot] = []
        acc[item.slot].push(item)
        return acc
      }, {})
  }, [
    enchantmentSearch,
    allItems,
    isItemConflicting,
    showConflicts,
    setBonusIndex,
    activeSetup,
    isItemVisibleForClasses
  ])

  const updateClassProficiencies = (setup: GearSetup, oldClasses: (string | null)[], newClasses: (string | null)[]) => {
    // 1. Identify what filters are granted by OLD classes
    const oldWeaponProficiencies = new Set<string>()
    const oldArmorProficiencies = new Set<string>()
    const oldShieldProficiencies = new Set<string>()
    oldClasses.forEach((cls) => {
      if (cls && CLASS_PROFICIENCIES[cls]) {
        CLASS_PROFICIENCIES[cls].weapons.forEach((w) => oldWeaponProficiencies.add(w))
        CLASS_PROFICIENCIES[cls].armor.forEach((a) => oldArmorProficiencies.add(a))
        CLASS_PROFICIENCIES[cls].shields.forEach((s) => oldShieldProficiencies.add(s))
      }
    })

    // 2. Identify what filters are granted by NEW classes
    const newWeaponProficiencies = new Set<string>()
    const newArmorProficiencies = new Set<string>()
    const newShieldProficiencies = new Set<string>()
    newClasses.forEach((cls) => {
      if (cls && CLASS_PROFICIENCIES[cls]) {
        CLASS_PROFICIENCIES[cls].weapons.forEach((w) => newWeaponProficiencies.add(w))
        CLASS_PROFICIENCIES[cls].armor.forEach((a) => newArmorProficiencies.add(a))
        CLASS_PROFICIENCIES[cls].shields.forEach((s) => newShieldProficiencies.add(s))
      }
    })

    // 3. Remove filters that were granted by old classes but NOT by new classes
    const weaponsToRemove = [...oldWeaponProficiencies].filter((w) => !newWeaponProficiencies.has(w))
    const armorToRemove = [...oldArmorProficiencies].filter((a) => !newArmorProficiencies.has(a))
    const shieldsToRemove = [...oldShieldProficiencies].filter((s) => !newShieldProficiencies.has(s))

    const updatedWeaponFilters = setup.weaponFilters.filter((w) => !weaponsToRemove.includes(w))
    const updatedArmorFilters = setup.armorFilters.filter((a) => !armorToRemove.includes(a))
    const updatedShieldFilters = setup.shieldFilters.filter((s) => !shieldsToRemove.includes(s))

    // 4. Add filters granted by new classes
    newWeaponProficiencies.forEach((w) => {
      if (!updatedWeaponFilters.includes(w)) {
        updatedWeaponFilters.push(w)
      }
    })
    newArmorProficiencies.forEach((a) => {
      if (!updatedArmorFilters.includes(a)) {
        updatedArmorFilters.push(a)
      }
    })
    newShieldProficiencies.forEach((s) => {
      if (!updatedShieldFilters.includes(s)) {
        updatedShieldFilters.push(s)
      }
    })

    setup.weaponFilters = updatedWeaponFilters
    setup.armorFilters = updatedArmorFilters
    setup.shieldFilters = updatedShieldFilters
  }

  const openSetBrowser = useCallback((setName: string) => {
    setBrowsingSet(setName)
    setShowSetBonusBrowser(true)
  }, [])

  const addSetup = () => {
    const newId = crypto.randomUUID()
    const newSetup: GearSetup = {
      id: newId,
      name: `New Setup ${String(setups.length + 1)}`,
      minLevel: 1,
      maxLevel: 34,
      classes: [null, null, null],
      weaponFilters: [],
      armorFilters: [],
      shieldFilters: [],
      allowMetalWithDruid: false,
      slots: {} as Record<GearSlot, GearItem | null>,
      slottedAugments: {}
    }

    dispatch(addSetupAction(newSetup))
    dispatch(setActiveSetupAction(newId))
  }

  const deleteSetup = (id: string) => {
    dispatch(removeSetupAction(id))
  }

  const selectItem = (slot: GearSlot, item: GearItem | null) => {
    dispatch(equipItemAction({ slot, item }))
    openSlotBrowser(null)
  }

  const setSlottedAugment = (itemId: string, slotIndex: number, augment: GearAugment | null, slot?: GearSlot) => {
    dispatch(setAugmentAction({ itemId, slotIndex, augment, slot }))
  }

  const getApplicableAugments = (slotType: string, itemMinLevel: number) => {
    const levelLimit = itemMinLevel
    const colorMap: Record<string, string[]> = {
      Colorless: ['Colorless'],
      Red: ['Red', 'Colorless'],
      Blue: ['Blue', 'Colorless'],
      Yellow: ['Yellow', 'Colorless'],
      Purple: ['Purple', 'Red', 'Blue', 'Colorless'],
      Orange: ['Orange', 'Red', 'Yellow', 'Colorless'],
      Green: ['Green', 'Blue', 'Yellow', 'Colorless'],
      Sun: ['Sun'],
      Moon: ['Moon']
    }

    const allowedTypes = colorMap[slotType] || [slotType]

    const filtered = allAugments.filter((aug) => {
      if (!allowedTypes.includes(aug.augmentType)) return false

      return aug.minimumLevel <= levelLimit
    })

    // Group by augmentType
    const groups: Record<string, GearAugment[]> = {}
    filtered.forEach((aug) => {
      if (!groups[aug.augmentType]) groups[aug.augmentType] = []
      groups[aug.augmentType].push(aug)
    })

    // Sort within groups
    Object.values(groups).forEach((group) => {
      group.sort((a, b) => {
        if (b.minimumLevel !== a.minimumLevel) return b.minimumLevel - a.minimumLevel
        return a.name.localeCompare(b.name)
      })
    })

    // Sort group names ascending
    const sortedGroupNames = Object.keys(groups).sort((a, b) => a.localeCompare(b))

    return { groups, sortedGroupNames }
  }

  const renderSlot = (slot: GearSlot, setup: GearSetup) => {
    const owner = getSlotOwner(slot)
    let selectedItem: GearItem | null = null
    let currentConflicts = characterConflicts
    let currentEquipped = characterEquipped
    let currentSlottedAugments = activeSetup.slottedAugments

    if (owner === 'character') {
      selectedItem = setup.slots[slot]
      currentConflicts = characterConflicts
      currentEquipped = characterEquipped
      currentSlottedAugments = activeSetup.slottedAugments
    } else if (owner === 'artificer_pet') {
      selectedItem = artificerPet.slots[slot]
      currentConflicts = artificerConflicts
      currentEquipped = artificerEquipped
      currentSlottedAugments = artificerPet.slottedAugments
    } else if (owner === 'druid_pet') {
      selectedItem = druidPet.slots[slot]
      currentConflicts = druidConflicts
      currentEquipped = druidEquipped
      currentSlottedAugments = druidPet.slottedAugments
    }

    return (
      <Col key={slot} xs={12} sm={6} md={4} lg={3} className='mb-3 px-1'>
        <Card className={`h-100 shadow-sm ${selectedItem ? 'border-primary' : ''} position-relative`}>
          <Card.Header
            className='py-1 px-2 bg-secondary-subtle text-secondary-emphasis small fw-bold d-flex justify-content-between align-items-center cursor-pointer'
            onClick={() => {
              openSlotBrowser(slot)
            }}
          >
            <span>{slot}</span>
            <FaMagnifyingGlass className='text-muted' size={12} />
          </Card.Header>
          <Card.Body
            className={`p-2 d-flex flex-column align-items-center ${selectedItem ? 'bg-white' : 'bg-dark-subtle justify-content-center'}`}
            style={{ minHeight: '100px' }}
          >
            {selectedItem ? (
              <div className='text-center w-100 d-flex flex-column'>
                <div className='fw-bold small text-dark mb-1'>{selectedItem.name}</div>
                <div className='text-secondary mb-1' style={{ fontSize: '0.7rem' }}>
                  ML: {selectedItem.minLevel || '1'} | {selectedItem.artifacttype || 'Item'}
                </div>
                {selectedItem.setBonus && selectedItem.setBonus.length > 0 && (
                  <div className='mt-1 mb-1'>
                    {selectedItem.setBonus.map((sb) => (
                      <Badge
                        key={sb.name}
                        bg='warning'
                        text='dark'
                        className='me-1 set-bonus-badge-clickable'
                        style={{ fontSize: '0.65rem' }}
                        onClick={() => {
                          openSetBonusBrowser(sb.name)
                        }}
                      >
                        Set: {sb.name}
                      </Badge>
                    ))}
                  </div>
                )}
                {selectedItem.material && (
                  <div
                    className={`mb-1 fw-bold ${isMetal(selectedItem.material) ? 'text-danger' : 'text-success'}`}
                    style={{ fontSize: '0.6rem' }}
                  >
                    {selectedItem.material} {isMetal(selectedItem.material) && '(Metal)'}
                  </div>
                )}
                {selectedItem.enchantments && selectedItem.enchantments.length > 0 && (
                  <div
                    className='text-start mt-1 pt-1 border-top gear-planner-slot-enchantments'
                    style={{ fontSize: '0.65rem' }}
                  >
                    <EnchantmentList
                      enchantments={selectedItem.enchantments}
                      itemId={selectedItem.id}
                      conflicts={currentConflicts}
                      equippedItems={currentEquipped}
                      source='slot'
                      browsingSlot={slot}
                      slottedAugments={currentSlottedAugments}
                    />
                  </div>
                )}
                {selectedItem.augments && selectedItem.augments.length > 0 && (
                  <div className='text-start mt-1 pt-1 border-top gear-planner-slot-augments'>
                    {selectedItem.augments.map((augSlot, idx) => {
                      const slotted = currentSlottedAugments[selectedItem.id]?.[idx]
                      const itemMinLevel = parseInt(selectedItem.minLevel, 10) || 1
                      const applicable = getApplicableAugments(augSlot.augmentType, itemMinLevel)

                      return (
                        <AugmentSlotItem
                          key={idx}
                          selectedItem={selectedItem}
                          idx={idx}
                          augSlot={augSlot}
                          slotted={slotted}
                          applicable={applicable}
                          slot={slot}
                          currentConflicts={currentConflicts}
                          currentEquipped={currentEquipped}
                          currentSlottedAugments={currentSlottedAugments}
                          setSlottedAugment={setSlottedAugment}
                          openSetBonusBrowser={openSetBonusBrowser}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className='text-center italic small text-secondary'>No Item Selected</div>
            )}
          </Card.Body>
        </Card>
      </Col>
    )
  }

  if (loading) {
    return (
      <Container className='py-4 text-center'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading Gear Data...</span>
        </div>
        <p className='mt-2'>Loading Gear Data...</p>
      </Container>
    )
  }

  if (!activeSetup) {
    return (
      <Container className='py-4'>
        <Card className='shadow'>
          <Card.Body className='text-center py-5'>
            <h4 className='text-muted'>No gear setups available.</h4>
            <Button variant='primary' className='mt-3' onClick={addSetup}>
              Create Default Setup
            </Button>
          </Card.Body>
        </Card>
      </Container>
    )
  }

  return (
    <div className='gear-planner-container'>
      <Button
        variant='primary'
        className='gear-planner-sidebar-toggle shadow-sm'
        onClick={() => {
          setShowSidebar(!showSidebar)
        }}
        title='Toggle Settings Sidebar'
      >
        <FaChevronRight className={showSidebar ? 'rotate-180' : ''} style={{ transition: 'transform 0.3s' }} />
      </Button>

      <Offcanvas
        show={showSidebar}
        onHide={() => {
          setShowSidebar(false)
        }}
        scroll
        className='gear-planner-sidebar gear-planner-offcanvas'
      >
        <Offcanvas.Header closeButton className='bg-primary text-white py-2'>
          <Offcanvas.Title className='fs-6'>Character Settings</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-3 bg-dark text-white'>
          <div className='mb-3 border-bottom pb-2'>
            <div className='fw-bold text-info small'>Current Setup</div>
            <div className='fs-5 text-truncate'>{activeSetup.name}</div>
          </div>
          <div className='mb-3 border-bottom pb-2'>
            <div className='fw-bold text-info small'>Level Range</div>
            <div className='fs-6'>
              ML {activeSetup.minLevel} - {activeSetup.maxLevel}
            </div>
          </div>
          <div className='mb-3'>
            <div className='fw-bold text-info small mb-1'>Classes</div>
            {activeSetup.classes.filter((c) => c !== null).length > 0 ? (
              <Stack gap={1} className='mb-3'>
                {activeSetup.classes.map(
                  (cls, idx) =>
                    cls && (
                      <Badge key={idx} bg='secondary' className='w-fit text-start py-1 px-2'>
                        {cls}
                      </Badge>
                    )
                )}
              </Stack>
            ) : (
              <div className='small italic text-secondary mb-3'>No classes selected</div>
            )}
          </div>
          <div className='mb-3'>
            <div className='fw-bold text-info small mb-1'>Weapon Filters</div>
            {activeSetup.weaponFilters.length > 0 ? (
              <div className='d-flex flex-wrap gap-1 mb-3'>
                {activeSetup.weaponFilters.map((w) => (
                  <Badge key={w} bg='dark' className='border border-secondary small'>
                    {w}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className='small italic text-secondary mb-3'>No weapon filters</div>
            )}
          </div>
          <div className='mb-3'>
            <div className='fw-bold text-info small mb-1'>Armor Filters</div>
            {activeSetup.armorFilters.length > 0 ? (
              <div className='d-flex flex-wrap gap-1'>
                {activeSetup.armorFilters.map((a) => (
                  <Badge key={a} bg='dark' className='border border-secondary small'>
                    {a}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className='small italic text-secondary'>No armor filters</div>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <Container fluid='lg' className='py-4'>
        <Card className='shadow'>
          <Card.Header className='bg-primary text-white py-3'>
            <Row className='align-items-center g-3'>
              <Col xs={12} md='auto'>
                <h2 className='mb-0'>Gear Planner</h2>
              </Col>
              <Col xs={12} md className='ms-md-auto'>
                <div className='d-flex justify-content-md-end gap-2'>
                  <Button
                    variant='light'
                    size='sm'
                    className='d-flex align-items-center gap-2'
                    onClick={() => {
                      setShowSetBonusBrowser(true)
                    }}
                  >
                    <FaLayerGroup /> Browse Set Bonuses
                  </Button>
                  <Button
                    variant='light'
                    size='sm'
                    className='d-flex align-items-center gap-2'
                    onClick={() => {
                      setShowEnchantmentSearch(true)
                    }}
                  >
                    <FaMagnifyingGlass /> Search Enchantments/Sets
                  </Button>
                </div>
              </Col>
              <Col xs={12} md='auto' className='d-flex gap-2 justify-content-md-end'>
                <Button
                  variant='outline-light'
                  size='sm'
                  className='d-flex align-items-center gap-2'
                  onClick={() => {
                    setShowSettings(true)
                  }}
                >
                  <FaGear /> Setup Settings
                </Button>
                <Button variant='outline-light' size='sm' onClick={addSetup}>
                  Add Setup
                </Button>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Tabs
              id='gear-setup-tabs'
              activeKey={activeSetupId}
              onSelect={(k) => {
                if (k) {
                  dispatch(setActiveSetupAction(k))
                }
              }}
              className='mb-4'
            >
              {setups.map((setup) => (
                <Tab
                  key={setup.id}
                  eventKey={setup.id}
                  title={
                    <Stack direction='horizontal' gap={2}>
                      <span>{setup.name}</span>
                      {setups.length > 1 && (
                        <Button
                          variant='link'
                          className='p-0 text-danger'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSetup(setup.id)
                          }}
                        >
                          <FaXmark />
                        </Button>
                      )}
                    </Stack>
                  }
                >
                  <div className='mt-3'>
                    <h5 className='mb-3 border-bottom pb-2'>Equipped Items</h5>
                    <Row>{GEAR_SLOTS.map((slot) => renderSlot(slot, setup))}</Row>
                    <SetBonusesSummary
                      equippedItems={characterEquipped}
                      slottedAugments={activeSetup.slottedAugments}
                      onSetClick={openSetBrowser}
                    />
                    <EnchantmentsSummary
                      equippedItems={characterEquipped}
                      slottedAugments={activeSetup.slottedAugments}
                    />

                    {setup.classes?.includes('Artificer') && setup.classes?.includes('Druid') && (
                      <div className='mt-4 p-2 bg-warning-subtle text-warning-emphasis border border-warning rounded small text-center fw-bold'>
                        Note: Only one pet may be active at a time.
                      </div>
                    )}

                    {setup.classes?.includes('Artificer') && (
                      <div className='mt-4 p-3 border border-info rounded bg-dark-subtle'>
                        <h5 className='mb-3 text-info border-bottom border-info pb-2'>Iron Defender (Artificer Pet)</h5>
                        <Row>{ARTIFICER_PET_SLOTS.map((slot) => renderSlot(slot, setup))}</Row>
                        <SetBonusesSummary
                          equippedItems={artificerEquipped}
                          slottedAugments={artificerPet.slottedAugments}
                          onSetClick={openSetBrowser}
                        />
                        <EnchantmentsSummary
                          equippedItems={artificerEquipped}
                          slottedAugments={artificerPet.slottedAugments}
                        />
                      </div>
                    )}

                    {setup.classes?.includes('Druid') && (
                      <div className='mt-4 p-3 border border-success rounded bg-dark-subtle'>
                        <h5 className='mb-3 text-success border-bottom border-success pb-2'>
                          Wolf Companion (Druid Pet)
                        </h5>
                        <Row>{DRUID_PET_SLOTS.map((slot) => renderSlot(slot, setup))}</Row>
                        <SetBonusesSummary
                          equippedItems={druidEquipped}
                          slottedAugments={druidPet.slottedAugments}
                          onSetClick={openSetBrowser}
                        />
                        <EnchantmentsSummary equippedItems={druidEquipped} slottedAugments={druidPet.slottedAugments} />
                      </div>
                    )}
                  </div>
                </Tab>
              ))}
            </Tabs>
          </Card.Body>
        </Card>

        <Modal
          show={showSettings}
          onHide={() => {
            setShowSettings(false)
          }}
          centered
          size='xl'
        >
          <Modal.Header closeButton className='bg-primary text-white'>
            <Modal.Title>Gear Setup Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body className='bg-dark text-white p-4'>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-4'>
                    <Form.Label className='fw-bold text-info'>Setup Name</Form.Label>
                    <Form.Control
                      type='text'
                      value={activeSetup.name}
                      className='bg-light text-dark'
                      onChange={(e) => {
                        dispatch(updateSetupAction({ id: activeSetup.id, name: e.target.value }))
                      }}
                    />
                  </Form.Group>

                  <Row className='mb-4'>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className='fw-bold text-info'>Min Level</Form.Label>
                        <Form.Control
                          type='number'
                          min={1}
                          max={34}
                          value={activeSetup.minLevel}
                          className='bg-light text-dark'
                          onChange={(e) => {
                            dispatch(updateSetupAction({ id: activeSetup.id, minLevel: Number(e.target.value) }))
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className='fw-bold text-info'>Max Level</Form.Label>
                        <Form.Control
                          type='number'
                          min={1}
                          max={34}
                          value={activeSetup.maxLevel}
                          className='bg-light text-dark'
                          onChange={(e) => {
                            dispatch(updateSetupAction({ id: activeSetup.id, maxLevel: Number(e.target.value) }))
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold text-info'>Classes (Up to 3)</Form.Label>
                    <Stack gap={2}>
                      {[0, 1, 2].map((idx) => (
                        <Form.Select
                          key={idx}
                          value={activeSetup.classes[idx] ?? ''}
                          className='bg-light text-dark'
                          onChange={(e) => {
                            const newClasses = [...activeSetup.classes]
                            newClasses[idx] = e.target.value || null

                            // We need to keep the updateClassProficiencies logic
                            // I'll update the slice to handle this or just pass the updated fields.
                            // The original code was mutating the object and then calling setSetups.

                            const setupUpdate: Partial<GearSetup> = {
                              id: activeSetup.id,
                              classes: newClasses
                            }

                            // Helper to calculate proficiencies
                            const tempSetup = { ...activeSetup, classes: newClasses }
                            updateClassProficiencies(tempSetup, activeSetup.classes, newClasses)
                            setupUpdate.weaponFilters = tempSetup.weaponFilters
                            setupUpdate.armorFilters = tempSetup.armorFilters
                            setupUpdate.shieldFilters = tempSetup.shieldFilters

                            dispatch(updateSetupAction(setupUpdate as GearSetup))
                          }}
                        >
                          <option value=''>Select Class...</option>
                          {GEAR_CLASSES.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </Form.Select>
                      ))}
                    </Stack>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold text-info d-block'>Weapon Type Filters</Form.Label>
                    <Accordion data-bs-theme='dark' className='border border-secondary rounded overflow-hidden'>
                      {Object.entries(WEAPON_TYPES).map(([category, types]) => (
                        <WeaponCategory
                          key={category}
                          category={category}
                          types={types}
                          activeSetup={activeSetup}
                          dispatch={dispatch}
                        />
                      ))}
                    </Accordion>
                  </Form.Group>

                  <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold text-info d-block'>Armor Type Filters</Form.Label>
                    <div className='p-2 border border-secondary rounded mb-3'>
                      <Row>
                        {ARMOR_TYPES.map((type) => (
                          <Col xs={12} md={6} key={type}>
                            <Form.Check
                              type='checkbox'
                              id={`armor-${type}`}
                              label={type}
                              checked={activeSetup.armorFilters.includes(type)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...activeSetup.armorFilters, type]
                                  : activeSetup.armorFilters.filter((t) => t !== type)
                                dispatch(updateSetupAction({ id: activeSetup.id, armorFilters: updated }))
                              }}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>

                    <Form.Label className='fw-bold text-info d-block'>Shield Type Filters</Form.Label>
                    <div className='p-2 border border-secondary rounded mb-3'>
                      <Row>
                        {SHIELD_TYPES.map((type) => (
                          <Col xs={12} md={6} key={type}>
                            <Form.Check
                              type='checkbox'
                              id={`shield-${type}`}
                              label={type}
                              checked={activeSetup.shieldFilters.includes(type)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...activeSetup.shieldFilters, type]
                                  : activeSetup.shieldFilters.filter((t) => t !== type)
                                dispatch(updateSetupAction({ id: activeSetup.id, shieldFilters: updated }))
                              }}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>

                    <Form.Label className='fw-bold text-info d-block'>Character Settings</Form.Label>
                    <div className='p-2 border border-secondary rounded'>
                      <Form.Check
                        type='checkbox'
                        id='druid-metal-override'
                        label='Allow Metal (Druidic Oath Override)'
                        checked={activeSetup.allowMetalWithDruid}
                        disabled={!activeSetup.classes.includes('Druid')}
                        onChange={(e) => {
                          dispatch(updateSetupAction({ id: activeSetup.id, allowMetalWithDruid: e.target.checked }))
                        }}
                      />
                      {!activeSetup.classes.includes('Druid') && (
                        <div className='text-muted small mt-0'>
                          <small>Only applicable if Druid class is selected.</small>
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer className='bg-primary border-top-0'>
            <Button
              variant='light'
              onClick={() => {
                setShowSettings(false)
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Offcanvas
          show={showEnchantmentSearch}
          onHide={() => {
            setShowEnchantmentSearch(false)
          }}
          placement='end'
          scroll
          className='gear-planner-enchantment-search gear-planner-offcanvas'
        >
          <Offcanvas.Header closeButton className='bg-primary text-white py-2'>
            <Offcanvas.Title className='fs-6'>Enchantment or Set Bonus Search</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className='p-3 bg-dark text-white'>
            <div className='mb-3 position-relative'>
              <Form.Control
                type='text'
                placeholder='Search by name, enchantment, or set bonus (min 3 chars)...'
                size='sm'
                value={enchantmentSearch}
                autoFocus
                onChange={(e) => {
                  setEnchantmentSearch(e.target.value)
                }}
                className='bg-light text-dark pe-4'
              />
              {enchantmentSearch && (
                <div
                  className='position-absolute end-0 top-50 translate-middle-y pe-2 cursor-pointer'
                  onClick={() => {
                    setEnchantmentSearch('')
                  }}
                >
                  <FaXmark size={14} className='text-muted' />
                </div>
              )}
            </div>

            <div className='mb-3'>
              <Form.Check
                type='checkbox'
                id='show-conflicts-search'
                label='Show conflicting/lesser items'
                checked={showConflicts}
                onChange={(e) => {
                  setShowConflicts(e.target.checked)
                }}
                className='small text-info'
              />
            </div>

            <div className='mt-3 overflow-auto' style={{ maxHeight: 'calc(100vh - 150px)' }}>
              {(() => {
                if (enchantmentSearch.length <= 2) {
                  return (
                    <div className='text-center py-4 text-secondary small'>Type at least 3 characters to search.</div>
                  )
                }

                if (!searchResultsBySlot || Object.keys(searchResultsBySlot).length === 0) {
                  return (
                    <div className='text-center py-4 text-secondary small'>No items found with that enchantment.</div>
                  )
                }

                return (
                  <Accordion data-bs-theme='dark'>
                    {Object.entries(searchResultsBySlot).map(([slot, items]) => (
                      <SearchResultSlot
                        key={slot}
                        slot={slot}
                        items={items}
                        getContextInfo={getContextInfo}
                        selectItem={selectItem}
                        setShowEnchantmentSearch={setShowEnchantmentSearch}
                        openSetBonusBrowser={openSetBonusBrowser}
                      />
                    ))}
                  </Accordion>
                )
              })()}
            </div>
          </Offcanvas.Body>
        </Offcanvas>

        <Offcanvas
          show={showSetBonusBrowser}
          onHide={() => {
            setShowSetBonusBrowser(false)
          }}
          placement='end'
          scroll
          className='gear-planner-set-bonus-browser gear-planner-offcanvas'
        >
          <Offcanvas.Header closeButton className='bg-primary text-white'>
            <Offcanvas.Title>Browse Set Bonuses</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className='bg-dark text-white p-3'>
            <Form.Group className='mb-3'>
              <Form.Label className='small text-info fw-bold'>Select a Set</Form.Label>
              <Form.Select
                size='sm'
                className='bg-light text-dark'
                value={browsingSet ?? ''}
                onChange={(e) => {
                  setBrowsingSet(e.target.value || null)
                }}
              >
                <option value=''>Choose a set...</option>
                {filteredSets.map((setName) => (
                  <option key={setName} value={setName}>
                    {setName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {browsingSet && (
              <div className='mt-4'>
                <h6 className='text-info border-bottom border-info pb-2 mb-3'>Items in: {browsingSet}</h6>
                <div className='overflow-auto' style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  {(() => {
                    const indexedItems = setBonusIndex[browsingSet ?? ''] || []
                    const min = activeSetup?.minLevel ?? 1
                    const max = activeSetup?.maxLevel ?? 34
                    const setItemResults = allItems.filter((item) => {
                      const itemLevel = Number(item.minLevel)
                      if (itemLevel < min || itemLevel > max) return false
                      if (!isItemVisibleForClasses(item, activeSetup)) return false
                      return indexedItems.some((ii) => ii.name === item.name && ii.minLevel === itemLevel)
                    })

                    if (setItemResults.length === 0) {
                      return (
                        <div className='text-center py-4 text-secondary small'>
                          No items found for this set in the selected level range.
                        </div>
                      )
                    }

                    // Group by slot
                    const grouped: Record<string, GearItem[]> = {}
                    setItemResults.forEach((item) => {
                      const slotKey = item.slot || 'Other'
                      if (!grouped[slotKey]) grouped[slotKey] = []
                      grouped[slotKey].push(item)
                    })

                    return (
                      <Accordion data-bs-theme='dark'>
                        {Object.entries(grouped).map(([slot, items]) => (
                          <SearchResultSlot
                            key={slot}
                            slot={slot}
                            items={items}
                            getContextInfo={getContextInfo}
                            selectItem={selectItem}
                            setShowEnchantmentSearch={() => {
                              /* Don't close for set bonus browser */
                            }}
                            openSetBonusBrowser={openSetBonusBrowser}
                          />
                        ))}
                      </Accordion>
                    )
                  })()}
                </div>
              </div>
            )}
          </Offcanvas.Body>
        </Offcanvas>

        <Offcanvas
          show={browsingSlot !== null}
          onHide={() => {
            openSlotBrowser(null)
          }}
          placement='end'
          scroll
          className='gear-planner-item-browser gear-planner-offcanvas'
        >
          <Offcanvas.Header closeButton className='bg-primary text-white'>
            <Offcanvas.Title>Select Item for {browsingSlot}</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {browsingSlot && (
              <>
                {(() => {
                  const { currentConflicts, currentEquipped, currentSlottedAugments } = getContextInfo(browsingSlot)

                  return (
                    <>
                      <div className='mb-3'>
                        <p className='text-light small mb-2'>
                          Showing {Math.min(itemsToShow, filteredItems.length)} of {filteredItems.length} results for{' '}
                          <strong>{browsingSlot}</strong> (Levels {activeSetup.minLevel}-{activeSetup.maxLevel})
                        </p>
                        <Form.Check
                          type='checkbox'
                          id='show-conflicts-browser'
                          label='Show conflicting/lesser items'
                          checked={showConflicts}
                          onChange={(e) => {
                            setShowConflicts(e.target.checked)
                          }}
                          className='small text-info'
                        />
                        <Form.Group className='mt-2'>
                          <Form.Select
                            size='sm'
                            className='bg-light text-dark'
                            value={setBonusFilter ?? ''}
                            onChange={(e) => {
                              setSetBonusFilter(e.target.value || null)
                            }}
                          >
                            <option value=''>All Set Bonuses (Filter...)</option>
                            {filteredSets.map((setName) => (
                              <option key={setName} value={setName}>
                                {setName}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className='list-group shadow-sm'>
                        <button
                          className='list-group-item list-group-item-action text-danger d-flex justify-content-between align-items-center'
                          onClick={() => {
                            if (browsingSlot) selectItem(browsingSlot, null)
                          }}
                        >
                          <span>Clear Slot</span>
                          <FaXmark />
                        </button>
                        {filteredItems.slice(0, itemsToShow).map((item) => (
                          <BrowserItem
                            key={item.id}
                            item={item}
                            browsingSlot={browsingSlot}
                            currentConflicts={currentConflicts}
                            currentEquipped={currentEquipped}
                            currentSlottedAugments={currentSlottedAugments}
                            selectItem={selectItem}
                            isMetal={isMetal}
                            openSetBonusBrowser={openSetBonusBrowser}
                          />
                        ))}
                        {filteredItems.length === 0 && (
                          <div className='list-group-item text-center py-4 text-light'>
                            No items found for this slot.
                          </div>
                        )}
                        {itemsToShow < filteredItems.length && (
                          <div
                            ref={observerTarget}
                            className='list-group-item text-center py-3 border-0 bg-transparent'
                          >
                            <div className='spinner-border spinner-border-sm text-primary' role='status'>
                              <span className='visually-hidden'>Loading more...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )
                })()}
              </>
            )}
          </Offcanvas.Body>
        </Offcanvas>
      </Container>
    </div>
  )
}

export default GearPlanner
