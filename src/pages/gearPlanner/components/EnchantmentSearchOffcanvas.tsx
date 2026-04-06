import { Accordion, Form, Offcanvas } from 'react-bootstrap'
import { FaXmark } from 'react-icons/fa6'
import type { EnchantmentConflict } from '../conflictResolver'
import { type GearAugment, type GearItem, GearSlot } from '../types'
import SearchResultSlot from './SearchResultSlot'

const EnchantmentSearchOffcanvas = (props: Props) => {
  const {
    enchantmentSearch,
    getContextInfo,
    openSetBonusBrowser,
    searchResultsBySlot,
    selectItem,
    setEnchantmentSearch,
    setShowConflicts,
    setShowEnchantmentSearch,
    showConflicts,
    showEnchantmentSearch
  } = props

  return (
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
              return <div className='text-center py-4 text-secondary small'>Type at least 3 characters to search.</div>
            }

            if (!searchResultsBySlot || Object.keys(searchResultsBySlot).length === 0) {
              return <div className='text-center py-4 text-secondary small'>No items found with that enchantment.</div>
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
  )
}

interface Props {
  showEnchantmentSearch: boolean
  setShowEnchantmentSearch: (show: boolean) => void
  enchantmentSearch: string
  setEnchantmentSearch: (search: string) => void
  showConflicts: boolean
  setShowConflicts: (show: boolean) => void
  searchResultsBySlot: Record<string, GearItem[]> | null
  getContextInfo: (slot: string) => {
    currentConflicts: Record<string, EnchantmentConflict[]>
    currentEquipped: GearItem[]
    currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
  }
  selectItem: (slot: GearSlot, item: GearItem | null) => void
  openSetBonusBrowser: (setName: string) => void
}

export default EnchantmentSearchOffcanvas
