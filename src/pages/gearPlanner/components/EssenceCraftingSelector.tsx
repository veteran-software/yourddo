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
    slot
  } = props

  const minLevel = parseInt(selectedItem.minLevel) || 1

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

  const prefixOptions = useMemo(
    () =>
      essenceEnchantments
        .filter((e) => e.affixType === 'prefix' && e.slotId === 'runearm')
        .sort((a, b) =>
          getFormattedName(a).localeCompare(getFormattedName(b), 'en', {
            sensitivity: 'base'
          })
        ),
    [essenceEnchantments, getFormattedName]
  )

  const suffixOptions = useMemo(
    () =>
      essenceEnchantments
        .filter((e) => e.affixType === 'suffix' && e.slotId === 'runearm')
        .sort((a, b) =>
          getFormattedName(a).localeCompare(getFormattedName(b), 'en', {
            sensitivity: 'base'
          })
        ),
    [essenceEnchantments, getFormattedName]
  )

  // Assuming 'extra' for Mark of House Cannith
  const extraOptions = useMemo(
    () =>
      essenceEnchantments
        .filter((e) => e.affixType === 'extra' && e.slotId === 'runearm')
        .sort((a, b) =>
          getFormattedName(a).localeCompare(getFormattedName(b), 'en', {
            sensitivity: 'base'
          })
        ),
    [essenceEnchantments, getFormattedName]
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

  return (
    <div className='text-start'>
      <div className='text-primary mb-1' style={{ fontSize: '0.65rem' }}>
        Essence Crafting
      </div>
      {renderDropdown('Prefix Slot', 'prefix', prefixOptions)}
      {renderDropdown('Suffix Slot', 'suffix', suffixOptions)}
      {minLevel >= 10 &&
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
  slot: GearSlot
  currentConflicts: Record<string, EnchantmentConflict[]>
  currentEquipped: GearItem[]
  currentSlottedAugments: Record<string, Record<number, GearAugment | null>>
}

export default EssenceCraftingSelector
