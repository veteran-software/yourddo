import { compressToEncodedURIComponent } from 'lz-string'
import { describe, expect, it } from 'vitest'
import { initialPetState } from './initialState'
import { encodeGearPermalink, tryDecodeGearPermalink } from './permalink'
import { type GearItem, type GearSetup, GearSlot } from './types'

describe('Bug #4: Fragile Item Reconstruction in Permalinks', () => {
  const mockItem = {
    id: 'MainHand|Legendary Sword|29|sword.json',
    name: 'Legendary Sword',
    slot: GearSlot.MainHand,
    minLevel: '29'
  } as unknown as GearItem

  const mockSetup: GearSetup = {
    id: 'test-setup-id',
    name: 'Test Setup',
    minLevel: 1,
    maxLevel: 32,
    classes: [],
    weaponFilters: [],
    armorFilters: [],
    shieldFilters: [],
    allowMetalWithDruid: false,
    slots: {
      [GearSlot.MainHand]: mockItem
    } as unknown as Record<GearSlot, GearItem | null>,
    slottedAugments: {},
    slottedCurses: {},
    slottedFiligrees: {},
    unlockedFiligreeSlots: {},
    slottedGemSetBonuses: {},
    slottedEssenceEnchantments: {},
    itemUpgrades: {},
    artificerPet: initialPetState(),
    druidPet: initialPetState()
  }

  it('should encode and decode using itemId', () => {
    const encoded: string = encodeGearPermalink(mockSetup)
    const result = tryDecodeGearPermalink(encoded, [mockItem], [], [])

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.slots[GearSlot.MainHand]?.id).toBe(mockItem.id)
    }
  })

  it('should fallback to itemName if itemId is missing (compatibility with old permalinks)', () => {
    // Manually construct an old-style payload (without the last itemId element)
    // Structure: [name, minLevel, maxLevel, classes, weapons, armors, shields, allowMetal, items]
    // items item: [slot, itemName, augments, curse, essence, nearly, ritual, lost, filigrees, unlocked, gemsets, minlevel, material, fountain, stormreaver]
    const oldItemPayload = [
      GearSlot.MainHand,
      'Legendary Sword',
      [], // augments
      null, // curse
      null, // essence
      null, // nearly
      null, // ritual
      null, // lost
      [], // filigrees
      null, // unlocked
      [], // gemsets
      29, // minlevel
      null, // material
      0, // fountain
      0 // stormreaver
      // itemId MISSING
    ]

    const oldPayload = ['Old Setup', 1, 32, [], [], [], [], 0, [oldItemPayload]]

    const encoded = compressToEncodedURIComponent(JSON.stringify(oldPayload))
    const result = tryDecodeGearPermalink(encoded, [mockItem], [], [])

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.slots[GearSlot.MainHand]?.id).toBe(mockItem.id)
    }
  })

  it('should encode and decode Trace of Madness', () => {
    // effectsAdded[0] of "Xoriat Madness: Mania"
    const traceEnchantment = { name: 'Melodic Guard' }
    const setupWithTrace: GearSetup = {
      ...mockSetup,
      itemUpgrades: {
        [mockItem.id]: {
          traceOfMadness: traceEnchantment
        }
      }
    }

    const encoded = encodeGearPermalink(setupWithTrace)
    const result = tryDecodeGearPermalink(encoded, [mockItem], [], [])

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.itemUpgrades[mockItem.id].traceOfMadness).toEqual(traceEnchantment)
    }
  })

  it('should handle name changes if itemId is present', () => {
    const renamedItem = { ...mockItem, name: 'Legendary Sword (Renamed)' }
    const encoded = encodeGearPermalink(mockSetup)

    // Even if we provide the "renamed" item in the library, it should match by ID
    const result = tryDecodeGearPermalink(encoded, [renamedItem], [], [])

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.slots[GearSlot.MainHand]?.id).toBe(mockItem.id)
    }
  })
})
