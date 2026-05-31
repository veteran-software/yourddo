import {useMemo} from 'react'
import {Dropdown} from 'react-bootstrap'
import {cannithRepurposingStation as lostPurposeRecipes} from '../../../data/cannithRepurposingStation.ts'
import type {CraftingIngredient} from '../../../types/crafting.ts'
import SelectedEnchantmentDisplay, {type BaseSelectorProps} from './SelectedEnchantmentDisplay.tsx'

const LostPurposeSelector = (props: BaseSelectorProps) => {
  const { item, slot, selectedEnchantment, onSelect, entityState, wrapperClassName, wrapperStyle } = props

  // Filter recipes for compatible items
  // cannithRepurposingStation.ts exports an array of recipes
  const recipes: CraftingIngredient[] = useMemo(
    () =>
      lostPurposeRecipes.filter((recipe: CraftingIngredient) => {
        const isLostPurpose: boolean | undefined = recipe.description?.includes('Lost Purpose item')
        if (!isLostPurpose) {
          return false
        }

        const isLegendaryRecipe: boolean = recipe.name.toLowerCase().includes('legendary')
        const isLegendaryItem: boolean = (Number.parseInt(String(item.minLevel)) || 1) >= 20

        if (isLegendaryItem) {
          return isLegendaryRecipe
        }
        return !isLegendaryRecipe
      }),
    [item.minLevel]
  )

  if (recipes.length === 0) {
    return null
  }

  // Find the recipe name for the selected enchantment to display in the toggle
  const selectedRecipe: CraftingIngredient | undefined = recipes.find(
    (recipe: CraftingIngredient) => recipe.setBonus?.[0]?.name === selectedEnchantment?.name
  )

  return (
    <div className={wrapperClassName ?? 'mt-2'} style={wrapperStyle}>
      <div className='text-dark mb-0 text-start' style={{ fontSize: '0.6rem' }}>
        Lost Purpose Upgrade
      </div>

      <Dropdown className='w-100'>
        <Dropdown.Toggle
          variant='outline-dark'
          id={`lost-purpose-drop-${item.id}`}
          className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
          style={{
            fontSize: '0.65rem',
            minHeight: '20px',
            backgroundColor: 'rgba(0,0,0,0.05)'
          }}
        >
          <span className='text-truncate text-dark'>
            {selectedRecipe?.name ?? selectedEnchantment?.name ?? '-- Select Set Bonus --'}
          </span>
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

          {recipes.map((recipe: CraftingIngredient, idx: number) => {
            const setBonusName: string | undefined = recipe.setBonus?.[0]?.name
            if (!setBonusName) {
              return null
            }

            return (
              <Dropdown.Item
                key={`${setBonusName}-${String(idx)}`}
                onClick={() => {
                  onSelect({
                    name: setBonusName,
                    bonus: 'Set Bonus'
                  })
                }}
                className='d-flex justify-content-between align-items-center'
              >
                <span>{recipe.name}</span>
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
      />
    </div>
  )
}

export default LostPurposeSelector
