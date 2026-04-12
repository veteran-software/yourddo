import { useCallback, useMemo } from 'react'
import { Dropdown } from 'react-bootstrap'
import type { EnchantmentConflict } from '../conflictResolver.ts'
import type { EssenceEnchantment } from '../dataLoader.ts'
import {
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootEnchantment
} from '../types.ts'
import EnchantmentList from './EnchantmentList.tsx'

const EssenceCraftingSelector = (props: Props) => {
  const {
    activeSetup,
    selectedItem,
    essenceEnchantments,
    setEssenceEnchantment,
    setItemMinLevel,
    setItemMaterial,
    slot
  } = props

  const minLevel = parseInt(selectedItem.minLevel) || 1

  const isGemOfManyFacets = selectedItem.name.includes('Gem of Many Facets')

  const getFormattedName = useCallback(
    (opt: EssenceEnchantment) => {
      const rawDisplayName =
        opt.shardName ?? opt.statModified ?? opt.enchantmentName
      const displayName = Array.isArray(rawDisplayName)
        ? rawDisplayName.join(', ')
        : rawDisplayName

      if (!opt.scalingStats || opt.scalingStats.length === 0) {
        return displayName
      }

      const idx = Math.max(
        0,
        Math.min(opt.scalingStats.length - 1, minLevel - 1)
      )
      const value = opt.scalingStats[idx]

      const modifierValue =
        typeof value === 'number' ? `+${String(value)}` : value
      const bonusText = opt.bonus ? ` (${opt.bonus})` : ''

      return `${displayName} ${modifierValue}${bonusText}`
    },
    [minLevel]
  )

  const slotIdMap: Record<string, string[]> = {
    [GearSlot.Armor]: ['armor', 'robe', 'docent'],
    [GearSlot.Head]: ['helm'],
    [GearSlot.Hands]: ['gloves'],
    [GearSlot.Cloak]: ['cloak'],
    [GearSlot.Waist]: ['belt'],
    [GearSlot.Feet]: ['boots'],
    [GearSlot.Wrists]: ['bracers'],
    [GearSlot.Eyes]: ['goggles'],
    [GearSlot.Neck]: ['necklace'],
    [GearSlot.FirstFinger]: ['ring'],
    [GearSlot.SecondFinger]: ['ring'],
    [GearSlot.Trinket]: ['trinket'],
    [GearSlot.MainHand]: ['weapon-melee', 'weapon-ranged'],
    [GearSlot.OffHand]: ['weapon-melee', 'shield', 'orb', 'runearm']
  }

  const allowedSlotIds = slotIdMap[slot] || []

  const prefixOptions = useMemo(
    () =>
      essenceEnchantments
        .filter(
          (e) => e.affixType === 'prefix' && allowedSlotIds.includes(e.slotId)
        )
        .sort((a, b) =>
          getFormattedName(a).localeCompare(getFormattedName(b), 'en', {
            sensitivity: 'base'
          })
        ),
    [essenceEnchantments, getFormattedName, allowedSlotIds]
  )

  const suffixOptions = useMemo(
    () =>
      essenceEnchantments
        .filter(
          (e) => e.affixType === 'suffix' && allowedSlotIds.includes(e.slotId)
        )
        .sort((a, b) =>
          getFormattedName(a).localeCompare(getFormattedName(b), 'en', {
            sensitivity: 'base'
          })
        ),
    [essenceEnchantments, getFormattedName, allowedSlotIds]
  )

  // Assuming 'extra' for Mark of House Cannith
  const extraOptions = useMemo(
    () =>
      essenceEnchantments
        .filter(
          (e) => e.affixType === 'extra' && allowedSlotIds.includes(e.slotId)
        )
        .sort((a, b) =>
          getFormattedName(a).localeCompare(getFormattedName(b), 'en', {
            sensitivity: 'base'
          })
        ),
    [essenceEnchantments, getFormattedName, allowedSlotIds]
  )

  const renderDropdown = (
    label: string,
    slotName: string,
    options: EssenceEnchantment[]
  ) => {
    const currentSelectionId =
      activeSetup.slottedEssenceEnchantments?.[selectedItem.id]?.[slotName] ??
      null
    const currentSelection = options.find((o) => o.id === currentSelectionId)

    return (
      <div className='mb-1'>
        <div className='text-dark mb-0' style={{ fontSize: '0.6rem' }}>
          {label}
        </div>
        <Dropdown className='w-100'>
          <Dropdown.Toggle
            variant='outline-dark'
            id={`essence-drop-${selectedItem.id}-${slotName}`}
            className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
            style={{
              fontSize: '0.65rem',
              minHeight: '20px',
              backgroundColor: 'rgba(0,0,0,0.05)'
            }}
          >
            <span className='text-truncate text-dark'>
              {currentSelection
                ? getFormattedName(currentSelection)
                : `-- Select ${label} --`}
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
                setEssenceEnchantment(selectedItem.id, slotName, null, slot)
              }}
            >
              -- None --
            </Dropdown.Item>

            <Dropdown.Divider />

            {options.map((opt) => (
              <Dropdown.Item
                key={opt.id}
                onClick={() => {
                  setEssenceEnchantment(selectedItem.id, slotName, opt.id, slot)
                }}
              >
                {getFormattedName(opt)}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        {currentSelection?.enchantments && (
          <div
            className='mt-1 text-secondary'
            style={{ fontSize: '0.6rem', lineHeight: '1.1' }}
          >
            <EnchantmentList
              enchantments={currentSelection.enchantments.flatMap(
                (e: LootEnchantment) => {
                  const rawName: string = e.statModified ?? e.name
                  const names: string[] = Array.isArray(rawName)
                    ? rawName
                    : [rawName]

                  const idx = Math.max(
                    0,
                    Math.min(
                      (currentSelection.scalingStats?.length ?? 1) - 1,
                      minLevel - 1
                    )
                  )
                  const value = currentSelection.scalingStats?.[idx]

                  return names.map((name) => ({
                    ...e,
                    name: name.trim(),
                    modifier: value ?? undefined,
                    bonus: currentSelection.bonus ?? e.bonus
                  }))
                }
              )}
              itemId={selectedItem.id}
              conflicts={props.currentConflicts}
              equippedItems={props.currentEquipped}
              source='slot'
              browsingSlot={slot}
              slottedAugments={props.currentSlottedAugments}
            />
          </div>
        )}
      </div>
    )
  }

  const materials = [
    'Adamantine',
    'Blueshine',
    'Byeshk',
    'Cloth',
    'Cold Iron',
    'Dwarven Iron',
    'Flametouched Iron',
    'Gem',
    'Glass',
    'Leather',
    'Magesteel',
    'Mithral',
    'Planeforged Steel',
    'Silver',
    'Spiritcraft Leather',
    'Spiritforged Iron',
    'Stone',
    'Wood'
  ]

  return (
    <div className='text-start'>
      <div className='text-primary mb-1' style={{ fontSize: '0.65rem' }}>
        Essence Crafting
      </div>

      {!isGemOfManyFacets && (
        <div className='d-flex gap-2 mb-1'>
          <div className='flex-grow-1'>
            <div className='text-dark mb-0' style={{ fontSize: '0.6rem' }}>
              Min Level (1-36)
            </div>
            <Dropdown className='w-100 mb-2'>
              <Dropdown.Toggle
                variant='outline-dark'
                id={`essence-min-level-${selectedItem.id}`}
                className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
                style={{
                  fontSize: '0.65rem',
                  minHeight: '20px',
                  backgroundColor: 'rgba(0,0,0,0.05)'
                }}
              >
                <span className='text-truncate text-dark'>
                  {selectedItem.minLevel}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu
                style={{
                  fontSize: '0.65rem',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                {Array.from({ length: 36 }, (_, i) => i + 1).map((lvl) => (
                  <Dropdown.Item
                    key={lvl}
                    onClick={() => {
                      setItemMinLevel(selectedItem.id, lvl, slot)
                    }}
                  >
                    {lvl}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className='flex-grow-1'>
            <div className='text-dark mb-0' style={{ fontSize: '0.6rem' }}>
              Material
            </div>
            <Dropdown className='w-100 mb-2'>
              <Dropdown.Toggle
                variant='outline-dark'
                id={`essence-material-${selectedItem.id}`}
                className='w-100 py-0 px-2 text-start d-flex justify-content-between align-items-center gear-planner-augment-toggle'
                style={{
                  fontSize: '0.65rem',
                  minHeight: '20px',
                  backgroundColor: 'rgba(0,0,0,0.05)'
                }}
              >
                <span className='text-truncate text-dark'>
                  {selectedItem.material || '-- Select --'}
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
                    setItemMaterial(selectedItem.id, '', slot)
                  }}
                >
                  -- None --
                </Dropdown.Item>
                <Dropdown.Divider />
                {materials.map((mat) => (
                  <Dropdown.Item
                    key={mat}
                    onClick={() => {
                      setItemMaterial(selectedItem.id, mat, slot)
                    }}
                  >
                    {mat}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      )}

      {renderDropdown('Prefix Slot', 'prefix', prefixOptions)}
      {renderDropdown('Suffix Slot', 'suffix', suffixOptions)}
      {minLevel >= 10 &&
        extraOptions.length > 0 &&
        renderDropdown('Mark of House Cannith Slot', 'extra', extraOptions)}
    </div>
  )
}

interface Props {
  selectedItem: GearItem
  activeSetup: GearSetup
  essenceEnchantments: EssenceEnchantment[]
  setEssenceEnchantment: (
    itemId: string,
    slotName: string,
    enchantmentId: string | null,
    slot: GearSlot
  ) => void
  setItemMinLevel: (itemId: string, minLevel: number, slot: GearSlot) => void
  setItemMaterial: (itemId: string, material: string, slot: GearSlot) => void
  slot: GearSlot
  currentConflicts: Record<string, EnchantmentConflict[]>
  currentEquipped: GearItem[]
  currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
}

export default EssenceCraftingSelector
