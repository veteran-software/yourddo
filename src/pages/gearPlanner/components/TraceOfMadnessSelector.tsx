import { Dropdown } from 'react-bootstrap'
import traceOfMadnessData from '../../../data/traceOfMadness.json'
import { type EntityGearState, type GearItem, type GearSlot, type UpgradeEntry } from '../types'
import SelectedEnchantmentDisplay from './SelectedEnchantmentDisplay.tsx'

interface TraceOfMadnessSelectorProps {
  item: GearItem
  slot: GearSlot
  selectedEnchantment: string | null
  onSelect: (upgradeName: string | null) => void
  entityState: EntityGearState
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
}

const TraceOfMadnessSelector = (props: TraceOfMadnessSelectorProps) => {
  const { item, slot, wrapperClassName, wrapperStyle } = props

  // Filter recipes for compatible items
  // In this case, any item with the 'Trace of Madness' enchantment
  const hasTraceOfMadness = item.enchantments?.some((e) => e.name === 'Trace of Madness')

  if (!hasTraceOfMadness) {
    return null
  }

  const selectedUpgrade = props.selectedEnchantment
    ? (traceOfMadnessData as UpgradeEntry[]).find((upgrade) => upgrade.name === props.selectedEnchantment)
    : undefined

  return (
    <div className={wrapperClassName ?? 'mt-2'} style={wrapperStyle}>
      <div className='text-dark mb-0 text-start' style={{ fontSize: '0.6rem' }}>
        Trace of Madness Upgrade
      </div>

      <Dropdown className='w-100'>
        <Dropdown.Toggle
          variant='outline-dark'
          id={`trace-of-madness-drop-${item.id}`}
          className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
          style={{
            fontSize: '0.65rem',
            minHeight: '20px',
            backgroundColor: 'rgba(0,0,0,0.05)'
          }}
        >
          <span className='text-truncate text-dark'>{selectedUpgrade?.name ?? '-- Select Upgrade --'}</span>
        </Dropdown.Toggle>

        <Dropdown.Menu
          className='shadow'
          style={{
            fontSize: '0.65rem',
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          <Dropdown.Item
            onClick={() => {
              props.onSelect(null)
            }}
          >
            -- None --
          </Dropdown.Item>

          <Dropdown.Divider />

          {(traceOfMadnessData as UpgradeEntry[]).map((upgrade: UpgradeEntry, idx: number) => {
            return (
              <Dropdown.Item
                key={`${upgrade.name}-${String(idx)}`}
                onClick={() => {
                  props.onSelect(upgrade.name)
                }}
                className='d-flex justify-content-between align-items-center'
              >
                <span>{upgrade.name}</span>
              </Dropdown.Item>
            )
          })}
        </Dropdown.Menu>
      </Dropdown>

      <SelectedEnchantmentDisplay
        selectedEnchantments={selectedUpgrade?.effectsAdded ?? null}
        item={item}
        slot={slot}
        entityState={props.entityState}
      />
    </div>
  )
}

export default TraceOfMadnessSelector
