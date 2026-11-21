import { describe, expect, it } from 'vitest'
import { getMythicBoostChoices, getMythicBoostEnchantments } from './mythicBoost'
import { GearSlot } from './types'

describe('mythic boost helpers', () => {
  it('returns magnitude choices and expands them into full enchantments for feet items', () => {
    const item = {
      id: 'item-1',
      name: 'Test Boots',
      slot: GearSlot.Feet,
      type: 'Boots'
    } as never

    const choices = getMythicBoostChoices(item)

    expect(choices.map((choice) => choice.label)).toEqual(['Mythic Feet Boost +2', 'Mythic Feet Boost +4'])
    expect(choices[0].enchantments).toEqual([
      { name: 'Physical Resistance Rating', modifier: 2, bonus: 'Mythic' },
      { name: 'Magical Resistance Rating', modifier: 2, bonus: 'Mythic' }
    ])
    expect(choices[1].enchantments).toEqual([
      { name: 'Physical Resistance Rating', modifier: 4, bonus: 'Mythic' },
      { name: 'Magical Resistance Rating', modifier: 4, bonus: 'Mythic' }
    ])

    expect(
      getMythicBoostEnchantments(item, {
        name: 'Mythic Feet Boost',
        modifier: 2,
        bonus: 'Mythic'
      })
    ).toEqual([
      { name: 'Physical Resistance Rating', modifier: 2, bonus: 'Mythic' },
      { name: 'Magical Resistance Rating', modifier: 2, bonus: 'Mythic' }
    ])
  })

  it('returns the correct component enchantments for accessory and weapon families', () => {
    expect(
      getMythicBoostChoices({
        id: 'item-2',
        name: 'Test Ring',
        slot: GearSlot.FirstFinger,
        type: 'Ring'
      } as never).map((choice) => choice.label)
    ).toEqual(['Mythic Ring Boost +1', 'Mythic Ring Boost +3'])

    expect(
      getMythicBoostChoices({
        id: 'item-3',
        name: 'Test Rune Arm',
        slot: GearSlot.OffHand,
        type: 'Rune Arm'
      } as never).map((choice) => choice.label)
    ).toEqual(['Mythic Weapon Boost +2', 'Mythic Weapon Boost +4'])
  })
})
