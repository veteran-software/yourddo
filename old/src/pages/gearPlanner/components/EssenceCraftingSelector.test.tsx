import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { EssenceCraftingEntry } from '../../essenceCrafting/types'
import { createDefaultSetup } from '../initialState'
import { type GearItem, GearSlot } from '../types'
import EssenceCraftingSelector from './EssenceCraftingSelector'

const createEntry = (
  name: string,
  placement: Partial<Pick<EssenceCraftingEntry, 'prefix' | 'suffix' | 'extra'>>,
  minItemLevel = 1
): EssenceCraftingEntry => ({
  name,
  minItemLevel,
  bound: { recipeId: 1, level: 1, essence: 1, collectible: [] },
  unbound: { recipeId: 2, level: 1, essence: 1, collectible: [] },
  prefix: placement.prefix ?? [],
  suffix: placement.suffix ?? [],
  extra: placement.extra ?? [],
  enchantments: [
    {
      name,
      bonus: 'Enhancement',
      modifiers: Array.from({ length: 37 - minItemLevel }, (_, index) => ({ level: minItemLevel + index, value: 1 }))
    }
  ]
})

const entries = [
  createEntry('Head Prefix', { prefix: ['Head'] }),
  createEntry('Headgear Prefix', { prefix: ['Headgear'] }),
  createEntry('Epic Head Prefix', { prefix: ['Head'] }, 20),
  createEntry('Weapon Prefix', { prefix: ['Weapon'] }),
  createEntry('Shield Prefix', { prefix: ['Shield'] })
]

const renderSelector = (item: GearItem, setEssenceEnchantment = vi.fn()) => {
  const setup = createDefaultSetup('setup-1', 'Setup 1')

  render(
    <EssenceCraftingSelector
      selectedItem={item}
      activeSetup={setup}
      essenceEnchantments={entries}
      setEssenceEnchantment={setEssenceEnchantment}
      setItemMinLevel={vi.fn()}
      setItemMaterial={vi.fn()}
      slot={item.slot}
      entityState={setup as never}
    />
  )

  return setEssenceEnchantment
}

describe('EssenceCraftingSelector v2 data', () => {
  it('matches v2 placement aliases and stores the selected entry name', async () => {
    const user = userEvent.setup()
    const item = {
      id: 'crafted-head',
      name: 'Essence Crafted Helmet',
      minLevel: 1,
      slot: GearSlot.Head,
      type: 'Crafted',
      material: ''
    } as GearItem
    const setEssenceEnchantment = renderSelector(item)

    await user.click(screen.getByRole('button', { name: '-- Select Prefix Slot --' }))

    expect(screen.getByRole('button', { name: 'Head Prefix (Head Prefix +1)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Headgear Prefix (Headgear Prefix +1)' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Epic Head Prefix/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Weapon Prefix/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Head Prefix (Head Prefix +1)' }))

    expect(setEssenceEnchantment).toHaveBeenCalledWith('crafted-head', 'prefix', 'Head Prefix', GearSlot.Head)
  })

  it('uses the crafted off-hand item type when matching v2 placements', async () => {
    const user = userEvent.setup()
    const item = {
      id: 'crafted-shield',
      name: 'Essence Crafted Shield',
      minLevel: 20,
      slot: GearSlot.OffHand,
      type: 'Shield',
      material: ''
    } as GearItem

    renderSelector(item)
    await user.click(screen.getByRole('button', { name: '-- Select Prefix Slot --' }))

    expect(screen.getByRole('button', { name: 'Shield Prefix (Shield Prefix +1)' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Weapon Prefix/ })).not.toBeInTheDocument()
  })

  it('preserves an imported selection even when v2 placement filtering would not offer it as a new choice', () => {
    const item = {
      id: 'crafted-orb',
      name: 'Essence Crafted Orb',
      minLevel: 20,
      slot: GearSlot.OffHand,
      type: 'Orb',
      material: ''
    } as GearItem
    const setup = createDefaultSetup('setup-1', 'Setup 1')
    setup.slottedEssenceEnchantments[item.id] = { prefix: 'Shield Prefix' }
    const setEssenceEnchantment = vi.fn()

    render(
      <EssenceCraftingSelector
        selectedItem={item}
        activeSetup={setup}
        essenceEnchantments={entries}
        setEssenceEnchantment={setEssenceEnchantment}
        setItemMinLevel={vi.fn()}
        setItemMaterial={vi.fn()}
        slot={item.slot}
        entityState={{ ...setup, equipped: [item], conflicts: {} } as never}
      />
    )

    expect(screen.getByRole('button', { name: 'Shield Prefix (Shield Prefix +1)' })).toBeInTheDocument()
    expect(screen.getByText('• Shield Prefix +1 (Enhancement)')).toBeInTheDocument()
    expect(setEssenceEnchantment).not.toHaveBeenCalled()
  })
})
