import { useAppSelector } from '../../../redux/hooks.ts'
import type { EnchantmentConflict } from '../conflictResolver.ts'
import { type GearAugment, type GearItem, GearSlot } from '../types.ts'
import AugmentSlotsList from './AugmentSlotList.tsx'
import EnchantmentList from './EnchantmentList.tsx'
import GenericBadge from './GenericBadge.tsx'
import SetBonusBadge from './SetBonusBadge.tsx'
import TroveBadge from './TroveBadge.tsx'

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
              <GenericBadge badgeText='Equipped' />
            )}

            {item.name}

            {troveData && (
              <TroveBadge itemName={item.name} troveData={troveData} />
            )}
          </div>

          <GenericBadge badgeText='Select' fontSize='0.75rem' />
        </div>

        {item.setBonus && item.setBonus.length > 0 && (
          <div className='mt-1 mb-1'>
            {item.setBonus.map((sb) => (
              <SetBonusBadge
                key={sb.name}
                openSetBonusBrowser={openSetBonusBrowser}
                setName={sb.name}
              />
            ))}
          </div>
        )}

        <div className='text-light small mb-1'>
          ML: {item.minLevel || '1'} | {item.type || 'Item'} | Material:{' '}
          <span
            className={`fw-bold ${isMetal(item.material) ? 'text-danger' : 'text-success'}`}
          >
            {item.material || 'Unknown'}
          </span>
        </div>

        {item.augments && item.augments.length > 0 && (
          <AugmentSlotsList augments={item.augments} />
        )}

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
