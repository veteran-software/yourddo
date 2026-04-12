import { Dropdown } from 'react-bootstrap'
import type { ItemRollup } from '../../../components/trove/types.ts'
import nearlyFinishedRecipes from '../../../data/nearlyFinished/recipes.json'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import type { GearItem, GearSlot, LootEnchantment } from '../types.ts'
import EnchantmentList from './EnchantmentList.tsx'
import TroveBadge from './TroveBadge.tsx'

interface Choice {
  name: string
}

interface Recipe {
  item: string
  stage: string
  choices: Choice[]
}

interface NearlyFinishedSelectorProps {
  item: GearItem
  slot: GearSlot
  selectedEnchantment: LootEnchantment | null
  onSelect: (enchantment: LootEnchantment | null) => void
  troveData: ItemRollup | null
}

const NearlyFinishedSelector = ({
  item,
  selectedEnchantment,
  onSelect,
  troveData
}: NearlyFinishedSelectorProps) => {
  const recipes =
    (
      nearlyFinishedRecipes as unknown as {
        meltingStation: CraftingIngredient[]
        reforgingStation: Recipe[]
      }
    ).reforgingStation || []

  const recipe = recipes.find(
    (r: Recipe) => r.item === item.name && r.stage === 'Nearly Finished'
  )

  if (!recipe) return null

  return (
    <div className='mt-2'>
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
          <span className='text-truncate text-dark'>
            {selectedEnchantment?.name ?? '-- Select Enhancement --'}
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
          {recipe.choices.map((choice, idx) => {
            // Check if the user owns an upgraded version with this choice

            return (
              <Dropdown.Item
                key={`${choice.name}-${String(idx)}`}
                onClick={() => {
                  onSelect({
                    name: choice.name,
                    bonus: 'Enhancement', // Default as requested
                    modifier: choice.name.split('+').pop()?.trim() ?? ''
                  })
                }}
                className='d-flex justify-content-between align-items-center'
              >
                <span>{choice.name}</span>
                {troveData && (
                  <TroveBadge troveData={troveData} itemName={item.name} />
                )}
              </Dropdown.Item>
            )
          })}
        </Dropdown.Menu>
      </Dropdown>
      {selectedEnchantment && (
        <div
          className='mt-1 text-secondary'
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

export default NearlyFinishedSelector
