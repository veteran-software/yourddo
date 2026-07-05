import { useMemo } from 'react'
import { Dropdown } from 'react-bootstrap'
import { getMythicBoostChoices, getMythicBoostEnchantments } from '../mythicBoost'
import { type EntityGearState, type GearItem, type GearSlot, type LootEnchantment } from '../types'
import SelectedEnchantmentDisplay from './SelectedEnchantmentDisplay'

interface Props {
  item: GearItem
  slot: GearSlot
  selectedEnchantment: LootEnchantment | null
  onSelect: (enchantment: LootEnchantment | null) => void
  entityState: EntityGearState
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
}

const MythicBoostSelector = ({
  item,
  slot,
  selectedEnchantment,
  onSelect,
  entityState,
  wrapperClassName,
  wrapperStyle
}: Props) => {
  const choices = useMemo(() => getMythicBoostChoices(item), [item])
  if (choices.length === 0) return null

  const selectedChoice = choices.find(
    (choice) =>
      choice.selectionLabel === selectedEnchantment?.name &&
      String(choice.amount) === String(selectedEnchantment?.modifier)
  )
  const fallbackLabel = selectedEnchantment
    ? `${selectedEnchantment.name} +${String(selectedEnchantment.modifier ?? '')} (${String(
        selectedEnchantment.bonus ?? 'Mythic'
      )})`
    : '-- Select Boost --'

  return (
    <div className={wrapperClassName ?? 'mt-2'} style={wrapperStyle}>
      <div className='text-dark mb-0 text-start' style={{ fontSize: '0.6rem' }}>
        Mythic Boost
      </div>

      <Dropdown className='w-100'>
        <Dropdown.Toggle
          variant='outline-dark'
          id={`mythic-boost-drop-${item.id}`}
          className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
          style={{ fontSize: '0.65rem', minHeight: '20px', backgroundColor: 'rgba(0,0,0,0.05)' }}
        >
          <span className='text-truncate text-dark'>
            {selectedChoice ? `${selectedChoice.selectionLabel} +${selectedChoice.amount}` : fallbackLabel}
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu className='shadow' style={{ fontSize: '0.65rem', maxHeight: '200px', overflowY: 'auto' }}>
          <Dropdown.Item
            onClick={() => {
              onSelect(null)
            }}
          >
            -- None --
          </Dropdown.Item>

          <Dropdown.Divider />

          {choices.map((choice, idx) => (
            <Dropdown.Item
              key={`${choice.label}-${String(idx)}`}
              onClick={() => {
                onSelect({
                  name: choice.selectionLabel,
                  modifier: choice.amount,
                  bonus: 'Mythic'
                })
              }}
            >
              {choice.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      <SelectedEnchantmentDisplay
        selectedEnchantments={getMythicBoostEnchantments(item, selectedEnchantment)}
        item={item}
        slot={slot}
        entityState={entityState}
        className='mt-1 text-secondary'
      />
    </div>
  )
}

export default MythicBoostSelector
