import { Accordion, Card, Stack } from 'react-bootstrap'
import type { ItemRollup } from '../../../components/trove/types'
import { getTroveOwners, normItem } from '../../../utils/troveUtils.ts'
import type { EnchantmentConflict } from '../conflictResolver.ts'
import { type GearAugment, type GearItem, GearSlot } from '../types.ts'
import AugmentSlotsList from './AugmentSlotList.tsx'
import GenericBadge from './badges/GenericBadge.tsx'
import SetBonusBadge from './badges/SetBonusBadge.tsx'
import EnchantmentList from './EnchantmentList.tsx'
import TroveBadge from './TroveBadge.tsx'

const SearchResultSlot = (props: Props) => {
  const {
    browsingSet,
    getContextInfo,
    items,
    openSetBonusBrowser,
    selectItem,
    setShowEnchantmentSearch,
    slot,
    troveData
  } = props

  const { currentConflicts, currentEquipped, currentSlottedAugments } =
    getContextInfo(slot)
  const equippedInSlot = currentEquipped.find((e) => e.slot === slot)
  const isPartofSet =
    !browsingSet ||
    equippedInSlot?.setBonus?.some((sb) => sb.name === browsingSet)

  return (
    <Accordion.Item eventKey={slot} key={slot}>
      <Accordion.Header className='small fw-bold'>
        <div className='d-flex justify-content-between w-100 me-3'>
          <span>
            {slot} ({items.length})
          </span>
          {equippedInSlot && (
            <span
              className={`${isPartofSet ? 'text-info' : 'text-warning'} ms-2`}
              style={{ fontSize: '0.75rem' }}
            >
              {equippedInSlot.name}
            </span>
          )}
        </div>
      </Accordion.Header>

      <Accordion.Body className='p-2 bg-dark'>
        <Stack gap={2}>
          {items.map((item) => {
            const isEquipped = currentEquipped.some((e) => e.id === item.id)
            const troveEntry = troveData?.[normItem(item.name)]
            const owners = troveEntry ? getTroveOwners(troveEntry) : ''
            const showHeader = isEquipped || owners

            return (
              <Card
                key={item.id}
                className='shadow-sm cursor-pointer border-secondary bg-white text-dark position-relative'
                onClick={() => {
                  selectItem(item.slot, item)
                  setShowEnchantmentSearch(false)
                }}
              >
                {showHeader && (
                  <Card.Header className='py-0 px-2 bg-secondary-subtle d-flex align-items-center gap-1 overflow-hidden'>
                    {isEquipped && <GenericBadge badgeText='Equipped' />}

                    {troveData && (
                      <TroveBadge itemName={item.name} troveData={troveData} />
                    )}
                  </Card.Header>
                )}

                <Card.Body className='p-2'>
                  <div className='fw-bold small text-truncate text-dark'>
                    {item.name}
                  </div>
                  <div
                    className='text-dark fw-medium'
                    style={{ fontSize: '0.7rem' }}
                  >
                    ML: {item.minLevel || '1'} | {item.type || 'Item'}
                  </div>

                  {item.setBonus && item.setBonus.length > 0 && (
                    <div className='mt-1 mb-1'>
                      {item.setBonus.map((sb) => (
                        <SetBonusBadge
                          key={`${item.id}-${sb.name}`}
                          setName={sb.name}
                          openSetBonusBrowser={openSetBonusBrowser}
                        />
                      ))}
                    </div>
                  )}

                  {item.augments && item.augments.length > 0 && (
                    <AugmentSlotsList augments={item.augments} />
                  )}

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
            )
          })}
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
  troveData: ItemRollup | null
  browsingSet?: string | null
}

export default SearchResultSlot
