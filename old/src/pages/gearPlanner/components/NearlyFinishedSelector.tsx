import { useMemo } from 'react'
import { Dropdown, Form } from 'react-bootstrap'
import nearlyFinishedRecipes from '../../../data/nearlyFinished/recipes.json'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { getNearlyFinishedChoiceLabels, parseNearlyFinishedChoice } from '../helpers'
import SelectedEnchantmentDisplay, { type BaseSelectorProps } from './SelectedEnchantmentDisplay.tsx'

const ACTIVE_SENTINEL = '__active__'

const NearlyFinishedSelector = (props: BaseSelectorProps) => {
  const { item, slot, selectedEnchantment, onSelect, entityState, wrapperClassName, wrapperStyle } = props
  const recipes: Recipe[] = useMemo(
    () => (nearlyFinishedRecipes as unknown as NearlyFinishedRecipes).reforgingStation,
    []
  )

  const recipe: Recipe | undefined = recipes.find((r: Recipe) => r.item === item.name && r.stage === 'Nearly Finished')

  if (!recipe) return null

  const choiceLabels = getNearlyFinishedChoiceLabels(recipe.choices, item.upgradeable)
  const hasChoices = choiceLabels.length > 0
  const isActive = selectedEnchantment !== null
  const wClass = wrapperClassName ?? 'mt-2'

  if (!hasChoices) {
    return (
      <div className={wClass} style={wrapperStyle}>
        <Form.Check
          type='checkbox'
          id={`nearly-finished-check-${item.id}-${slot}`}
          label='Nearly Finished upgrade applied'
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

  return (
    <div className={wClass} style={wrapperStyle}>
      <div className='text-dark mb-0 text-start' style={{ fontSize: '0.6rem' }}>
        Nearly Finished
      </div>

      <Dropdown className='w-100'>
        <Dropdown.Toggle
          variant='outline-dark'
          id={`nearly-finished-drop-${item.id}`}
          className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
          style={{
            fontSize: '0.65rem',
            minHeight: '20px',
            backgroundColor: 'rgba(0,0,0,0.05)'
          }}
        >
          <span className='text-truncate text-dark'>{selectedEnchantment?.name ?? '-- Select Enhancement --'}</span>
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
              onSelect(null)
            }}
          >
            -- None --
          </Dropdown.Item>

          <Dropdown.Divider />

          {choiceLabels.map((choiceName: string, idx: number) => {
            const parsedChoice = parseNearlyFinishedChoice(choiceName)

            return (
              <Dropdown.Item
                key={`${choiceName}-${String(idx)}`}
                onClick={() => {
                  onSelect(parsedChoice)
                }}
                className='d-flex justify-content-between align-items-center'
              >
                <span>{choiceName}</span>
              </Dropdown.Item>
            )
          })}
        </Dropdown.Menu>
      </Dropdown>

      <SelectedEnchantmentDisplay
        selectedEnchantment={selectedEnchantment}
        item={item}
        slot={slot}
        entityState={entityState}
        className='mt-1 text-secondary'
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

export default NearlyFinishedSelector
