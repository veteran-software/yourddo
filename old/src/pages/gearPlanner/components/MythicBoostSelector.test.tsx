import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { GearSlot, type LootEnchantment } from '../types'
import MythicBoostSelector from './MythicBoostSelector'

const entityState = {
  slots: {},
  equipped: [],
  conflicts: {},
  slottedAugments: {},
  slottedCurses: {},
  slottedFiligrees: {},
  unlockedFiligreeSlots: {},
  slottedGemSetBonuses: {},
  slottedEssenceEnchantments: {},
  itemUpgrades: {},
  slottedNearlyFinished: {},
  slottedAlmostThere: {},
  slottedFinishingTouch: {},
  slottedRitualTable: {},
  slottedLostPurpose: {},
  slottedTraceOfMadness: {},
  slottedMythicBoost: {},
  slottedFountainOfNecroticMight: {},
  slottedStormreaverUpgrade: {},
  slottedZhentarimAttuned: {}
} as never

describe('MythicBoostSelector', () => {
  it('shows boost magnitudes in the dropdown and expands the selected boost into component enchantments', async () => {
    const user = userEvent.setup()

    const Harness = () => {
      const [selectedEnchantment, setSelectedEnchantment] = useState<LootEnchantment | null>(null)

      return (
        <MythicBoostSelector
          item={
            {
              id: 'item-1',
              name: 'Test Boots',
              slot: GearSlot.Feet,
              type: 'Boots'
            } as never
          }
          slot={GearSlot.Feet}
          selectedEnchantment={selectedEnchantment}
          onSelect={setSelectedEnchantment}
          entityState={entityState}
        />
      )
    }

    render(<Harness />)

    await user.click(screen.getByRole('button', { name: /select boost/i }))

    expect(screen.getByText('Mythic Feet Boost +2')).toBeInTheDocument()
    expect(screen.getByText('Mythic Feet Boost +4')).toBeInTheDocument()

    await user.click(screen.getByText('Mythic Feet Boost +2'))

    expect(screen.getAllByRole('button', { name: 'Mythic Feet Boost +2' }).length).toBeGreaterThan(0)
    expect(
      screen.getByText((content) => content.includes('Physical Resistance Rating +2 (Mythic)'))
    ).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('Magical Resistance Rating +2 (Mythic)'))).toBeInTheDocument()
  })
})
