import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createDefaultSetup } from '../initialState'
import { type GearItem, GearSlot } from '../types'
import EnchantmentsSummary from './EnhancementsSummary'

describe('EnchantmentsSummary', () => {
  it('totals Reaper bonuses as stackable', () => {
    const item1 = {
      id: 'item-1',
      name: 'Item 1',
      slot: GearSlot.Head,
      enchantments: []
    } as unknown as GearItem
    const item2 = {
      id: 'item-2',
      name: 'Item 2',
      slot: GearSlot.Cloak,
      enchantments: []
    } as unknown as GearItem
    const itemUpgrades = createDefaultSetup('setup-1', 'Setup 1').itemUpgrades
    itemUpgrades[item1.id] = { reaperForge: 'reaper-helmet-enchantment' }
    itemUpgrades[item2.id] = { reaperForge: 'reaper-cloak-enchantment' }

    render(
      <EnchantmentsSummary
        equippedItems={[item1, item2]}
        slottedAugments={{}}
        slottedCurses={{}}
        slottedFiligrees={{}}
        slottedGemSetBonuses={{}}
        slottedEssenceEnchantments={{}}
        itemUpgrades={itemUpgrades}
        slottedNearlyFinished={{}}
        slottedAlmostThere={{}}
        slottedFinishingTouch={{}}
        slottedRitualTable={{}}
        slottedLostPurpose={{}}
        slottedTraceOfMadness={{}}
        slottedFountainOfNecroticMight={{}}
        slottedStormreaverUpgrade={{}}
        slottedZhentarimAttuned={{}}
        allItems={[item1, item2]}
        allAugments={[]}
        allCurses={[]}
        allFiligrees={[]}
      />
    )

    expect(screen.getAllByText(/reaper/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('+2').length).toBeGreaterThan(0)

    const itemRows = screen
      .getAllByText(/Item 1|Item 2/)
      .map((el) => el.parentElement?.className ?? '')
      .filter(Boolean)

    expect(itemRows.every((className) => className.includes('text-secondary'))).toBe(true)
    expect(itemRows.some((className) => className.includes('text-decoration-line-through'))).toBe(false)
  })
})
