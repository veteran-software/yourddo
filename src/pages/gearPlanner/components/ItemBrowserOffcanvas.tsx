import type { RefObject } from 'react'
import { Form, Offcanvas } from 'react-bootstrap'
import { FaXmark } from 'react-icons/fa6'
import type { EnchantmentConflict } from '../conflictResolver'
import { type GearAugment, type GearItem, type GearSetup, GearSlot } from '../types'
import BrowserItem from './BrowserItem'

const ItemBrowserOffcanvas = (props: Props) => {
  const {
    activeSetup,
    browsingSlot,
    filteredItems,
    filteredSets,
    getContextInfo,
    isMetal,
    itemsToShow,
    observerTarget,
    openSetBonusBrowser,
    openSlotBrowser,
    selectItem,
    setBonusFilter,
    setSetBonusFilter,
    setShowConflicts,
    showConflicts
  } = props

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
                      <div className='list-group-item text-center py-4 text-light'>No items found for this slot.</div>
                    )}

                    {itemsToShow < filteredItems.length && (
                      <div ref={observerTarget} className='list-group-item text-center py-3 border-0 bg-transparent'>
                        <div className='spinner-border spinner-border-sm text-primary' role='status'>
                          <span className='visually-hidden' aria-hidden='true'>
                            Loading more...
                          </span>
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
  filteredSets: string[]
  getContextInfo: (slot: string) => {
    currentConflicts: Record<string, EnchantmentConflict[]>
    currentEquipped: GearItem[]
    currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
  }
  selectItem: (slot: GearSlot, item: GearItem | null) => void
  isMetal: (material: string | null | undefined) => boolean
  openSetBonusBrowser: (setName: string) => void
  observerTarget: RefObject<HTMLDivElement | null>
}

export default ItemBrowserOffcanvas
