import { Accordion, Col, Form, Offcanvas, Row } from 'react-bootstrap'
import type { ItemRollup } from '../../../components/trove/types'
import { normItem } from '../../../utils/troveUtils.ts'
import type { EnchantmentConflict } from '../conflictResolver'
import {
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootItem,
  type SetBonusIndex
} from '../types'
import SearchResultSlot from './SearchResultSlot'

const SetBonusBrowserOffcanvas = (props: Props) => {
  const {
    activeSetup,
    allItems,
    browsingSet,
    filteredItemSets,
    allFiligreeSetNames,
    getContextInfo,
    isItemVisibleForClasses,
    openSetBonusBrowser,
    selectItem,
    setBonusIndex,
    setBrowsingSet,
    setShowSetBonusBrowser,
    showSetBonusBrowser,
    troveData,
    itemNameSearch,
    setItemNameSearch
  } = props

  return (
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
          <Form.Label className='small text-info fw-bold'>
            Search Items
          </Form.Label>

          <Form.Control
            type='text'
            placeholder='Search items by name...'
            size='sm'
            className='bg-light text-dark fw-bold dark-placeholder'
            value={itemNameSearch}
            onChange={(e) => {
              setItemNameSearch(e.target.value)
            }}
          />
        </Form.Group>

        <Row>
          <Col xs={12} md={6}>
            <Form.Group className='mb-3'>
              <Form.Label className='small text-info fw-bold'>
                Select an Item Set
              </Form.Label>

              <Form.Select
                size='sm'
                className='bg-light text-dark'
                value={
                  filteredItemSets.includes(browsingSet ?? '')
                    ? (browsingSet ?? '')
                    : ''
                }
                onChange={(e) => {
                  setBrowsingSet(e.target.value || null)
                }}
              >
                <option value=''>Choose a set...</option>
                {filteredItemSets.map((setName) => (
                  <option key={setName} value={setName}>
                    {setName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group className='mb-3'>
              <Form.Label className='small text-info fw-bold'>
                Select a Filigree Set
              </Form.Label>

              <Form.Select
                size='sm'
                className='bg-light text-dark'
                value={
                  allFiligreeSetNames.includes(browsingSet ?? '')
                    ? (browsingSet ?? '')
                    : ''
                }
                onChange={(e) => {
                  setBrowsingSet(e.target.value || null)
                }}
              >
                <option value=''>Choose a set...</option>
                {allFiligreeSetNames.map((setName) => (
                  <option key={setName} value={setName}>
                    {setName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {browsingSet && (
          <div className='mt-4'>
            <h6 className='text-info border-bottom border-info pb-2 mb-3'>
              Items in: {browsingSet}
            </h6>

            <div
              className='overflow-auto'
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              {(() => {
                const indexedItems = setBonusIndex[browsingSet ?? ''] || []
                const min = activeSetup?.minLevel ?? 1
                const max = activeSetup?.maxLevel ?? 34

                const setItemResults = allItems.filter((item) => {
                  const itemLevel = Number(item.minLevel) || 1
                  if (itemLevel < min || itemLevel > max) return false
                  if (!isItemVisibleForClasses(item, activeSetup)) return false
                  if (itemNameSearch) {
                    const searchLower = itemNameSearch.toLowerCase().trim()
                    if (
                      !item.name.toLowerCase().includes(searchLower) &&
                      !item.name
                        .toLowerCase()
                        .replaceAll(/[^a-z0-9]/g, '')
                        .includes(searchLower.replaceAll(/[^a-z0-9]/g, ''))
                    )
                      return false
                  }
                  return indexedItems.some(
                    (ii) =>
                      ii.name === item.name &&
                      (item.slot === GearSlot.Filigree ||
                        ii.minLevel === itemLevel)
                  )
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
                setItemResults
                  .toSorted((a, b) => {
                    // Priority 1: Trove ownership
                    const isOwnedA = troveData?.[normItem(a.name)] ? 1 : 0
                    const isOwnedB = troveData?.[normItem(b.name)] ? 1 : 0
                    if (isOwnedA !== isOwnedB) return isOwnedB - isOwnedA

                    // Priority 2: Min Level (desc)
                    const levelA = Number.parseInt(a.minLevel, 10) || 0
                    const levelB = Number.parseInt(b.minLevel, 10) || 0
                    if (levelB !== levelA) return levelB - levelA

                    // Priority 3: Name (asc)
                    return a.name.localeCompare(b.name)
                  })
                  .forEach((item) => {
                    const slotKey = item.slot || 'Other'
                    if (!grouped[slotKey]) grouped[slotKey] = []
                    grouped[slotKey].push(item)
                  })

                return (
                  <Accordion data-bs-theme='dark'>
                    {Object.entries(grouped).map(([slot, items]) => {
                      const {
                        currentConflicts,
                        currentEquipped,
                        currentSlottedAugments,
                        currentSlottedFiligrees
                      } = getContextInfo(slot)

                      return (
                        <SearchResultSlot
                          key={slot}
                          slot={slot}
                          items={items}
                          currentConflicts={currentConflicts}
                          currentEquipped={currentEquipped}
                          currentSlottedAugments={currentSlottedAugments}
                          currentSlottedFiligrees={
                            currentSlottedFiligrees as Record<
                              string,
                              (GearItem | null)[]
                            >
                          }
                          selectItem={selectItem}
                          setShowEnchantmentSearch={() => {
                            /* Don't close for set bonus browser */
                          }}
                          openSetBonusBrowser={openSetBonusBrowser}
                          troveData={troveData}
                          browsingSet={browsingSet}
                        />
                      )
                    })}
                  </Accordion>
                )
              })()}
            </div>
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  )
}

interface Props {
  showSetBonusBrowser: boolean
  setShowSetBonusBrowser: (show: boolean) => void
  browsingSet: string | null
  setBrowsingSet: (set: string | null) => void
  filteredItemSets: string[]
  allFiligreeSetNames: string[]
  setBonusIndex: SetBonusIndex
  activeSetup: GearSetup
  allItems: GearItem[]
  isItemVisibleForClasses: (item: GearItem, setup: GearSetup) => boolean
  getContextInfo: (slot: string) => {
    currentConflicts: Record<string, EnchantmentConflict[]>
    currentEquipped: GearItem[]
    currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
    currentSlottedFiligrees: Record<string, (LootItem | null)[]>
  }
  selectItem: (slot: GearSlot, item: GearItem | null) => void
  openSetBonusBrowser: (setName: string) => void
  troveData: ItemRollup | null
  itemNameSearch: string
  setItemNameSearch: (search: string) => void
}

export default SetBonusBrowserOffcanvas
