import { Dropdown } from 'react-bootstrap'
import type { ItemRollup } from '../../../components/trove/types.ts'
import { ritualTable } from '../../../data/ritualTable.ts'
import type { GearItem, GearSlot, LootEnchantment } from '../types.ts'
import EnchantmentList from './EnchantmentList.tsx'
import TroveBadge from './TroveBadge.tsx'

interface RitualTableSelectorProps {
  item: GearItem
  slot: GearSlot
  selectedEnchantment: LootEnchantment | null
  onSelect: (enchantment: LootEnchantment | null) => void
  troveData: ItemRollup | null
}

const RitualTableSelector = ({
  item,
  slot,
  selectedEnchantment,
  onSelect,
  troveData
}: RitualTableSelectorProps) => {
  // Determine the requirement based on the enchantment
  const isWeapon = item.enchantments?.some((e) => e.name === 'Sealed in Fire')
  const isAccessory = item.enchantments?.some(
    (e) => e.name === 'Sealed in Undeath'
  )

  let requirementName: string | null = null
  if (isWeapon) {
    requirementName = 'Sealed in Fire Weapon'
  } else if (isAccessory) {
    requirementName = 'Sealed in Undeath Accessory'
  }

  if (!requirementName) return null

  // Find all recipes that have this requirement
  const recipes = ritualTable.filter((recipe) =>
    recipe.requirements?.some((req) => req.name === requirementName)
  )

  if (recipes.length === 0) return null

  return (
    <div className='mt-2'>
      <div className='text-dark mb-0 text-start' style={{ fontSize: '0.6rem' }}>
        Ritual Table Upgrade
      </div>
      <Dropdown className='w-100'>
        <Dropdown.Toggle
          variant='outline-dark'
          id={`ritual-table-drop-${item.id}`}
          className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
          style={{
            fontSize: '0.65rem',
            minHeight: '20px',
            backgroundColor: 'rgba(0,0,0,0.05)'
          }}
        >
          <span className='text-truncate text-dark'>
            {recipes.find((r) => {
              const effect = r.effectsAdded?.[0]
              return (
                (effect?.name ?? r.name) === selectedEnchantment?.name &&
                (effect?.modifier?.toString() ?? '1') ===
                  selectedEnchantment?.modifier &&
                (effect?.bonus ?? 'Enhancement') === selectedEnchantment?.bonus
              )
            })?.name ?? '-- Select Upgrade --'}
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
            return (
              <Dropdown.Item
                key={`${recipe.name}-${String(idx)}`}
                onClick={() => {
                  const effect = recipe.effectsAdded?.[0]
                  onSelect({
                    name: effect?.name ?? recipe.name,
                    modifier: effect?.modifier?.toString() ?? '1',
                    bonus: effect?.bonus ?? 'Enhancement' // Default as requested
                  })
                }}
                className='d-flex justify-content-between align-items-center'
              >
                <span>{recipe.name}</span>
                {troveData && (
                  <TroveBadge troveData={troveData} itemName={recipe.name} />
                )}
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

export default RitualTableSelector
