import { useMemo } from 'react'
import { Dropdown } from 'react-bootstrap'
import { getReaperForgeEffectsForSlot, getReaperForgeEnchantments } from '../helpers'
import { type EntityGearState, type GearItem, type GearSlot } from '../types'
import SelectedEnchantmentDisplay from './SelectedEnchantmentDisplay'

interface Props {
  item: GearItem
  slot: GearSlot
  selectedEffectId: string | null
  onSelectEffect: (effectId: string | null) => void
  entityState: EntityGearState
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
}

const ReaperForgeSelector = ({
  item,
  slot,
  selectedEffectId,
  onSelectEffect,
  entityState,
  wrapperClassName,
  wrapperStyle
}: Props) => {
  const effects = useMemo(() => getReaperForgeEffectsForSlot(slot), [slot])
  if (effects.length === 0) return null

  const selectedEffect = effects.find((effect) => effect.id === selectedEffectId) ?? null

  return (
    <div className={wrapperClassName ?? 'mt-2'} style={wrapperStyle}>
      <div className='text-dark mb-0 text-start' style={{ fontSize: '0.6rem' }}>
        Reaper Forge
      </div>

      <Dropdown className='w-100'>
        <Dropdown.Toggle
          variant='outline-dark'
          id={`reaper-forge-drop-${item.id}`}
          className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
          style={{ fontSize: '0.65rem', minHeight: '20px', backgroundColor: 'rgba(0,0,0,0.05)' }}
        >
          <span className='text-truncate text-dark'>{selectedEffect?.name ?? '-- Select Enhancement --'}</span>
        </Dropdown.Toggle>

        <Dropdown.Menu className='shadow' style={{ fontSize: '0.65rem', maxHeight: '200px', overflowY: 'auto' }}>
          <Dropdown.Item
            onClick={() => {
              onSelectEffect(null)
            }}
          >
            -- None --
          </Dropdown.Item>

          <Dropdown.Divider />

          {effects.map((effect) => (
            <Dropdown.Item
              key={effect.id}
              onClick={() => {
                onSelectEffect(effect.id)
              }}
            >
              {effect.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      <SelectedEnchantmentDisplay
        selectedEnchantments={getReaperForgeEnchantments(selectedEffectId)}
        item={item}
        slot={slot}
        entityState={entityState}
        className='mt-1 text-secondary'
      />
    </div>
  )
}

export default ReaperForgeSelector
