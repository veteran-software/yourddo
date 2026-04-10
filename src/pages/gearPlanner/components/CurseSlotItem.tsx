import { Dropdown } from 'react-bootstrap'
import {
  checkPotentialConflict,
  type EnchantmentConflict
} from '../conflictResolver.ts'
import {
  type Curse,
  type GearAugment,
  type GearItem,
  GearSlot
} from '../types.ts'
import EnchantmentList from './EnchantmentList.tsx'

const CurseSlotItem = (props: Props) => {
  const {
    allCurses,
    currentConflicts,
    currentEquipped,
    currentSlottedAugments,
    selectedItem,
    setCurse,
    slot,
    slotted
  } = props

  return (
    <div className='mx-n2 px-2 py-1 mb-1 bg-white last-child-mb-0'>
      <div className='d-flex align-items-center gap-1 mb-1'>
        <span className='text-dark fw-bold' style={{ fontSize: '0.6rem' }}>
          Deck of Many Curses
        </span>
      </div>

      <Dropdown className='w-100 flex-shrink-0'>
        <Dropdown.Toggle
          variant='outline-dark'
          id={`curse-drop-${selectedItem.id}`}
          className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
          style={{
            fontSize: '0.65rem',
            minHeight: '20px',
            backgroundColor: 'rgba(0,0,0,0.05)'
          }}
        >
          <span className='text-truncate text-dark d-flex align-items-center'>
            {slotted ? `${slotted.name} (${slotted.type})` : 'No Curse'}
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu
          className='gear-planner-augment-menu'
          style={{ fontSize: '0.65rem', maxHeight: '200px', overflowY: 'auto' }}
        >
          <Dropdown.Item
            onClick={() => {
              setCurse(selectedItem.id, null, slot)
            }}
          >
            No Curse
          </Dropdown.Item>

          <Dropdown.Divider />

          {allCurses.map((curse) => {
            const hasConflict = curse.enchantments?.some((ench) => {
              const potential = checkPotentialConflict(
                ench,
                currentEquipped,
                slot,
                currentSlottedAugments
              )

              return potential.isConflict && potential.isRedundant
            })

            const hasUpgrade = curse.enchantments?.some((ench) => {
              const pot = checkPotentialConflict(
                ench,
                currentEquipped,
                slot,
                currentSlottedAugments
              )

              return pot.isConflict && !pot.isRedundant
            })

            return (
              <Dropdown.Item
                key={curse.name}
                onClick={() => {
                  setCurse(selectedItem.id, curse, slot)
                }}
                active={slotted?.name === curse.name}
                className='d-flex align-items-center justify-content-between'
              >
                <span className='text-truncate'>
                  {curse.name} ({curse.type})
                </span>

                <span className='ms-2 flex-shrink-0'>
                  {hasConflict && (
                    <span
                      className='badge bg-warning text-dark px-1 py-0 ms-1'
                      style={{ fontSize: '0.55rem' }}
                    >
                      Conflicting
                    </span>
                  )}

                  {hasUpgrade && (
                    <span
                      className='badge bg-info px-1 py-0 ms-1'
                      style={{ fontSize: '0.55rem' }}
                    >
                      Upgrade
                    </span>
                  )}
                </span>
              </Dropdown.Item>
            )
          })}
        </Dropdown.Menu>
      </Dropdown>

      {slotted?.enchantments && (
        <div
          className='mt-1 ps-2 border-start border-2 gear-planner-augment-enchantments flex-grow-1'
          style={{ fontSize: '0.65rem', minHeight: '0' }}
        >
          <EnchantmentList
            enchantments={slotted.enchantments}
            itemId={`${selectedItem.id}-curse`}
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

interface Props {
  selectedItem: GearItem
  allCurses: Curse[]
  slotted: Curse | null | undefined
  slot: GearSlot
  currentConflicts: Record<string, EnchantmentConflict[]>
  currentEquipped: GearItem[]
  currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
  setCurse: (itemId: string, curse: Curse | null, slot?: GearSlot) => void
}

export default CurseSlotItem
