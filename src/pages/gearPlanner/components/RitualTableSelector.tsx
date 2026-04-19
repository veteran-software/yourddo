import { useMemo } from 'react'
import { Dropdown } from 'react-bootstrap'
import type { ItemRollup } from '../../../components/trove/types.ts'
import { ritualTable } from '../../../data/ritualTable.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import type { LootEnchantment } from '../types.ts'
import SelectedEnchantmentDisplay, {
  type BaseSelectorProps
} from './SelectedEnchantmentDisplay.tsx'
import TroveBadge from './TroveBadge.tsx'

interface Props extends BaseSelectorProps {
  troveData: ItemRollup | null
}

const RitualTableSelector = (props: Props) => {
  const {
    item,
    onSelect,
    selectedEnchantment,
    slot,
    troveData,
    conflicts,
    equippedItems,
    slottedAugments,
    slottedNearlyFinished,
    slottedRitualTable,
    slottedLostPurpose,
    wrapperClassName,
    wrapperStyle
  } = props

  // Determine the requirement based on the enchantment
  const isWeapon =
    Array.isArray(item.enchantments) &&
    item.enchantments.some((enchantment: LootEnchantment) => enchantment.name === 'Sealed in Fire')
  const isAccessory =
    Array.isArray(item.enchantments) &&
    item.enchantments.some((enchantment: LootEnchantment) => enchantment.name === 'Sealed in Undeath')

  let requirementName: string | null = null
  if (isWeapon) {
    requirementName = 'Sealed in Fire Weapon'
  } else if (isAccessory) {
    requirementName = 'Sealed in Undeath Accessory'
  }

  // Find all recipes that have this requirement
  const recipes: CraftingIngredient[] = useMemo(
    () =>
      ritualTable.filter((recipe: CraftingIngredient) =>
        recipe.requirements?.some((req: CraftingIngredient) => req.name === requirementName)
      ),
    [requirementName]
  )

  if (!requirementName || recipes.length === 0) {
    return null
  }

  return (
    <div className={wrapperClassName ?? 'mt-2'} style={wrapperStyle}>
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
            {selectedEnchantment
              ? (recipes.find((r) => {
                  const effect = r.effectsAdded?.[0]
                  return (
                    (effect?.name ?? r.name) === selectedEnchantment.name &&
                    (effect?.modifier?.toString() ?? '1') === selectedEnchantment.modifier &&
                    (effect?.bonus ?? 'Enhancement') === selectedEnchantment.bonus
                  )
                })?.name ?? selectedEnchantment.name)
              : '-- Select Upgrade --'}
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
                {troveData && <TroveBadge troveData={troveData} itemName={recipe.name} />}
              </Dropdown.Item>
            )
          })}
        </Dropdown.Menu>
      </Dropdown>

      <SelectedEnchantmentDisplay
        selectedEnchantment={selectedEnchantment}
        item={item}
        slot={slot}
        conflicts={conflicts}
        equippedItems={equippedItems}
        slottedAugments={slottedAugments}
        slottedNearlyFinished={slottedNearlyFinished}
        slottedRitualTable={slottedRitualTable}
        slottedLostPurpose={slottedLostPurpose}
      />
    </div>
  )
}

export default RitualTableSelector
