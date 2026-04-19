import React, { Fragment } from 'react'
import { Dropdown, Form } from 'react-bootstrap'
import { useAppSelector } from '../../../redux/hooks.ts'
import { getTroveKey } from '../../../utils/troveUtils.ts'
import { checkPotentialConflict } from '../conflictResolver.ts'
import {
  type EntityGearState,
  type GearAugment,
  type GearAugmentSlot,
  type GearItem,
  GearSlot
} from '../types.ts'
import GenericBadge from './badges/GenericBadge.tsx'
import SetBonusBadge from './badges/SetBonusBadge.tsx'
import EnchantmentList from './EnchantmentList.tsx'
import TroveBadge from './TroveBadge.tsx'

/**
 * Renders an augment slot item within a gear planning UI.
 * This component is responsible for displaying and managing an individual slot where a gear augment can be applied.
 * It provides a dropdown for selecting or clearing an augment and displays associated augment properties and effects.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.applicable - The applicable augments available for this slot, grouped and sorted by type.
 * @param {Object} props.augSlot - Metadata about the augment slot, such as its type and associated name.
 * @param {Array} props.currentConflicts - A list of potential or existing conflicts related to applied augments.
 * @param {Array} props.currentEquipped - The list of items currently equipped by the user.
 * @param {Array} props.currentSlottedAugments - Augments currently slotted for the gear being planned.
 * @param {Array} props.currentSlottedNearlyFinished - Augments related to "nearly finished" configurations.
 * @param {Array} props.currentSlottedRitualTable - Augments applied based on ritual-related configurations.
 * @param {Array} props.currentSlottedLostPurpose - Augments linked to specific "Lost Purpose" characteristics.
 * @param {number} props.idx - The unique index of the current augment slot item.
 * @param {Function} props.openSetBonusBrowser - Callback to open the UI for browsing available set bonuses.
 * @param {Object} props.selectedItem - The gear item currently selected for augmentation.
 * @param {Function} props.setSlottedAugment - Callback for updating the slotted augment in the parent state.
 * @param {Object} props.slot - Represents metadata specific to an augmentable slot in the gear configuration.
 * @param {Object|null} props.slotted - The augment currently slotted in this slot, if any.
 */
const AugmentSlotItem = (props: Props) => {
  const { applicable, augSlot, entityState, idx, openSetBonusBrowser, selectedItem, setSlottedAugment, slot, slotted } =
    props

  const {
    equipped: currentEquipped,
    slottedAugments: currentSlottedAugments,
    slottedNearlyFinished: currentSlottedNearlyFinished,
    slottedRitualTable: currentSlottedRitualTable,
    slottedLostPurpose: currentSlottedLostPurpose,
    slottedFountainOfNecroticMight: currentSlottedFountainOfNecroticMight,
    slottedStormreaverUpgrade: currentSlottedStormreaverUpgrade
  } = entityState

  const { troveData } = useAppSelector((state) => state.app)
  const [showOwnedOnly, setShowOwnedOnly] = React.useState(false)

  const filterApplicable = (group: GearAugment[]) => {
    if (!showOwnedOnly || !troveData) {
      return group
    }

    return group.filter((aug: GearAugment) => getTroveKey(aug.name) in troveData)
  }

  return (
    <div key={idx} className='mx-n2 px-2 py-1 mb-1 bg-white last-child-mb-0'>
      <div className='d-flex align-items-center justify-content-between mb-0 mt-n1'>
        <span
          className='text-dark fw-bold d-flex flex-row justify-content-between w-100'
          style={{ fontSize: '0.6rem' }}
        >
          {augSlot.name ?? `${augSlot.augmentType} Slot`}
          {troveData && Object.keys(troveData).length > 0 && (
            <Form.Check
              type='checkbox'
              id={`show-owned-only-aug-${selectedItem.id}-${String(idx)}`}
              label='Owned only'
              checked={showOwnedOnly}
              onChange={(e) => {
                setShowOwnedOnly(e.target.checked)
              }}
              className='small text-info pb-0 mb-0'
              style={{ fontSize: '0.65rem' }}
            />
          )}
        </span>
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
            {slotted ? `${slotted.name} (ML:${String(slotted.minLevel)})` : 'Empty Slot'}
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
            <Fragment key={groupName}>
              <Dropdown.Header className='text-light fw-bold py-0 ps-1' style={{ fontSize: '0.65rem' }}>
                {groupName} Augments
              </Dropdown.Header>

              {filterApplicable(applicable.groups[groupName]).map((aug: GearAugment) => {
                if (selectedItem.minimumLevel && aug.minLevel > selectedItem.minimumLevel) {
                  return null
                }

                const results = aug.effectsAdded?.map((ench) =>
                  checkPotentialConflict(
                    ench,
                    currentEquipped,
                    slot,
                    currentSlottedAugments,
                    currentSlottedNearlyFinished,
                    currentSlottedRitualTable,
                    currentSlottedLostPurpose,
                    currentSlottedFountainOfNecroticMight,
                    currentSlottedStormreaverUpgrade,
                    selectedItem.id,
                    idx
                  )
                )

                const hasConflict = results?.some((pot) => pot.isConflict && pot.isRedundant)
                const hasUpgrade = results?.some((pot) => pot.isConflict && pot.isUpgrade)
                const isOverpowered = results?.some((pot) => pot.isConflict && pot.isOverpowered)

                return (
                  <Dropdown.Item
                    key={`${aug.name}-${String(aug.minLevel)}`}
                    onClick={() => {
                      setSlottedAugment(selectedItem.id, idx, aug, slot)
                    }}
                    active={slotted?.name === aug.name}
                    className='d-flex align-items-center justify-content-between'
                  >
                    <span className='text-truncate'>
                      {troveData && <TroveBadge itemName={aug.name} troveData={troveData} />}
                      {aug.name} (ML:{aug.minLevel})
                    </span>

                    <span className='ms-2 flex-shrink-0'>
                      {hasConflict && <GenericBadge badgeText='Redundant' />}

                      {hasUpgrade && <GenericBadge badgeText='Upgrade' />}

                      {isOverpowered && <GenericBadge badgeText='Overpowered' />}
                    </span>
                  </Dropdown.Item>
                )
              })}
            </Fragment>
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
  idx: number
  augSlot: GearAugmentSlot
  slotted: GearAugment | null | undefined
  applicable: {
    groups: Record<string, GearAugment[]>
    sortedGroupNames: string[]
  }
  slot: GearSlot
  entityState: EntityGearState
  setSlottedAugment: (itemId: string, slotIndex: number, augment: GearAugment | null, slot?: GearSlot) => void
  openSetBonusBrowser: (setName: string) => void
}

export default AugmentSlotItem
