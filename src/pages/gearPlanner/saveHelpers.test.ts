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
    setup.itemUpgrades[itemId] = { reaperForge: 'reaper-ring-boost-3' }

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
    expect(imported[0].slots[GearSlot.MainHand]?.id).toBe('test-main-hand-null-enchantments')
    expect(imported[0].itemUpgrades[itemId].reaperForge).toBe('reaper-ring-boost-3')
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
    delete legacySetup.itemUpgrades
    delete legacySetup.artificerPet
    delete legacySetup.druidPet
    const file = new File([JSON.stringify([legacySetup])], 'gear-planner-save.json', { type: 'application/json' })

    const imported = await importSetupsFromJson(file)

    expect(imported).toHaveLength(1)
    expect(imported[0].id).toBe('legacy-1')
    expect(imported[0].slots[GearSlot.MainHand]?.id).toBe('legacy-main-hand')
    expect(imported[0].itemUpgrades).toBeDefined()
    expect(imported[0].artificerPet.itemUpgrades).toBeDefined()
    expect(imported[0].druidPet.itemUpgrades).toBeDefined()
  })
})
