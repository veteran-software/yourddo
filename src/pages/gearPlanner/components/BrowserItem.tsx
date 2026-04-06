import { Badge } from 'react-bootstrap'
import { useAppSelector } from '../../../redux/hooks.ts'
import { getTroveOwners, normItem } from '../../../utils/troveUtils.ts'
import type { EnchantmentConflict } from '../conflictResolver.ts'
import { type GearAugment, type GearItem, GearSlot } from '../types.ts'
import AugmentSlotsList from './AugmentSlotList.tsx'
import EnchantmentList from './EnchantmentList.tsx'

const BrowserItem = (props: Props) => {
  const {
    browsingSlot,
    currentConflicts,
    currentEquipped,
    currentSlottedAugments,
    isMetal,
    item,
    openSetBonusBrowser,
    selectItem
  } = props

  const { troveData } = useAppSelector((state) => state.app)

  const troveEntry = troveData?.[normItem(item.name)]
  const owners = troveEntry ? getTroveOwners(troveEntry) : ''

  return (
    <button
      key={item.id}
      className='list-group-item list-group-item-action d-flex justify-content-between align-items-start position-relative'
      onClick={() => {
        if (browsingSlot) selectItem(browsingSlot, item)
      }}
    >
      <div className='w-100'>
        <div className='d-flex justify-content-between align-items-center mb-1'>
          <div className='fw-bold text-white fs-6'>
            {currentEquipped.some((e) => e.id === item.id) && (
              <Badge bg='success' className='me-2' style={{ fontSize: '0.6rem' }}>
                Equipped
              </Badge>
            )}

            {item.name}

            {owners && (
              <Badge bg='primary' className='me-2' style={{ fontSize: '0.6rem' }}>
                {owners}
              </Badge>
            )}
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

        <div className='text-light small mb-1'>
          ML: {item.minLevel || '1'} | {item.type || 'Item'} | Material:{' '}
          <span className={`fw-bold ${isMetal(item.material) ? 'text-danger' : 'text-success'}`}>
            {item.material || 'Unknown'}
          </span>
        </div>

        {item.augments && item.augments.length > 0 && <AugmentSlotsList augments={item.augments} />}

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

interface Props {
  item: GearItem
  browsingSlot: GearSlot
  currentConflicts: Record<string, EnchantmentConflict[]>
  currentEquipped: GearItem[]
  currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
  selectItem: (slot: GearSlot, item: GearItem | null) => void
  isMetal: (material: string | null | undefined) => boolean
  openSetBonusBrowser: (setName: string) => void
}

export default BrowserItem
