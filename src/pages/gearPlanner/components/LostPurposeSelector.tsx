import { Dropdown } from 'react-bootstrap'
import { cannithRepurposingStation as lostPurposeRecipes } from '../../../data/cannithRepurposingStation.ts'
import type { GearItem, GearSlot, LootEnchantment } from '../types.ts'
import EnchantmentList from './EnchantmentList.tsx'

interface LostPurposeSelectorProps {
  item: GearItem
  slot: GearSlot
  selectedEnchantment: LootEnchantment | null
  onSelect: (enchantment: LootEnchantment | null) => void
}

const LostPurposeSelector = ({
  item,
  slot,
  selectedEnchantment,
  onSelect
}: LostPurposeSelectorProps) => {
  // Filter recipes for compatible items
  // cannithRepurposingStation.ts exports an array of recipes
  const recipes = lostPurposeRecipes.filter((r) => {
    const isLostPurpose = r.description?.includes('Lost Purpose item')
    if (!isLostPurpose) return false

    const isLegendaryRecipe = r.name?.toLowerCase().includes('legendary')
    const isLegendaryItem = (parseInt(item.minLevel) || 1) >= 20

    if (isLegendaryItem) {
      return isLegendaryRecipe
    }
    return !isLegendaryRecipe
  })

  if (recipes.length === 0) return null

  // Find the recipe name for the selected enchantment to display in the toggle
  const selectedRecipe = recipes.find(
    (r) => r.setBonus?.[0]?.name === selectedEnchantment?.name
  )

  return (
    <div className='mt-2'>
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
            {selectedRecipe?.name ??
              selectedEnchantment?.name ??
              '-- Select Set Bonus --'}
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
          {recipes.map((recipe, idx) => {
            const setBonusName = recipe.setBonus?.[0]?.name
            if (!setBonusName) return null

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

      {selectedEnchantment && (
        <div
          className='mt-1 text-secondary text-start'
          style={{ fontSize: '0.6rem', lineHeight: '1.1' }}
        >
          <EnchantmentList
            enchantments={[selectedEnchantment]}
            itemId={item.id}
            conflicts={{}}
            equippedItems={[]}
            source='slot'
            browsingSlot={slot}
          />
        </div>
      )}
    </div>
  )
}

export default LostPurposeSelector
