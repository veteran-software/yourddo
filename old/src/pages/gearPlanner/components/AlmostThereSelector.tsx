import { useMemo } from 'react'
import { Dropdown, Form } from 'react-bootstrap'
import nearlyFinishedRecipes from '../../../data/nearlyFinished/recipes.json'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import SelectedEnchantmentDisplay, { type BaseSelectorProps } from './SelectedEnchantmentDisplay.tsx'

const ACTIVE_SENTINEL = '__active__'

const AlmostThereSelector = (props: BaseSelectorProps) => {
  const { item, slot, selectedEnchantment, onSelect, entityState, wrapperClassName, wrapperStyle } = props

  const recipe = useMemo(
    () =>
      (nearlyFinishedRecipes as unknown as NearlyFinishedRecipes).reforgingStation.find(
        (r) => r.item === item.name && r.stage === 'Almost There'
      ),
    [item.name]
  )

  if (!recipe) return null

  const hasChoices = (recipe.choices?.length ?? 0) > 0
  const isActive = selectedEnchantment !== null

  const wClass = wrapperClassName ?? 'mt-2'

  if (hasChoices) {
    return (
      <div className={wClass} style={wrapperStyle}>
        <div className='text-dark mb-0 text-start' style={{ fontSize: '0.6rem' }}>
          Almost There
        </div>

        <Dropdown className='w-100'>
          <Dropdown.Toggle
            variant='outline-dark'
            id={`almost-there-drop-${item.id}`}
            className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
            style={{ fontSize: '0.65rem', minHeight: '20px', backgroundColor: 'rgba(0,0,0,0.05)' }}
          >
            <span className='text-truncate text-dark'>
              {selectedEnchantment && selectedEnchantment.name !== ACTIVE_SENTINEL
                ? selectedEnchantment.name
                : '-- Select Enhancement --'}
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
            {(recipe.choices ?? []).map((choice, idx) => (
              <Dropdown.Item
                key={`${choice.name}-${String(idx)}`}
                onClick={() => {
                  onSelect({
                    name: choice.name,
                    bonus: 'Enhancement',
                    modifier: choice.name.split('+').pop()?.trim() ?? ''
                  })
                }}
                className='d-flex justify-content-between align-items-center'
              >
                <span>{choice.name}</span>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <SelectedEnchantmentDisplay
          selectedEnchantment={
            selectedEnchantment && selectedEnchantment.name !== ACTIVE_SENTINEL ? selectedEnchantment : null
          }
          item={item}
          slot={slot}
          entityState={entityState}
          className='mt-1 text-secondary'
        />
      </div>
    )
  }

  return (
    <div className={wClass} style={wrapperStyle}>
      <Form.Check
        type='checkbox'
        id={`almost-there-check-${item.id}-${slot}`}
        label='Almost There upgrade applied'
        checked={isActive}
        onChange={(e) => {
          onSelect(e.target.checked ? { name: ACTIVE_SENTINEL } : null)
        }}
        style={{ fontSize: '0.65rem' }}
        className='text-start fw-bold text-primary'
      />
    </div>
  )
}

interface NearlyFinishedRecipes {
  meltingStation: CraftingIngredient[]
  reforgingStation: Recipe[]
}

interface Recipe {
  item: string
  stage: string
  choices?: { name: string }[]
}

export default AlmostThereSelector
