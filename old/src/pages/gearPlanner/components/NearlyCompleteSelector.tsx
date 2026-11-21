import { useMemo } from 'react'
import { Dropdown } from 'react-bootstrap'
import { getNearlyCompleteRecipes, toNearlyCompleteSelection } from '../nearlyComplete'
import type { EntityGearState, GearItem, GearSlot } from '../types'
import type { NearlyCompleteSelection } from '../upgradeState'
import SelectedEnchantmentDisplay from './SelectedEnchantmentDisplay'

interface Props {
  item: GearItem
  slot: GearSlot
  selectedUpgrade: NearlyCompleteSelection | null
  onSelect: (upgrade: NearlyCompleteSelection | null) => void
  entityState: EntityGearState
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
}

const NearlyCompleteSelector = ({
  item,
  slot,
  selectedUpgrade,
  onSelect,
  entityState,
  wrapperClassName,
  wrapperStyle
}: Props) => {
  const recipes = useMemo(() => getNearlyCompleteRecipes(item), [item])

  if (recipes.length === 0) return null

  return (
    <div className={wrapperClassName ?? 'mt-2'} style={wrapperStyle}>
      <div className='text-dark mb-0 text-start' style={{ fontSize: '0.6rem' }}>
        Nearly Complete
      </div>

      <Dropdown className='w-100'>
        <Dropdown.Toggle
          variant='outline-dark'
          id={`nearly-complete-drop-${item.id}`}
          className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
          style={{ fontSize: '0.65rem', minHeight: '20px', backgroundColor: 'rgba(0,0,0,0.05)' }}
        >
          <span className='text-truncate text-dark'>{selectedUpgrade?.name ?? '-- Select Enhancement --'}</span>
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

          {recipes.map((recipe) => (
            <Dropdown.Item
              key={recipe.name}
              onClick={() => {
                onSelect(toNearlyCompleteSelection(recipe))
              }}
            >
              {recipe.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      <SelectedEnchantmentDisplay
        selectedEnchantments={selectedUpgrade?.effectsAdded}
        item={item}
        slot={slot}
        entityState={entityState}
      />
    </div>
  )
}

export default NearlyCompleteSelector
