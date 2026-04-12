import React from 'react'
import { Dropdown, Form } from 'react-bootstrap'
import { useAppSelector } from '../../../redux/hooks.ts'
import { getTroveKey } from '../../../utils/troveUtils.ts'
import {
  checkPotentialConflict,
  type EnchantmentConflict
} from '../conflictResolver.ts'
import {
  type GearAugment,
  type GearAugmentSlot,
  type GearItem,
  GearSlot
} from '../types.ts'
import GenericBadge from './badges/GenericBadge.tsx'
import SetBonusBadge from './badges/SetBonusBadge.tsx'
import EnchantmentList from './EnchantmentList.tsx'
import TroveBadge from './TroveBadge.tsx'

const AugmentSlotItem = (props: Props) => {
  const {
    applicable,
    augSlot,
    currentConflicts,
    currentEquipped,
    currentSlottedAugments,
    idx,
    openSetBonusBrowser,
    selectedItem,
    setSlottedAugment,
    slot,
    slotted
  } = props

  const { troveData } = useAppSelector((state) => state.app)
  const [showOwnedOnly, setShowOwnedOnly] = React.useState(false)

  const filterApplicable = (group: GearAugment[]) => {
    if (!showOwnedOnly || !troveData) return group
    return group.filter((aug) => !!troveData[getTroveKey(aug.name)])
  }

  return (
    <div key={idx} className='mx-n2 px-2 py-1 mb-1 bg-white last-child-mb-0'>
      <div className='d-flex align-items-center justify-content-between mb-1'>
        <span className='text-dark fw-bold' style={{ fontSize: '0.6rem' }}>
          {augSlot.name ?? `${augSlot.augmentType} Slot`}
        </span>
        {troveData && Object.keys(troveData).length > 0 && (
          <Form.Check
            type='checkbox'
            id={`show-owned-only-aug-${selectedItem.id}-${String(idx)}`}
            label='Owned only'
            checked={showOwnedOnly}
            onChange={(e) => {
              setShowOwnedOnly(e.target.checked)
            }}
            className='small text-warning'
            style={{ fontSize: '0.55rem' }}
          />
        )}
      </div>

      <Dropdown className='w-100 flex-shrink-0'>
        <Dropdown.Toggle
          variant='outline-dark'
          id={`aug-drop-${selectedItem.id}-${String(idx)}`}
          className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
          style={{
            fontSize: '0.65rem',
            minHeight: '20px',
            backgroundColor: 'rgba(0,0,0,0.05)'
          }}
        >
          <span className='text-truncate text-dark d-flex align-items-center'>
            {slotted
              ? `${slotted.name} (ML:${String(slotted.minimumLevel)})`
              : 'Empty Slot'}
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu
          className='gear-planner-augment-menu'
          style={{ fontSize: '0.65rem', maxHeight: '200px', overflowY: 'auto' }}
        >
          <Dropdown.Item
            onClick={() => {
              setSlottedAugment(selectedItem.id, idx, null, slot)
            }}
          >
            Empty Slot
          </Dropdown.Item>

          <Dropdown.Divider />

          {applicable.sortedGroupNames.map((groupName) => (
            <React.Fragment key={groupName}>
              <Dropdown.Header
                className='text-light fw-bold py-0 ps-1'
                style={{ fontSize: '0.6rem' }}
              >
                {groupName} Augments
              </Dropdown.Header>

              {filterApplicable(applicable.groups[groupName]).map((aug) => {
                const hasConflict = aug.effectsAdded?.some((ench) => {
                  const pot = checkPotentialConflict(
                    ench,
                    currentEquipped,
                    slot,
                    currentSlottedAugments
                  )
                  return pot.isConflict && pot.isRedundant
                })

                const hasUpgrade = aug.effectsAdded?.some((ench) => {
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
                    key={`${aug.name}-${String(aug.minimumLevel)}`}
                    onClick={() => {
                      setSlottedAugment(selectedItem.id, idx, aug, slot)
                    }}
                    active={slotted?.name === aug.name}
                    className='d-flex align-items-center justify-content-between'
                  >
                    <span className='text-truncate'>
                      {troveData && (
                        <TroveBadge itemName={aug.name} troveData={troveData} />
                      )}
                      {aug.name} (ML:{aug.minimumLevel})
                    </span>

                    <span className='ms-2 flex-shrink-0'>
                      {hasConflict && <GenericBadge badgeText='Conflicting' />}

                      {hasUpgrade && <GenericBadge badgeText='Upgrade' />}
                    </span>
                  </Dropdown.Item>
                )
              })}
            </React.Fragment>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {slotted?.setBonus && slotted.setBonus.length > 0 && (
        <div className='mt-1 ps-2 mb-1'>
          {slotted.setBonus.map((sb, idx) => (
            <SetBonusBadge
              key={`${sb.name}-${String(idx)}`}
              setName={sb.name}
              openSetBonusBrowser={openSetBonusBrowser}
            />
          ))}
        </div>
      )}
      {slotted?.effectsAdded && slotted.effectsAdded.length > 0 && (
        <div
          className='mt-1 ps-2 border-start border-2 gear-planner-augment-enchantments flex-grow-1'
          style={{ fontSize: '0.65rem', minHeight: '0' }}
        >
          <EnchantmentList
            enchantments={slotted.effectsAdded}
            itemId={`${selectedItem.id}-aug-${String(idx)}`}
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
  idx: number
  augSlot: GearAugmentSlot
  slotted: GearAugment | null | undefined
  applicable: {
    groups: Record<string, GearAugment[]>
    sortedGroupNames: string[]
  }
  slot: GearSlot
  currentConflicts: Record<string, EnchantmentConflict[]>
  currentEquipped: GearItem[]
  currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
  setSlottedAugment: (
    itemId: string,
    slotIndex: number,
    augment: GearAugment | null,
    slot?: GearSlot
  ) => void
  openSetBonusBrowser: (setName: string) => void
}

export default AugmentSlotItem
