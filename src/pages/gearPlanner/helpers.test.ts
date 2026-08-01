import { describe, expect, it } from 'vitest'
import cloakData from '../../data/loot/runtime/cloak.json'
import type { EssenceCraftingEntry } from '../essenceCrafting/types'
import {
  aggregateEnchantmentEntries,
  getEssenceCraftingLevel,
  getNearlyFinishedChoiceLabels,
  getScaledEssenceEnchantments,
  parseNearlyFinishedChoice
} from './helpers'
import { type Curse, type GearItem, GearSlot } from './types'
import { createEmptyItemUpgrades, setItemUpgradeState } from './upgradeState'

describe('gear planner nearly finished helpers', () => {
  it('reconstructs Cloak of Balance nearly finished options from the upgradeable text', () => {
    const cloakOfBalance = cloakData.find(
      (item) => item.pageTitle === 'Cloak of Balance' && item.name === 'Cloak of Balance'
    )

    expect(cloakOfBalance).toBeDefined()

    const labels = getNearlyFinishedChoiceLabels(undefined, cloakOfBalance?.upgradeable)

    expect(labels).toEqual(['Quality Strength +1', 'Quality Dexterity +1', 'Quality Constitution +1'])
  })

  it('parses Nearly Finished choice labels into loot enchantments', () => {
    expect(parseNearlyFinishedChoice('Quality Strength +1')).toEqual({
      name: 'Strength',
      bonus: 'Quality',
      modifier: '1'
    })

    expect(parseNearlyFinishedChoice('Dexterity +13')).toEqual({
      name: 'Dexterity',
      bonus: 'Enhancement',
      modifier: '13'
    })
  })

  it('adds reaper forge grants to aggregated enchantments', () => {
    const item = {
      id: 'item-1',
      name: 'Test Item',
      slot: GearSlot.Head
    } as unknown as GearItem
    const itemUpgrades = createEmptyItemUpgrades()
    setItemUpgradeState(itemUpgrades, item.id, 'reaperForge', 'reaper-helmet-enchantment')

    const entries = aggregateEnchantmentEntries(item, undefined, undefined, undefined, { itemUpgrades })

    expect(entries.map((entry) => entry.ench.name)).toEqual([
      'Strength',
      'Dexterity',
      'Constitution',
      'Intelligence',
      'Wisdom',
      'Charisma'
    ])
  })
})

const createEssenceEntry = (overrides: Partial<EssenceCraftingEntry> = {}): EssenceCraftingEntry => ({
  name: 'Test Essence',
  minItemLevel: 1,
  bound: { recipeId: 1, level: 1, essence: 1, collectible: [] },
  unbound: { recipeId: 2, level: 1, essence: 1, collectible: [] },
  prefix: ['Head'],
  suffix: [],
  extra: [],
  enchantments: [],
  ...overrides
})

describe('gear planner essence crafting v2 helpers', () => {
  it('scales each nested effect independently and formats percentages and dice', () => {
    const entry = createEssenceEntry({
      enchantments: [
        { name: 'Absorption', bonus: 'Enhancement', modifiers: [{ level: 20, value: 0.27 }] },
        { name: 'Bane', bonus: null, modifierDice: 'd10', modifiers: [{ level: 20, value: 4 }] },
        { name: 'Deathblock', bonus: null, modifiers: [] }
      ]
    })

    expect(getScaledEssenceEnchantments(entry, 20)).toEqual([
      { name: 'Absorption', modifier: '27%', bonus: 'Enhancement' },
      { name: 'Bane', modifier: '4d10', bonus: undefined },
      { name: 'Deathblock', modifier: undefined, bonus: undefined }
    ])
  })

  it('uses the entry name for entries without effect records and enforces minItemLevel', () => {
    const entry = createEssenceEntry({ name: 'Static Effect', minItemLevel: 20 })

    expect(getScaledEssenceEnchantments(entry, 19)).toEqual([])
    expect(getScaledEssenceEnchantments(entry, 20)).toEqual([{ name: 'Static Effect' }])
  })

  it('applies Masterworks boosts and caps the effective crafting level', () => {
    const item = { minLevel: 35 } as GearItem
    const majorMasterworks = { name: 'Curse of Major Masterworks' } as Curse

    expect(getEssenceCraftingLevel(item)).toBe(35)
    expect(getEssenceCraftingLevel(item, majorMasterworks)).toBe(36)
  })

  it('resolves stored selections by their v2 entry name', () => {
    const item = {
      id: 'crafted-head',
      name: 'Essence Crafted Helmet',
      minLevel: 20,
      slot: GearSlot.Head,
      enchantments: []
    } as unknown as GearItem
    const entry = createEssenceEntry({
      name: 'Healthy',
      minItemLevel: 20,
      enchantments: [{ name: 'Hit Points', bonus: 'Enhancement', modifiers: [{ level: 20, value: 36 }] }]
    })

    const entries = aggregateEnchantmentEntries(item, undefined, undefined, undefined, {
      slottedEssenceEnchantments: { [item.id]: { prefix: 'Healthy' } },
      essenceEnchantments: [entry]
    })

    expect(entries).toContainEqual({
      ench: { name: 'Hit Points', modifier: 36, bonus: 'Enhancement' },
      sourceName: 'Essence Crafted Helmet (Essence: Healthy)'
    })
  })
})
