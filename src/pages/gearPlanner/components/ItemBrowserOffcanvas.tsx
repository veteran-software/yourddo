import { type RefObject } from 'react'
import { Form, Offcanvas } from 'react-bootstrap'
import { FaXmark } from 'react-icons/fa6'
import type { EnchantmentConflict } from '../conflictResolver'
import useItemBrowser from '../hooks/useItemBrowser.tsx'
import {
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot
} from '../types'

const ItemBrowserOffcanvas = (props: Props) => {
  const {
    activeSetup,
    browsingSlot,
    filteredItems,
    filteredItemSets,
    itemsToShow,
    observerTarget,
    openSlotBrowser,
    selectItem,
    setBonusFilter,
    setSetBonusFilter,
    setShowConflicts,
    showConflicts,
    itemNameSearch,
    setItemNameSearch
  } = props

  const { renderCategorizedItems } = useItemBrowser({ ...props })

  return (
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
            <div className='mb-3'>
              <div className='d-flex justify-content-between align-items-center mb-2'>
                <span className='text-light small'>
                  Levels {activeSetup.minLevel}-{activeSetup.maxLevel}
                </span>

                <Form.Check
                  type='checkbox'
                  id='show-conflicts-browser'
                  label='Show conflicting'
                  checked={showConflicts}
                  onChange={(e) => {
                    setShowConflicts(e.target.checked)
                  }}
                  className='small text-info'
                />
              </div>

              <Form.Group className='mb-3'>
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

              <Form.Group className='mb-3'>
                <Form.Select
                  size='sm'
                  className='bg-light text-dark'
                  value={setBonusFilter ?? ''}
                  onChange={(e) => {
                    setSetBonusFilter(e.target.value || null)
                  }}
                >
                  <option value=''>All Set Bonuses (Filter...)</option>
                  {filteredItemSets.map((setName) => (
                    <option key={setName} value={setName}>
                      {setName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <button
                className='btn btn-outline-danger btn-sm w-100 d-flex justify-content-between align-items-center mb-3'
                onClick={() => {
                  if (browsingSlot) selectItem(browsingSlot, null)
                }}
              >
                <span>Clear Slot</span>
                <FaXmark />
              </button>
            </div>

            {renderCategorizedItems()}

            {filteredItems.length === 0 && (
              <div className='text-center py-4 text-light'>
                No items found for this slot.
              </div>
            )}

            {itemsToShow < filteredItems.length && (
              <div
                ref={observerTarget}
                className='text-center py-3'
                style={{ minHeight: '50px' }}
              >
                <div
                  className='spinner-border spinner-border-sm text-primary'
                  role='status'
                >
                  <span className='visually-hidden' aria-hidden='true'>
                    Loading more...
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  )
}

interface Props {
  browsingSlot: GearSlot | null
  openSlotBrowser: (slot: GearSlot | null) => void
  itemsToShow: number
  filteredItems: GearItem[]
  activeSetup: GearSetup
  showConflicts: boolean
  setShowConflicts: (show: boolean) => void
  setBonusFilter: string | null
  setSetBonusFilter: (filter: string | null) => void
  filteredItemSets: string[]
  getContextInfo: (slot: GearSlot) => {
    currentConflicts: Record<string, EnchantmentConflict[]>
    currentEquipped: GearItem[]
    currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
  }
  selectItem: (slot: GearSlot, item: GearItem | null) => void
  isMetal: (material: string | null | undefined) => boolean
  openSetBonusBrowser: (setName: string) => void
  observerTarget: RefObject<HTMLDivElement | null>
  itemNameSearch: string
  setItemNameSearch: (search: string) => void
}

export default ItemBrowserOffcanvas
