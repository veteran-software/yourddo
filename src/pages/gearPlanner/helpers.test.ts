import { describe, expect, it } from 'vitest'
import cloakData from '../../data/loot/runtime/cloak.json'
import { aggregateEnchantmentEntries, getNearlyFinishedChoiceLabels, parseNearlyFinishedChoice } from './helpers'
import { type GearItem, GearSlot } from './types'
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
