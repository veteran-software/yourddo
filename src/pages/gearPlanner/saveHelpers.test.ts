import { describe, expect, it } from 'vitest'
import handAxeItems from '../../data/loot/runtime/handAxe.json'
import { SAVE_FILE_VERSION, SaveFileSchema } from '../../schemas'
import { createDefaultSetup } from './initialState'
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
})
