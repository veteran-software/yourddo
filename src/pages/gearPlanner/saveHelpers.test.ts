import { describe, expect, it } from 'vitest'
import handAxeItems from '../../data/loot/runtime/handAxe.json'
import { SAVE_FILE_VERSION, SaveFileSchema } from '../../schemas'
import { createDefaultSetup } from './initialState'
import { importSetupsFromJson } from './saveHelpers'
import { type GearItem, GearSlot } from './types'

describe('Gear Planner save file validation', () => {
  it('accepts equipped runtime loot items with null enchantments', () => {
    const runtimeItem = handAxeItems.find((item) => item.enchantments === null)
    expect(runtimeItem).toBeDefined()
    if (!runtimeItem) {
      throw new Error('Expected handAxe runtime data to include an item with null enchantments')
    }

    const gearItem: GearItem = {
      ...runtimeItem,
      id: 'test-main-hand-null-enchantments',
      slot: GearSlot.MainHand,
      minimumLevel: 1
    }
    const setup = createDefaultSetup('test', 'Test Setup')
    setup.slots[GearSlot.MainHand] = gearItem

    const result = SaveFileSchema.safeParse({
      version: SAVE_FILE_VERSION,
      exportedAt: new Date().toISOString(),
      setups: [setup]
    })

    expect(result.success).toBe(true)
  })

  it('accepts level 36 and rejects levels above the character cap', () => {
    const setup = createDefaultSetup('test', 'Test Setup')
    setup.minLevel = 36
    setup.maxLevel = 36

    const payload = {
      version: SAVE_FILE_VERSION,
      exportedAt: new Date().toISOString(),
      setups: [setup]
    }

    expect(SaveFileSchema.safeParse(payload).success).toBe(true)
    setup.maxLevel = 37
    expect(SaveFileSchema.safeParse(payload).success).toBe(false)
  })

  it('round-trips the current save file shape through import', async () => {
    const setup = createDefaultSetup('test', 'Test Setup')
    const runtimeItem = handAxeItems.find((item) => item.enchantments === null)
    expect(runtimeItem).toBeDefined()
    if (!runtimeItem) {
      throw new Error('Expected handAxe runtime data to include an item with null enchantments')
    }

    setup.slots[GearSlot.MainHand] = {
      ...runtimeItem,
      id: 'test-main-hand-null-enchantments',
      slot: GearSlot.MainHand,
      minimumLevel: 1
    }
    const itemId = 'test-main-hand-null-enchantments'
    setup.slottedEssenceEnchantments[itemId] = {
      prefix: 'Healthy',
      suffix: 'False Life',
      extra: null
    }
    setup.itemUpgrades[itemId] = {
      reaperForge: 'reaper-ring-boost-3',
      mythicBoost: { name: 'Mythic Weapon Boost', modifier: 2, bonus: 'Mythic' },
      nearlyComplete: {
        name: 'Strength Skills +6',
        effectsAdded: [
          { name: 'Skill: Jump', modifier: '6', bonus: 'Exceptional' },
          { name: 'Skill: Swim', modifier: '6', bonus: 'Exceptional' }
        ]
      }
    }
    setup.artificerPet.itemUpgrades['pet-upgrade'] = setup.itemUpgrades[itemId]
    setup.druidPet.itemUpgrades['pet-upgrade'] = setup.itemUpgrades[itemId]

    const file = new File(
      [
        JSON.stringify({
          version: SAVE_FILE_VERSION,
          exportedAt: new Date().toISOString(),
          setups: [setup]
        })
      ],
      'gear-planner-save.json',
      { type: 'application/json' }
    )

    const imported = await importSetupsFromJson(file)

    expect(imported).toHaveLength(1)
    expect(imported[0].id).toBe('test')
    expect(imported[0].minLevel).toBe(1)
    expect(imported[0].maxLevel).toBe(36)
    expect(imported[0].slots[GearSlot.MainHand]?.id).toBe('test-main-hand-null-enchantments')
    expect(imported[0].slottedEssenceEnchantments[itemId]).toEqual({
      prefix: 'Healthy',
      suffix: 'False Life',
      extra: null
    })
    expect(imported[0].itemUpgrades[itemId].reaperForge).toBe('reaper-ring-boost-3')
    expect(imported[0].itemUpgrades[itemId].mythicBoost).toEqual({
      name: 'Mythic Weapon Boost',
      modifier: 2,
      bonus: 'Mythic'
    })
    expect(imported[0].itemUpgrades[itemId].nearlyComplete?.effectsAdded).toHaveLength(2)
    expect(imported[0].artificerPet.itemUpgrades['pet-upgrade'].nearlyComplete?.name).toBe('Strength Skills +6')
    expect(imported[0].druidPet.itemUpgrades['pet-upgrade'].nearlyComplete?.name).toBe('Strength Skills +6')
  })

  it('normalizes older save files that omit newer planner fields', async () => {
    const setup = createDefaultSetup('legacy-1', 'Legacy Setup')
    const runtimeItem = handAxeItems.find((item) => item.enchantments === null)
    expect(runtimeItem).toBeDefined()
    if (!runtimeItem) {
      throw new Error('Expected handAxe runtime data to include an item with null enchantments')
    }

    setup.slots[GearSlot.MainHand] = {
      ...runtimeItem,
      id: 'legacy-main-hand',
      slot: GearSlot.MainHand,
      minimumLevel: 1
    }

    const legacySetup: Record<string, unknown> = { ...setup }
    legacySetup.maxLevel = 34
    delete legacySetup.itemUpgrades
    delete legacySetup.artificerPet
    delete legacySetup.druidPet
    const file = new File([JSON.stringify([legacySetup])], 'gear-planner-save.json', { type: 'application/json' })

    const imported = await importSetupsFromJson(file)

    expect(imported).toHaveLength(1)
    expect(imported[0].id).toBe('legacy-1')
    expect(imported[0].maxLevel).toBe(34)
    expect(imported[0].slots[GearSlot.MainHand]?.id).toBe('legacy-main-hand')
    expect(imported[0].itemUpgrades).toBeDefined()
    expect(imported[0].artificerPet.itemUpgrades).toBeDefined()
    expect(imported[0].druidPet.itemUpgrades).toBeDefined()
  })
})
