import { describe, expect, it } from 'vitest'
import { createDefaultSetup, initialPetState } from './initialState'
import { buildPermalinkPayloadV2, decodePermalinkPayloadV2, isPermalinkPayloadV2 } from './permalinkV2'
import { type GearItem, GearSlot } from './types'

describe('permalink V2 payload helpers', () => {
  const mockItem = {
    id: 'MainHand|Legendary Sword|29|sword.json',
    name: 'Legendary Sword',
    slot: GearSlot.MainHand,
    minLevel: '29',
    material: 'wood'
  } as unknown as GearItem

  it('builds a versioned payload with setup metadata and items', () => {
    const setup = createDefaultSetup('setup-1', 'Setup 1')
    setup.slots[GearSlot.MainHand] = mockItem
    setup.artificerPet = initialPetState()
    setup.druidPet = initialPetState()

    const payload = buildPermalinkPayloadV2(setup)

    expect(payload.version).toBe(2)
    expect(payload.setup).toMatchObject({
      name: 'Setup 1',
      minLevel: 1,
      maxLevel: 34
    })
    expect(payload.items).toHaveLength(1)
    expect(payload.items[0]).toMatchObject({
      slot: GearSlot.MainHand,
      itemId: mockItem.id,
      itemName: mockItem.name,
      itemMaterial: mockItem.material
    })
  })

  it('recognizes and decodes the V2 payload shape', () => {
    const setup = createDefaultSetup('setup-1', 'Setup 1')
    setup.slots[GearSlot.MainHand] = mockItem

    const payload = buildPermalinkPayloadV2(setup)

    expect(isPermalinkPayloadV2(payload)).toBe(true)
    expect(isPermalinkPayloadV2([1, 2, 3])).toBe(false)

    const decoded = decodePermalinkPayloadV2(payload, [mockItem], [], [])

    expect(decoded.name).toBe('Setup 1')
    expect(decoded.slots[GearSlot.MainHand]?.id).toBe(mockItem.id)
    expect(decoded.slots[GearSlot.MainHand]?.material).toBe(mockItem.material)
  })
})
