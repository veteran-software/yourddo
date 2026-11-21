import { describe, expect, it } from 'vitest'
import traceOfMadnessData from '../../data/traceOfMadness.json'
import {
  clearItemUpgradeState,
  createUpgradeViews,
  hasAnyItemUpgrade,
  type ItemUpgrades,
  migrateLegacyItemUpgrades,
  resolveItemUpgrades,
  setItemUpgradeState
} from './upgradeState'

describe('upgradeState helpers', () => {
  it('stores and clears compact upgrade state', () => {
    const itemUpgrades: ItemUpgrades = {}

    setItemUpgradeState(itemUpgrades, 'item-1', 'nearlyFinished', { name: 'Nearly Finished Bonus' })
    setItemUpgradeState(itemUpgrades, 'item-1', 'fountainOfNecroticMight', true)
    setItemUpgradeState(itemUpgrades, 'item-1', 'mythicBoost', { name: 'Mythic Boost', modifier: '2', bonus: 'Mythic' })
    setItemUpgradeState(itemUpgrades, 'item-1', 'reaperForge', 'reaper-ring-boost-1')

    expect(hasAnyItemUpgrade(itemUpgrades['item-1'])).toBe(true)
    expect(createUpgradeViews(itemUpgrades).slottedNearlyFinished['item-1']).toEqual({ name: 'Nearly Finished Bonus' })
    expect(createUpgradeViews(itemUpgrades).slottedFountainOfNecroticMight['item-1']).toBe(true)
    expect(createUpgradeViews(itemUpgrades).slottedMythicBoost['item-1']).toEqual({
      name: 'Mythic Boost',
      modifier: '2',
      bonus: 'Mythic'
    })
    expect(createUpgradeViews(itemUpgrades).slottedReaperForge['item-1']).toBe('reaper-ring-boost-1')

    clearItemUpgradeState(itemUpgrades, 'item-1')
    expect(itemUpgrades['item-1']).toBeUndefined()
    expect(hasAnyItemUpgrade(itemUpgrades['item-1'])).toBe(false)
  })

  it('migrates legacy upgrade fields into the compact map', () => {
    const legacyTrace = traceOfMadnessData[0]
    const itemUpgrades: ItemUpgrades = {}

    migrateLegacyItemUpgrades(
      {
        slottedNearlyFinished: {
          itemA: { name: 'Nearly Finished Bonus' }
        },
        slottedAlmostThere: {
          itemB: { name: 'Almost There Bonus' }
        },
        slottedTraceOfMadness: {
          itemC: legacyTrace.name
        },
        slottedMythicBoost: {
          itemF: { name: 'Mythic Boost', modifier: '4', bonus: 'Mythic' }
        },
        slottedFountainOfNecroticMight: {
          itemD: true
        }
      },
      itemUpgrades
    )

    setItemUpgradeState(itemUpgrades, 'itemE', 'reaperForge', 'reaper-ring-boost-2')

    expect(createUpgradeViews(itemUpgrades).slottedNearlyFinished.itemA).toEqual({ name: 'Nearly Finished Bonus' })
    expect(createUpgradeViews(itemUpgrades).slottedAlmostThere.itemB).toEqual({ name: 'Almost There Bonus' })
    expect(createUpgradeViews(itemUpgrades).slottedTraceOfMadness.itemC).toEqual(legacyTrace.effectsAdded[0])
    expect(createUpgradeViews(itemUpgrades).slottedMythicBoost.itemF).toEqual({
      name: 'Mythic Boost',
      modifier: '4',
      bonus: 'Mythic'
    })
    expect(createUpgradeViews(itemUpgrades).slottedFountainOfNecroticMight.itemD).toBe(true)
    expect(createUpgradeViews(itemUpgrades).slottedReaperForge.itemE).toBe('reaper-ring-boost-2')
  })

  it('resolves compact upgrades without re-migrating legacy fields', () => {
    const itemUpgrades: ItemUpgrades = {
      itemA: {
        nearlyFinished: { name: 'Nearly Finished Bonus' }
      }
    }

    expect(resolveItemUpgrades({ itemUpgrades })).toBe(itemUpgrades)
  })
})
