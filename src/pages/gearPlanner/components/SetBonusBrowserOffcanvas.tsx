import { Col, Form, Offcanvas, Row } from 'react-bootstrap'
import type { ItemRollup } from '../../../components/trove/types'
import type { EnchantmentConflict } from '../conflictResolver'
import { type GearAugment, type GearItem, GearSlot, type LootItem, type SetBonusIndex } from '../types'
import SetBonusItems from './SetBonusItems.tsx'

const SetBonusBrowserOffcanvas = (props: Props) => {
  const {
    allItems,
    browsingSet,
    filteredItemSets,
    allFiligreeSetNames,
    getContextInfo,
    openSetBonusBrowser,
    selectItem,
    setBonusIndex,
    setBrowsingSet,
    setShowSetBonusBrowser,
    showSetBonusBrowser,
    setBrowsingSlot,
    showOwnedOnly,
    setShowOwnedOnly,
    troveData,
    itemNameSearch,
    setItemNameSearch
  } = props

  return (
    <Offcanvas
      show={showSetBonusBrowser}
      onHide={() => {
        setShowSetBonusBrowser(false)
        setBrowsingSlot(null)
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
          <div className='d-flex justify-content-between align-items-center mb-1'>
            <Form.Label className='small text-info fw-bold mb-0'>Search Items</Form.Label>
            {troveData && Object.keys(troveData).length > 0 && (
              <Form.Check
                type='checkbox'
                id='show-owned-only-set-browser'
                label='Show owned items only'
                checked={showOwnedOnly}
                onChange={(e) => {
                  setShowOwnedOnly(e.target.checked)
                }}
                className='small text-warning'
              />
            )}
          </div>

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
              <Form.Label className='small text-info fw-bold'>Select an Item Set</Form.Label>

              <Form.Select
                size='sm'
                className='bg-light text-dark'
                value={filteredItemSets.includes(browsingSet ?? '') ? (browsingSet ?? '') : ''}
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
              <Form.Label className='small text-info fw-bold'>Select a Filigree Set</Form.Label>

              <Form.Select
                size='sm'
                className='bg-light text-dark'
                value={allFiligreeSetNames.includes(browsingSet ?? '') ? (browsingSet ?? '') : ''}
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
            <h6 className='text-info border-bottom border-info pb-2 mb-3'>Items in: {browsingSet}</h6>

            <div className='overflow-auto' style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <SetBonusItems
                browsingSet={browsingSet}
                allItems={allItems}
                setBonusIndex={setBonusIndex}
                showOwnedOnly={showOwnedOnly}
                troveData={troveData}
                itemNameSearch={itemNameSearch}
                getContextInfo={getContextInfo}
                selectItem={selectItem}
                openSetBonusBrowser={openSetBonusBrowser}
              />
            </div>
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  )
}

interface Props {
  allFiligreeSetNames: string[]
  allItems: GearItem[]
  browsingSet: string | null
  filteredItemSets: string[]
  getContextInfo: (slot: string) => {
    currentConflicts: Record<string, EnchantmentConflict[]>
    currentEquipped: GearItem[]
    currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
    currentSlottedFiligrees: Record<string, (LootItem | null)[]>
  }
  itemNameSearch: string
  openSetBonusBrowser: (setName: string, slot?: GearSlot | null) => void
  selectItem: (slot: GearSlot, item: GearItem | null) => void
  setBonusIndex: SetBonusIndex
  setBrowsingSet: (set: string | null) => void
  setBrowsingSlot: (slot: GearSlot | null) => void
  setItemNameSearch: (search: string) => void
  setShowOwnedOnly: (show: boolean) => void
  setShowSetBonusBrowser: (show: boolean) => void
  showOwnedOnly: boolean
  showSetBonusBrowser: boolean
  troveData: ItemRollup | null
}

export default SetBonusBrowserOffcanvas
