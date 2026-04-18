import { useMemo } from 'react'
import { Dropdown } from 'react-bootstrap'
import nearlyFinishedRecipes from '../../../data/nearlyFinished/recipes.json'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import type { GearItem, GearSlot, LootEnchantment } from '../types.ts'
import EnchantmentList from './EnchantmentList.tsx'

const NearlyFinishedSelector = ({
  item,
  slot,
  selectedEnchantment,
  onSelect,
  conflicts,
  equippedItems,
  slottedAugments,
  slottedNearlyFinished,
  slottedRitualTable,
  slottedLostPurpose,
  wrapperClassName,
  wrapperStyle
}: Props) => {
  const recipes: Recipe[] = useMemo(
    () => (nearlyFinishedRecipes as unknown as NearlyFinishedRecipes).reforgingStation,
    []
  )

  const recipe: Recipe | undefined = recipes.find((r: Recipe) => r.item === item.name && r.stage === 'Nearly Finished')

  if (!recipe) {
    return null
  }

  return (
    <div className={wrapperClassName ?? 'mt-2'} style={wrapperStyle}>
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

          {recipe.choices.map((choice: Choice, idx: number) => {
            return (
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
            )
          })}
        </Dropdown.Menu>
      </Dropdown>

      {selectedEnchantment && (
        <div className='mt-1 text-secondary' style={{ fontSize: '0.6rem', lineHeight: '1.1' }}>
          <EnchantmentList
            enchantments={[selectedEnchantment]}
            itemId={item.id}
            conflicts={conflicts}
            equippedItems={equippedItems}
            source='slot'
            browsingSlot={slot}
            slottedAugments={slottedAugments}
            slottedNearlyFinished={slottedNearlyFinished}
            slottedRitualTable={slottedRitualTable}
            slottedLostPurpose={slottedLostPurpose}
          />
        </div>
      )}
    </div>
  )
}

interface Props {
  item: GearItem
  slot: GearSlot
  selectedEnchantment: LootEnchantment | null
  onSelect: (enchantment: LootEnchantment | null) => void
  conflicts: Record<string, import('../conflictResolver.ts').EnchantmentConflict[]>
  equippedItems: GearItem[]
  slottedAugments: Record<string, Record<number, import('../types.ts').GearAugment | null>>
  slottedNearlyFinished: Record<string, LootEnchantment | null>
  slottedRitualTable: Record<string, LootEnchantment | null>
  slottedLostPurpose: Record<string, LootEnchantment | null>
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
}

interface NearlyFinishedRecipes {
  meltingStation: CraftingIngredient[]
  reforgingStation: Recipe[]
}

interface Choice {
  name: string
}

interface Recipe {
  item: string
  stage: string
  choices: Choice[]
}

export default NearlyFinishedSelector
