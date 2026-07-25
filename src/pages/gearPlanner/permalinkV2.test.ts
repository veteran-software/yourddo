import { describe, expect, it } from 'vitest'
import { createDefaultSetup, initialPetState } from './initialState'
import { buildPermalinkPayloadV2, decodePermalinkPayloadV2, isPermalinkPayloadV2 } from './permalinkV2'
import { type Curse, type GearItem, GearSlot } from './types'
import { setItemUpgradeState } from './upgradeState'

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
      maxLevel: 36
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
    setItemUpgradeState(setup.itemUpgrades, mockItem.id, 'reaperForge', 'reaper-ring-boost-3')
    setItemUpgradeState(setup.itemUpgrades, mockItem.id, 'nearlyComplete', {
      name: 'Strength +15',
      effectsAdded: [{ name: 'Strength', modifier: '15', bonus: 'Enhancement' }]
    })

    const payload = buildPermalinkPayloadV2(setup)

    expect(isPermalinkPayloadV2(payload)).toBe(true)
    expect(isPermalinkPayloadV2([1, 2, 3])).toBe(false)

    const decoded = decodePermalinkPayloadV2(payload, [mockItem], [], [])

    expect(decoded.name).toBe('Setup 1')
    expect(decoded.minLevel).toBe(1)
    expect(decoded.maxLevel).toBe(36)
    expect(decoded.slots[GearSlot.MainHand]?.id).toBe(mockItem.id)
    expect(decoded.slots[GearSlot.MainHand]?.material).toBe(mockItem.material)
    expect(decoded.itemUpgrades[mockItem.id].reaperForge).toBe('reaper-ring-boost-3')
    expect(decoded.itemUpgrades[mockItem.id].nearlyComplete).toEqual({
      name: 'Strength +15',
      effectsAdded: [{ name: 'Strength', modifier: '15', bonus: 'Enhancement' }]
    })
  })

  it('omits quiver curses from the V2 payload and decode path', () => {
    const quiverItem = {
      id: 'Quiver|Test Quiver|1|quiver.json',
      name: 'Test Quiver',
      slot: GearSlot.Quiver,
      minLevel: '1'
    } as unknown as GearItem
    const curse = { name: 'Curse of Testing', type: 'Minor' } as Curse

    const setup = createDefaultSetup('setup-1', 'Setup 1')
    setup.slots[GearSlot.Quiver] = quiverItem
    setup.slottedCurses[quiverItem.id] = curse

    const payload = buildPermalinkPayloadV2(setup)
    expect(payload.items[0].curseName).toBeNull()

    const decoded = decodePermalinkPayloadV2(payload, [quiverItem], [], [curse])
    expect(decoded.slottedCurses[quiverItem.id]).toBeUndefined()
  })

  it('round-trips Nearly Complete selections on pet equipment', () => {
    const petItem = {
      ...mockItem,
      id: 'pet-nearly-complete',
      name: 'Pet Nearly Complete Item',
      slot: GearSlot.ArtificerPetWeapon
    }
    const setup = createDefaultSetup('setup-1', 'Setup 1')
    setup.artificerPet.slots[GearSlot.ArtificerPetWeapon] = petItem
    setItemUpgradeState(setup.artificerPet.itemUpgrades, petItem.id, 'nearlyComplete', {
      name: 'Strength Skills +6',
      effectsAdded: [
        { name: 'Skill: Jump', modifier: '6', bonus: 'Exceptional' },
        { name: 'Skill: Swim', modifier: '6', bonus: 'Exceptional' }
      ]
    })

    const payload = buildPermalinkPayloadV2(setup)
    const decoded = decodePermalinkPayloadV2(payload, [petItem], [], [])

    expect(decoded.artificerPet.itemUpgrades[petItem.id].nearlyComplete?.name).toBe('Strength Skills +6')
    expect(decoded.artificerPet.itemUpgrades[petItem.id].nearlyComplete?.effectsAdded).toHaveLength(2)
  })
})
