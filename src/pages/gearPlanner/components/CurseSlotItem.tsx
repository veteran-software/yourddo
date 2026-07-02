import { Dropdown } from 'react-bootstrap'
import { checkPotentialConflict } from '../conflictResolver.ts'
import { canApplyCurse } from '../helpers.ts'
import { type Curse, type EntityGearState, type GearItem, GearSlot } from '../types.ts'
import EnchantmentList from './EnchantmentList.tsx'

const CurseSlotItem = (props: Props) => {
  const { allCurses, entityState, selectedItem, setCurse, slot, slotted } = props

  if (!canApplyCurse(selectedItem)) return null

  const {
    equipped: currentEquipped,
    slottedAugments: currentSlottedAugments,
    slottedNearlyFinished: currentSlottedNearlyFinished,
    slottedRitualTable: currentSlottedRitualTable,
    slottedLostPurpose: currentSlottedLostPurpose,
    slottedTraceOfMadness: currentSlottedTraceOfMadness,
    slottedFountainOfNecroticMight: currentSlottedFountainOfNecroticMight,
    slottedStormreaverUpgrade: currentSlottedStormreaverUpgrade,
    slottedZhentarimAttuned: currentSlottedZhentarimAttuned
  } = entityState

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
            {slotted ? slotted.name : 'Empty Slot'}
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
            const results =
              Array.isArray(curse.enchantments) &&
              curse.enchantments.map((ench) =>
                checkPotentialConflict(ench, currentEquipped, slot, {
                  slottedAugments: currentSlottedAugments,
                  slottedNearlyFinished: currentSlottedNearlyFinished,
                  slottedRitualTable: currentSlottedRitualTable,
                  slottedLostPurpose: currentSlottedLostPurpose,
                  slottedTraceOfMadness: currentSlottedTraceOfMadness,
                  slottedFountainOfNecroticMight: currentSlottedFountainOfNecroticMight,
                  slottedStormreaverUpgrade: currentSlottedStormreaverUpgrade,
                  slottedZhentarimAttuned: currentSlottedZhentarimAttuned,
                  ignoreItemId: selectedItem.id
                })
              )

            const hasConflict = results && results.some((pot) => pot.isConflict && pot.isRedundant)
            const hasUpgrade = results && results.some((pot) => pot.isConflict && pot.isUpgrade)
            const isOverpowered = results && results.some((pot) => pot.isConflict && pot.isOverpowered)

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
                    <span className='badge bg-warning text-dark px-1 py-0 ms-1' style={{ fontSize: '0.55rem' }}>
                      Conflicting
                    </span>
                  )}

                  {hasUpgrade && (
                    <span className='badge bg-info px-1 py-0 ms-1' style={{ fontSize: '0.55rem' }}>
                      Upgrade
                    </span>
                  )}

                  {isOverpowered && (
                    <span className='badge bg-danger px-1 py-0 ms-1' style={{ fontSize: '0.55rem' }}>
                      Overpowered
                    </span>
                  )}
                </span>
              </Dropdown.Item>
            )
          })}
        </Dropdown.Menu>
      </Dropdown>

      {slotted && (
        <div
          className='mt-1 ps-2 border-start border-2 gear-planner-augment-enchantments flex-grow-1'
          style={{ fontSize: '0.65rem', minHeight: '0' }}
        >
          <EnchantmentList
            enchantments={slotted.enchantments}
            itemId={`${selectedItem.id}-curse`}
            entityState={entityState}
            source='slot'
            browsingSlot={slot}
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
  entityState: EntityGearState
  setCurse: (itemId: string, curse: Curse | null, slot?: GearSlot) => void
}

export default CurseSlotItem
