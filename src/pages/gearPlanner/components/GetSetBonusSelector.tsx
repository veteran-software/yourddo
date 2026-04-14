import { Dropdown } from 'react-bootstrap'
import { type GearItem, type GearSetup, GearSlot } from '../types.ts'

const GemSetBonusSelector = (props: Props) => {
  const { activeSetup, selectedItem, setSlottedGemSetBonus, slot } = props

  return (
    <div className='mb-2 border-bottom pb-2'>
      <div className='text-primary mb-1' style={{ fontSize: '0.65rem' }}>
        Select Set Bonuses
      </div>
      {[0, 1].map((idx) => {
        const currentSelection =
          activeSetup.slottedGemSetBonuses?.[selectedItem.id]?.[idx] ?? null
        const otherSelection =
          activeSetup.slottedGemSetBonuses?.[selectedItem.id]?.[
            idx === 0 ? 1 : 0
          ] ?? null

        return (
          <div key={idx} className={idx === 0 ? 'mb-1' : ''}>
            <Dropdown className='w-100'>
              <Dropdown.Toggle
                variant='outline-dark'
                id={`gem-set-drop-${selectedItem.id}-${String(idx)}`}
                className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
                style={{
                  fontSize: '0.65rem',
                  minHeight: '20px',
                  backgroundColor: 'rgba(0,0,0,0.05)'
                }}
              >
                <span className='text-truncate text-dark'>
                  {currentSelection ?? '-- Select Set --'}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu
                style={{
                  fontSize: '0.65rem',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                <Dropdown.Item
                  onClick={() => {
                    setSlottedGemSetBonus(selectedItem.id, idx, null, slot)
                  }}
                >
                  -- None --
                </Dropdown.Item>

                <Dropdown.Divider />

                {selectedItem.setBonus?.map((sb) => (
                  <Dropdown.Item
                    key={sb.name}
                    disabled={sb.name === otherSelection}
                    onClick={() => {
                      setSlottedGemSetBonus(selectedItem.id, idx, sb.name, slot)
                    }}
                  >
                    {sb.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )
      })}
    </div>
  )
}

interface Props {
  selectedItem: GearItem
  activeSetup: GearSetup
  slot: GearSlot
  setSlottedGemSetBonus: (
    itemId: string,
    idx: number,
    setName: string | null,
    slot: GearSlot
  ) => void
}

export default GemSetBonusSelector
