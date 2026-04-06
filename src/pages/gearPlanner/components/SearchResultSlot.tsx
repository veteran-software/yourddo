import { Accordion, Badge, Card, Stack } from 'react-bootstrap'
import type { EnchantmentConflict } from '../conflictResolver.ts'
import { type GearAugment, type GearItem, GearSlot } from '../types.ts'
import AugmentSlotsList from './AugmentSlotList.tsx'
import EnchantmentList from './EnchantmentList.tsx'

const SearchResultSlot = (props: Props) => {
  const { getContextInfo, items, openSetBonusBrowser, selectItem, setShowEnchantmentSearch, slot } = props

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
                  ML: {item.minLevel || '1'} | {item.type || 'Item'}
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

interface Props {
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
}

export default SearchResultSlot
