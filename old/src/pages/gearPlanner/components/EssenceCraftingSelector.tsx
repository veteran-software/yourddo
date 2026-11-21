import { useCallback, useMemo } from 'react'
import { Dropdown } from 'react-bootstrap'
import { shields } from '../../../data/basics/armor.ts'
import { meleeWeapons, rangedWeapons, throwingWeapons } from '../../../data/basics/weapons.ts'
import { MAX_CHARACTER_LEVEL } from '../../../utils/constants.ts'
import type { EssenceCraftingEntry } from '../../essenceCrafting/types.ts'
import { getEssenceCraftingLevel, getScaledEssenceEnchantments } from '../helpers.ts'
import { type EntityGearState, type GearItem, type GearSetup, GearSlot, type LootEnchantment } from '../types.ts'
import EnchantmentList from './EnchantmentList.tsx'

const EssenceCraftingSelector = (props: Props) => {
  const {
    activeSetup,
    selectedItem,
    essenceEnchantments,
    setEssenceEnchantment,
    setItemMinLevel,
    setItemMaterial,
    slot,
    entityState
  } = props

  const minLevel = Number.parseInt(String(selectedItem.minLevel)) || 1

  const effectiveLevel = getEssenceCraftingLevel(selectedItem, activeSetup.slottedCurses[selectedItem.id])
  const isGemOfManyFacets = selectedItem.name.includes('Gem of Many Facets')

  const getFormattedName = useCallback(
    (entry: EssenceCraftingEntry) => {
      const effects = getScaledEssenceEnchantments(entry, effectiveLevel)

      if (entry.enchantments.length === 0 || effects.length === 0) {
        return entry.name
      }

      const formatModifier = (effect: LootEnchantment): string => {
        if (effect.modifier == null || effect.modifier === '') {
          return ''
        }

        if (typeof effect.modifier === 'number' && effect.modifier > 0) {
          return ` +${String(effect.modifier)}`
        }

        return ` ${String(effect.modifier)}`
      }

      const effectNames = effects.map((effect) => `${effect.name}${formatModifier(effect)}`).join('; ')
      return `${entry.name} (${effectNames})`
    },
    [effectiveLevel]
  )

  const slotTokenMap: Record<string, string[]> = useMemo(() => {
    return {
      [GearSlot.Armor]: ['Armor'],
      [GearSlot.ArtificerPetArmor]: ['Armor'],
      [GearSlot.DruidPetArmor]: ['Armor'],
      [GearSlot.Head]: ['Head', 'Headgear'],
      [GearSlot.Hands]: ['Gloves', 'Hands', 'Hand'],
      [GearSlot.Cloak]: ['Cloak'],
      [GearSlot.Waist]: ['Belt', 'Waist'],
      [GearSlot.Feet]: ['Boots', 'Feet'],
      [GearSlot.Wrists]: ['Bracers', 'Wrists'],
      [GearSlot.Eyes]: ['Goggles', 'Eyes'],
      [GearSlot.Neck]: ['Necklace', 'Neck'],
      [GearSlot.FirstFinger]: ['Ring', 'Rings', 'Fingers'],
      [GearSlot.SecondFinger]: ['Ring', 'Rings', 'Fingers'],
      [GearSlot.Trinket]: ['Trinket'],
      [GearSlot.MainHand]: ['Weapon'],
      [GearSlot.OffHand]: ['Weapon', 'Shield', 'Orb', 'Runearm'],
      [GearSlot.ArtificerPetWeapon]: ['Weapon'],
      [GearSlot.DruidPetWeapon]: ['Weapon']
    }
  }, [])

  const allowedSlotTokens: string[] = useMemo(() => {
    const tokens = slot in slotTokenMap ? slotTokenMap[slot] : []
    if (slot !== GearSlot.MainHand && slot !== GearSlot.OffHand) {
      return tokens
    }

    const weaponType = selectedItem.type
    const filteredTokens: string[] = []

    if (weaponType === 'Weapon (Melee)' || meleeWeapons.has(weaponType)) {
      filteredTokens.push('Weapon')
    }

    if (weaponType === 'Weapon (Ranged)' || rangedWeapons.has(weaponType) || throwingWeapons.has(weaponType)) {
      filteredTokens.push('Weapon')
    }

    if (shields.has(weaponType) || weaponType === 'Shield') {
      filteredTokens.push('Shield')
    }

    if (weaponType === 'Orb') {
      filteredTokens.push('Orb')
    }

    if (weaponType === 'Rune Arm') {
      filteredTokens.push('Runearm')
    }

    // Fallback for generic Crafted items (e.g., type "Weapon") where no specific type matched
    if (filteredTokens.length === 0) {
      return tokens
    }

    return [...new Set(filteredTokens)]
  }, [slotTokenMap, slot, selectedItem.type])

  const normalizedAllowedSlotTokens = useMemo(
    () => new Set(allowedSlotTokens.map((token) => token.toLowerCase())),
    [allowedSlotTokens]
  )

  const { prefixOptions, suffixOptions, extraOptions } = useMemo(() => {
    const filterAndSort = (affixType: 'prefix' | 'suffix' | 'extra'): EssenceCraftingEntry[] =>
      essenceEnchantments
        .filter((entry: EssenceCraftingEntry) => {
          if (effectiveLevel < entry.minItemLevel) {
            return false
          }

          for (const placement of entry[affixType]) {
            if (normalizedAllowedSlotTokens.has(placement.trim().toLowerCase())) {
              return true
            }
          }

          return false
        })
        .sort((a: EssenceCraftingEntry, b: EssenceCraftingEntry) =>
          getFormattedName(a).localeCompare(getFormattedName(b), 'en', { sensitivity: 'base' })
        )

    return {
      prefixOptions: filterAndSort('prefix'),
      suffixOptions: filterAndSort('suffix'),
      extraOptions: filterAndSort('extra')
    }
  }, [essenceEnchantments, getFormattedName, normalizedAllowedSlotTokens, effectiveLevel])

  const renderDropdown = (label: string, slotName: string, options: EssenceCraftingEntry[]) => {
    const currentSelectionId =
      selectedItem.id in activeSetup.slottedEssenceEnchantments &&
      slotName in activeSetup.slottedEssenceEnchantments[selectedItem.id]
        ? activeSetup.slottedEssenceEnchantments[selectedItem.id][slotName]
        : null

    const currentSelection = essenceEnchantments.find(
      (option: EssenceCraftingEntry) => option.name === currentSelectionId
    )

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
              {currentSelection ? getFormattedName(currentSelection) : `-- Select ${label} --`}
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

            {options.map((option: EssenceCraftingEntry) => (
              <Dropdown.Item
                key={option.name}
                onClick={() => {
                  setEssenceEnchantment(selectedItem.id, slotName, option.name, slot)
                }}
              >
                {getFormattedName(option)}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {currentSelection?.enchantments && (
          <div className='mt-1 text-secondary' style={{ fontSize: '0.6rem', lineHeight: '1.1' }}>
            <EnchantmentList
              enchantments={getScaledEssenceEnchantments(currentSelection, effectiveLevel)}
              itemId={selectedItem.id}
              entityState={entityState}
              source='slot'
              browsingSlot={slot}
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
            <div className='text-dark mb-0' style={{ fontSize: '0.65rem' }}>
              Min Level (1-{MAX_CHARACTER_LEVEL})
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
                <span className='text-truncate text-dark'>{selectedItem.minLevel}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu
                style={{
                  fontSize: '0.65rem',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                {Array.from({ length: MAX_CHARACTER_LEVEL }, (_, i) => i + 1).map((lvl) => (
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
                <span className='text-truncate text-dark'>{selectedItem.material || '-- Select --'}</span>
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

      {minLevel >= 10 && extraOptions.length > 0 && renderDropdown('Mark of House Cannith Slot', 'extra', extraOptions)}
    </div>
  )
}

interface Props {
  selectedItem: GearItem
  activeSetup: GearSetup
  essenceEnchantments: EssenceCraftingEntry[]
  setEssenceEnchantment: (itemId: string, slotName: string, enchantmentId: string | null, slot?: GearSlot) => void
  setItemMinLevel: (itemId: string, minLevel: number, slot?: GearSlot) => void
  setItemMaterial: (itemId: string, material: string, slot?: GearSlot) => void
  slot: GearSlot
  entityState: EntityGearState
}

export default EssenceCraftingSelector
